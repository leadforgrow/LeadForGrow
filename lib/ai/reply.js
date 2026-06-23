import { chatCompletion } from '@/lib/ai/providers';
import { buildSystemPrompt, buildReplyPrompt } from '@/lib/ai/prompts';
import { retrieveKnowledge, formatKnowledgeContext } from '@/lib/ai/rag/retriever';
import { getLeadMemory, formatMemoryContext } from '@/lib/ai/memory';
import { getAiSettings } from '@/lib/ai/settings';

export async function generateReply({
  businessId,
  businessName,
  channel,
  style = 'smart',
  customerName,
  lastMessage,
  messages = [],
  leadId,
}) {
  const aiSettings = await getAiSettings(businessId);
  const query = `${lastMessage || ''} ${messages.slice(-3).map((m) => m.content?.body).join(' ')}`;
  const chunks = await retrieveKnowledge(businessId, query);
  const knowledgeContext = formatKnowledgeContext(chunks);

  let memoryContext = '';
  if (leadId) {
    const memories = await getLeadMemory(businessId, leadId);
    memoryContext = formatMemoryContext(memories);
  }

  const conversationSnippet = messages
    .slice(-8)
    .map((m) => `${m.direction === 'incoming' ? 'Customer' : 'Agent'}: ${m.content?.body || ''}`)
    .join('\n');

  const system = buildSystemPrompt({ businessName, aiSettings, knowledgeContext, memoryContext });
  const user = buildReplyPrompt({ style, channel, customerName, lastMessage, conversationSnippet });

  const result = await chatCompletion({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: style === 'creative' ? 0.7 : 0.4,
  });

  if (result.content) {
    return {
      reply: result.content.trim(),
      confidence: chunks.length ? 0.85 : 0.5,
      sources: chunks.map((c) => c.metadata?.sourceName).filter(Boolean),
      provider: result.provider,
    };
  }

  // Fallback without LLM
  const fallback = lastMessage?.toLowerCase().includes('price')
    ? `Thank you for your interest${customerName ? `, ${customerName.split(' ')[0]}` : ''}. I'll share our pricing details shortly.`
    : `Hi${customerName ? ` ${customerName.split(' ')[0]}` : ''}, thanks for reaching out! How can I help you today?`;

  return { reply: fallback, confidence: 0.4, sources: [], provider: 'fallback' };
}

export default { generateReply };
