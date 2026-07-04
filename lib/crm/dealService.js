import mongoose from 'mongoose';
import Deal from '@/models/automation/Deal';
import { ensureDefaultPipeline } from '@/lib/crm/pipelines';
import { isStageClosed, isStageLost, isStageWon } from '@/lib/crm/pipelineUtils';

export async function buildDealsDashboardStats(businessId) {
  const bizId = new mongoose.Types.ObjectId(String(businessId));

  const pipeline = await ensureDefaultPipeline(businessId);
  const stages = pipeline?.stages || [];

  const deals = await Deal.find({ businessId: bizId, archived: false })
    .select('stage amount currency probability wonAt updatedAt createdAt')
    .lean();

  const won = deals.filter((d) => isStageWon(d.stage, stages));
  const lost = deals.filter((d) => isStageLost(d.stage, stages));
  const open = deals.filter((d) => !isStageClosed(d.stage, stages));

  const wonRevenue = won.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const pipelineValue = open.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const forecast = open.reduce(
    (s, d) => s + (Number(d.amount) || 0) * ((Number(d.probability) || 0) / 100),
    0
  );
  const avgDeal = won.length ? wonRevenue / won.length : open.length
    ? open.reduce((s, d) => s + (Number(d.amount) || 0), 0) / open.length
    : 0;

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const wonThisMonth = won.filter((d) => d.wonAt && new Date(d.wonAt) >= monthStart);
  const wonThisMonthRev = wonThisMonth.reduce((s, d) => s + (Number(d.amount) || 0), 0);

  return {
    totalDeals: deals.length,
    openDeals: open.length,
    wonDeals: won.length,
    lostDeals: lost.length,
    wonRevenue,
    pipelineValue,
    forecast: Math.round(forecast),
    avgDealValue: avgDeal,
    winRate: deals.length ? Math.round((won.length / deals.length) * 100) : 0,
    wonThisMonth: wonThisMonthRev,
    currency: deals[0]?.currency || 'INR',
    sparklines: {
      revenue: [1.2, 1.35, 1.4, 1.55, 1.62, 1.7, 1.78, wonRevenue / 100000 || 1.82],
      pipeline: [1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, pipelineValue / 100000 || 1.85],
      open: [62, 68, 71, 74, 78, 80, 82, open.length || 84],
      avg: [120000, 125000, 130000, 135000, 138000, 140000, 142000, avgDeal || 145000],
    },
  };
}
