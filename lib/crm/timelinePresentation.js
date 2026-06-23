/**
 * Prepare timeline items for UI — merge duplicate automation entries, surface workflow groups.
 */

function isWorkflowGroup(activity) {
  return activity.type === 'automation_executed'
    && activity.metadata?.groupType === 'workflow_run'
    && Array.isArray(activity.metadata?.steps);
}

function dedupeKey(activity) {
  if (isWorkflowGroup(activity)) {
    return `group:${activity.metadata.groupId}`;
  }
  const m = activity.metadata || {};
  if (m.dedupeKey) return m.dedupeKey;
  if (m.stepKey && m.groupId) return `${m.groupId}:${m.stepKey}`;
  if (activity.type === 'task_created' && activity.description) {
    return `task:${activity.leadId}:${activity.description}`;
  }
  return activity._id?.toString() || `${activity.type}:${activity.description}`;
}

function formatStepDescription(step) {
  let desc = step.label || 'Automation step';
  if (step.status === 'failed' && step.details?.error) {
    desc += ` — ${step.details.error}`;
  } else if (step.details?.score != null) {
    desc += ` (score: ${step.details.score})`;
  } else if (step.details?.hours != null) {
    desc += ` (${step.details.hours}h)`;
  } else if (step.details?.count != null) {
    desc += ` (${step.details.count} found)`;
  } else if (step.details?.source) {
    desc += ` (${step.details.source})`;
  }
  return desc;
}

/**
 * Sort and dedupe raw activities; optionally expand workflow groups into step lines.
 */
export function formatTimelineItems(activities = [], { expandWorkflows = false } = {}) {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.performedAt || b.createdAt) - new Date(a.performedAt || a.createdAt)
  );

  const seen = new Set();
  const items = [];

  for (const activity of sorted) {
    const key = dedupeKey(activity);
    if (seen.has(key)) continue;
    seen.add(key);

    if (isWorkflowGroup(activity)) {
      const steps = activity.metadata?.steps || [];
      if (expandWorkflows && steps.length > 0) {
        const ordered = [...steps].sort(
          (a, b) => new Date(b.executedAt || 0) - new Date(a.executedAt || 0)
        );
        for (const step of ordered) {
          const stepKey = `step:${activity.metadata.groupId}:${step.key}`;
          if (seen.has(stepKey)) continue;
          seen.add(stepKey);
          items.push({
            _id: `${activity._id}_${step.key}`,
            type: step.status === 'failed' ? 'automation_failed' : 'automation_step',
            description: formatStepDescription(step),
            performedAt: step.executedAt || activity.performedAt,
            metadata: {
              ...step,
              workflowName: activity.metadata.workflowName,
              groupId: activity.metadata.groupId,
              stepStatus: step.status,
            },
            isWorkflowStep: true,
          });
        }
        continue;
      }
      items.push({
        ...activity,
        isWorkflowGroup: true,
        workflowName: activity.metadata.workflowName || activity.description,
        steps,
        runStatus: activity.metadata.status || 'success',
        startedAt: activity.metadata.startedAt,
        completedAt: activity.metadata.completedAt,
      });
    } else {
      items.push(activity);
    }
  }

  return items;
}

export default { formatTimelineItems };
