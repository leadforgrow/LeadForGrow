# CRM API Reference (Phase 2)

All endpoints require authentication via `withTenantAuth`. Responses use `{ success, data, error, pagination? }`.

## Contacts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/automation/contacts` | List contacts (search, pagination, filters) |
| POST | `/api/automation/contacts` | Create contact |
| GET | `/api/automation/contacts/[id]` | Contact detail + timeline, deals, tasks |
| PUT | `/api/automation/contacts/[id]` | Update / archive contact |
| DELETE | `/api/automation/contacts/[id]` | Soft delete |
| POST | `/api/automation/contacts/merge` | Merge two contacts |
| POST | `/api/automation/contacts/import` | Bulk CSV import |

## Companies

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/automation/companies` | List companies |
| POST | `/api/automation/companies` | Create company |
| GET | `/api/automation/companies/[id]` | Detail + contacts, deals, analytics |
| PUT | `/api/automation/companies/[id]` | Update company |
| DELETE | `/api/automation/companies/[id]` | Soft delete |

## Deals

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/automation/deals` | List deals + pipeline aggregate |
| POST | `/api/automation/deals` | Create deal |
| GET | `/api/automation/deals/[id]` | Deal detail + timeline |
| PUT | `/api/automation/deals/[id]` | Update stage, amount, etc. |
| DELETE | `/api/automation/deals/[id]` | Soft delete |

## Pipelines

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/automation/pipelines` | List pipelines (auto-seeds default) |
| POST | `/api/automation/pipelines` | Create pipeline |
| GET | `/api/automation/pipelines/[id]` | Pipeline + stage analytics |
| PUT | `/api/automation/pipelines/[id]` | Update stages |
| DELETE | `/api/automation/pipelines/[id]` | Archive pipeline |

## Universal CRM

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/automation/notes` | Notes with version history |
| PUT/DELETE | `/api/automation/notes/[id]` | Edit / delete note |
| GET/POST | `/api/automation/attachments` | File attachments |
| GET/POST | `/api/automation/comments` | Comments with mentions |
| GET | `/api/automation/timeline` | Universal entity timeline |
| GET/POST | `/api/automation/saved-views` | Saved filter views |
| GET/POST | `/api/automation/custom-fields` | Custom field definitions |
| GET | `/api/automation/dashboard` | CRM dashboard metrics |

## Leads (enhanced)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/automation/leads/duplicates` | Duplicate detection |
| POST | `/api/automation/leads/merge` | Merge leads |
| POST | `/api/automation/leads/convert` | Convert lead to contact/deal |
| PATCH | `/api/automation/leads/bulk` | Bulk archive, assign, status, tags |
