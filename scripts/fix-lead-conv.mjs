/**
 * Fix saurabh singh (918810873052): restore the wrongly hidden conversation
 * and attach orphaned messages (old outgoing sends with no conversationId).
 * Also backfills orphaned WhatsApp messages for ALL leads in the business.
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
const { default: Conversation } = await import('@/models/omnichannel/Conversation');
const { default: Message } = await import('@/models/automation/Message');

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);

// 1. Restore the specific hidden conversation
const restore = await Conversation.updateOne(
  { _id: new mongoose.Types.ObjectId('6a64d2013641396669455ea3') },
  { $set: { isDeleted: false, isArchived: false, isSpam: false, status: 'open' } }
);
console.log(`[1] Restored saurabh singh conversation (matched=${restore.matchedCount}, modified=${restore.modifiedCount})`);

// 2. Attach orphaned WhatsApp messages to their lead's conversation (whole business)
const waConvs = await Conversation.find({ businessId, channel: 'whatsapp', leadId: { $ne: null } })
  .select('_id leadId').lean();
const convByLead = new Map(waConvs.map((c) => [String(c.leadId), c._id]));

const orphans = await Message.find({
  businessId,
  leadId: { $ne: null },
  $or: [{ conversationId: { $exists: false } }, { conversationId: null }],
}).select('_id leadId channel').lean();

let attached = 0;
const touchedConvs = new Set();
for (const msg of orphans) {
  const convId = convByLead.get(String(msg.leadId));
  if (!convId) continue;
  await Message.updateOne(
    { _id: msg._id },
    { $set: { conversationId: convId, channel: msg.channel || 'whatsapp' } }
  );
  touchedConvs.add(String(convId));
  attached += 1;
}
console.log(`[2] Attached ${attached} orphaned message(s) to their conversations`);

// 3. Recompute last-message fields for touched conversations
for (const cid of touchedConvs) {
  const last = await Message.findOne({ conversationId: new mongoose.Types.ObjectId(cid) })
    .sort({ timestamp: -1 }).lean();
  if (last) {
    await Conversation.updateOne(
      { _id: new mongoose.Types.ObjectId(cid) },
      { $set: {
        lastMessageAt: last.timestamp,
        lastMessagePreview: (last.content?.body || '').slice(0, 100),
        lastMessageDirection: last.direction,
      } }
    );
  }
}
console.log(`[3] Recomputed previews for ${touchedConvs.size} conversation(s)`);

console.log('\nDONE. saurabh singh should now appear in the inbox with full history.');
await mongoose.disconnect();
