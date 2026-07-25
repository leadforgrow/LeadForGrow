# CRM API Audit — `app/api/automation/**`

## Common patterns (use these for fixes)

Most CRM routes follow this manual pattern (they do **not** use `withApiHandler` / `apiSuccess` from `lib/api/handler.js`):

```javascript
export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    // ... handler logic
    return NextResponse.json({ success: true, data, pagination });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
```

| Helper | Location | Used by |
|--------|----------|---------|
| `withTenantAuth` + `resolveTenant` | `lib/auth.js` | Most list/detail/bulk routes |
| `withPlanAccess(feature, handler)` | `lib/accessControl.js` | `leads/[id]`, `tasks/[id]` only |
| `parseListParams`, `buildSearchOr`, `paginationMeta` | `lib/crm/queryBuilder.js` | contacts, companies |
| `assertObjectId`, `requireFields`, `parseJsonBody` | `lib/api/validation.js` | **Not used** in automation CRM routes |
| `parsePagination` (sort allowlist) | `lib/api/pagination.js` | **Not used** in automation CRM routes |
| `leadActivityFields` / `entityActivityFields` | `lib/crm/activityHelpers.js` | leads `[id]` PUT; should be used in tasks |

**Response shape:** JSON routes consistently use `{ success, data?, error?, pagination? }`. Export routes return raw binary (`NextResponse(buffer)`). Error messages often leak `error.message` (including Mongoose errors).

---

## P0 — Critical (security / data corruption / runtime crash)

### 1. PDF export has no authentication
**File:** `app/api/automation/leads/export/pdf/route.js:5`

```5:7:app/api/automation/leads/export/pdf/route.js
export async function POST(request) {
  try {
    const { leads, filter } = await request.json();
```

Excel export uses `withTenantAuth` (line 8); PDF does not. Anyone can POST unbounded `leads` arrays → memory/CPU DoS and unauthenticated report generation.

**Fix:** Wrap with `withTenantAuth` (match excel route). Add max row limit (e.g. 5,000) and optionally re-fetch leads server-side by ID with `businessId` filter.

---

### 2. Cross-tenant `businessId` override via body spread
**Files:**
- `app/api/automation/contacts/route.js:84-88`
- `app/api/automation/companies/route.js:80-84`
- `app/api/automation/custom-fields/route.js:40-43`

Pattern:
```javascript
Contact.create({ businessId: tenant.business._id, ...body, ownerId: ..., createdBy: ... })
```

`...body` **overwrites** `businessId` if the client sends it — records can be written into another tenant's namespace.

**Fix:** Destructure allowed fields from `body` explicitly, or `{ ...body, businessId: tenant.business._id }` with `businessId` last. Use `requireFields` / field allowlists consistently.

---

### 3. Deal stage change crashes with `ReferenceError: pipeline is not defined`
**File:** `app/api/automation/deals/[id]/route.js:69-72` vs `131`, `146`

`pipeline` is declared with `const` inside the first `if (stageChanging)` block but referenced later at lines 131 and 146 outside that block. Any deal stage change linked to a lead throws at runtime after save.

**Fix:** Hoist pipeline resolution before the block:
```javascript
let pipelineDoc = null;
if (stageChanging) {
  pipelineDoc = deal.pipelineId ? await Pipeline.findById(deal.pipelineId) : await ensureDefaultPipeline(...);
  // use pipelineDoc everywhere
}
```

---

### 4. Lead conversion is not atomic — race allows double conversion / duplicate deals
**File:** `lib/crm/conversion.js:67-69`, `140-187`

Read-check-write with no transaction or conditional update:
```javascript
const lead = await Lead.findOne({ _id: leadId, businessId });
if (lead.status === 'converted') throw new Error('Lead already converted');
// ... Contact.create, Deal.create, lead.save()
```

Two concurrent POSTs to `leads/convert` can both pass the status check and create duplicate contacts/deals. No check for existing deal on `leadId`.

**Fix:** Use `findOneAndUpdate({ _id, businessId, status: { $ne: 'converted' } }, { $set: { status: 'converted' } }, { session })` inside a Mongoose transaction; roll back on failure. Before `Deal.create`, check `Deal.findOne({ leadId, businessId, deletedAt: null })`. Return **409** on conflict.

**Route:** `app/api/automation/leads/convert/route.js:41-43` maps all errors to **500** — should return 404/409 for not-found/already-converted.

---

## P1 — High (functional bugs / RBAC / data loss)

### 5. Contacts POST detects duplicates but always creates anyway
**File:** `app/api/automation/contacts/route.js:79-112`

`findDuplicateContacts` runs, then `Contact.create` always executes. Duplicates are returned as informational metadata only.

**Fix:** If duplicates exist and `body.allowDuplicate !== true`, return **409** with `{ success: false, error: 'Duplicate contact', data: { duplicates } }`. Match lead-ingest behavior in `leads/route.js:249-254`.

---

### 6. Bulk lead status bypasses stage validation — can mark leads `converted` without conversion
**File:** `app/api/automation/leads/bulk/route.js:38-41`

No call to `validateStageTransition` / `normalizeLeadStatus` (unlike `leads/[id]/route.js:109-114`). Bulk action can set `status: 'converted'` without creating contact/deal.

**Fix:** Reuse `validateStageTransition` per lead (or reject `converted`/`won` in bulk). For `converted`, call `convertLead` instead of blind `updateMany`.

---

### 7. Bulk lead delete — incomplete cascade vs single-lead delete
**Files:**
- Bulk: `app/api/automation/leads/bulk/route.js:50-54` — deletes `Lead` + `Activity` only
- Single: `app/api/automation/leads/[id]/route.js:287-291` — also deletes `Task`, `Message`

Orphaned tasks/messages after bulk delete.

**Fix:** Mirror single-delete cascade in bulk `delete` case.

---

### 8. `mergeContacts` — related records not fully migrated
**File:** `lib/crm/merge.js:111-116`

Updates `Lead`, `Deal`, `Task` contactId. **Missing:** `Activity` (entityType `contact`), `CrmNote`, `CrmAttachment`. Source is only `archived: true`, not soft-deleted.

**Fix:** Add `updateMany` for Activity/CrmNote/CrmAttachment (mirror `mergeLeads` lines 50-57). Call `source.softDelete(performedBy)`.

---

### 9. `mergeLeads` — WhatsApp `Message` records not reassigned
**File:** `lib/crm/merge.js:46-58`

Updates Activity, Task, Deal, CrmNote, CrmAttachment. **Missing:** `Message.updateMany({ leadId: sourceId }, { leadId: targetId })`.

**Fix:** Add Message migration to merge promise array.

---

### 10. Broken pagination when `hasOpenDeals` filter is used
**Files:**
- `app/api/automation/contacts/route.js:52-60`
- `app/api/automation/companies/route.js:53-61`

Flow: paginate in DB → enrich with stats → filter in memory → set `total = enriched.length` (page size, not global total). Pages are wrong and results can be empty on later pages.

**Fix:** Pre-filter via aggregation (`$lookup` deals + `$match openDeals`) before skip/limit, or compute full matching ID set then paginate.

---

### 11. Excel export crashes when `filter` is omitted
**File:** `app/api/automation/leads/export/excel/route.js:117`

```javascript
`Filter: ${filter.toUpperCase()}`
```

`filter` is optional; `undefined.toUpperCase()` throws TypeError.

**Fix:** `(filter || 'all').toUpperCase()` (PDF route already does this at line 53).

---

### 12. Task completion activity fails for non-lead tasks
**File:** `app/api/automation/tasks/[id]/route.js:30-36`

`Activity.create` only sets `leadId`. Pre-hook (`Activity.js:108-112`) backfills `entityId` from `leadId` only. Tasks linked to `companyId`/`contactId`/`dealId` only (allowed by `tasks/route.js:74-76`) will fail validation on complete.

**Fix:** Use `entityActivityFields({ businessId }, entityType, entityId, { type: 'follow_up_completed', ... })` picking the linked entity.

---

### 13. RBAC: restricted roles bypass assignment checks on detail routes
**Files:**
- `app/api/automation/leads/[id]/route.js:24-25` — fetches any lead by `businessId`, no assignment check
- `app/api/automation/dashboard/route.js:84-86` — loads **all** leads for KPIs
- `app/api/automation/reports/route.js` — no role filtering

List endpoint (`leads/route.js:44-48`) restricts `member`/`TEAM_MEMBER`/`VIEW_ONLY` to assigned leads; detail/dashboard/reports do not.

**Fix:** Apply `applyRoleFilter` from `lib/crm/queryBuilder.js:22-27` consistently, or reject 403 when restricted user requests unassigned lead.

---

### 14. Auth middleware inconsistency on lead/task detail routes
**Files:** `leads/[id]/route.js`, `tasks/[id]/route.js` use `withPlanAccess`; all other CRM routes use `withTenantAuth` + `resolveTenant`.

`withPlanAccess` skips live user/business document resolution and tenant mismatch checks in `resolveTenant` (`lib/auth.js:202-205`).

**Fix:** Standardize on `withTenantAuth` + `resolveTenant` (+ plan check if needed).

---

## P2 — Medium (validation, limits, consistency)

### 15. No max batch size on bulk/import endpoints
**Files:**
- `app/api/automation/leads/bulk/route.js:16` — unbounded `ids`
- `app/api/automation/contacts/bulk/route.js:14`
- `app/api/automation/companies/bulk/route.js:18`
- `app/api/automation/contacts/import/route.js:12-21` — unbounded loop

**Fix:** `const MAX_BATCH = 100; if (ids.length > MAX_BATCH) return 400`. Return `{ modified, failed, errors[] }` for partial visibility.

---

### 16. Sort-field injection (NoSQL operator / arbitrary field sort)
**File:** `lib/crm/queryBuilder.js:9-10`, used at contacts/companies routes line 45-46

```javascript
const sortField = searchParams.get('sort') || defaults.sortField || 'updatedAt';
// ...
.sort({ [sortField]: sortDir })
```

No allowlist. Client can sort by any field or probe schema.

**Fix:** Allowlist per entity (`['updatedAt','createdAt','fullName','name']`). `lib/api/pagination.js` has the pattern but isn't wired in.

---

### 17. Unescaped regex in search — ReDoS / regex injection
**Files:**
- `app/api/automation/leads/route.js:96-99` — `$regex: search`
- `lib/crm/queryBuilder.js:19` — `$regex: search`
- `app/api/automation/notes/route.js:25`

User-controlled regex metacharacters not escaped.

**Fix:** Escape with `search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` or use Atlas Search / text index.

---

### 18. Invalid pagination params produce `NaN`
**Files:** `lib/crm/queryBuilder.js:6-8`, `activities/route.js:15-17`, `reports/route.js:17-18`

`parseInt('abc')` → `NaN`; `Math.max(1, NaN)` → `NaN`; MongoDB `.skip(NaN).limit(NaN)` errors.

**Fix:** Guard: `const page = Number.isFinite(p) ? Math.max(1, p) : 1`. Same for `period` in reports.

---

### 19. Bulk operations report wrong `modified` count
**File:** `app/api/automation/leads/bulk/route.js:27,31,36,41,48,55`

Always sets `modified = ids.length` instead of `updateMany`/`deleteMany`.result.modifiedCount. Cross-tenant IDs in array silently reduce actual updates.

**Fix:** Use `const { modifiedCount } = await Lead.updateMany(...)` and return actual count.

---

### 20. Export endpoints — client-trusted data, no size cap, no server re-fetch
**Files:**
- `app/api/automation/leads/export/excel/route.js:10`
- `app/api/automation/leads/export/pdf/route.js:7`

Accept arbitrary `leads[]` from client; build full workbook/PDF in memory. No verification leads belong to tenant; no row limit.

**Fix:** Accept `{ leadIds, filter }`, fetch with `{ _id: { $in }, businessId }`, cap count, stream for large exports.

---

### 21. Contacts import — no dedupe, no CSV parsing, no validation beyond firstName
**File:** `app/api/automation/contacts/import/route.js:21-39`

Expects JSON `{ contacts: [...] }`, not CSV. No duplicate check, no email/phone validation, no batch limit, no transaction.

**Fix:** Add `findDuplicateContacts` check per row, `assertEmail`/`assertObjectId`, max rows, return `{ created, skipped, errors }`. Add CSV parser if UI expects CSV.

---

### 22. Error responses leak internal messages
**Widespread** — e.g. `contacts/route.js:65`, `convert/route.js:43`, `merge/route.js:19`

`error.message` returned directly → Mongoose validation messages, internal paths.

**Fix:** Map known errors to safe messages; use `ApiError` + `apiError()` from `lib/api/response.js` for 4xx; generic message for 5xx.

---

### 23. Wrong HTTP status codes on convert/merge errors
| Case | Current | Should be |
|------|---------|-----------|
| Lead not found | 500 (`convert/route.js:43`) | 404 |
| Already converted | 500 (`conversion.js:69`) | 409 |
| Merge self | 500 (`merge.js:18`) | 400 |

**Fix:** Throw `ApiError.notFound()` / `ApiError.conflict()` and map in catch blocks.

---

### 24. Duplicate lead POST returns HTTP 200
**File:** `app/api/automation/leads/route.js:249-254`

Existing duplicate returns `{ success: true }` with status **200** instead of **409**.

**Fix:** Return **409** with `{ success: false, code: 'DUPLICATE', data: existingLead }` or document 200 as intentional idempotent create.

---

### 25. `contacts/duplicates` and `companies/merge` routes do not exist
Only `leads/duplicates` and `leads/merge`, `contacts/merge` exist. No contact duplicate finder endpoint, no company merge.

---

### 26. Incomplete CRUD on saved-views and custom-fields
- `saved-views/[id]/route.js` — **DELETE only** (no PUT/PATCH)
- `custom-fields/route.js` — **GET/POST only** (no update/delete)
- `activities/route.js` — **GET only** (writes go through `logTimelineEvent`)

Not bugs per se, but dead-end API surfaces if UI expects full CRUD.

---

## P3 — Lower (performance / consistency notes)

### 27. Dashboard loads all leads + all deals into memory
**File:** `app/api/automation/dashboard/route.js:80-86`

`Lead.find(...).lean()` and `Deal.find(...).lean()` with no limit — scales poorly for large tenants.

**Fix:** Use aggregations (`buildHeroKpis` inputs from `$group` pipelines).

---

### 28. Leads list logs full query to console in production
**File:** `app/api/automation/leads/route.js:110,168`

PII in server logs.

**Fix:** Remove or gate behind `NODE_ENV === 'development'`.

---

### 29. `parsePagination` / `withApiHandler` / `assertObjectId` exist but CRM routes ignore them
Creates inconsistent validation across the codebase. New fixes should adopt:
- `parseListParams` + sort allowlist extension
- `assertObjectId(id)` on all `[id]` params and bulk `ids`
- `withApiHandler` for unified error envelope + request IDs

---

## Response-shape summary

| Route area | Shape |
|------------|-------|
| Most JSON CRM routes | `{ success, data, pagination? }` |
| Bulk routes | `{ success, data: { modified } }` or `{ success: true }` (contacts/companies bulk omit count) |
| Export excel/pdf | Raw binary (no envelope) — expected |
| Error paths | Mix of generic (`'Failed to fetch leads'`) and raw `error.message` |

---

## Quick reference: verified fix priorities

| Priority | Issue | Primary file:line |
|----------|-------|-------------------|
| P0 | Unauthenticated PDF export | `leads/export/pdf/route.js:5` |
| P0 | businessId body override | `contacts/route.js:84`, `companies/route.js:80`, `custom-fields/route.js:40` |
| P0 | Deal PUT pipeline ReferenceError | `deals/[id]/route.js:131,146` |
| P0 | Non-transactional convert race | `lib/crm/conversion.js:67-187` |
| P1 | Duplicate contacts still created | `contacts/route.js:79-89` |
| P1 | Bulk status skips validation | `leads/bulk/route.js:38-41` |
| P1 | Bulk delete incomplete cascade | `leads/bulk/route.js:50-54` |
| P1 | mergeContacts incomplete | `lib/crm/merge.js:111-116` |
| P1 | mergeLeads missing Messages | `lib/crm/merge.js:46-58` |
| P1 | hasOpenDeals pagination broken | `contacts/route.js:52-60`, `companies/route.js:53-61` |
| P1 | Excel filter crash | `leads/export/excel/route.js:117` |
| P1 | Task complete activity for non-lead tasks | `tasks/[id]/route.js:30-36` |
| P1 | RBAC bypass on detail/dashboard | `leads/[id]/route.js:24`, `dashboard/route.js:84` |

Switch to **Agent mode** if you want these fixes implemented in a consistent pass using the existing helper patterns.

[REDACTED]