export const REPLY_STYLES = {
  smart: 'Balanced, helpful, and context-aware',
  short: 'Brief and to the point (1-2 sentences)',
  detailed: 'Thorough and comprehensive',
  professional: 'Formal business tone',
  friendly: 'Warm and conversational',
  sales: 'Persuasive with clear call-to-action',
};

export const EMAIL_TYPES = {
  cold: 'Cold outreach email',
  followup: 'Follow-up email',
  proposal: 'Proposal email',
  reminder: 'Reminder email',
  thankyou: 'Thank-you email',
};

export function buildSystemPrompt({ businessName, aiSettings = {}, knowledgeContext = '', memoryContext = '' }) {
  const tone = aiSettings.tone || 'professional';
  const personality = aiSettings.personality || 'helpful sales advisor';
  const languages = (aiSettings.languages || ['en']).join(', ');
  const custom = aiSettings.customInstructions || '';

  return `You are Grovia, the AI sales assistant for ${businessName}.
Tone: ${tone}. Personality: ${personality}. Languages: ${languages}.
${custom ? `Business instructions: ${custom}` : ''}

CRITICAL RULES:
- Answer ONLY using the provided knowledge base context and CRM data.
- If information is not in context, say you don't have that information — never invent prices, policies, or product details.
- Be concise and actionable for sales teams.
${knowledgeContext ? `\n--- KNOWLEDGE BASE ---\n${knowledgeContext}\n--- END KNOWLEDGE ---` : '\n(No knowledge base context available — do not make up business facts.)'}
${memoryContext ? `\n--- CUSTOMER MEMORY ---\n${memoryContext}\n--- END MEMORY ---` : ''}`;
}

export function buildReplyPrompt({ style, channel, customerName, lastMessage, conversationSnippet }) {
  return `Generate a ${style} reply for ${channel || 'chat'}.
Customer: ${customerName || 'Customer'}
Their last message: "${lastMessage || ''}"
Recent conversation:
${conversationSnippet || '(no history)'}

Style guide: ${REPLY_STYLES[style] || REPLY_STYLES.smart}
Return ONLY the reply text, no quotes or labels.`;
}

export function buildQualifyPrompt({ lead, messages, notes }) {
  return `Analyze this lead and return JSON only:
{
  "industry": string|null,
  "budget": string|null,
  "companySize": string|null,
  "buyingIntent": "high"|"medium"|"low"|null,
  "urgency": "high"|"medium"|"low"|null,
  "decisionMaker": boolean|null,
  "location": string|null,
  "timeline": string|null,
  "requirements": string[],
  "leadScore": number (0-100),
  "temperature": "hot"|"warm"|"cold",
  "summary": string,
  "reasoning": string
}

Lead: ${JSON.stringify({ name: lead.name, email: lead.email, phone: lead.phone, source: lead.source, status: lead.status, message: lead.message })}
Notes: ${(notes || []).map((n) => n.text).join('; ')}
Recent messages: ${(messages || []).slice(-10).map((m) => `${m.direction}: ${m.content?.body || ''}`).join('\n')}`;
}

export default { buildSystemPrompt, buildReplyPrompt, buildQualifyPrompt, REPLY_STYLES, EMAIL_TYPES };
