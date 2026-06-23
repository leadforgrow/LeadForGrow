# Architecture Overview

LeadForGrow uses a **modular monolith** architecture within Next.js 16 App Router.

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Presentation** | `app/`, `app/components/` | Pages, layouts, UI components |
| **Application** | `lib/`, `app/api/` | Route handlers, orchestration, auth |
| **Domain** | `lib/*/domain/`, `models/` | Business entities and rules |
| **Infrastructure** | `lib/mongodb.js`, `lib/queue.js`, `lib/integrations/` | DB, queues, external services |

## Key Flows

### Lead Ingest
```
Embed (form/chatbot) → POST /api/forms/submit
  → lib/leadProcessor.js (dedup, quota, assign)
  → lib/queue.js → automationEngine.processLeadTrigger
  → WhatsApp auto-reply / sequences
```

### Authentication
```
POST /api/auth/login → JWT access token + refresh token
Middleware → JWT format check on protected routes
withAuth() → Full JWT verify + RBAC on API handlers
POST /api/auth/refresh → Rotate refresh token
```

### Background Jobs
```
API server → BullMQ queue (Redis)
Worker process (IS_WORKER=true) → Processes automation jobs
Fallback: synchronous execution when Redis unavailable
```

## Design Principles

1. **Backward compatible APIs** — `{ success, data, error, code }` envelope
2. **Tenant isolation** — `businessId` on all CRM entities
3. **Fail-safe defaults** — Rate limit fails open; queue falls back to sync
4. **No microservices** — Single deployable unit with optional worker tier

See also: [Folder Structure](./FOLDER_STRUCTURE.md) · [Dependency Graph](../PHASE1_AUDIT.md#dependency-graph)
