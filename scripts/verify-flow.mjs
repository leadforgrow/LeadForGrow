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
const { default: WhatsAppFlow } = await import('@/models/automation/WhatsAppFlow');
const { default: FlowNode } = await import('@/models/automation/FlowNode');
const { default: FlowExecution } = await import('@/models/automation/FlowExecution');

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);

// show which cluster/db we're pointed at (host only, no creds)
const host = (process.env.MONGODB_URI || '').replace(/\/\/[^@]*@/, '//<creds>@');
console.log('DB target:', host.slice(0, 80));

const flows = await WhatsAppFlow.find({ businessId }).select('name status triggerType publishedVersion publishedSnapshot').lean();
console.log(`\nFlows for Pistonsgarage: ${flows.length}`);
for (const f of flows) {
  const snapNodes = f.publishedSnapshot?.nodes?.length || 0;
  console.log(`  • ${f.name} | ${f.status} | trigger=${f.triggerType} | pubV=${f.publishedVersion} | snapshotNodes=${snapNodes}`);
  const nodeCount = await FlowNode.countDocuments({ flowId: f._id });
  console.log(`    editor nodes in DB: ${nodeCount}`);
}

const execCount = await FlowExecution.countDocuments({ businessId });
console.log(`\nFlow executions for Pistonsgarage: ${execCount}`);

await mongoose.disconnect();
