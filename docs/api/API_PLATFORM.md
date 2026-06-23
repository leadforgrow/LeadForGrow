# API Platform

All new and refactored routes should use the unified API platform in `lib/api/`.

## Response Format

```json
{
  "success": true,
  "data": { },
  "meta": { "pagination": { "page": 1, "limit": 20, "total": 100 } },
  "requestId": "uuid"
}
```

Error:
```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "AUTH_REQUIRED",
  "requestId": "uuid"
}
```

## Route Handler Pattern

```javascript
import { withAuth } from '@/lib/auth';
import { withApiHandler } from '@/lib/api/handler';
import { apiSuccess, apiPaginated } from '@/lib/api/response';
import { parsePagination, buildPaginationMeta } from '@/lib/api/pagination';

export const GET = withAuth()(withApiHandler(async (req) => {
  const { page, limit, skip, sort } = parsePagination(new URL(req.url).searchParams);
  const [items, total] = await fetchItems(req.user.businessId, { skip, limit, sort });
  return apiPaginated(items, buildPaginationMeta(total, { page, limit }), req.requestId);
}));
```

## Composable Middleware

| Wrapper | Purpose |
|---------|---------|
| `withApiHandler` | Request ID, error handling, logging |
| `withAuth(roles?)` | JWT verification + RBAC |
| `withTenantAuth` | Requires `businessId` on token |
| `withRateLimit(n, window)` | Redis rate limiting |
| `withCsrf` | CSRF for cookie-auth mutations |

## Pagination Query Params

| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 20 | Items per page (max 100) |
| `sort` | createdAt | Sort field |
| `order` | desc | asc or desc |
| `filter[field]` | — | Equality filter (when allowed) |

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `AUTH_REQUIRED` | 401 | Missing token |
| `TOKEN_INVALID` | 401 | Expired/invalid JWT |
| `FORBIDDEN` | 403 | RBAC or CSRF failure |
| `NOT_FOUND` | 404 | Resource missing |
| `BAD_REQUEST` | 400 | Validation failure |
| `RATE_LIMITED` | 429 | Too many requests |

## Versioning

Current API version: **v1** (implicit, no prefix). Future versions will use `/api/v2/` with backward-compatible v1 routes maintained.
