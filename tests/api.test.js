import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../lib/api/errors.js';
import { parsePagination, buildPaginationMeta } from '../lib/api/pagination.js';
import { sanitizeInput, stripHtml } from '../lib/security/sanitize.js';
import { generateRequestId } from '../lib/api/requestId.js';

describe('API errors', () => {
  it('creates typed errors with status codes', () => {
    const err = ApiError.notFound('Lead not found');
    assert.equal(err.status, 404);
    assert.equal(err.code, 'NOT_FOUND');
  });
});

describe('pagination', () => {
  it('parses page and limit with caps', () => {
    const params = new URLSearchParams('page=2&limit=200&sort=name&order=asc');
    const p = parsePagination(params);
    assert.equal(p.page, 2);
    assert.equal(p.limit, 100);
    assert.equal(p.sortField, 'name');
    assert.equal(p.sortOrder, 'asc');
  });

  it('builds pagination meta', () => {
    const meta = buildPaginationMeta(45, { page: 2, limit: 20 });
    assert.equal(meta.totalPages, 3);
    assert.equal(meta.hasNext, true);
    assert.equal(meta.hasPrev, true);
  });
});

describe('sanitize', () => {
  it('strips HTML from strings', () => {
    assert.equal(stripHtml('<script>alert(1)</script>hello'), 'alert(1)hello');
  });

  it('blocks prototype pollution keys', () => {
    const out = sanitizeInput({ __proto__: { polluted: true }, name: 'Test' });
    assert.equal(out.name, 'Test');
    assert.equal(out.__proto__, undefined);
  });
});

describe('request ID', () => {
  it('generates UUID format', () => {
    const id = generateRequestId();
    assert.match(id, /^[0-9a-f-]{36}$/i);
  });
});
