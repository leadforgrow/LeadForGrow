/**
 * Resume waiting workflow executions when events occur (reply, payment, deal won).
 */
import SequenceExecution from '@/models/sequences/SequenceExecution';
import AutomationSequence from '@/models/automation/AutomationSequence';
import { sequenceEngine } from '@/lib/sequences/engine';

const WAIT_NODE_MAP = {
  reply: 'wait_reply',
  payment: 'wait_payment',
  meeting: 'wait_meeting',
  deal_won: 'wait_deal_won',
};

export async function resumeWaitingExecutions(leadId, eventType = 'reply') {
  const waitType = WAIT_NODE_MAP[eventType] || 'wait_reply';

  const executions = await SequenceExecution.find({
    leadId,
    status: 'waiting',
  }).lean();

  let resumed = 0;
  for (const exec of executions) {
    const sequence = await AutomationSequence.findById(exec.sequenceId).lean();
    if (!sequence) continue;

    const currentNode = (sequence.nodes || []).find((n) => n.id === exec.currentNodeId);
    if (!currentNode || currentNode.type !== waitType) continue;

    const edges = (sequence.edges || []).filter((e) => e.source === currentNode.id);
    const successEdge = edges.find((e) => e.label?.toLowerCase() === 'yes' || e.sourceHandle === 'true') || edges[0];
    if (!successEdge?.target) continue;

    await SequenceExecution.updateOne(
      { _id: exec._id },
      {
        $set: { status: 'running' },
        $push: {
          logs: {
            nodeId: currentNode.id,
            nodeType: waitType,
            status: 'success',
            message: `Resumed: ${eventType} received`,
            executedAt: new Date(),
          },
        },
      }
    );

    await sequenceEngine.queueNode(exec._id, successEdge.target, 0);
    resumed++;
  }

  return resumed;
}

export default { resumeWaitingExecutions };
