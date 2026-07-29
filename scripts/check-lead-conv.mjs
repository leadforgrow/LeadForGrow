// READ-ONLY: inspect conversations + messages for a lead by phone.
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
const PHONE = '918810873052';

const { default: Lead } = await import('@/models/automation/Lead');
const { default: Conversation } = await import('@/models/omnichannel/Conversation');
const { default: Message } = await import('@/models/automation/Message');

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);

console.log('=== LEADS matching phone/whatsappId', PHONE, '===');
const leads = await Lead.find({
  businessId,
  $or: [{ phone: new RegExp(PHONE) }, { whatsapp: new RegExp(PHONE) }, { whatsappId: new RegExp(PHONE) }],
}).select('name phone whatsapp whatsappId createdAt').lean();
leads.forEach((l) => console.log(`  ${l.name} | _id=${l._id} | phone=${l.phone} | wa=${l.whatsapp} | waId=${l.whatsappId}`));

const leadIds = leads.map((l) => l._id);

console.log('\n=== CONVERSATIONS for those leads (any channel) ===');
const convs = await Conversation.find({ businessId, leadId: { $in: leadIds } }).lean();
for (const c of convs) {
  const msgCount = await Message.countDocuments({ conversationId: c._id });
  console.log(`  _id=${c._id} | ch=${c.channel} | participantId=${c.participantId} | leadId=${c.leadId}`);
  console.log(`     inboxStatus=${c.inboxStatus} status=${c.status} | isDeleted=${c.isDeleted} isArchived=${c.isArchived} isSpam=${c.isSpam} | msgs=${msgCount} | lastMsgAt=${c.lastMessageAt}`);
}

console.log('\n=== CONVERSATIONS by participantId', PHONE, '(regardless of lead) ===');
const byPart = await Conversation.find({ businessId, participantId: new RegExp(PHONE) }).lean();
byPart.forEach((c) => console.log(`  _id=${c._id} | leadId=${c.leadId} | participantId=${c.participantId} | isDeleted=${c.isDeleted} isArchived=${c.isArchived}`));

console.log('\n=== MESSAGES with NO conversationId for these leads (orphaned) ===');
const orphan = await Message.countDocuments({ businessId, leadId: { $in: leadIds }, conversationId: { $exists: false } });
const orphanNull = await Message.countDocuments({ businessId, leadId: { $in: leadIds }, conversationId: null });
console.log(`  no conversationId field: ${orphan} | null conversationId: ${orphanNull}`);

await mongoose.disconnect();
