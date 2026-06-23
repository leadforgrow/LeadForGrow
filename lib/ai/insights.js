import Lead from '@/models/automation/Lead';
import Deal from '@/models/automation/Deal';
import Message from '@/models/automation/Message';
import Conversation from '@/models/omnichannel/Conversation';
import Task from '@/models/automation/Task';
import { computeLeadIntelligence } from '@/lib/leadIntelligence';

export async function generateInsights(businessId) {
  const now = new Date();
  const dayAgo = new Date(now - 86400000);

  const [leads, deals, unreadConvs, overdueTasks, recentMessages] = await Promise.all([
    Lead.find({ businessId, archived: { $ne: true } }).sort({ createdAt: -1 }).limit(200).lean(),
    Deal.find({ businessId, stage: { $nin: ['won', 'lost'] } }).lean(),
    Conversation.find({ businessId, inboxStatus: 'unread', isDeleted: { $ne: true } }).countDocuments(),
    Task.find({ businessId, status: { $ne: 'completed' }, dueDate: { $lt: now } }).countDocuments(),
    Message.find({ businessId, timestamp: { $gte: dayAgo } }).countDocuments(),
  ]);

  const hotLeads = leads
    .filter((l) => l.priority === 'high' || l.priority === 'urgent' || l.status === 'new')
    .slice(0, 5)
    .map((l) => {
      const intel = computeLeadIntelligence(l);
      return { id: l._id, name: l.name, score: intel.intelligence.engagementScore.score, action: intel.intelligence.nextAction.action };
    });

  const dealsAtRisk = deals
    .filter((d) => d.stage !== 'won' && d.updatedAt && new Date(d.updatedAt) < new Date(now - 7 * 86400000))
    .slice(0, 5)
    .map((d) => ({ id: d._id, title: d.title, amount: d.amount, stage: d.stage }));

  const pipelineValue = deals.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const waitingCustomers = unreadConvs;

  const revenueOpportunities = deals
    .filter((d) => ['negotiation', 'proposal', 'qualified'].includes(d.stage))
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 3)
    .map((d) => ({ id: d._id, title: d.title, amount: d.amount }));

  return {
    nextBestActions: hotLeads.map((l) => ({ leadId: l.id, leadName: l.name, action: l.action })),
    recommendedFollowups: leads.filter((l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= now).slice(0, 5).map((l) => ({ leadId: l._id, name: l.name, due: l.nextFollowUpAt })),
    dealsAtRisk,
    customersWaiting: waitingCustomers,
    revenueOpportunities,
    customerSentiment: recentMessages > 20 ? 'active' : recentMessages > 5 ? 'moderate' : 'quiet',
    responseQuality: overdueTasks === 0 ? 'good' : overdueTasks < 5 ? 'needs_attention' : 'poor',
    leadQuality: hotLeads.length > 3 ? 'high' : hotLeads.length > 0 ? 'mixed' : 'low',
    hotLeads,
    pipelineValue,
    stats: { totalLeads: leads.length, activeDeals: deals.length, messagesToday: recentMessages, overdueTasks },
  };
}

export default { generateInsights };
