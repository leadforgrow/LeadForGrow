/**
 * Create + publish the Pistons Garage booking flow under the Pistonsgarage business.
 * Run: node --use-system-ca --import ./scripts/register-alias.mjs scripts/seed-garage-flow.mjs
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

// Pistonsgarage business + its owner (pistonsgarage@leadforgrow.com)
const BUSINESS_ID = '6a2a8240496c2d8be7b744f3';
const OWNER_ID = '6a2a8240496c2d8be7b744f0';
// Copy accidentally created under the wrong business earlier — clean it up.
const WRONG_BUSINESS_ID = '696f33fb09eed989f269bdae';

const { default: WhatsAppFlow } = await import('@/models/automation/WhatsAppFlow');
const { default: FlowNode } = await import('@/models/automation/FlowNode');
const { default: FlowVariable } = await import('@/models/automation/FlowVariable');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  console.log('[seed] Connected');

  const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);
  const ownerId = new mongoose.Types.ObjectId(OWNER_ID);

  // 1. Remove the copy created under the wrong business
  const wrong = await WhatsAppFlow.find({ businessId: new mongoose.Types.ObjectId(WRONG_BUSINESS_ID), name: /Pistons Garage/i });
  for (const w of wrong) {
    await FlowNode.deleteMany({ flowId: w._id });
    await FlowVariable.deleteMany({ flowId: w._id });
    await WhatsAppFlow.deleteOne({ _id: w._id });
    console.log('[seed] Deleted wrong-business copy', String(w._id));
  }

  // Load flow JSON
  const flowJson = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'garage-booking-complete-flow.json'), 'utf8')
  );
  const meta = flowJson.flow || {};
  const nodes = flowJson.nodes || [];
  const edges = flowJson.edges || [];
  const variables = flowJson.variables || [];

  // 2. Remove any existing copy under Pistonsgarage (clean re-seed)
  const dupes = await WhatsAppFlow.find({ businessId, name: meta.name });
  for (const d of dupes) {
    await FlowNode.deleteMany({ flowId: d._id, businessId });
    await FlowVariable.deleteMany({ flowId: d._id, businessId });
    await WhatsAppFlow.deleteOne({ _id: d._id });
    console.log('[seed] Removed existing Pistonsgarage copy', String(d._id));
  }

  const snapshotNodes = nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position || { x: 0, y: 0 },
    data: n.data || {},
  }));

  // 3. Create + publish under Pistonsgarage
  const flow = await WhatsAppFlow.create({
    businessId,
    name: meta.name || 'Garage Booking Flow',
    description: meta.description || '',
    status: 'published',
    triggerType: meta.triggerType || 'incoming_message',
    triggerConfig: meta.triggerConfig || {},
    edges,
    version: 1,
    publishedVersion: 1,
    publishedAt: new Date(),
    publishedSnapshot: {
      nodes: snapshotNodes,
      edges,
      triggerType: meta.triggerType || 'incoming_message',
      triggerConfig: meta.triggerConfig || {},
    },
    tags: meta.tags || [],
    createdBy: ownerId,
    updatedBy: ownerId,
  });
  console.log('[seed] Created + published flow', String(flow._id), 'under business', BUSINESS_ID);

  for (const n of nodes) {
    await FlowNode.create({
      businessId,
      flowId: flow._id,
      nodeKey: n.id,
      type: n.type,
      position: n.position || { x: 0, y: 0 },
      data: n.data || {},
    });
  }
  console.log(`[seed] Inserted ${nodes.length} nodes`);

  for (const v of variables) {
    await FlowVariable.findOneAndUpdate(
      { businessId, flowId: flow._id, key: v.key },
      { $set: { label: v.label, defaultValue: v.defaultValue || '', source: v.source || 'custom' } },
      { upsert: true }
    );
  }
  console.log(`[seed] Upserted ${variables.length} variables`);

  const others = await WhatsAppFlow.find({
    businessId,
    status: 'published',
    triggerType: 'incoming_message',
    _id: { $ne: flow._id },
  }).select('name _id').lean();
  if (others.length) {
    console.log('[seed] WARNING other published incoming_message flows (may double-fire):');
    others.forEach((o) => console.log('   -', o.name, String(o._id)));
  }

  console.log('\n[seed] DONE. flowId =', String(flow._id));
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('[seed] ERROR:', e.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
