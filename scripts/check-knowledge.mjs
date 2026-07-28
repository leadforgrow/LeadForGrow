// READ-ONLY: check knowledge sources/chunks for Pistonsgarage.
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
const { default: KnowledgeSource } = await import('@/models/ai/KnowledgeSource');
const { default: KnowledgeChunk } = await import('@/models/ai/KnowledgeChunk');

await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
const businessId = new mongoose.Types.ObjectId(BUSINESS_ID);

const sources = await KnowledgeSource.find({ businessId }).lean();
const chunkCount = await KnowledgeChunk.countDocuments({ businessId });

console.log(`Knowledge SOURCES for Pistonsgarage: ${sources.length}`);
for (const s of sources) {
  console.log(`  • ${s.name || s.title || '(untitled)'} | type=${s.type} | status=${s.status} | chunks=${s.chunkCount ?? '?'}`);
}
console.log(`\nKnowledge CHUNKS total: ${chunkCount}`);

// Is there a text index on content (needed for $text search)?
try {
  const idx = await KnowledgeChunk.collection.indexes();
  const textIdx = idx.find((i) => Object.values(i.key || {}).includes('text'));
  console.log('Text index on chunks:', textIdx ? textIdx.name : 'NONE (text search will fall back to regex)');
} catch (e) { console.log('index check error:', e.message); }

await mongoose.disconnect();
