# LeadForGrow Database / Schema Audit

**Scope verified:** 66 files under `models/**`, connection in `lib/mongodb.js` (not `lib/server/` — that folder only has `intelligence.js` and `businessAssistantContext.js`), plus `scripts/ensure-indexes.js` and `scripts/migrate.js` (+ 3 migrations).

---

## Model inventory (name → purpose)

| Model | File | Purpose |
|-------|------|---------|
| **Business** | `models/Business.js` | Tenant root: plan, quotas, settings, integration credentials |
| **User** | `models/User.js` | Auth identity; optional `businessId` / `agencyId` |
| **Agency** | `models/Agency.js` | Agency account linked 1:1-ish to a Business |
| **Client** | `models/Client.js` | Agency-managed end-client (`agencyId`) |
| **Invoice** | `models/Invoice.js` | Agency→client billing records (`agencyId`) |
| **AgencyUsage** | `models/AgencyUsage.js` | Monthly agency usage counters |
| **Form** | `models/Form.js` | Embeddable lead-capture forms |
| **Website** | `models/Website.js` | Website builder sites |
| **Integration** | `models/Integration.js` | Per-business integration connections |
| **IntegrationLog** | `models/IntegrationLog.js` | Integration sync logs (90-day TTL) |
| **RolePermission** | `models/RolePermission.js` | Global role→permission map (seed data) |
| **OnboardingCall** | `models/OnboardingCall.js` | Pre-payment onboarding call bookings |
| **ConsentLog** | `models/ConsentLog.js` | Cookie/consent tracking per visitor |
| **MetaWebhookIngress** | `models/MetaWebhookIngress.js` | Meta webhook debug/ingress log (30-day TTL) |
| **Lead** | `models/automation/Lead.js` | Core CRM lead |
| **Contact** | `models/automation/Contact.js` | CRM contact |
| **Company** | `models/automation/Company.js` | CRM company/account |
| **Deal** | `models/automation/Deal.js` | Sales deal/opportunity |
| **Pipeline** | `models/automation/Pipeline.js` | Configurable deal/lead pipeline stages |
| **Task** | `models/automation/Task.js` | CRM tasks (calls, follow-ups, etc.) |
| **Activity** | `models/automation/Activity.js` | Unified activity/timeline events |
| **Message** | `models/automation/Message.js` | Channel messages (WA/IG/email) |
| **WhatsAppConversation** | `models/automation/WhatsAppConversation.js` | Legacy WA chat inbox summary per lead |
| **Conversation** | `models/omnichannel/Conversation.js` | Omnichannel inbox conversation |
| **AutomationRule** | `models/automation/AutomationRule.js` | Automation rules & templates |
| **AutomationSequence** | `models/automation/AutomationSequence.js` | Workflow/sequence definitions |
| **WorkflowVersion** | `models/automation/WorkflowVersion.js` | Published sequence version snapshots |
| **WorkflowFolder** | `models/automation/WorkflowFolder.js` | Sequence folder organization |
| **SequenceExecution** | `models/sequences/SequenceExecution.js` | Running/completed sequence runs |
| **Broadcast** | `models/automation/Broadcast.js` | Bulk WA/email broadcasts |
| **Event** | `models/automation/Event.js` | Event→form→sequence linkage |
| **TeamMember** | `models/automation/TeamMember.js` | Business team roster + permissions |
| **Notification** | `models/automation/Notification.js` | In-app user notifications |
| **LeadSource** | `models/automation/LeadSource.js` | Connected lead source config |
| **SavedView** | `models/automation/SavedView.js` | Saved CRM list filters |
| **WebhookLog** | `models/automation/WebhookLog.js` | Webhook idempotency log (7-day TTL) |
| **CrmNote** | `models/automation/CrmNote.js` | Entity notes with version history |
| **CrmComment** | `models/automation/CrmComment.js` | Threaded comments on entities |
| **CrmAttachment** | `models/automation/CrmAttachment.js` | File attachments on entities |
| **CrmCustomField** | `models/automation/CrmCustomField.js` | Custom field definitions |
| **UserAccess** | `models/access/UserAccess.js` | RBAC membership per business |
| **WorkspaceRole** | `models/access/WorkspaceRole.js` | Custom workspace roles |
| **ApiKey** | `models/access/ApiKey.js` | Business API keys |
| **RefreshToken** | `models/access/RefreshToken.js` | JWT refresh token store |
| **AccessAuditLog** | `models/access/AccessAuditLog.js` | Security/access audit trail |
| **Subscription** | `models/billing/Subscription.js` | SaaS subscription per business |
| **BillingInvoice** | `models/billing/Invoice.js` | Stripe/Razorpay invoice mirror |
| **UsageRecord** | `models/billing/UsageRecord.js` | Monthly metered usage |
| **CMS_Client** | `models/cms/Client.js` | Agency CMS client (separate collection) |
| **CMS_Invoice** | `models/cms/Invoice.js` | CMS client invoices |
| **CMS_Service** | `models/cms/ServiceTask.js` | CMS service engagements |
| **CMS_Task** | `models/cms/ServiceTask.js` | CMS delivery tasks |
| **CMS_ActivityLog** | `models/cms/ActivityLog.js` | CMS client activity feed |
| **MeetingType** | `models/meetings/MeetingType.js` | Bookable meeting type/slug |
| **MeetingBooking** | `models/meetings/MeetingBooking.js` | Scheduled meetings |
| **MeetingAvailability** | `models/meetings/MeetingAvailability.js` | Per-host availability overrides |
| **MeetingReminder** | `models/meetings/MeetingReminder.js` | Scheduled meeting reminders |
| **MeetingAnalytics** | `models/meetings/MeetingAnalytics.js` | Daily meeting metrics rollup |
| **EmailAccount** | `models/omnichannel/EmailAccount.js` | Connected email accounts |
| **EmailThread** | `models/omnichannel/EmailThread.js` | Email thread metadata |
| **EmailDraft** | `models/omnichannel/EmailDraft.js` | Composed email drafts |
| **InboxLabel** | `models/omnichannel/InboxLabel.js` | Inbox labels/tags |
| **AiMemory** | `models/ai/AiMemory.js` | AI-extracted lead/contact memories |
| **AiSummary** | `models/ai/AiSummary.js` | AI-generated summaries |
| **KnowledgeSource** | `models/ai/KnowledgeSource.js` | RAG knowledge source docs |
| **KnowledgeChunk** | `models/ai/KnowledgeChunk.js` | Chunked + embedded source text |

---

## Prioritized issues (verified in code)

### P0 — Data integrity / multi-tenant safety

1. **`Lead.businessId` is optional** — `models/automation/Lead.js` line 12: `required: false`. Leads can exist with no tenant scope; all tenant queries become unreliable.  
   **Fix:** Set `required: true` (with migration backfill for orphans); add schema validation that at least one of `businessId` or (`agencyId` + `clientId`) is present if agency mode is intentional.

2. **No unique constraint on lead email per business** — `Lead.js` has `{ businessId: 1, email: 1 }` but not `unique: true, sparse: true` (unlike `whatsappId` / `metaLeadId`). Duplicate CRM leads by email are allowed.  
   **Fix:** `LeadSchema.index({ businessId: 1, email: 1 }, { unique: true, sparse: true })`.

3. **No unique constraint on contact email per business** — `models/automation/Contact.js` indexes `'emails.address'` but does not enforce uniqueness.  
   **Fix:** Add sparse unique compound index on `{ businessId: 1, 'emails.address': 1 }` (or normalize to a single `primaryEmail` field).

4. **`TeamMember` allows duplicate memberships** — `models/automation/TeamMember.js` has no `{ businessId: 1, userId: 1 }` unique index (unlike `UserAccess`).  
   **Fix:** `TeamMemberSchema.index({ businessId: 1, userId: 1 }, { unique: true })`.

5. **`Subscription` allows multiple active subs per business** — `models/billing/Subscription.js` only indexes `businessId`; app uses `findOne({ businessId }).sort({ createdAt: -1 })`.  
   **Fix:** Partial unique index: `{ businessId: 1, status: 1 }` with `partialFilterExpression: { status: { $in: ['active', 'trialing', 'past_due'] } }`, or enforce one doc per business via unique `{ businessId: 1 }`.

6. **CMS invoice number scoped globally, not per tenant** — `models/cms/Invoice.js` line 18: `invoiceNumber: { unique: true }`. Two businesses cannot share numbering schemes.  
   **Fix:** Drop global unique; add `InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true })`.

7. **CMS client ID globally unique** — `models/cms/Client.js` line 13: `clientId: { unique: true }`.  
   **Fix:** `{ businessId: 1, clientId: 1 }` unique compound instead.

8. **Notifications queried without `businessId`** — `app/api/automation/notifications/route.js` uses `{ userId }` only; model has both `businessId` and `userId`. Multi-workspace users can see cross-tenant notifications.  
   **Fix:** Always filter `{ businessId, userId }`; add index `{ businessId: 1, userId: 1, isRead: 1, createdAt: -1 }` to `models/automation/Notification.js`.

9. **No delete cascade anywhere** — Grep across `models/**` found zero `pre('remove')` / cascade hooks. Example: `app/api/automation/team/route.js` deletes `TeamMember` but not `UserAccess`, assigned leads, etc. Deleting a business/lead/contact leaves orphaned `Message`, `Activity`, `Deal`, `KnowledgeChunk`, etc.  
   **Fix:** Add application-level cleanup jobs or Mongoose middleware per entity; at minimum document required delete order.

10. **`WhatsAppConversation` unique index exists only in script, not schema** — `scripts/ensure-indexes.js` line 25 creates `{ businessId: 1, leadId: 1 }` unique, but `models/automation/WhatsAppConversation.js` does not declare it. Fresh deploys without running the script allow duplicate conversations.  
    **Fix:** Add to schema: `WhatsAppConversationSchema.index({ businessId: 1, leadId: 1 }, { unique: true })`.

---

### P1 — Missing / wrong indexes (performance)

11. **`Notification` — no compound indexes** — `models/automation/Notification.js` only has single-field indexes.  
    **Fix:** `{ businessId: 1, userId: 1, createdAt: -1 }` and `{ userId: 1, isRead: 1, createdAt: -1 }`.

12. **`Website` — no query indexes** — `models/Website.js`: queries use `owner` and `slug` (`app/api/websites/route.js`, `app/api/website-funnel/list/route.js`); `businessId` is unindexed.  
    **Fix:** `{ owner: 1, createdAt: -1 }`, `{ businessId: 1 }`, keep existing sparse slug index.

13. **CMS models missing `businessId` indexes** — `models/cms/Invoice.js`, `models/cms/ActivityLog.js`, `models/cms/ServiceTask.js` (Service + Task schemas): `businessId` is required on some but never indexed.  
    **Fix:** e.g. `{ businessId: 1, status: 1 }`, `{ businessId: 1, clientId: 1 }`, `{ businessId: 1, createdAt: -1 }`.

14. **`OnboardingCall` — no indexes** — `models/OnboardingCall.js` has no indexes on `userId`, `userEmail`, or `status`.  
    **Fix:** `{ userId: 1, createdAt: -1 }`, `{ status: 1 }`.

15. **`ApiKey` — no index on `keyHash`** — `models/access/ApiKey.js`: hash stored but not indexed (auth lookup would full-scan).  
    **Fix:** `{ keyHash: 1 }` unique sparse index.

16. **`Subscription` — missing business status index** —  
    **Fix:** `{ businessId: 1, status: 1 }` and `{ businessId: 1, createdAt: -1 }`.

17. **`SequenceExecution` — missing active-run index** — worker queries likely filter by status.  
    **Fix:** `{ businessId: 1, status: 1, createdAt: -1 }`.

18. **Cross-tenant index prefixes missing `businessId`** — several indexes lead with non-tenant fields:
    - `Lead.js` line 208: `{ assignedTo: 1, status: 1 }` → `{ businessId: 1, assignedTo: 1, status: 1 }`
    - `Task.js` line 66: `{ assignedTo: 1, status: 1 }` → prefix with `businessId`
    - `Activity.js` line 115: `{ entityType: 1, entityId: 1, performedAt: -1 }` → prefix with `businessId`
    - `MeetingBooking.js` line 83: `{ assignedTo: 1, startTime: 1 }` → prefix with `businessId`

19. **`Form` — missing agency indexes** — `businessId` optional; has `{ businessId: 1, active: 1 }` but nothing for agency mode.  
    **Fix:** `{ agencyId: 1, clientId: 1, active: 1 }`.

20. **`User` — missing indexes & timestamps** — No `agencyId` index; only `{ businessId: 1, role: 1 }`. Schema has manual `createdAt` only (no `updatedAt`, no `timestamps: true`).  
    **Fix:** Enable timestamps; add `{ agencyId: 1 }` sparse index.

21. **`ConsentLog.businessId` not required** — line 16: indexed but optional; consent records can exist without tenant.  
    **Fix:** `required: true` where business context is always known.

22. **`ensure-indexes.js` drift from schemas** — Script adds indexes not in models:
    - Lead: `{ businessId: 1, archived: 1, receivedAt: -1 }` and `{ businessId: 1, status: 1, assignedTo: 1 }` (schema has `updatedAt` variant, not `receivedAt`; no combined status+assignedTo)
    - WhatsAppConversation unique index (see P0 #10)  
    **Fix:** Move all production indexes into schema definitions; expand script to all collections or rely on `syncIndexes()` in CI.

23. **`WorkflowVersion` — no uniqueness on version** — `models/automation/WorkflowVersion.js` line 28: `{ sequenceId: 1, version: -1 }` only.  
    **Fix:** `{ sequenceId: 1, version: 1 }` unique.

24. **`SavedView` — duplicate names allowed** — `models/automation/SavedView.js` line 21: `{ businessId, entityType, userId }` not unique.  
    **Fix:** Add `{ businessId: 1, userId: 1, entityType: 1, name: 1 }` unique.

---

### P2 — Schema design / consistency / size risks

25. **Dual conversation models (redundant)** — `WhatsAppConversation` used by chat APIs (`app/api/automation/chat/*`, `lib/integrations/whatsapp.js`); `Conversation` used by omnichannel inbox (`app/api/automation/inbox/*`). Same lead can have divergent state.  
    **Fix:** Consolidate on `Conversation` or sync both in one code path.

26. **Dual membership models (redundant)** — `TeamMember` + `UserAccess` both represent business membership with different permission shapes (`lib/access/resolver.js` reads both).  
    **Fix:** Single source of truth; migrate permissions into `UserAccess` + `WorkspaceRole`.

27. **Triple Client / triple Invoice / dual Task** —  
    - Clients: `Client` (agency), `CMS_Client` (business CMS), Lead.`clientId` → agency `Client`  
    - Invoices: `Invoice` (agency), `BillingInvoice`, `CMS_Invoice`  
    - Tasks: `Task` (CRM) vs `CMS_Task` (delivery)  
    **Fix:** Rename for clarity (`AgencyClient`, `BillingInvoice` already aliased) and document boundaries; avoid overloading `Client`.

28. **`Deal.stage` has no enum validation** — `models/automation/Deal.js` line 30: free `String`; `DEAL_STAGES` exported but unused in schema. Pipeline stages are dynamic, but invalid stage strings won't be caught.  
    **Fix:** Validate against pipeline stages at app layer, or store `stageKey` with ref to `Pipeline.stages[].key`.

29. **Unbounded arrays (16MB risk)** — verified unbounded subdocs:
    - `Broadcast.recipients` — entire audience embedded (`models/automation/Broadcast.js` line 54) — **highest risk**
    - `SequenceExecution.logs` — grows per run (`models/sequences/SequenceExecution.js` line 39)
    - `Lead.notes` embedded array (`models/automation/Lead.js` line 145)
    - `CrmNote.versions` (`models/automation/CrmNote.js` line 22)
    - `ConsentLog.pageViews` (`models/ConsentLog.js` line 32)
    - `Conversation.assignmentHistory` (`models/omnichannel/Conversation.js` line 53)
    - `CMS_Task.auditLog` (`models/cms/ServiceTask.js` line 106)
    - `AutomationSequence.nodes` / `edges` (complex workflows)  
    **Fix:** Move broadcast recipients to separate collection; cap or externalize logs; use `CrmNote`/`Activity` instead of embedded `Lead.notes`.

30. **`KnowledgeSource.content` duplicated in chunks** — full content on source doc plus `KnowledgeChunk` rows (`models/ai/KnowledgeSource.js` + `KnowledgeChunk.js`). Large PDFs can bloat source documents.  
    **Fix:** Store content only in chunks; keep metadata on source.

31. **`baseSchemaPlugin` applied inconsistently** — Used on Lead, Contact, Deal, Pipeline, omnichannel models, etc., but **not** on TeamMember, Notification, AutomationRule, Form, User, meetings models, billing models. Soft-delete behavior is inconsistent.  
    **Fix:** Standardize which collections get soft-delete + audit fields.

32. **`Activity` has `timestamps: false`** — No Mongoose `createdAt`/`updatedAt`; uses `performedAt`. But `lib/server/intelligence.js` line 14 sorts by `createdAt` (wrong field — will sort unpredictably).  
    **Fix:** Use `performedAt` in queries; optionally enable timestamps or alias.

33. **`RolePermission.role` enum duplicates** — `models/RolePermission.js` line 8 mixes `SUPER_ADMIN` and `super`, `TEAM_MEMBER` and `team_member`, etc. Same issue on `User.role`.  
    **Fix:** Normalize to one canonical set; migration to map legacy values.

34. **`LeadSource.name` is a fixed enum** — Cannot define custom source names per business (`models/automation/LeadSource.js` line 14).  
    **Fix:** Change `name` to free `String`; keep `type` enum.

35. **Migration `002-crm-phase2.js` does not create indexes** — Lines 53–56 only log existing index counts.  
    **Fix:** Call `Model.syncIndexes()` or explicit `createIndex` for new CRM collections.

36. **Pipeline stage seed mismatch** — Migration `002` creates 5 legacy stages; migration `003` upgrades to 12; `Deal.js` exports 12 `DEAL_STAGES`; default pipeline in code uses `@/lib/crm/pipelineStages`. New businesses created outside migrations may get inconsistent stage keys.

37. **Credentials stored in document fields** — `Business.integrationCredentials`, `Integration.credentials`, `EmailAccount.imap.password` / `smtp.password` (`models/omnichannel/EmailAccount.js` lines 15–22) — schema has no encryption enforcement.  
    **Fix:** Encrypt at rest (app layer); mark fields `select: false`.

38. **Naming inconsistency: tenant scoping fields**
    - Primary: `businessId` (most models)
    - Agency layer: `agencyId` + `clientId` (Lead, Form, User, Invoice)
    - OAuth: `Integration.oauth.tenantId` (Microsoft tenant, not app tenant)
    - CMS uses `clientId` meaning CMS client, not agency client  
    **Fix:** Document naming guide; consider `agencyClientId` vs `cmsClientId`.

39. **`Agency.businessId` not unique** — Multiple agency docs could reference the same business (`models/Agency.js` line 20).  
    **Fix:** `{ businessId: 1 }` unique sparse if 1:1 is intended.

---

### P2 — MongoDB connection (`lib/mongodb.js`)

**Good (verified):**
- Global cache via `global.mongoose` for dev hot-reload ✓
- `bufferCommands: false` (serverless-friendly) ✓
- Pool/timeouts configured ✓

**Issues:**

40. **`minPoolSize: 5` is serverless-unfriendly** — `lib/mongodb.js` lines 40–41 keep 5 warm connections per instance; costly on Vercel/edge lambdas.  
    **Fix:** `minPoolSize: 0` (or env-based) in production serverless; keep higher only for long-running workers.

41. **`tlsAllowInvalidCertificates: true` in development** — line 45–47 disables cert validation in dev. Ensure this never leaks to production via mis-set `NODE_ENV`.

42. **No explicit `autoIndex: false` for production** — Mongoose defaults may auto-build indexes on connect in dev; production should use `ensure-indexes.js` / migrations in CI. Script currently covers only 8 of 66 models.

43. **`lib/server/` has no DB connection** — Connection lives in `lib/mongodb.js`. If the intent was a server-only DB module, it is missing from `lib/server/`.

---

## `scripts/ensure-indexes.js` summary

Covers only: Lead, Message, WhatsAppConversation, Activity, Task, MeetingType, MeetingBooking, MeetingReminder.

**Gaps vs schemas:** ~50+ models with declared indexes never touched by this script; two Lead indexes exist only here; WhatsAppConversation unique index exists only here. Running this script alone is insufficient for production index parity.

---

## `scripts/migrate.js` summary

Solid runner (up/down/status, `_migrations` tracking). Migrations are data backfills, not index management. `001` adds audit fields to 9 collections but many newer models using `baseSchemaPlugin` aren't in that list.

---

## Recommended fix order

1. Tenant scoping: require `businessId` on Lead/Form/ConsentLog; fix Notification queries.  
2. Unique constraints: lead email, contact email, TeamMember, Subscription, CMS invoice/client IDs.  
3. Move all indexes into schemas; run full `syncIndexes` in deploy pipeline.  
4. Consolidate Conversation + membership models (plan migration).  
5. Externalize `Broadcast.recipients`; cap execution logs.  
6. Add delete-cleanup for business/lead/user removal.  
7. Tune connection pool for deployment target.

I can turn any of these into concrete migration + schema patches in Agent mode if you want.

[REDACTED]