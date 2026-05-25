import AutomationRule from '@/models/automation/AutomationRule';
import { TRIGGER_TO_ENGINE } from './constants';

/**
 * Create or update AutomationRule linked to a sequence.
 * Rule appears in Automation Rules page for ON/OFF toggle only.
 */
export async function syncSequenceRule(sequence, userId = null) {
  const engineTrigger = TRIGGER_TO_ENGINE[sequence.triggerType] || 'onLeadReceived';
  const triggers = {
    onLeadReceived: engineTrigger === 'onLeadReceived',
    onStatusChange: engineTrigger === 'onStatusChange',
    onNoResponse: engineTrigger === 'onNoResponse',
  };

  const rulePayload = {
    name: sequence.name,
    description: sequence.description || `Workflow sequence: ${sequence.name}`,
    type: 'sequence_runner',
    enabled: sequence.status === 'active',
    config: { sequenceId: sequence._id, channel: 'both' },
    triggers,
  };

  if (sequence.automationRuleId) {
    const updated = await AutomationRule.findOneAndUpdate(
      { _id: sequence.automationRuleId, businessId: sequence.businessId },
      { $set: rulePayload },
      { new: true }
    );
    if (updated) return updated;
  }

  const rule = await AutomationRule.create({
    businessId: sequence.businessId,
    ...rulePayload,
  });

  sequence.automationRuleId = rule._id;
  await sequence.save();
  return rule;
}

export async function disableSequenceRule(sequenceId) {
  await AutomationRule.updateMany(
    { 'config.sequenceId': sequenceId, type: 'sequence_runner' },
    { $set: { enabled: false } }
  );
}

export async function deleteSequenceRule(sequenceId, businessId) {
  await AutomationRule.deleteMany({
    businessId,
    type: 'sequence_runner',
    'config.sequenceId': sequenceId,
  });
}
