/**
 * Consolidate WhatsApp conversations by phone number (last 10 digits), even
 * across duplicate leads. Moves all messages into one conversation keyed by the
 * normalized phone, deletes the duplicates, and archives duplicate leads.
 *
 * Run: node --use-system-ca --import ./scripts/register-alias.mjs scripts/merge-by-phone.mjs
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
const { default: Lead } = await import('@/models/automation/Lead');
const { default: Conversation } = await import('@/models/omnichannel/Conversation');
const { default: Message } = await import('@/models/automation/Message');

const last10 = (p) => { const n = String(p || '').replace(/\D/g, ''); return n.length >= 10 ? n.slice(-10) : n; };

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);

const convs = await Conversation.find({ businessId, channel: 'whatsapp', leadId: { $ne: null } }).lean();

// Resolve each conversation's phone via its lead.
const leadIds = [...new Set(convs.map((c) => String(c.leadId)))];
const leads = await Lead.find({ _id: { $in: leadIds } }).select('phone whatsappId name').lean();
const leadPhone = new Map(leads.map((l) => [String(l._id), last10(l.phone || l.whatsappId)]));

// Group conversations by phone.
const byPhone = new Map();
for (const c of convs) {
  const phone = leadPhone.get(String(c.leadId)) || last10(c.participantId);
  if (!phone) continue;
  if (!byPhone.has(phone)) byPhone.set(phone, []);
  byPhone.get(phone).push(c);
}

let mergedGroups = 0;
for (const [phone, group] of byPhone) {
  if (group.length < 2) continue;

  const counts = {};
  for (const c of group) counts[c._id] = await Message.countDocuments({ conversationId: c._id });
  // Primary = most messages (tie → phone-keyed participantId).
  const primary = group.slice().sort((a, b) => {
    if (counts[b._id] !== counts[a._id]) return counts[b._id] - counts[a._id];
    const aPhone = /^\d{10,}$/.test(a.participantId || '') ? 1 : 0;
    const bPhone = /^\d{10,}$/.test(b.participantId || '') ? 1 : 0;
    return bPhone - aPhone;
  })[0];

  const survivorLeadId = primary.leadId;
  const others = group.filter((c) => String(c._id) !== String(primary._id));
  const intervened = group.some((c) => c.inboxStatus === 'intervened');

  const dupLeadIds = new Set();
  for (const o of others) {
    await Message.updateMany({ conversationId: o._id }, { $set: { conversationId: primary._id, leadId: survivorLeadId } });
    if (String(o.leadId) !== String(survivorLeadId)) dupLeadIds.add(String(o.leadId));
    await Conversation.deleteOne({ _id: o._id });
  }

  const last = await Message.findOne({ conversationId: primary._id }).sort({ timestamp: -1 }).lean();
  await Conversation.updateOne(
    { _id: primary._id },
    { $set: {
      participantId: phone.length >= 10 ? (leads.find(l=>String(l._id)===String(survivorLeadId))?.whatsappId || String(primary.participantId)) : primary.participantId,
      leadId: survivorLeadId,
      isDeleted: false,
      isArchived: false,
      status: 'open',
      lastMessageAt: last?.timestamp || primary.lastMessageAt,
      lastMessagePreview: (last?.content?.body || '').slice(0, 100),
      lastMessageDirection: last?.direction || primary.lastMessageDirection,
      ...(intervened ? { inboxStatus: 'intervened' } : {}),
    } }
  );

  // Archive duplicate leads (keep the survivor active).
  for (const dl of dupLeadIds) {
    await Lead.updateOne({ _id: new mongoose.Types.ObjectId(dl) }, { $set: { archived: true } });
  }

  console.log(`Phone ${phone}: kept conv ${primary._id} (lead ${survivorLeadId}), removed ${others.length} conv(s), archived ${dupLeadIds.size} dup lead(s)`);
  mergedGroups += 1;
}

console.log(`\nDone. Consolidated ${mergedGroups} phone group(s).`);
await mongoose.disconnect();
