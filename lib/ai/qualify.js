import { chatCompletion } from '@/lib/ai/providers';
import { buildQualifyPrompt } from '@/lib/ai/prompts';
import { computeEngagementScore } from '@/lib/leadIntelligence';

export async function qualifyLead({ lead, messages = [], notes = [] }) {
  const prompt = buildQualifyPrompt({ lead, messages, notes });
  const result = await chatCompletion({
    messages: [
      { role: 'system', content: 'You are a B2B lead qualification expert. Return valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    jsonMode: true,
    temperature: 0.2,
  });

  if (result.content) {
    try {
      const parsed = JSON.parse(result.content);
      return { ...parsed, provider: result.provider };
    } catch {
      /* fall through */
    }
  }

  // Rule-based fallback using leadIntelligence
  const engagement = computeEngagementScore(lead);
  const score = Math.min(100, Math.max(0, engagement.score * 8));
  const temperature = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';

  return {
    industry: lead.industry || null,
    budget: null,
    companySize: null,
    buyingIntent: score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low',
    urgency: lead.priority === 'urgent' ? 'high' : lead.priority === 'high' ? 'medium' : 'low',
    decisionMaker: null,
    location: lead.city || lead.location || null,
    timeline: null,
    requirements: lead.serviceInterest ? [lead.serviceInterest] : [],
    leadScore: score,
    temperature,
    summary: `${lead.name} — ${temperature} lead with ${engagement.level} engagement`,
    reasoning: engagement.reasons.join('; ') || 'Based on contact data and engagement signals',
    provider: 'rules',
  };
}

export default { qualifyLead };
