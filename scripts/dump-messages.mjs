// READ-ONLY: dump recent messages for Pistonsgarage to inspect direction/body/conversationId.
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
const { default: Message } = await import('@/models/automation/Message');

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);

const msgs = await Message.find({ businessId }).sort({ timestamp: -1 }).limit(30).lean();
console.log(`Last ${msgs.length} messages (newest first):\n`);
for (const m of msgs.reverse()) {
  const dir = (m.direction || '?').padEnd(9);
  const conv = m.conversationId ? String(m.conversationId).slice(-6) : 'NO-CONV';
  const t = m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : '';
  const body = (m.content?.body || m.content?.caption || '').replace(/\n/g, ' ').slice(0, 55);
  console.log(`${t} | ${dir} | ${m.type?.padEnd(6) || ''} | conv:${conv} | ${body}`);
}

await mongoose.disconnect();
