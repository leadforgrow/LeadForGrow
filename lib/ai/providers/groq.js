/**
 * AI provider abstraction — supports Groq today, extensible for OpenAI/Anthropic.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function chatCompletion({
  messages,
  model,
  temperature = 0.3,
  maxTokens = 2048,
  jsonMode = false,
}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { content: null, provider: null, error: 'GROQ_API_KEY not configured' };

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || process.env.AI_MODEL || 'llama-3.1-8b-instant',
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await res.json();
    if (!res.ok) {
      return { content: null, provider: 'groq', error: data.error?.message || 'LLM request failed' };
    }

    return {
      content: data.choices?.[0]?.message?.content || '',
      provider: 'groq',
      usage: data.usage,
    };
  } catch (err) {
    return { content: null, provider: 'groq', error: err.message };
  }
}

export async function* streamChatCompletion({ messages, model, temperature = 0.3, maxTokens = 2048 }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    yield { delta: 'AI is not configured. Set GROQ_API_KEY.', done: true };
    return;
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || process.env.AI_MODEL || 'llama-3.1-8b-instant',
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    yield { delta: 'AI request failed.', done: true };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') {
        yield { done: true };
        return;
      }
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield { delta, done: false };
      } catch {
        /* skip malformed */
      }
    }
  }
  yield { done: true };
}

export function isAiConfigured() {
  return Boolean(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_BACKEND_URL);
}

export default { chatCompletion, streamChatCompletion, isAiConfigured };
