import Task from '@/models/automation/Task';
import { logTimelineEvent } from '@/lib/crm/timeline';
import { isLostStage, isWonStage, normalizeStageKey } from '@/lib/crm/stageKeys';
import { STAGE_PROBABILITY } from '@/lib/crm/pipelineStages';

function getCustomField(deal, key) {
  if (!deal.customFields) return undefined;
  if (typeof deal.customFields.get === 'function') return deal.customFields.get(key);
  return deal.customFields[key];
}

function setCustomField(deal, key, value) {
  if (!deal.customFields) deal.customFields = new Map();
  if (typeof deal.customFields.set === 'function') {
    deal.customFields.set(key, value);
  } else {
    deal.customFields[key] = value;
  }
}

/**
 * CRM-only stage automation hooks (no WhatsApp/email).
 * Prepares internal records, tasks, and timeline events per stage.
 */
export async function runDealStageAutomations({
  businessId,
  deal,
  oldStage,
  newStage,
  stageConfig,
  userId,
  body = {},
}) {
  const stage = normalizeStageKey(newStage);
  const actions = [];

  if (stageConfig?.probability != null) {
    deal.probability = stageConfig.probability;
  } else if (STAGE_PROBABILITY[stage] != null) {
    deal.probability = STAGE_PROBABILITY[stage];
  }

  if (stage === 'qualified') {
    actions.push('deal_qualified');
    await logTimelineEvent({
      businessId,
      entityType: 'deal',
      entityId: deal._id,
      leadId: deal.leadId,
      type: 'deal_updated',
      description: 'Deal qualified — next action suggested',
      performedBy: userId,
      metadata: { automation: 'stage_qualified' },
    });
  }

  if (stage === 'first_contact') {
    actions.push('first_contact_logged');
    await logTimelineEvent({
      businessId,
      entityType: 'deal',
      entityId: deal._id,
      leadId: deal.leadId,
      type: 'deal_updated',
      description: 'First contact recorded on deal',
      performedBy: userId,
      metadata: { automation: 'stage_first_contact' },
    });
  }

  if (stage === 'demo_completed') {
    await Task.create({
      businessId,
      dealId: deal._id,
      leadId: deal.leadId,
      type: 'call',
      title: `Capture demo outcome: ${deal.title}`,
      description: 'Record outcome, budget, decision maker, expected close',
      dueDate: new Date(Date.now() + 86400000),
      assignedTo: deal.assignedTo || userId,
      priority: 'high',
      status: 'pending',
      createdBy: userId,
    });
    actions.push('demo_outcome_task');
  }

  if (stage === 'follow_up' || stage === 'negotiation' || stage === 'decision_pending') {
    actions.push(`deal_${stage}_automation`);
  }

  if (stage === 'demo_scheduled') {
    const existing = await Task.findOne({
      businessId,
      dealId: deal._id,
      type: 'meeting',
      status: 'pending',
      title: { $regex: /demo/i },
    });
    if (!existing) {
      const due = new Date();
      due.setDate(due.getDate() + 2);
      await Task.create({
        businessId,
        dealId: deal._id,
        leadId: deal.leadId,
        contactId: deal.contactId,
        companyId: deal.companyId,
        type: 'meeting',
        title: `Prepare demo: ${deal.title}`,
        description: 'CRM automation: demo scheduled — confirm meeting details and agenda.',
        dueDate: due,
        assignedTo: deal.assignedTo || userId,
        priority: 'high',
        status: 'pending',
        createdBy: userId,
      });
      actions.push('meeting_task_created');
      await logTimelineEvent({
        businessId,
        entityType: 'deal',
        entityId: deal._id,
        leadId: deal.leadId,
        type: 'task_created',
        description: 'Demo prep task created (stage automation)',
        performedBy: userId,
        metadata: { automation: 'demo_scheduled' },
      });
    }
  }

  if (stage === 'quotation_sent') {
    const quotations = getCustomField(deal, 'quotations') || [];
    const record = {
      id: `q_${Date.now()}`,
      amount: deal.amount,
      currency: deal.currency,
      sentAt: new Date(),
      sentBy: userId,
      status: 'sent',
    };
    quotations.push(record);
    setCustomField(deal, 'quotations', quotations);
    actions.push('quotation_recorded');
    await logTimelineEvent({
      businessId,
      entityType: 'deal',
      entityId: deal._id,
      leadId: deal.leadId,
      type: 'deal_updated',
      description: `Quotation record created (${deal.currency} ${deal.amount})`,
      performedBy: userId,
      metadata: { automation: 'quotation_sent', quotationId: record.id },
    });
  }

  if (stage === 'payment_pending') {
    const payments = getCustomField(deal, 'payments') || [];
    const record = {
      id: `p_${Date.now()}`,
      amount: deal.amount,
      currency: deal.currency,
      status: 'pending',
      createdAt: new Date(),
    };
    payments.push(record);
    setCustomField(deal, 'payments', payments);
    actions.push('payment_record_created');
    await logTimelineEvent({
      businessId,
      entityType: 'deal',
      entityId: deal._id,
      leadId: deal.leadId,
      type: 'deal_updated',
      description: 'Payment record created (pending)',
      performedBy: userId,
      metadata: { automation: 'payment_pending', paymentId: record.id },
    });
  }

  if (isWonStage(stage) || stageConfig?.isWon) {
    deal.wonAt = deal.wonAt || new Date();
    deal.lostAt = null;
    if (body.wonReason) deal.wonReason = body.wonReason;
    actions.push('deal_closed_won');
    await logTimelineEvent({
      businessId,
      entityType: 'deal',
      entityId: deal._id,
      leadId: deal.leadId,
      type: 'deal_won',
      description: `Deal won — revenue ${deal.currency} ${deal.amount}`,
      performedBy: userId,
      metadata: { amount: deal.amount, currency: deal.currency },
    });
  }

  if (isLostStage(stage) || stageConfig?.isLost) {
    const reason = body.lostReason || deal.lostReason;
    if (!reason) {
      const err = new Error('Lost reason is required when marking a deal as lost');
      err.code = 'LOST_REASON_REQUIRED';
      throw err;
    }
    deal.lostReason = reason;
    deal.lostAt = deal.lostAt || new Date();
    deal.wonAt = null;
    actions.push('deal_closed_lost');
    await logTimelineEvent({
      businessId,
      entityType: 'deal',
      entityId: deal._id,
      leadId: deal.leadId,
      type: 'deal_lost',
      description: `Deal lost: ${reason}`,
      performedBy: userId,
      metadata: { lostReason: reason },
    });
  }

  return { actions, stage };
}

export default { runDealStageAutomations };
