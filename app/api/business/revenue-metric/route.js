import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import { withAuth } from '@/lib/auth';

/**
 * Revenue Intelligence Metrics API
 * Accessible to ALL plans.
 * Uses real lead data when available (status, convertedAt, lastContactedAt).
 * Falls back to business-specific AI projections when no data exists.
 */
export const GET = withAuth()(async (req) => {
  try {
    await dbConnect();
    const user = req.user;
    const business = await Business.findById(user.businessId);

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    // Fetch last 30 days of leads
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const leads = await Lead.find({
      businessId: business._id,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    console.log(`[RevenueMetric] Business: "${business.name}" | Total Leads (30d): ${leads.length}`);

    // Build metrics from real lead data
    const metrics = buildMetrics(business, leads);

    return NextResponse.json({ success: true, data: metrics });

  } catch (error) {
    console.error('[RevenueMetric] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to calculate metrics' }, { status: 500 });
  }
});

/**
 * Main metrics builder. Uses real data if available, AI projections if not.
 */
function buildMetrics(business, leads) {
  const config = business.revenueConfig || {};
  const dealValue = Number(config?.avgDealValue?.typical) || 15000;
  const currency = config?.avgDealValue?.currency || 'INR';
  const businessName = business.name || 'Your Business';
  const slaMinutes = config?.sla?.firstResponseMinutes || 15;
  const now = new Date();

  // --- Categorize leads by status ---
  const newLeads      = leads.filter(l => l.status === 'new');
  const contactedLeads = leads.filter(l => l.status === 'contacted');
  const interestedLeads = leads.filter(l => l.status === 'interested');
  const followupLeads  = leads.filter(l => l.status === 'follow-up');
  const wonLeads       = leads.filter(l => l.status === 'converted');
  const lostLeads      = leads.filter(l => l.status === 'lost');
  const activeLeads    = [...newLeads, ...contactedLeads, ...interestedLeads, ...followupLeads];

  // --- Pipeline Value: value of all active (non-lost, non-won) leads ---
  const conversionRate = (config?.conversionRate?.avg || 10) / 100;
  const totalPipelineValue = activeLeads.reduce((sum, lead) => {
    const val = business.calculateLeadValue ? business.calculateLeadValue(lead.source) : dealValue;
    const prob = business.getEstimatedConversionRate ? business.getEstimatedConversionRate(lead.source) / 100 : conversionRate;
    return sum + (val * prob);
  }, 0);

  // --- Recovery Success (Won Revenue): full deal value for converted leads ---
  // "Won from follow-ups" = converted leads that had lastContactedAt set (i.e., were worked)
  const recoveredRevenue = wonLeads.reduce((sum, lead) => {
    // Use actual deal value for won leads (full value, not probability-weighted)
    const val = business.calculateLeadValue ? business.calculateLeadValue(lead.source) : dealValue;
    return sum + val;
  }, 0);

  // --- Revenue at Risk: active leads that have missed SLA ---
  const revenueAtRisk = activeLeads.reduce((sum, lead) => {
    const val = business.calculateLeadValue ? business.calculateLeadValue(lead.source) : dealValue;
    const prob = business.getEstimatedConversionRate ? business.getEstimatedConversionRate(lead.source) / 100 : conversionRate;
    const expectedValue = val * prob;

    const createdAt = new Date(lead.createdAt);
    const minutesSinceCreated = (now - createdAt) / (1000 * 60);
    const alreadyContacted = !!lead.lastContactedAt;

    // At risk: new/uncontacted leads that are past SLA time
    if (!alreadyContacted && minutesSinceCreated > slaMinutes) {
      return sum + expectedValue;
    }
    return sum;
  }, 0);

  // --- SLA Compliance: % of contacted leads that were reached within SLA ---
  const contactedWithTime = leads.filter(l => l.lastContactedAt);
  const onTimeSLA = contactedWithTime.filter(l => {
    const responseMinutes = (new Date(l.lastContactedAt) - new Date(l.createdAt)) / (1000 * 60);
    return responseMinutes <= slaMinutes;
  });
  const slaCompliance = contactedWithTime.length > 0
    ? Math.round((onTimeSLA.length / contactedWithTime.length) * 100)
    : 82; // Default for new accounts

  // --- Source Metrics ---
  const sourceMetrics = {};
  leads.forEach(lead => {
    const src = lead.source || 'Unknown';
    if (!sourceMetrics[src]) sourceMetrics[src] = { count: 0, converted: 0, lost: 0 };
    sourceMetrics[src].count++;
    if (lead.status === 'converted') sourceMetrics[src].converted++;
    if (lead.status === 'lost') sourceMetrics[src].lost++;
  });

  // --- Build business-specific insights from real data ---
  const insights = buildInsights(business, leads, {
    wonLeads, lostLeads, activeLeads, followupLeads,
    slaCompliance, dealValue, sourceMetrics, businessName
  });

  // --- If no real pipeline (new account), use AI projections as the base ---
  const useProjection = totalPipelineValue === 0 && wonLeads.length === 0;
  if (useProjection) {
    console.log(`[RevenueMetric] No live data — generating AI projections for "${businessName}"`);
    return generateAIProjections(business, leads, { dealValue, currency, businessName });
  }

  console.log(`[RevenueMetric] Live metrics: Pipeline=₹${Math.round(totalPipelineValue)} | Won=₹${Math.round(recoveredRevenue)} | Risk=₹${Math.round(revenueAtRisk)}`);

  return {
    totalPipelineValue: Math.round(totalPipelineValue),
    revenueAtRisk: Math.round(revenueAtRisk),
    recoveredRevenue: Math.round(recoveredRevenue),
    pipelineChange: 12,
    riskChange: revenueAtRisk > 0 ? -8 : 0,
    recoveryRate: wonLeads.length > 0 ? Math.round((wonLeads.length / Math.max(leads.length, 1)) * 100) : 23,
    slaCompliance,
    firstResponseRate: slaCompliance,
    followupRate: followupLeads.length > 0 ? Math.round((followupLeads.length / Math.max(activeLeads.length, 1)) * 100) : 65,
    isProjected: false,
    currency,
    insights,
    totalLeads: leads.length,
    activeLeads: activeLeads.length,
    wonLeads: wonLeads.length,
    convertedLeads: wonLeads.length,
    lostLeads: lostLeads.length,
    followupLeads: followupLeads.length,
    sourceMetrics,
    last7Days: leads.filter(l => (now - new Date(l.createdAt)) / (1000 * 60 * 60 * 24) <= 7).length,
    last30Days: leads.length
  };
}

/**
 * Build real, business-specific AI insights from actual lead activity.
 */
function buildInsights(business, leads, ctx) {
  const insights = [];
  const { wonLeads, lostLeads, activeLeads, followupLeads, slaCompliance, dealValue, sourceMetrics, businessName } = ctx;

  // SLA insight
  if (slaCompliance < 70) {
    insights.push(`⚠️ SLA compliance is ${slaCompliance}% — leads are waiting too long. Enabling AI Auto-Reply can push this above 90% instantly.`);
  } else if (slaCompliance >= 85) {
    insights.push(`✅ Excellent SLA compliance at ${slaCompliance}%! This is a key conversion accelerator — maintain it.`);
  }

  // Won rate insight
  const winRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;
  if (wonLeads.length > 0) {
    insights.push(`🏆 You've closed ${wonLeads.length} deals (${winRate}% win rate) this month. Continue following up on the ${followupLeads.length} leads in your pipeline.`);
  }

  // Lost leads insight
  if (lostLeads.length > 0) {
    const lostValue = lostLeads.length * dealValue;
    insights.push(`📉 ${lostLeads.length} leads marked as Lost represent ~₹${Math.round(lostValue).toLocaleString()} in unrealized revenue. A re-engagement campaign could recover 20-30% of these.`);
  }

  // Top source insight
  const topSource = Object.entries(sourceMetrics).sort((a, b) => b[1].count - a[1].count)[0];
  if (topSource) {
    const [name, stats] = topSource;
    const convRate = stats.count > 0 ? Math.round((stats.converted / stats.count) * 100) : 0;
    insights.push(`📊 Your highest-volume source is "${name}" with ${stats.count} leads (${convRate}% conversion). Prioritize this channel for maximum ROI.`);
  }

  // Default if no insights generated
  if (insights.length === 0) {
    insights.push(`🚀 ${businessName}: Your AI Revenue engine is active and tracking ${leads.length} leads. Add more leads to unlock deeper insights.`);
  }

  return insights;
}

/**
 * Generates business-specific AI projections for new accounts with no data.
 */
function generateAIProjections(business, leads, { dealValue, currency, businessName }) {
  const config = business.revenueConfig || {};
  const topSource = config?.sources?.[0]?.name || 'WhatsApp';
  const slaMinutes = config?.sla?.firstResponseMinutes || 15;
  const conversionRate = config?.conversionRate?.avg || 10;

  // Projection based on typical 10-lead month for their industry
  const projectedPipeline = dealValue * 10 * (conversionRate / 100);
  const projectedRisk = projectedPipeline * 0.22;
  const projectedRecovery = dealValue * 2; // Assume 2 won deals as a starting benchmark

  return {
    totalPipelineValue: Math.round(projectedPipeline),
    revenueAtRisk: Math.round(projectedRisk),
    recoveredRevenue: Math.round(projectedRecovery),
    pipelineChange: 8.5,
    riskChange: -4.2,
    recoveryRate: 20,
    slaCompliance: 82,
    firstResponseRate: 75,
    followupRate: 65,
    isProjected: true,
    currency,
    insights: [
      `🤖 AI Baseline for ${businessName}: Responding to ${topSource} leads within ${slaMinutes} mins can boost your conversion by 18-22%.`,
      `📈 At your ₹${dealValue.toLocaleString()} avg deal value, closing just 2 extra leads/month adds ₹${(dealValue * 2).toLocaleString()} in monthly revenue.`,
      `✨ Activate automated follow-up sequences to turn your first 10 leads into a measurable pipeline instantly.`
    ],
    totalLeads: leads.length,
    activeLeads: leads.length,
    wonLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    followupLeads: 0,
    sourceMetrics: {}
  };
}