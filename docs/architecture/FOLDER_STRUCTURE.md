# Folder Structure

```
app/
  api/              # REST endpoints (one route.js per path)
  automation/       # CRM UI (/automation/*)
  agency/           # Agency console
  components/       # Shared React components
  lfgadmin/         # Platform admin

lib/
  api/              # API platform (handler, response, pagination, validation)
  security/         # CSRF, sanitize, refresh tokens
  access/           # RBAC resolver + middleware
  automation/       # Engine facade + lead manager
  billing/          # Payment providers
  call-automation/  # Telephony subsystem
  integrations/     # Third-party connectors
  meetings/         # Scheduling subsystem
  meta/             # Meta/Facebook integration
  realtime/         # SSE event hub
  sequences/        # Automation sequences
  auth.js           # JWT middleware
  mongodb.js        # Database connection
  queue.js          # BullMQ
  env.js            # Environment validation
  leadProcessor.js  # Lead ingest

models/
  automation/       # CRM entities
  access/           # Auth + permissions
  billing/          # Subscriptions
  meetings/         # Booking entities
  cms/              # Legacy CMS (deprecated path)
  baseSchema.js     # Audit field plugin

workers/
  automation-worker.js

scripts/
  migrate.js        # Migration runner
  migrations/       # Versioned DB migrations
  ensure-indexes.js
  smoke-test.js

tests/
  auth.test.js
  api.test.js
  security.test.js

docs/
  architecture/
  api/
  database/
  deployment/
```

## File Size Policy

Modules should stay under **300–400 lines**. Files exceeding this should be split into focused services. Current exceptions are documented in `docs/PHASE1_AUDIT.md`.
