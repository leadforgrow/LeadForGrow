import { ApiError } from '../api/errors.js';

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Strip HTML tags and trim strings. Does not mutate the original object.
 */
export function stripHtml(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
}

/**
 * Deep-sanitize user input: strip HTML from strings, block prototype pollution.
 */
export function sanitizeInput(input, depth = 0) {
  if (depth > 10) return null;
  if (input == null) return input;

  if (typeof input === 'string') {
    return stripHtml(input);
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item, depth + 1));
  }

  if (typeof input === 'object') {
    // Null prototype so polluted keys like __proto__ can never resolve up the chain
    const out = Object.create(null);
    for (const [key, val] of Object.entries(input)) {
      if (DANGEROUS_KEYS.has(key)) continue;
      out[key] = sanitizeInput(val, depth + 1);
    }
    return out;
  }

  return input;
}

/**
 * Sanitize and validate a JSON body from a request.
 */
export async function sanitizeJsonBody(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    throw ApiError.badRequest('Invalid JSON body');
  }
  return sanitizeInput(body);
}
