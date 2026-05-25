import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import AutomationRule from '@/models/automation/AutomationRule';
import AutomationSequence from '@/models/automation/AutomationSequence';
import Form from '@/models/Form';
import Task from '@/models/automation/Task';

import { ASSISTANT_NAME } from '@/lib/assistant/brand';

function getTopSource(sourceMetrics) {
  const entries = Object.entries(sourceMetrics || {});
  if (!entries.length) return 'Unknown';
  return entries.sort((a, b) => b[1].count - a[1].count)[0][0];
}

/**
 * Build rich business context for the AI assistant (company-facing, not lead-facing).
 */
export async function buildBusinessAssistantContext(businessId, userId) {
  const business = await Business.findById(businessId).lean();
  if (!business) return null;

  const dealValue = Number(business.revenueConfig?.avgDealValue?.typical) || 15000;
  const currency = business.revenueConfig?.avgDealValue?.currency || 'INR';
  const businessName = business.businessName || business.name || 'Your Business';
  const slaMinutes = business.revenueConfig?.sla?.firstResponseMinutes || 15;

  const [leads, activeRules, sequences, forms, overdueTasks, newLeadsCount] = await Promise.all([
    Lead.find({ businessId, archived: { $ne: true } }).sort({ createdAt: -1 }).limit(500).lean(),
    AutomationRule.countDocuments({ businessId, enabled: true }),
    AutomationSequence.countDocuments({ businessId, status: 'active' }),
    Form.countDocuments({ businessId, active: { $ne: false } }),
    Task.countDocuments({ businessId, status: 'pending', dueDate: { $lt: new Date() } }),
    Lead.countDocuments({ businessId, status: 'new', archived: { $ne: true } }),
  ]);

  const wonLeads = leads.filter((l) => ['converted', 'won', 'finalized'].includes(String(l.status).toLowerCase()));
  const lostLeads = leads.filter((l) => l.status === 'lost');
  const activeLeads = leads.filter((l) => !['converted', 'lost', 'won', 'finalized'].includes(String(l.status).toLowerCase()));
  const followupLeads = leads.filter((l) => l.status === 'follow-up' || l.status === 'follow-up');

  const totalPipelineValue = activeLeads.length * dealValue;
  const recoveredRevenue = wonLeads.length * dealValue;
  const revenueAtRisk = activeLeads.filter((l) => l.status === 'new' || !l.lastContactedAt).length * dealValue;

  const sourceMetrics = {};
  leads.forEach((lead) => {
    const src = lead.source || 'Unknown';
    if (!sourceMetrics[src]) sourceMetrics[src] = { count: 0, converted: 0 };
    sourceMetrics[src].count++;
    if (lead.status === 'converted') sourceMetrics[src].converted++;
  });

  const contactedWithTime = leads.filter((l) => l.lastContactedAt);
  const onTimeSLA = contactedWithTime.filter((l) => {
    const mins = (new Date(l.lastContactedAt) - new Date(l.createdAt)) / 60000;
    return mins <= slaMinutes;
  });
  const slaCompliance = contactedWithTime.length
    ? Math.round((onTimeSLA.length / contactedWithTime.length) * 100)
    : 82;

  const hotLeads = leads
    .filter((l) => l.status === 'new')
    .slice(0, 5)
    .map((l) => ({ name: l.name, phone: l.phone, source: l.source, receivedAt: l.receivedAt || l.createdAt }));

  const creds = business.integrationCredentials || {};
  const integrations = {
    whatsapp: Boolean(creds.whatsapp?.enabled),
    email: Boolean(creds.email?.enabled),
    metaAds: Boolean(creds.facebookAds?.enabled),
  };

  return {
    businessName,
    plan: business.plan || 'free',
    industry: business.industry || business.category || 'General',
    currency,
    dealValue,
    slaMinutes,
    metrics: {
      totalLeads: leads.length,
      activeLeads: activeLeads.length,
      newLeads: newLeadsCount,
      wonLeads: wonLeads.length,
      lostLeads: lostLeads.length,
      followupLeads: followupLeads.length,
      totalPipelineValue: Math.round(totalPipelineValue),
      recoveredRevenue: Math.round(recoveredRevenue),
      revenueAtRisk: Math.round(revenueAtRisk),
      slaCompliance,
      winRate: leads.length ? Math.round((wonLeads.length / leads.length) * 100) : 0,
    },
    operations: {
      activeAutomationRules: activeRules,
      activeSequences: sequences,
      activeForms: forms,
      overdueTasks,
    },
    topSource: getTopSource(sourceMetrics),
    sourceMetrics,
    hotLeads,
    integrations,
    workingHours: business.businessHours || business.revenueConfig?.workingHours,
    quotas: business.quotas,
  };
}

export function formatCurrency(value, currency = 'INR') {
  const sym = currency === 'INR' ? '₹' : '$';
  const n = Number(value) || 0;
  if (n >= 100000) return `${sym}${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${sym}${(n / 1000).toFixed(1)}K`;
  return `${sym}${n.toLocaleString()}`;
}

/**
 * Local intelligent fallback when AI backend is unreachable.
 */
export function generateLocalAnswer(question, ctx) {
  const q = question.toLowerCase();
  const m = ctx.metrics;
  const cur = formatCurrency(m.totalPipelineValue, ctx.currency);
  const risk = formatCurrency(m.revenueAtRisk, ctx.currency);
  const won = formatCurrency(m.recoveredRevenue, ctx.currency);

  if (/pipeline|revenue|deal|money|sales/.test(q)) {
    return `**${ctx.businessName} pipeline snapshot**\n\n• Active pipeline: **${cur}** (${m.activeLeads} active leads × ${formatCurrency(ctx.dealValue, ctx.currency)} avg deal)\n• Won revenue: **${won}** (${m.wonLeads} closed deals)\n• At risk: **${risk}** — mostly new/uncontacted leads\n• Win rate: **${m.winRate}%**\n\nTop lead source: **${ctx.topSource}**. Focus follow-ups there for fastest ROI.`;
  }

  if (/lead|call|contact|follow|today|who should/.test(q)) {
    const hot = ctx.hotLeads.slice(0, 3);
    if (!hot.length) {
      return `No hot **new leads** waiting right now. ${m.totalLeads} total leads in CRM. Consider running a reactivation sequence on ${m.followupLeads} follow-up leads or launching Meta/WhatsApp campaigns.`;
    }
    const list = hot.map((l, i) => `${i + 1}. **${l.name}** (${l.phone || 'no phone'}) — ${l.source || 'direct'}`).join('\n');
    return `**Priority calls for ${ctx.businessName} today:**\n\n${list}\n\n${m.newLeads} new leads need first contact. Your SLA target is **${ctx.slaMinutes} minutes** — current compliance: **${m.slaCompliance}%**.`;
  }

  if (/automation|sequence|workflow|whatsapp|email/.test(q)) {
    const parts = [];
    parts.push(`**Automation status for ${ctx.businessName}:**`);
    parts.push(`• ${ctx.operations.activeAutomationRules} automation rules active`);
    parts.push(`• ${ctx.operations.activeSequences} sequences running`);
    parts.push(`• WhatsApp: ${ctx.integrations.whatsapp ? '✅ connected' : '❌ not connected'}`);
    parts.push(`• Email: ${ctx.integrations.email ? '✅ connected' : '❌ not connected'}`);
    if (!ctx.integrations.whatsapp) parts.push('\n💡 Connect WhatsApp in Integrations to unlock instant lead acknowledgements — Indian SMBs see 2× response rates.');
    if (m.newLeads > 0 && ctx.operations.activeAutomationRules === 0) {
      parts.push('\n⚠️ You have new leads but no active automations. Enable **Instant Lead Acknowledgement** in Automation Rules.');
    }
    return parts.join('\n');
  }

  if (/sla|response|speed|reply/.test(q)) {
    return `**Response performance**\n\n• SLA compliance: **${m.slaCompliance}%** (target: respond within ${ctx.slaMinutes} min)\n• ${m.newLeads} leads still in **new** status\n• ${ctx.operations.overdueTasks} overdue tasks\n\nRecommendation: Enable WhatsApp auto-reply + assign hot leads to your fastest closer within 5 minutes.`;
  }

  if (/plan|quota|limit|upgrade/.test(q)) {
    return `**${ctx.businessName} account**\n\n• Plan: **${ctx.plan}**\n• Team limit: ${ctx.quotas?.maxTeamMembers ?? '—'} members\n• Forms limit: ${ctx.quotas?.maxForms ?? '—'}\n• Automation rules: ${ctx.quotas?.maxAutomationRules ?? '—'}\n\nYou're using ${ctx.operations.activeAutomationRules} active automations and ${ctx.operations.activeForms} forms.`;
  }

  if (/summary|overview|status|how am i|how are we/.test(q)) {
    return `**${ctx.businessName} — Business summary**\n\n📊 **${m.totalLeads}** total leads · **${m.activeLeads}** in pipeline · **${m.wonLeads}** won\n💰 Pipeline **${cur}** · Won **${won}** · At risk **${risk}**\n⚡ SLA **${m.slaCompliance}%** · Top source **${ctx.topSource}**\n🤖 **${ctx.operations.activeAutomationRules}** automations · **${ctx.operations.activeSequences}** sequences\n\nAsk me about leads to call, automation setup, or revenue recovery strategies.`;
  }

  return `I'm **${ASSISTANT_NAME}**, ${ctx.businessName}'s growth advisor — I know your pipeline, automations, and team metrics.\n\nRight now: **${m.totalLeads} leads**, **${cur}** pipeline, **${m.slaCompliance}%** SLA compliance.\n\nTry asking:\n• "Who should I call today?"\n• "Pipeline summary"\n• "Automation status"\n• "What's my revenue at risk?"`;
}
