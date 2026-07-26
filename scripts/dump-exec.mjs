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

const del = await FlowExecution.deleteMany({ businessId });
console.log(`[cleanup] Deleted ${del.deletedCount} stale flow executions for Pistonsgarage`);

await mongoose.disconnect();
