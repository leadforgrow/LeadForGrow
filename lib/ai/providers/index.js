import { chatCompletion, streamChatCompletion, isAiConfigured } from './groq.js';

export { chatCompletion, streamChatCompletion, isAiConfigured };

export function getActiveProvider() {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.AI_BACKEND_URL) return 'remote';
  return 'local';
}
