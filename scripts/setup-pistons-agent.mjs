/**
 * Set up Pistons Garage for AI auto-reply and verify it end-to-end:
 *   1. Enable AI + WhatsApp auto-reply agent
 *   2. Archive the booking flow (so it stops triggering)
 *   3. Clear old flow executions (no leftover "waiting" state)
 *   4. Add + index a knowledge source
 *   5. Test runSalesAgent with a real question
 *
 * Run: node --use-system-ca --import ./scripts/register-alias.mjs scripts/setup-pistons-agent.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

function loadEnvLocal() {
  const raw = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) {
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}
loadEnvLocal();

const BUSINESS_ID = '6a2a8240496c2d8be7b744f3';

const { default: Business } = await import('@/models/Business');
const { default: WhatsAppFlow } = await import('@/models/automation/WhatsAppFlow');
const { default: FlowExecution } = await import('@/models/automation/FlowExecution');
const { default: KnowledgeSource } = await import('@/models/ai/KnowledgeSource');
const { default: KnowledgeChunk } = await import('@/models/ai/KnowledgeChunk');
const { ingestSource } = await import('@/lib/ai/rag/ingest');
const { runSalesAgent } = await import('@/lib/ai/agent');

const KNOWLEDGE = `Pistons Garage — Business Information

About: Pistons Garage is a full-service car service and repair centre. We service all major four-wheeler brands.

Services & starting prices:
- Complete Service (full inspection + engine oil + filters): Rs 3,999
- Basic Service (oil + filter change): Rs 1,999
- Oil Change only: Rs 1,200
- Battery replacement & checkup: from Rs 2,500 (battery cost extra)
- AC Service (cooling + gas refill): Rs 1,499
- Wheel Alignment & Balancing: Rs 899
- Brake Service (pads / discs): from Rs 1,800
- Suspension repair: quoted after inspection
- Jump Start / roadside emergency: Rs 499

Brands serviced: Maruti Suzuki, Hyundai, Honda, Toyota, Mahindra, Tata, Ford.
Fuel types handled: Petrol, Diesel, CNG.

Pickup & Drop: Free pickup and drop service available within city limits.

Working hours: Monday to Saturday, 9:00 AM to 7:00 PM. Closed on Sunday.

Booking: Customers can book on WhatsApp by sharing vehicle brand, model, the service needed, and a preferred time slot (Morning / Afternoon / Evening).

Warranty: All services carry a 30-day workmanship warranty.`;

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);
  console.log('[setup] Connected. Business:', BUSINESS_ID, '\n');

  // 1. Enable AI + WhatsApp auto-reply
  await Business.findByIdAndUpdate(businessId, {
    $set: {
      'settings.ai.enabled': true,
      'settings.ai.agentEnabled': true,
      'settings.ai.whatsappAutoReply': true,
      'settings.ai.tone': 'friendly',
      'settings.ai.handoffEnabled': true,
    },
  });
  const biz = await Business.findById(businessId).select('settings.ai businessName').lean();
  console.log('[1] AI settings:', JSON.stringify(biz.settings?.ai));

  // 2. Archive the booking flow so it stops triggering
  const flowRes = await WhatsAppFlow.updateMany(
    { businessId, status: 'published' },
    { $set: { status: 'archived' } }
  );
  console.log(`[2] Archived ${flowRes.modifiedCount} published flow(s) → they will NOT trigger anymore`);

  // 3. Clear old flow executions (remove leftover "waiting" state)
  const execRes = await FlowExecution.deleteMany({ businessId });
  console.log(`[3] Cleared ${execRes.deletedCount} old flow executions`);

  // 4. Add + index a knowledge source
  await KnowledgeChunk.deleteMany({ businessId }); // clean re-seed
  await KnowledgeSource.deleteMany({ businessId, name: 'Pistons Garage Info' });
  const source = await KnowledgeSource.create({
    businessId,
    name: 'Pistons Garage Info',
    type: 'custom',
    category: 'business',
    content: KNOWLEDGE,
    status: 'pending',
  });
  const ingest = await ingestSource(source._id, businessId);
  console.log(`[4] Knowledge indexed → ${ingest.chunkCount} chunks (source: "Pistons Garage Info")`);

  // 5. Test runSalesAgent with real questions (uses knowledge + Groq)
  console.log('\n[5] Testing AI agent replies (grounded in knowledge):\n');
  const questions = [
    'Do you service Maruti Swift diesel and how much is an oil change?',
    'Are you open on Sunday? And do you offer pickup?',
    'What is the price for AC service?',
  ];
  for (const q of questions) {
    const ai = await runSalesAgent({
      businessId,
      businessName: biz.businessName || 'Pistons Garage',
      message: q,
      leadId: null,
      conversationHistory: [],
      channel: 'whatsapp',
    });
    console.log(`Q: ${q}`);
    console.log(`A: ${ai.reply}`);
    console.log(`   (confidence=${ai.confidence}, handoff=${ai.handoff}, sources=${JSON.stringify(ai.sources || [])})\n`);
  }

  console.log('[setup] DONE ✅  Agent enabled, flow archived, knowledge indexed.');
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('[setup] ERROR:', e.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
