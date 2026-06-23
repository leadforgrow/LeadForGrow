import AiMemory from '@/models/ai/AiMemory';

export async function getLeadMemory(businessId, leadId) {
  return AiMemory.find({ businessId, leadId }).sort({ updatedAt: -1 }).limit(50).lean();
}

export async function upsertMemory(businessId, { leadId, contactId, conversationId, type, key, value, source = 'ai', confidence }) {
  if (key) {
    return AiMemory.findOneAndUpdate(
      { businessId, leadId, key },
      { $set: { value, type, contactId, conversationId, source, confidence, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
  }
  return AiMemory.create({ businessId, leadId, contactId, conversationId, type, value, source, confidence });
}

export function formatMemoryContext(memories) {
  if (!memories?.length) return '';
  return memories.map((m) => `- [${m.type}] ${m.key ? `${m.key}: ` : ''}${m.value}`).join('\n');
}

export async function extractMemoriesFromConversation(businessId, leadId, messages) {
  const insights = [];
  const text = messages.map((m) => m.content?.body || '').join(' ').toLowerCase();
  if (/budget|₹|rs\.|price|cost/.test(text)) {
    const match = text.match(/(?:budget|₹|rs\.?)\s*[\d,]+/i);
    if (match) insights.push({ type: 'preference', key: 'budget_mention', value: match[0] });
  }
  if (/urgent|asap|immediately|today|tomorrow/.test(text)) {
    insights.push({ type: 'preference', key: 'urgency', value: 'high urgency detected' });
  }
  for (const ins of insights) {
    await upsertMemory(businessId, { leadId, ...ins, source: 'ai', confidence: 0.7 });
  }
  return insights;
}

export default { getLeadMemory, upsertMemory, formatMemoryContext, extractMemoriesFromConversation };
