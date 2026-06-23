import { WON_STAGES, LOST_STAGES, CLOSED_STAGES } from './stageKeys.js';
import { DEFAULT_DEAL_STAGES, STAGE_PROBABILITY } from './pipelineStages.js';

export function isOpenDeal(stage) {
  return !CLOSED_STAGES.includes(stage);
}

export function computeDealRevenue(deals = []) {
  let pipelineRevenue = 0;
  let wonRevenue = 0;
  let lostRevenue = 0;
  let expectedRevenue = 0;
  let openCount = 0;
  let wonCount = 0;
  let lostCount = 0;

  for (const deal of deals) {
    const amount = Number(deal.amount) || 0;
    const stage = deal.stage;

    if (WON_STAGES.includes(stage)) {
      wonRevenue += amount;
      wonCount += 1;
    } else if (LOST_STAGES.includes(stage)) {
      lostRevenue += amount;
      lostCount += 1;
    } else {
      pipelineRevenue += amount;
      openCount += 1;
      const prob = deal.probability ?? STAGE_PROBABILITY[stage] ?? 10;
      expectedRevenue += amount * (prob / 100);
    }
  }

  const closedCount = wonCount + lostCount;
  const conversionRate = closedCount ? Math.round((wonCount / closedCount) * 100) : 0;
  const avgDealSize = wonCount ? Math.round(wonRevenue / wonCount) : 0;

  return {
    pipelineRevenue: Math.round(pipelineRevenue),
    wonRevenue: Math.round(wonRevenue),
    lostRevenue: Math.round(lostRevenue),
    expectedRevenue: Math.round(expectedRevenue),
    openCount,
    wonCount,
    lostCount,
    conversionRate,
    avgDealSize,
  };
}

export function buildStageBreakdown(deals = [], pipelineStages = DEFAULT_DEAL_STAGES) {
  const byStage = {};
  for (const stage of pipelineStages) {
    byStage[stage.key] = { count: 0, totalValue: 0 };
  }

  for (const deal of deals) {
    const key = byStage[deal.stage] ? deal.stage : 'new_lead';
    if (!byStage[key]) byStage[key] = { count: 0, totalValue: 0 };
    byStage[key].count += 1;
    byStage[key].totalValue += Number(deal.amount) || 0;
  }

  return pipelineStages.map((stage) => {
    const row = byStage[stage.key] || { count: 0, totalValue: 0 };
    return {
      key: stage.key,
      label: stage.label,
      color: stage.color,
      probability: stage.probability,
      count: row.count,
      totalValue: Math.round(row.totalValue),
      avgValue: row.count ? Math.round(row.totalValue / row.count) : 0,
      isWon: !!stage.isWon,
      isLost: !!stage.isLost,
    };
  });
}

export function monthBounds(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

export function wonRevenueInRange(deals, start, end) {
  return deals
    .filter((d) => WON_STAGES.includes(d.stage))
    .filter((d) => {
      const at = d.wonAt ? new Date(d.wonAt) : new Date(d.updatedAt);
      return at >= start && at < end;
    })
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
}
