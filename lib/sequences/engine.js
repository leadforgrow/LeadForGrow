import AutomationRule from '@/models/automation/AutomationRule';
import AutomationSequence from '@/models/automation/AutomationSequence';
import SequenceExecution from '@/models/sequences/SequenceExecution';
import Lead from '@/models/automation/Lead';
import Business from '@/models/Business';
import { TRIGGER_TO_ENGINE } from './constants';
import { executeNode, getOutgoingEdges, findStartNode } from './executor';

export const sequenceEngine = {
  /**
   * Start a graph-based workflow for a lead
   */
  async startWorkflow(lead, sequenceId, automationRuleId = null) {
    const sequence = await AutomationSequence.findById(sequenceId);
    if (!sequence || sequence.status === 'archived') return null;

    const business = await Business.findById(lead.businessId);
    if (!business) return null;

    const startNode = findStartNode(sequence);
    if (!startNode && (!sequence.steps || sequence.steps.length === 0)) return null;

    const execution = await SequenceExecution.create({
      businessId: lead.businessId,
      sequenceId: sequence._id,
      leadId: lead._id,
      automationRuleId,
      status: 'running',
      currentNodeId: startNode?.id || null,
      logs: [],
    });

    await Lead.findByIdAndUpdate(lead._id, {
      $set: { activeSequenceId: sequence._id, sequenceStepIndex: 0, activeExecutionId: execution._id },
    });

    await AutomationSequence.updateOne(
      { _id: sequence._id },
      { $inc: { 'analytics.enrolled': 1, 'analytics.activeRuns': 1 } }
    );

    if (sequence.workflowMode === 'graph' && sequence.nodes?.length) {
      await sequenceEngine.processNode(execution._id, startNode.id);
    } else if (sequence.steps?.length) {
      const { automationEngine } = await import('@/lib/automationEngine');
      await automationEngine.executeSequenceStep(lead._id, sequence._id, 0);
    }

    return execution;
  },

  /**
   * Process a workflow node and queue/trigger next
   */
  async processNode(executionId, nodeId) {
    const execution = await SequenceExecution.findById(executionId);
    if (!execution || ['completed', 'failed', 'cancelled'].includes(execution.status)) return;

    const sequence = await AutomationSequence.findById(execution.sequenceId);
    const lead = await Lead.findById(execution.leadId);
    const business = await Business.findById(execution.businessId);
    if (!sequence || !lead || !business) return;

    const node = (sequence.nodes || []).find((n) => n.id === nodeId);
    if (!node) {
      await sequenceEngine.completeExecution(execution, 'failed', 'Node not found');
      return;
    }

    await SequenceExecution.updateOne(
      { _id: executionId },
      { $set: { currentNodeId: nodeId, status: 'running' } }
    );

    if (node.type === 'delay' || node.type === 'wait_until') {
      const delayMs = node.type === 'delay'
        ? ((node.data?.delayHours || 0) * 3600000) + ((node.data?.delayMinutes || 0) * 60000)
        : Math.max(0, new Date(node.data?.datetime || Date.now()).getTime() - Date.now());
      const nextEdges = getOutgoingEdges(sequence, nodeId);
      const nextId = nextEdges[0]?.target;
      if (nextId) {
        await sequenceEngine.queueNode(executionId, nextId, delayMs || 60000);
        await SequenceExecution.updateOne(
          { _id: executionId },
          { $push: { logs: { nodeId, nodeType: node.type, status: 'success', message: 'Delay scheduled', executedAt: new Date() } }, $set: { status: 'waiting' } }
        );
      }
      return;
    }

    const { log, complete, error } = await executeNode(node, lead, business, execution);

    await SequenceExecution.updateOne(
      { _id: executionId },
      { $push: { logs: log }, $set: { lastError: error || null } }
    );

    if (complete || node.type === 'end') {
      await sequenceEngine.completeExecution(execution, 'completed');
      return;
    }

    if (log.status === 'failed') {
      const updated = await SequenceExecution.findByIdAndUpdate(
        executionId,
        { $inc: { retryCount: 1 } },
        { new: true }
      );
      if ((updated?.retryCount || 0) >= 3) {
        await sequenceEngine.completeExecution(execution, 'failed', log.message);
        return;
      }
    }

    let branch;
    if (node.type === 'condition') {
      branch = log.metadata?.branch === 'true' ? 'true' : 'false';
    }

    const nextEdges = getOutgoingEdges(sequence, nodeId, branch);
    const nextId = nextEdges[0]?.target;
    if (nextId) {
      await sequenceEngine.queueNode(executionId, nextId, 0);
    } else {
      await sequenceEngine.completeExecution(execution, 'completed');
    }
  },

  async queueNode(executionId, nodeId, delayMs = 0) {
    const { queueWorkflowNode } = await import('@/lib/queue');
    await queueWorkflowNode(executionId, nodeId, delayMs);
  },

  async completeExecution(execution, status, error = null) {
    await SequenceExecution.updateOne(
      { _id: execution._id },
      {
        $set: {
          status,
          completedAt: status === 'completed' ? new Date() : undefined,
          failedAt: status === 'failed' ? new Date() : undefined,
          lastError: error,
          currentNodeId: null,
        },
      }
    );

    await Lead.findByIdAndUpdate(execution.leadId, {
      $unset: { activeSequenceId: 1, sequenceStepIndex: 1, activeExecutionId: 1 },
    });

    const inc = { 'analytics.activeRuns': -1 };
    if (status === 'completed') inc['analytics.completed'] = 1;
    if (status === 'failed') inc['analytics.failed'] = 1;

    await AutomationSequence.updateOne({ _id: execution.sequenceId }, { $inc: inc });
  },

  /**
   * Called from automationEngine when sequence_runner rule matches trigger
   */
  async tryStartFromRule(lead, trigger) {
    const rules = await AutomationRule.find({
      businessId: lead.businessId,
      type: 'sequence_runner',
      enabled: true,
      [`triggers.${trigger}`]: true,
    });

    for (const rule of rules) {
      const sequenceId = rule.config?.sequenceId;
      if (!sequenceId) continue;
      const sequence = await AutomationSequence.findById(sequenceId);
      if (!sequence || sequence.status !== 'active') continue;
      const expectedTrigger = TRIGGER_TO_ENGINE[sequence.triggerType];
      if (expectedTrigger && expectedTrigger !== trigger) continue;
      await sequenceEngine.startWorkflow(lead, sequenceId, rule._id);
      await AutomationRule.updateOne(
        { _id: rule._id },
        { $inc: { executionCount: 1 }, $set: { lastExecutedAt: new Date() } }
      );
    }
  },
};

export default sequenceEngine;
