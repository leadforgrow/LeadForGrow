// READ-ONLY: dumps the most recent flow executions for Pistonsgarage.
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
const { default: FlowExecution } = await import('@/models/automation/FlowExecution');

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);

const execs = await FlowExecution.find({ businessId }).sort({ createdAt: -1 }).limit(3).lean();
console.log(`Showing ${execs.length} most recent executions\n`);
for (const e of execs) {
  console.log('─'.repeat(72));
  console.log('exec', String(e._id), '| status:', e.status, '| current:', e.currentNodeKey, '| created:', e.createdAt);
  console.log('vars:', JSON.stringify({
    vehicle_type: e.variables?.vehicle_type,
    service: e.variables?.service,
    brand: e.variables?.brand,
    model: e.variables?.model,
    fuel_type: e.variables?.fuel_type,
    pickup_choice: e.variables?.pickup_choice,
    preferred_time: e.variables?.preferred_time,
    last_reply: e.variables?.last_reply,
  }));
  console.log('logs:');
  for (const l of (e.logs || [])) {
    console.log(`   [${l.status}] ${l.nodeType || ''} ${l.nodeKey || ''} ${l.message ? '- ' + l.message : ''}`);
  }
}

await mongoose.disconnect();
