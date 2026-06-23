/**
 * Migration: Phase 2 CRM collections and field backfill.
 */
export const id = '002-crm-phase2';
export const description = 'Create CRM indexes and backfill entity fields on activities';

const NEW_COLLECTIONS = ['contacts', 'companies', 'pipelines', 'crmnotes', 'crmattachments', 'savedviews', 'crmcustomfields', 'crmcomments'];

export async function up(db) {
  // Backfill activity entityType/entityId from leadId
  const activities = db.collection('activities');
  const actResult = await activities.updateMany(
    { entityId: { $exists: false }, leadId: { $exists: true } },
    [{ $set: { entityType: 'lead', entityId: '$leadId' } }]
  );
  console.log(`  activities: ${actResult.modifiedCount} backfilled with entityType/entityId`);

  // Ensure deals have ownerId from assignedTo where missing
  const deals = db.collection('deals');
  const dealResult = await deals.updateMany(
    { ownerId: { $exists: false }, assignedTo: { $exists: true } },
    [{ $set: { ownerId: '$assignedTo' } }]
  );
  console.log(`  deals: ${dealResult.modifiedCount} backfilled ownerId`);

  // Create default pipeline per business that has deals but no pipeline
  const businesses = await db.collection('businesses').find({}).toArray();
  for (const biz of businesses) {
    const existing = await db.collection('pipelines').findOne({ businessId: biz._id, isDefault: true });
    if (!existing) {
      await db.collection('pipelines').insertOne({
        businessId: biz._id,
        name: 'Sales Pipeline',
        entityType: 'deal',
        isDefault: true,
        archived: false,
        stages: [
          { key: 'qualification', label: 'Qualification', order: 0, color: '#6366f1', probability: 10 },
          { key: 'proposal', label: 'Proposal', order: 1, color: '#8b5cf6', probability: 30 },
          { key: 'negotiation', label: 'Negotiation', order: 2, color: '#f59e0b', probability: 60 },
          { key: 'closed_won', label: 'Closed Won', order: 3, color: '#10b981', probability: 100, isWon: true },
          { key: 'closed_lost', label: 'Closed Lost', order: 4, color: '#ef4444', probability: 0, isLost: true },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        version: 0,
      });
      console.log(`  Created default pipeline for business ${biz._id}`);
    }
  }

  for (const name of NEW_COLLECTIONS) {
    const indexes = await db.collection(name).indexes();
    console.log(`  ${name}: ${indexes.length} indexes`);
  }
}

export async function down(db) {
  await db.collection('pipelines').deleteMany({ name: 'Sales Pipeline', isDefault: true });
  await db.collection('activities').updateMany(
    {},
    { $unset: { entityType: '', entityId: '' } }
  );
}
