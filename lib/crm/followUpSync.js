import Lead from '@/models/automation/Lead';
import Task from '@/models/automation/Task';
import { dbConnect } from '@/lib/mongodb';

const OPEN_TASK_STATUSES = ['pending', 'in_progress'];

/**
 * Set lead.nextFollowUpAt from the earliest open task due date.
 */
export async function syncLeadNextFollowUp(leadId, businessId) {
  await dbConnect();
  const next = await Task.findOne({
    leadId,
    businessId,
    status: { $in: OPEN_TASK_STATUSES },
    dueDate: { $ne: null },
  })
    .sort({ dueDate: 1 })
    .select('dueDate')
    .lean();

  const nextFollowUpAt = next?.dueDate || null;
  await Lead.updateOne({ _id: leadId, businessId }, { $set: { nextFollowUpAt } });
  return nextFollowUpAt;
}

/**
 * Batch-enrich leads with nextFollowUpAt from tasks when missing on the document.
 */
export async function enrichLeadsWithNextFollowUp(leads, businessId) {
  if (!leads?.length) return leads;

  const needIds = leads
    .filter((l) => !l.nextFollowUpAt)
    .map((l) => l._id);

  if (!needIds.length) return leads;

  await dbConnect();
  const rows = await Task.aggregate([
    {
      $match: {
        businessId,
        leadId: { $in: needIds },
        status: { $in: OPEN_TASK_STATUSES },
        dueDate: { $ne: null },
      },
    },
    { $sort: { dueDate: 1 } },
    { $group: { _id: '$leadId', nextFollowUpAt: { $first: '$dueDate' } } },
  ]);

  const byLead = Object.fromEntries(rows.map((r) => [r._id.toString(), r.nextFollowUpAt]));

  return leads.map((l) => {
    const fromTask = byLead[l._id.toString()];
    if (!l.nextFollowUpAt && fromTask) {
      return { ...l, nextFollowUpAt: fromTask };
    }
    return l;
  });
}

export default { syncLeadNextFollowUp, enrichLeadsWithNextFollowUp };
