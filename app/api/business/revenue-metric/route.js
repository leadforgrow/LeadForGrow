import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import { withPlanAccess } from '@/lib/accessControl';

export async function GET(request) {
  return withPlanAccess(request, 'analytics', async (req, user) => {
    try {
      await dbConnect();
      const business = await Business.findById(user.businessId);
      
      if (!business || !business.revenueConfig || !business.revenueIntelligenceActive) {
        return NextResponse.json({ 
          success: false, 
          error: 'Revenue intelligence not configured' 
        }, { status: 400 });
      }

      // Get time range (default: last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all leads for the business
      const leads = await Lead.find({
        businessId: business._id,
        createdAt: { $gte: thirtyDaysAgo }
      }).sort({ createdAt: -1 });

      // Calculate metrics
      const metrics = calculateRevenueMetrics(business, leads);

      return NextResponse.json({ 
        success: true, 
        data: metrics
      });
    } catch (error) {
      console.error('Error calculating revenue metrics:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to calculate metrics' 
      }, { status: 500 });
    }
  });
}

function calculateRevenueMetrics(business, leads) {
  const config = business.revenueConfig;
  const now = new Date();
  
  // Initialize metrics
  let totalPipelineValue = 0;
  let revenueAtRisk = 0;
  let recoveredRevenue = 0;
  let slaComplianceCount = 0;
  let firstResponseOnTime = 0;
  let followupOnTime = 0;
  let totalFollowups = 0;

  const sourceMetrics = {};
  const insights = [];

  leads.forEach(lead => {
    // Calculate lead value based on source
    const leadValue = business.calculateLeadValue(lead.source);
    const conversionProb = business.getEstimatedConversionRate(lead.source) / 100;
    const expectedValue = leadValue * conversionProb;

    // Add to pipeline
    if (lead.status !== 'converted' && lead.status !== 'lost') {
      totalPipelineValue += expectedValue;
    }

    // Check SLA compliance
    const createdAt = new Date(lead.createdAt);
    const firstResponseTime = lead.firstContactedAt 
      ? (new Date(lead.firstContactedAt) - createdAt) / (1000 * 60) 
      : null;
    
    const slaMinutes = config.sla.firstResponseMinutes;
    
    if (firstResponseTime !== null) {
      if (firstResponseTime <= slaMinutes) {
        firstResponseOnTime++;
      }
      slaComplianceCount++;
    }

    // Calculate revenue at risk (missed SLA)
    if (!lead.firstContactedAt) {
      const minutesSinceCreated = (now - createdAt) / (1000 * 60);
      if (minutesSinceCreated > slaMinutes) {
        revenueAtRisk += expectedValue;
      }
    } else if (firstResponseTime > slaMinutes) {
      revenueAtRisk += expectedValue * 0.5; // Partial risk
    }

    // Track recovered revenue (leads that were followed up and converted)
    if (lead.status === 'converted' && lead.followupCount > 0) {
      recoveredRevenue += leadValue;
    }

    // Follow-up tracking
    if (lead.followupCount > 0) {
      totalFollowups += lead.followupCount;
      
      const lastFollowup = lead.timeline?.[lead.timeline.length - 1];
      if (lastFollowup && lastFollowup.type === 'followup') {
        const followupTime = (new Date(lastFollowup.timestamp) - new Date(lead.firstContactedAt)) / (1000 * 60);
        if (followupTime <= config.sla.followupMinutes) {
          followupOnTime++;
        }
      }
    }

    // Source performance
    const sourceName = lead.source || 'Unknown';
    if (!sourceMetrics[sourceName]) {
      sourceMetrics[sourceName] = {
        count: 0,
        totalValue: 0,
        converted: 0,
        atRisk: 0
      };
    }
    
    sourceMetrics[sourceName].count++;
    sourceMetrics[sourceName].totalValue += expectedValue;
    if (lead.status === 'converted') sourceMetrics[sourceName].converted++;
    if (!lead.firstContactedAt && (now - createdAt) / (1000 * 60) > slaMinutes) {
      sourceMetrics[sourceName].atRisk++;
    }
  });

  // Calculate percentages
  const slaCompliance = slaComplianceCount > 0 
    ? Math.round((firstResponseOnTime / slaComplianceCount) * 100) 
    : 0;
  
  const firstResponseRate = slaComplianceCount > 0
    ? Math.round((firstResponseOnTime / slaComplianceCount) * 100)
    : 0;
  
  const followupRate = totalFollowups > 0
    ? Math.round((followupOnTime / totalFollowups) * 100)
    : 0;

  // Generate insights
  const highValueLeads = leads.filter(l => {
    const value = business.calculateLeadValue(l.source);
    return value >= config.avgDealValue.typical * 1.5;
  });
  
  const highValueAtRisk = highValueLeads.filter(l => {
    const minutesSinceCreated = (now - new Date(l.createdAt)) / (1000 * 60);
    return !l.firstContactedAt && minutesSinceCreated > config.sla.firstResponseMinutes;
  }).length;

  if (highValueAtRisk > 0) {
    const riskValue = highValueAtRisk * config.avgDealValue.high;
    insights.push(
      `${highValueAtRisk} high-value leads (${formatCurrency(riskValue, config.avgDealValue.currency)}) are past SLA - urgent action needed`
    );
  }

  // Top performing source insight
  const topSource = Object.entries(sourceMetrics)
    .sort((a, b) => b[1].totalValue - a[1].totalValue)[0];
  
  if (topSource) {
    const [sourceName, stats] = topSource;
    const avgValue = stats.totalValue / stats.count;
    const overallAvg = totalPipelineValue / leads.length;
    
    if (avgValue > overallAvg * 1.5) {
      insights.push(
        `Your ${sourceName} leads have ${Math.round((avgValue / overallAvg) * 100)}% higher value than other sources - prioritize these first`
      );
    }
  }

  // Recovery insight
  if (recoveredRevenue > 0) {
    insights.push(
      `Your follow-up efforts recovered an estimated ${formatCurrency(recoveredRevenue, config.avgDealValue.currency)} this month`
    );
  }

  // Calculate changes (mock for now - would need historical data)
  const pipelineChange = 12; // Would compare to last period
  const riskChange = -8; // Negative is good
  const recoveryRate = 23;

  return {
    totalPipelineValue: Math.round(totalPipelineValue),
    revenueAtRisk: Math.round(revenueAtRisk),
    recoveredRevenue: Math.round(recoveredRevenue),
    pipelineChange,
    riskChange,
    recoveryRate,
    slaCompliance,
    firstResponseRate,
    followupRate,
    highValueAtRisk: highValueLeads.length,
    sourceMetrics,
    insights,
    
    // Additional metrics
    totalLeads: leads.length,
    activeLeads: leads.filter(l => l.status === 'new' || l.status === 'contacted').length,
    convertedLeads: leads.filter(l => l.status === 'converted').length,
    lostLeads: leads.filter(l => l.status === 'lost').length,
    
    // Time periods
    last7Days: leads.filter(l => {
      const daysDiff = (now - new Date(l.createdAt)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length,
    
    last30Days: leads.length
  };
}

function formatCurrency(value, currency = 'INR') {
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${Math.round(value).toLocaleString()}`;
}