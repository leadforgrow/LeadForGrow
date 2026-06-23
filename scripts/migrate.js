#!/usr/bin/env node
/**
 * Database migration runner.
 * Usage: node scripts/migrate.js [up|down|status]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { dbConnect } from '../lib/mongodb.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const command = process.argv[2] || 'up';

async function loadMigrations() {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.js')).sort();
  const migrations = [];
  for (const file of files) {
    const mod = await import(path.join(MIGRATIONS_DIR, file));
    migrations.push({ file, ...mod });
  }
  return migrations;
}

async function getApplied(db) {
  const col = db.collection('_migrations');
  const docs = await col.find({}).sort({ appliedAt: 1 }).toArray();
  return new Set(docs.map((d) => d.id));
}

async function markApplied(db, migration) {
  await db.collection('_migrations').insertOne({
    id: migration.id,
    description: migration.description,
    file: migration.file,
    appliedAt: new Date(),
  });
}

async function unmark(db, id) {
  await db.collection('_migrations').deleteOne({ id });
}

async function status() {
  await dbConnect();
  const db = mongoose.connection.db;
  const migrations = await loadMigrations();
  const applied = await getApplied(db);

  console.log('\nMigration status:\n');
  for (const m of migrations) {
    const mark = applied.has(m.id) ? '✓' : '○';
    console.log(`  ${mark} ${m.id} — ${m.description}`);
  }
  process.exit(0);
}

async function up() {
  await dbConnect();
  const db = mongoose.connection.db;
  const migrations = await loadMigrations();
  const applied = await getApplied(db);

  for (const m of migrations) {
    if (applied.has(m.id)) {
      console.log(`  skip ${m.id} (already applied)`);
      continue;
    }
    console.log(`  applying ${m.id}...`);
    await m.up(db);
    await markApplied(db, m);
    console.log(`  ✓ ${m.id}`);
  }

  console.log('\nMigrations complete.');
  process.exit(0);
}

async function down() {
  await dbConnect();
  const db = mongoose.connection.db;
  const migrations = await loadMigrations();
  const applied = await getApplied(db);
  const last = [...migrations].reverse().find((m) => applied.has(m.id));

  if (!last) {
    console.log('No migrations to roll back.');
    process.exit(0);
  }

  console.log(`  rolling back ${last.id}...`);
  await last.down(db);
  await unmark(db, last.id);
  console.log(`  ✓ rolled back ${last.id}`);
  process.exit(0);
}

try {
  if (command === 'status') await status();
  else if (command === 'down') await down();
  else await up();
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}
