/**
 * LeadForGrow Automation Worker
 *
 * The worker runs inside the Next.js process when IS_WORKER=true.
 * Start a dedicated worker instance (separate from the API server):
 *
 *   IS_WORKER=true REDIS_URL=redis://... npm run worker
 *
 * In production, deploy this as a separate service/container from the API.
 */
process.env.IS_WORKER = 'true';

console.log('[Worker] IS_WORKER=true — worker will initialize when lib/queue is loaded.');
console.log('[Worker] Start with: npm run worker');

import('../lib/queue.js').catch((err) => {
  console.error('[Worker] Failed to load queue module:', err.message);
  process.exit(1);
});

// Keep process alive
setInterval(() => {}, 60_000);
