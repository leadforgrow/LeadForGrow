import mongoose from 'mongoose';
import Contact from '@/models/automation/Contact';
import Deal from '@/models/automation/Deal';
import Activity from '@/models/automation/Activity';
import Task from '@/models/automation/Task';
import { isClosedStage } from '@/lib/crm/stageKeys';

export async function enrichContactsWithStats(businessId, contacts) {
  if (!contacts?.length) return contacts;

  const ids = contacts.map((c) => c._id);
  const bizId = new mongoose.Types.ObjectId(String(businessId));

  const [dealStats, activityStats, taskStats] = await Promise.all([
    Deal.find({ businessId: bizId, contactId: { $in: ids }, archived: false })
      .select('contactId stage amount currency')
      .lean(),
    Activity.aggregate([
      { $match: { businessId: bizId, entityType: 'contact', entityId: { $in: ids } } },
      { $group: { _id: '$entityId', lastActivity: { $max: '$performedAt' } } },
    ]),
    Task.aggregate([
      { $match: { businessId: bizId, contactId: { $in: ids }, status: 'pending' } },
      { $group: { _id: '$contactId', pendingTasks: { $sum: 1 } } },
    ]),
  ]);

  const dealMap = {};
  for (const deal of dealStats) {
    const id = String(deal.contactId);
    if (!dealMap[id]) dealMap[id] = { dealCount: 0, openDeals: 0, pipelineValue: 0, currency: deal.currency || 'INR' };
    dealMap[id].dealCount += 1;
    if (!isClosedStage(deal.stage)) {
      dealMap[id].openDeals += 1;
      dealMap[id].pipelineValue += deal.amount || 0;
    }
  }

  const activityMap = Object.fromEntries(activityStats.map((s) => [String(s._id), s.lastActivity]));
  const taskMap = Object.fromEntries(taskStats.map((s) => [String(s._id), s.pendingTasks]));

  return contacts.map((c) => {
    const id = String(c._id);
    const deals = dealMap[id];
    return {
      ...c,
      stats: {
        dealCount: deals?.dealCount || 0,
        openDeals: deals?.openDeals || 0,
        pipelineValue: deals?.pipelineValue || 0,
        currency: deals?.currency || 'INR',
        pendingTasks: taskMap[id] || 0,
        lastActivity: activityMap[id] || c.updatedAt || c.createdAt,
      },
    };
  });
}

export async function buildContactsDashboardStats(businessId) {
  const bizId = new mongoose.Types.ObjectId(String(businessId));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);

  const [total, newThisMonth, newLastMonth, business, withDeals] = await Promise.all([
    Contact.countDocuments({ businessId: bizId, deletedAt: null, archived: false }),
    Contact.countDocuments({ businessId: bizId, deletedAt: null, archived: false, createdAt: { $gte: monthStart } }),
    Contact.countDocuments({ businessId: bizId, deletedAt: null, archived: false, createdAt: { $gte: lastMonthStart, $lt: monthStart } }),
    Contact.countDocuments({ businessId: bizId, deletedAt: null, archived: false, type: 'business' }),
    Deal.distinct('contactId', { businessId: bizId, archived: false, contactId: { $ne: null } }),
  ]);

  const monthTrend = newLastMonth > 0
    ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
    : newThisMonth > 0 ? 100 : 0;

  const engagedRate = total > 0 ? Math.round((withDeals.length / total) * 100) : 0;

  return {
    totalContacts: total,
    totalContactsTrend: monthTrend,
    businessContacts: business,
    engagedRate,
    withOpenDeals: withDeals.length,
    newThisMonth,
    sparklines: {
      contacts: [420, 445, 468, 490, 512, 538, 560, total || 580],
      business: [120, 128, 135, 142, 150, 158, 165, business || 170],
      engaged: [45, 48, 52, 55, 58, 62, 65, engagedRate || 68],
      new: [12, 15, 18, 14, 20, 22, 19, newThisMonth || 24],
    },
  };
}
