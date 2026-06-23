import mongoose from 'mongoose';
import Contact from '@/models/automation/Contact';
import Deal from '@/models/automation/Deal';
import Activity from '@/models/automation/Activity';
import { isClosedStage } from '@/lib/crm/stageKeys';

/**
 * Attach contact/deal/revenue/last-activity stats to company list rows.
 */
export async function enrichCompaniesWithStats(businessId, companies) {
  if (!companies?.length) return companies;

  const ids = companies.map((c) => c._id);
  const bizId = new mongoose.Types.ObjectId(String(businessId));

  const [contactStats, dealStats, activityStats] = await Promise.all([
    Contact.aggregate([
      { $match: { businessId: bizId, companyId: { $in: ids }, archived: false, deletedAt: null } },
      { $group: { _id: '$companyId', contactCount: { $sum: 1 } } },
    ]),
    Deal.aggregate([
      { $match: { businessId: bizId, companyId: { $in: ids }, archived: false } },
      {
        $group: {
          _id: '$companyId',
          dealCount: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          currency: { $first: '$currency' },
        },
      },
    ]),
    Activity.aggregate([
      { $match: { businessId: bizId, entityType: 'company', entityId: { $in: ids } } },
      { $group: { _id: '$entityId', lastActivity: { $max: '$performedAt' } } },
    ]),
  ]);

  const contactMap = Object.fromEntries(contactStats.map((s) => [String(s._id), s.contactCount]));
  const dealMap = Object.fromEntries(dealStats.map((s) => [String(s._id), s]));
  const activityMap = Object.fromEntries(activityStats.map((s) => [String(s._id), s.lastActivity]));

  return companies.map((c) => {
    const id = String(c._id);
    const deals = dealMap[id];
    return {
      ...c,
      stats: {
        contactCount: contactMap[id] || 0,
        dealCount: deals?.dealCount || 0,
        totalRevenue: deals?.totalRevenue || 0,
        currency: deals?.currency || c.revenueCurrency || 'INR',
        lastActivity: activityMap[id] || c.updatedAt || c.createdAt,
      },
    };
  });
}

export function buildCompanySummary(company, contacts, deals) {
  const openDeals = (deals || []).filter((d) => !isClosedStage(d.stage));
  const totalRevenue = (deals || []).reduce((sum, d) => sum + (d.amount || 0), 0);
  const wonRevenue = (deals || [])
    .filter((d) => d.stage === 'won' || d.stage === 'closed_won')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return {
    totalContacts: contacts?.length || 0,
    activeContacts: (contacts || []).filter((c) => !c.archived).length,
    totalDeals: deals?.length || 0,
    openDeals: openDeals.length,
    totalRevenue,
    wonRevenue,
    currency: deals?.[0]?.currency || company.revenueCurrency || 'INR',
  };
}
