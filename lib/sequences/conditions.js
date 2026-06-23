/**
 * Workflow condition evaluation — supports AND/OR groups and field operators.
 */

const OPERATORS = {
  equals: (a, b) => String(a ?? '') === String(b ?? ''),
  not_equals: (a, b) => String(a ?? '') !== String(b ?? ''),
  contains: (a, b) => String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),
  not_contains: (a, b) => !String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),
  starts_with: (a, b) => String(a ?? '').toLowerCase().startsWith(String(b ?? '').toLowerCase()),
  ends_with: (a, b) => String(a ?? '').toLowerCase().endsWith(String(b ?? '').toLowerCase()),
  gte: (a, b) => Number(a) >= Number(b),
  gt: (a, b) => Number(a) > Number(b),
  lte: (a, b) => Number(a) <= Number(b),
  lt: (a, b) => Number(a) < Number(b),
  empty: (a) => a == null || a === '' || (Array.isArray(a) && a.length === 0),
  not_empty: (a) => !(a == null || a === '' || (Array.isArray(a) && a.length === 0)),
  in: (a, b) => String(b ?? '').split(',').map((s) => s.trim()).includes(String(a ?? '')),
};

export function getFieldValue(field, lead, context = {}) {
  if (!field) return null;
  const customFields = lead.customFields || lead.metadata?.customFields || {};
  const map = {
    status: lead.status,
    score: lead.metadata?.score ?? lead.score ?? 0,
    leadScore: lead.metadata?.score ?? lead.score ?? 0,
    tags: lead.tags,
    owner: lead.assignedTo?.toString?.() || lead.assignedTo,
    company: lead.companyId?.toString?.() || lead.companyName,
    industry: lead.industry,
    source: lead.source,
    email: lead.email,
    phone: lead.phone,
    name: lead.name,
    stage: lead.status,
    pipelineStage: lead.status,
    priority: lead.priority,
    serviceInterest: lead.serviceInterest,
  };
  if (map[field] !== undefined) return map[field];
  if (customFields[field] !== undefined) return customFields[field];
  if (lead.metadata?.[field] !== undefined) return lead.metadata[field];
  if (context[field] !== undefined) return context[field];
  return lead[field];
}

export function evaluateSingleCondition(condition, lead, context = {}) {
  const field = condition.field || 'status';
  const op = condition.operator || 'equals';
  const val = condition.value;
  const actual = getFieldValue(field, lead, context);
  const fn = OPERATORS[op];
  if (!fn) return true;
  if (op === 'empty' || op === 'not_empty') return fn(actual);
  return fn(actual, val);
}

export function evaluateConditionGroup(data, lead, context = {}) {
  if (data.conditions?.length) {
    const logic = (data.logic || 'and').toLowerCase();
    const results = data.conditions.map((c) =>
      c.conditions ? evaluateConditionGroup(c, lead, context) : evaluateSingleCondition(c, lead, context)
    );
    return logic === 'or' ? results.some(Boolean) : results.every(Boolean);
  }
  if (data.not) return !evaluateSingleCondition(data, lead, context);
  return evaluateSingleCondition(data, lead, context);
}

export function evaluateCondition(data, lead, context = {}) {
  return evaluateConditionGroup(data, lead, context);
}

export { OPERATORS };
