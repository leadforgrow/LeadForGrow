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

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Worker] Received ${signal}, shutting down gracefully...`);
  try {
    const { automationQueue } = await import('../lib/queue.js');
    if (automationQueue) {
      await automationQueue.close();
      console.log('[Worker] Queue closed.');
    }
  } catch (err) {
    console.error('[Worker] Shutdown error:', err.message);
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

import('../lib/queue.js').catch((err) => {
  console.error('[Worker] Failed to load queue module:', err.message);
  process.exit(1);
});

import('../lib/queue.js').catch((err) => {
  console.error('[Worker] Failed to load queue module:', err.message);
  process.exit(1);
});

// Resume WhatsApp Flow delay nodes + keep process alive
setInterval(async () => {
  try {
    const { resumeDueFlowDelays } = await import('../lib/whatsappFlows/engine.js');
    const n = await resumeDueFlowDelays(50);
    if (n > 0) console.log(`[Worker] Resumed ${n} WhatsApp flow delay(s)`);
  } catch (err) {
    /* engine may fail if Mongo not ready — ignore */
  }
}, 60_000);

// Dispatch due autoSend follow-up tasks (email/WhatsApp) — this is what actually
// sends delayed automated follow-ups. Without this interval, tasks created with
// autoSend:true would sit pending forever on any deployment with no external cron.
setInterval(async () => {
  try {
    const { processDueTasks } = await import('../lib/automation/processDueTasks.js');
    const { processed } = await processDueTasks();
    if (processed > 0) console.log(`[Worker] Processed ${processed} due follow-up task(s)`);
  } catch (err) {
    /* engine may fail if Mongo not ready — ignore */
  }
}, 60_000);
