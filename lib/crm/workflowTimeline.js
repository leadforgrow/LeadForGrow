/**
 * Grouped workflow timeline — one activity per workflow run, expandable steps.
 */
import Activity from '@/models/automation/Activity';
import { dbConnect } from '@/lib/mongodb';

function stepKey(label) {
  return String(label || 'step').toLowerCase().replace(/\s+/g, '_').slice(0, 64);
}

/**
 * Start or resume a grouped workflow run on the lead timeline.
 */
export async function startWorkflowRun({
  businessId,
  leadId,
  workflowName,
  workflowId = null,
  groupId = null,
}) {
  await dbConnect();
  const gid = groupId || `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const existing = await Activity.findOne({
    businessId,
    leadId,
    'metadata.groupId': gid,
    type: 'automation_executed',
  });

  if (existing) return { groupId: gid, activityId: existing._id };

  const activity = await Activity.create({
    businessId,
    entityType: 'lead',
    entityId: leadId,
    leadId,
    type: 'automation_executed',
    description: `Automation: ${workflowName}`,
    performedAt: new Date(),
    metadata: {
      groupId: gid,
      groupType: 'workflow_run',
      workflowName,
      workflowId,
      status: 'running',
      startedAt: new Date(),
      steps: [],
    },
  });

  return { groupId: gid, activityId: activity._id };
}

/**
 * Append a step to a workflow run (deduped by step key).
 */
export async function appendWorkflowStep({
  businessId,
  leadId,
  groupId,
  label,
  status = 'success',
  details = null,
  retries = 0,
}) {
  if (!groupId) return null;
  await dbConnect();

  const key = stepKey(label);
  const step = {
    key,
    label,
    status,
    executedAt: new Date(),
    retries,
    details,
  };

  const activity = await Activity.findOne({
    businessId,
    leadId,
    'metadata.groupId': groupId,
    type: 'automation_executed',
  });

  if (!activity) return null;

  const steps = [...(activity.metadata?.steps || [])];
  const idx = steps.findIndex((s) => s.key === key);
  if (idx >= 0) {
    steps[idx] = { ...steps[idx], ...step };
  } else {
    steps.push(step);
  }

  const failed = steps.some((s) => s.status === 'failed');
  const allDone = steps.length > 0 && steps.every((s) => s.status === 'success' || s.status === 'skipped');

  activity.metadata = {
    ...activity.metadata,
    steps,
    status: failed ? 'partial' : allDone ? 'success' : 'running',
    completedAt: allDone ? new Date() : activity.metadata?.completedAt,
  };
  activity.markModified('metadata');
  await activity.save();
  return activity;
}

/**
 * Mark workflow run complete.
 */
export async function completeWorkflowRun({ businessId, leadId, groupId, status = 'success' }) {
  if (!groupId) return;
  await dbConnect();
  await Activity.updateOne(
    { businessId, leadId, 'metadata.groupId': groupId, type: 'automation_executed' },
    { $set: { 'metadata.status': status, 'metadata.completedAt': new Date() } }
  );
}

export default { startWorkflowRun, appendWorkflowStep, completeWorkflowRun };
