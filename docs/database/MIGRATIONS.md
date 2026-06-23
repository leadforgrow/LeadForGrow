# Database Migrations

## Running Migrations

```bash
# Apply all pending migrations
npm run migrate

# Check which migrations have been applied
npm run migrate:status

# Roll back the most recent migration
node scripts/migrate.js down
```

Migrations are tracked in the `_migrations` collection.

## Creating a Migration

Create a file in `scripts/migrations/` with a numeric prefix:

```javascript
// scripts/migrations/002-add-field.js
export const id = '002-add-field';
export const description = 'Add newField to leads';

export async function up(db) {
  await db.collection('leads').updateMany(
    { newField: { $exists: false } },
    { $set: { newField: null } }
  );
}

export async function down(db) {
  await db.collection('leads').updateMany({}, { $unset: { newField: '' } });
}
```

## Rules

1. Migrations must be **idempotent** (safe to re-run logic via `$exists` checks)
2. Never delete data in `up()` without explicit backup strategy
3. Always implement `down()` for rollback
4. Test locally before production deploy
