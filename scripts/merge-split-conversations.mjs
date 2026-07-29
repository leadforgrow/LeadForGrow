/**
 * Merge WhatsApp conversations that were split into two threads for the same
 * lead (one keyed by phone = incoming, one keyed by leadId = outgoing).
 * Moves all messages into one conversation and deletes the duplicates.
 *
 * Run: node --use-system-ca --import ./scripts/register-alias.mjs scripts/merge-split-conversations.mjs
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

const convs = await Conversation.find({ businessId, channel: 'whatsapp', leadId: { $ne: null } }).lean();

// Group by leadId
const byLead = new Map();
for (const c of convs) {
  const k = String(c.leadId);
  if (!byLead.has(k)) byLead.set(k, []);
  byLead.get(k).push(c);
}

let merged = 0;
for (const [leadId, group] of byLead) {
  if (group.length < 2) continue;

  // Primary = the one whose participantId is NOT the leadId string (i.e. phone-keyed),
  // else the one with the most messages, else the oldest.
  const counts = {};
  for (const c of group) counts[c._id] = await Message.countDocuments({ conversationId: c._id });
  const primary = group
    .slice()
    .sort((a, b) => {
      const aPhone = a.participantId && a.participantId !== leadId ? 1 : 0;
      const bPhone = b.participantId && b.participantId !== leadId ? 1 : 0;
      if (aPhone !== bPhone) return bPhone - aPhone;
      if (counts[a._id] !== counts[b._id]) return counts[b._id] - counts[a._id];
      return new Date(a.createdAt) - new Date(b.createdAt);
    })[0];

  const others = group.filter((c) => String(c._id) !== String(primary._id));
  const intervened = group.some((c) => c.inboxStatus === 'intervened');

  for (const o of others) {
    await Message.updateMany({ conversationId: o._id }, { $set: { conversationId: primary._id } });
    await Conversation.deleteOne({ _id: o._id });
  }

  // Recompute primary's last message + preserve intervened
  const last = await Message.findOne({ conversationId: primary._id }).sort({ timestamp: -1 }).lean();
  await Conversation.updateOne(
    { _id: primary._id },
    {
      $set: {
        lastMessageAt: last?.timestamp || primary.lastMessageAt,
        lastMessagePreview: (last?.content?.body || '').slice(0, 100),
        lastMessageDirection: last?.direction || primary.lastMessageDirection,
        ...(intervened ? { inboxStatus: 'intervened' } : {}),
      },
    }
  );

  console.log(`Merged lead ${leadId}: kept ${primary._id} (${primary.participantId}), removed ${others.length} duplicate(s)`);
  merged += 1;
}

console.log(`\nDone. Merged ${merged} split conversation group(s).`);
await mongoose.disconnect();
