/**
 * Revenue attribution — link deal wins to active workflow executions.
 */
import SequenceExecution from '@/models/sequences/SequenceExecution';
import Deal from '@/models/automation/Deal';

export async function attributeRevenueToWorkflows(leadId, dealId, amount) {
  const deal = dealId ? await Deal.findById(dealId).lean() : null;
  const revenue = amount ?? deal?.value ?? deal?.amount ?? 0;
  if (!revenue || !leadId) return { attributed: 0 };

  const since = new Date(Date.now() - 90 * 86400000);
  const executions = await SequenceExecution.find({
    leadId,
    createdAt: { $gte: since },
    status: { $in: ['running', 'waiting', 'completed'] },
  }).sort({ createdAt: -1 }).limit(10);

  let attributed = 0;
  for (const exec of executions) {
    if (exec.revenueAttributed > 0) continue;
    await SequenceExecution.updateOne(
      { _id: exec._id },
      { $set: { revenueAttributed: revenue, 'context.attributedDealId': dealId } }
    );
    attributed++;
    break;
  }

  return { attributed, revenue };
}

export async function getRevenueMetrics(businessId, sequenceId = null) {
  const match = { businessId };
  if (sequenceId) match.sequenceId = sequenceId;

  const [agg, dealStats] = await Promise.all([
    SequenceExecution.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$sequenceId',
          totalRevenue: { $sum: '$revenueAttributed' },
          runs: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          won: { $sum: { $cond: [{ $gt: ['$revenueAttributed', 0] }, 1, 0] } },
        },
      },
    ]),
    Deal.aggregate([
      { $match: { businessId, stage: { $in: ['won', 'converted', 'closed_won'] } } },
      {
        $group: {
          _id: null,
          dealsWon: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$value', 0] } },
          avgValue: { $avg: { $ifNull: ['$value', 0] } },
        },
      },
    ]),
  ]);

  const deals = dealStats[0] || { dealsWon: 0, totalValue: 0, avgValue: 0 };
  const workflowRevenue = agg.reduce((s, r) => s + (r.totalRevenue || 0), 0);

  return {
    revenueGenerated: workflowRevenue,
    dealsWon: deals.dealsWon,
    totalDealValue: deals.totalValue,
    avgDealValue: Math.round(deals.avgValue || 0),
    conversionRate: agg.length
      ? Math.round((agg.reduce((s, r) => s + r.won, 0) / Math.max(1, agg.reduce((s, r) => s + r.runs, 0))) * 100)
      : 0,
    byWorkflow: agg,
    roi: workflowRevenue > 0 ? Math.round((workflowRevenue / Math.max(1, agg.reduce((s, r) => s + r.runs, 0))) * 100) / 100 : 0,
  };
}
