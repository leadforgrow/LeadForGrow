/**
 * Shared CRM query helpers for list endpoints.
 */

export function parseListParams(searchParams, defaults = {}) {
  const page = Math.max(1, parseInt(searchParams.get('page') || defaults.page || '1', 10));
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || defaults.limit || '50', 10)), 100);
  const skip = (page - 1) * limit;
  const sortField = searchParams.get('sort') || defaults.sortField || 'updatedAt';
  const sortDir = searchParams.get('dir') === 'asc' ? 1 : -1;
  const search = searchParams.get('search')?.trim() || '';
  const archived = searchParams.get('archived') === 'true';

  return { page, limit, skip, sortField, sortDir, search, archived };
}

export function buildSearchOr(fields, search) {
  if (!search) return null;
  return fields.map((field) => ({ [field]: { $regex: search, $options: 'i' } }));
}

export function applyRoleFilter(query, user, assignedField = 'assignedTo') {
  const restricted = ['member', 'TEAM_MEMBER', 'VIEW_ONLY'].includes(user.role);
  if (restricted) {
    query[assignedField] = user._id;
  }
  return query;
}

export function paginationMeta(total, page, limit) {
  return { total, page, limit, pages: Math.ceil(total / limit) || 1 };
}

export default { parseListParams, buildSearchOr, applyRoleFilter, paginationMeta };
