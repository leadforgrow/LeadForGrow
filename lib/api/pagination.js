/**
 * Parse standard list query params: page, limit, sort, order, filter.
 */
export function parsePagination(searchParams, defaults = {}) {
  const page = Math.max(1, parseInt(searchParams.get('page') || defaults.page || '1', 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') || defaults.limit || '20', 10))
  );
  const sort = searchParams.get('sort') || defaults.sort || 'createdAt';
  const order = (searchParams.get('order') || defaults.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sort: { [sort]: order },
    sortField: sort,
    sortOrder: order === 1 ? 'asc' : 'desc',
  };
}

export function buildPaginationMeta(total, { page, limit }) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Parse filter[field]=value pairs from search params.
 */
export function parseFilters(searchParams, allowedFields = []) {
  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith('filter[') || !key.endsWith(']')) continue;
    const field = key.slice(7, -1);
    if (allowedFields.length && !allowedFields.includes(field)) continue;
    if (value !== '' && value != null) filters[field] = value;
  }
  return filters;
}
