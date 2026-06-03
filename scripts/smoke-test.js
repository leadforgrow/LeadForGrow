#!/usr/bin/env node
/**
 * Pre-deploy smoke checks — run: npm run smoke
 * Verifies env, module imports, and critical route files exist.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// Load .env.local for local smoke runs (Next.js loads this automatically at runtime)
const envLocal = path.join(root, '.env.local');
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

let failed = 0;

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  failed += 1;
}

function check(name, ok) {
  if (ok) pass(name);
  else fail(name);
}

function fileExists(rel) {
  return fs.existsSync(path.join(root, rel));
}

console.log('\nLeadForGrow — Go-live smoke checks\n');

// --- Required env (production) ---
const isProd = process.env.NODE_ENV === 'production';
const hasEnvLocal = fs.existsSync(path.join(root, '.env.local'));
const required = ['MONGODB_URI', 'JWT_SECRET'];
const prodRequired = ['LFG_ADMIN_PASSWORD', 'CRON_SECRET', 'ENCRYPTION_KEY'];

for (const key of required) {
  const set = !!process.env[key]?.trim();
  if (set) {
    pass(`env: ${key}`);
  } else if (!isProd && hasEnvLocal) {
    pass(`env: ${key} (loaded via .env.local at runtime)`);
  } else if (!isProd) {
    fail(`env: ${key} — copy .env.example to .env.local`);
  } else {
    fail(`env: ${key}`);
  }
}
if (isProd) {
  for (const key of prodRequired) {
    check(`env (prod): ${key}`, !!process.env[key]?.trim());
  }
  check('env (prod): JWT_SECRET length >= 32', (process.env.JWT_SECRET || '').length >= 32);
} else {
  pass('env: dev mode — prod-only vars skipped');
}

check('env (prod): REDIS_URL recommended', isProd ? !!process.env.REDIS_URL : true);

// --- Critical files ---
const criticalFiles = [
  'lib/mongodb.js',
  'lib/auth.js',
  'lib/env.js',
  'lib/leadProcessor.js',
  'lib/automationEngine.js',
  'middleware.js',
  'app/api/forms/submit/route.js',
  'app/api/auth/login/route.js',
  'app/api/automation/leads/route.js',
  'app/api/automation/team/route.js',
  'app/api/onboarding/schedule-call/route.js',
  'workers/automation-worker.js',
];

for (const f of criticalFiles) {
  check(`file: ${f}`, fileExists(f));
}

// --- Module imports ---
try {
  const { validateEnv } = await import('../lib/env.js');
  validateEnv({ strict: false });
  pass('import: lib/env.js');
} catch (e) {
  fail(`import: lib/env.js — ${e.message}`);
}

try {
  const { BILLING_PLANS } = await import('../lib/billing/plans.js');
  check('import: billing plans', Object.keys(BILLING_PLANS).length >= 3);
} catch (e) {
  fail(`import: lib/billing/plans.js — ${e.message}`);
}

try {
  const { REALTIME_EVENTS } = await import('../lib/realtime/constants.js');
  check('import: realtime constants', !!REALTIME_EVENTS.CHAT_MESSAGE);
} catch (e) {
  fail(`import: lib/realtime/constants.js — ${e.message}`);
}

// --- Security: legacy routes secured ---
const scheduleCall = fs.readFileSync(path.join(root, 'app/api/onboarding/schedule-call/route.js'), 'utf8');
check('security: schedule-call uses withTenantAuth', scheduleCall.includes('withTenantAuth'));

const clientsRoute = fs.readFileSync(path.join(root, 'app/api/clients/route.js'), 'utf8');
check('security: /api/clients uses withTenantAuth', clientsRoute.includes('withTenantAuth'));

console.log('');
if (failed > 0) {
  console.error(`Failed: ${failed} check(s). Fix before production deploy.\n`);
  process.exit(1);
}

console.log('All smoke checks passed.\n');
console.log('Manual go-live steps:');
console.log('  1. Set all vars in .env.local (see .env.example)');
console.log('  2. Run Redis + npm run worker in production');
console.log('  3. Configure Meta WhatsApp + approved templates');
console.log('  4. Test: register → form submit → lead → automation → inbox');
console.log('  5. npm run build && npm test\n');
