import KnowledgeChunk from '@/models/ai/KnowledgeChunk';
import { cacheGet, cacheSet, cacheKey } from '@/lib/ai/cache';

/**
 * Retrieve relevant knowledge chunks via MongoDB text search + keyword fallback.
 */
export async function retrieveKnowledge(businessId, query, { limit = 6 } = {}) {
  if (!query?.trim()) return [];

  const q = query.trim();
  const key = cacheKey(['rag', businessId, q, limit]);
  const cached = cacheGet(key);
  if (cached) return cached;

  // Text search (requires text index on content)
  let chunks = await KnowledgeChunk.find(
    { businessId, $text: { $search: q } },
    { score: { $meta: 'textScore' }, content: 1, metadata: 1, sourceId: 1 }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();

  if (chunks.length) {
    cacheSet(key, chunks);
    return chunks;
  }

  // Keyword fallback
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return [];

  const regex = terms.map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  chunks = await KnowledgeChunk.find({
    businessId,
    $or: regex.map((r) => ({ content: r })),
  })
    .limit(limit)
    .lean();

  cacheSet(key, chunks);
  return chunks;
}

export function formatKnowledgeContext(chunks) {
  if (!chunks?.length) return '';
  return chunks
    .map((c, i) => `[${i + 1}] (${c.metadata?.sourceName || 'source'}): ${c.content}`)
    .join('\n\n');
}

export default { retrieveKnowledge, formatKnowledgeContext };
