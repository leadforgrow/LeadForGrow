# Database Schema

LeadForGrow uses **MongoDB** with **Mongoose** ODM.

## Base Audit Fields

All new entities should apply `baseSchemaPlugin` from `models/baseSchema.js`:

| Field | Type | Purpose |
|-------|------|---------|
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |
| `createdBy` | ObjectId → User | Creator |
| `updatedBy` | ObjectId → User | Last editor |
| `deletedAt` | Date | Soft delete (null = active) |
| `version` | Number | Optimistic concurrency |

```javascript
import { baseSchemaPlugin } from '../baseSchema.js';

const schema = new mongoose.Schema({ /* fields */ });
schema.plugin(baseSchemaPlugin);
```

## Core Collections

### leads
Primary CRM entity. Indexed on `businessId + status`, `businessId + phone`, `businessId + receivedAt`. Links to `contactId`, `companyId`, supports `tags` and `customFields`.

### contacts
Person records with multiple phones/emails, addresses, social profiles. Links to `companyId` and optional `leadId`.

### companies
Organization accounts with industry, revenue, employee count. Parent for contacts and deals.

### deals
Sales opportunities with pipeline stages, products, probability, forecast. Links to lead, contact, company.

### pipelines
Configurable stage definitions per business. Supports unlimited pipelines with custom stages, colors, win probability.

### crmnotes / crmattachments / crmcomments
Universal notes, files, and comments attached to any CRM entity via `entityType` + `entityId`.

### activities
Universal timeline events. Indexed on `entityType + entityId + performedAt` and `businessId + performedAt`.

### businesses
Tenant root. Contains `plan`, `quotas`, onboarding state, integration credentials (encrypted).

### users
Authentication + role. Linked to `businessId` or `agencyId`.

### refreshtokens
Server-side refresh token hashes with TTL expiry.

## Indexes

Run `npm run indexes` to ensure production compound indexes.

## Migrations

Never edit schemas manually in production. Use:

```bash
npm run migrate          # Apply pending
npm run migrate:status   # Check status
node scripts/migrate.js down  # Roll back last
```

See [MIGRATIONS.md](./MIGRATIONS.md) for authoring new migrations.
