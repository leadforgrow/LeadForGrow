import { ApiError } from './errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export function requireFields(obj, fields) {
  const missing = fields.filter((f) => {
    const v = obj?.[f];
    return v === undefined || v === null || v === '';
  });
  if (missing.length) {
    throw ApiError.badRequest(`Missing required fields: ${missing.join(', ')}`);
  }
}

export function assertEmail(value, field = 'email') {
  if (!EMAIL_RE.test(String(value || ''))) {
    throw ApiError.badRequest(`Invalid ${field}`);
  }
}

export function assertObjectId(value, field = 'id') {
  if (!OBJECT_ID_RE.test(String(value || ''))) {
    throw ApiError.badRequest(`Invalid ${field}`);
  }
}

export function assertOneOf(value, allowed, field = 'value') {
  if (!allowed.includes(value)) {
    throw ApiError.badRequest(`Invalid ${field}: must be one of ${allowed.join(', ')}`);
  }
}

export function parseJsonBody(req) {
  return req.json().catch(() => {
    throw ApiError.badRequest('Invalid JSON body');
  });
}

export function clampString(value, max = 500) {
  if (value == null) return value;
  return String(value).slice(0, max);
}
