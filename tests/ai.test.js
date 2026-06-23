import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chunkText, extractTextFromBuffer } from '../lib/ai/rag/chunker.js';
import { buildSystemPrompt, buildQualifyPrompt, REPLY_STYLES } from '../lib/ai/prompts.js';

// Inline copies of pure helpers (avoid @/ model imports in node:test)
function formatKnowledgeContext(chunks) {
  if (!chunks?.length) return '';
  return chunks
    .map((c, i) => `[${i + 1}] (${c.metadata?.sourceName || 'source'}): ${c.content}`)
    .join('\n\n');
}

function formatMemoryContext(memories) {
  if (!memories?.length) return '';
  return memories.map((m) => `- [${m.type}] ${m.key ? `${m.key}: ` : ''}${m.value}`).join('\n');
}

function detectCopilotIntent(question) {
  const q = question.toLowerCase();
  if (/hot lead|priority lead|call today|who should i call/.test(q)) return { tool: 'hot_leads', params: {} };
  if (/deal.*above|₹\s*[\d,]+|pipeline.*\d/.test(q)) {
    const match = q.match(/[\d,]+/);
    return { tool: 'deals_above', params: { amount: match ? parseInt(match[0].replace(/,/g, ''), 10) : 50000 } };
  }
  if (/waiting|unread|customer.*wait|pending.*reply/.test(q)) return { tool: 'waiting_customers', params: {} };
  if (/create meeting|schedule meeting|book meeting/.test(q)) return { tool: 'create_meeting', params: { title: 'Follow-up meeting' } };
  if (/pipeline|deals summary/.test(q)) return { tool: 'pipeline_summary', params: {} };
  return null;
}

describe('AI chunker', () => {
  it('chunks long text with overlap', () => {
    const text = 'Hello world. '.repeat(200);
    const chunks = chunkText(text, { chunkSize: 100, overlap: 20 });
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every((c) => c.length <= 120));
  });

  it('extracts plain text from buffer', () => {
    const buf = Buffer.from('Our pricing starts at ₹999 per month.');
    const out = extractTextFromBuffer(buf, 'text/plain', 'info.txt');
    assert.match(out, /pricing/);
  });

  it('returns empty for blank input', () => {
    assert.deepEqual(chunkText('   '), []);
  });
});

describe('AI prompts', () => {
  it('builds knowledge-only system prompt', () => {
    const prompt = buildSystemPrompt({
      businessName: 'Acme Corp',
      aiSettings: { tone: 'professional', languages: ['en', 'hi'] },
      knowledgeContext: 'Product X costs ₹5000',
    });
    assert.match(prompt, /Acme Corp/);
    assert.match(prompt, /ONLY using/);
    assert.match(prompt, /Product X/);
  });

  it('warns when no knowledge context', () => {
    const prompt = buildSystemPrompt({ businessName: 'Test' });
    assert.match(prompt, /do not make up business facts/);
  });

  it('includes qualify JSON schema fields', () => {
    const prompt = buildQualifyPrompt({
      lead: { name: 'Raj', email: 'raj@test.com', status: 'new' },
      messages: [{ direction: 'incoming', content: { body: 'Need pricing' } }],
      notes: [],
    });
    assert.match(prompt, /leadScore/);
    assert.match(prompt, /temperature/);
  });

  it('defines reply styles', () => {
    assert.ok(REPLY_STYLES.smart);
    assert.ok(REPLY_STYLES.sales);
  });
});

describe('AI RAG formatting', () => {
  it('formats knowledge context for prompts', () => {
    const ctx = formatKnowledgeContext([
      { content: 'We offer CRM software', metadata: { sourceName: 'Company FAQ' } },
    ]);
    assert.match(ctx, /Company FAQ/);
    assert.match(ctx, /CRM software/);
  });

  it('formats memory context', () => {
    const ctx = formatMemoryContext([
      { type: 'preference', key: 'budget', value: '₹50,000' },
    ]);
    assert.match(ctx, /budget/);
    assert.match(ctx, /50,000/);
  });
});

describe('Copilot intent detection', () => {
  it('detects hot leads query', () => {
    const intent = detectCopilotIntent('Show me hot leads today');
    assert.equal(intent.tool, 'hot_leads');
  });

  it('detects deals above amount', () => {
    const intent = detectCopilotIntent('Show deals above ₹50,000');
    assert.equal(intent.tool, 'deals_above');
    assert.equal(intent.params.amount, 50000);
  });

  it('detects waiting customers', () => {
    const intent = detectCopilotIntent('Find customers waiting for reply');
    assert.equal(intent.tool, 'waiting_customers');
  });

  it('returns null for generic questions', () => {
    assert.equal(detectCopilotIntent('What is the weather?'), null);
  });
});
