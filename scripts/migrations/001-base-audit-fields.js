/**
 * Migration: add base audit fields to core collections.
 * Safe to re-run — only sets fields that are missing.
 */
export const id = '001-base-audit-fields';
export const description = 'Add createdBy, updatedBy, deletedAt, version to core collections';

const COLLECTIONS = [
  'leads',
  'users',
  'businesses',
  'tasks',
  'activities',
  'automationrules',
  'automationsequences',
  'forms',
  'integrations',
];

export async function up(db) {
  for (const name of COLLECTIONS) {
    const col = db.collection(name);
    const result = await col.updateMany(
      { version: { $exists: false } },
      {
        $set: {
          createdBy: null,
          updatedBy: null,
          deletedAt: null,
          version: 0,
        },
      }
    );
    console.log(`  ${name}: ${result.modifiedCount} documents updated`);
  }
}

export async function down(db) {
  for (const name of COLLECTIONS) {
    await db.collection(name).updateMany(
      {},
      { $unset: { createdBy: '', updatedBy: '', deletedAt: '', version: '' } }
    );
  }
}
