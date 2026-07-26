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

const { default: User } = await import('@/models/User');
const { default: Business } = await import('@/models/Business');
const { default: WhatsAppFlow } = await import('@/models/automation/WhatsAppFlow');

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

console.log('=== ALL BUSINESSES ===');
const all = await Business.find({}).select('name _id ownerId plan').lean();
all.forEach((b) => console.log(`  ${b.name}  | _id=${b._id} | owner=${b.ownerId} | plan=${b.plan}`));

console.log('\n=== USERS with email leadforgrow ===');
const users = await User.find({ email: /leadforgrow/i }).select('email _id businessId agencyId role').lean();
users.forEach((u) => console.log(`  ${u.email} | _id=${u._id} | businessId=${u.businessId} | agencyId=${u.agencyId} | role=${u.role}`));

console.log('\n=== ALL WHATSAPP FLOWS ===');
const flows = await WhatsAppFlow.find({}).select('name _id businessId status triggerType').lean();
flows.forEach((f) => console.log(`  ${f.name} | _id=${f._id} | biz=${f.businessId} | ${f.status} | ${f.triggerType}`));

await mongoose.disconnect();
