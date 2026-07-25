# LeadForGrow Security & Authentication Audit

Verified against the codebase at `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1`. Issues below are **confirmed in code**, ordered by severity.

---

## Critical

### 1. Unauthenticated profile read/write (IDOR)
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\user\profile\[id]\route.js`  
**Lines:** 15–103 (GET), 105–144 (PUT)

- No `withAuth`, no ownership check.
- `/api/user/` is **not** in `middleware.js` protected prefixes — middleware does not gate this at all.
- **GET** returns email, role, business plan, quotas, feature flags, lead counts for any valid MongoDB user ID.
- **PUT** updates any user’s `firstName`/`lastName`/`phone` and, for owner/admin roles, mutates linked `Business` fields.

**Fix:** Wrap with `withAuth()`, verify `req.user.userId === id` (or admin RBAC). Add `/api/user/` to `PROTECTED_API_PREFIXES` in `middleware.js`.

---

### 2. Open lead injection into any tenant
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\website-funnel\leads\route.js`  
**Lines:** 10–31

- Public POST accepts client-supplied `businessId` and creates `Lead` + `Activity` with no auth or business validation.
- Not covered by middleware protection.

**Fix:** Require a signed form/website token tied to `businessId`, or move behind authenticated tenant routes; validate `websiteId` belongs to `businessId`.

---

### 3. Call-integration API fully unauthenticated (telephony takeover)
**Files:**
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\automation\call-integration\route.js` (lines 9–170)
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\automation\call-integration\inbound\route.js` (lines 9–56)

- Under `/api/automation/` (middleware only checks JWT **shape**, not signature).
- Handlers have **no** `withAuth` / `withTenantAuth`.
- Any caller passing `a.b.c` as Bearer/cookie can:
  - Read call settings/usage/missed calls for any `businessId` (GET lines 75–98)
  - Update telephony settings, connect phones (PATCH 108–128)
  - Trigger AI callbacks and test calls (POST 22–56)
  - Reset integration (DELETE 147–161)
  - Spoof inbound calls via `?businessId=` (inbound POST 14–35) with no Twilio/provider signature check.

**Fix:** Add `withTenantAuth` + enforce `req.user.businessId`; verify provider webhook signatures on inbound; remove simulation actions from production paths.

---

### 4. Website CRUD without JWT verification
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\websites\[id]\route.js`  
**Lines:** 5–54

- GET/PUT/DELETE by Mongo ID with no auth handler.
- Middleware requires 3-part token format only; handler never calls `verifyToken`.
- Attacker with garbage JWT shape can read/modify/delete any website.

**Fix:** Wrap all methods in `withAuth()` and scope queries to `owner: req.user.userId` or `businessId: req.user.businessId`.

---

### 5. SSRF via unauthenticated scrape endpoint
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\scrape\route.js`  
**Lines:** 4–21

- No auth; not in middleware protected list.
- Launches Puppeteer against arbitrary user-supplied `url` (`lib/scraper.js` lines 17–22) — SSRF to internal networks/metadata endpoints.

**Fix:** Require auth + tenant scope; block private IP ranges; allowlist schemes/hosts; or remove endpoint in production (middleware blocks `/api/scrape` in prod at `middleware.js` 112, but dev/staging remain exposed).

---

### 6. OAuth tokens exposed in URL query string
**Files:**
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\auth\google\callback\route.js` lines 194–208
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\auth\google\complete\page.js` lines 13–36

- `accessToken`, `refreshToken`, `userId`, `email` redirected as query params, then stored in `localStorage` and a non-`httpOnly` cookie.
- Tokens leak via browser history, Referer, server/proxy logs, analytics.

**Fix:** Use short-lived one-time exchange code → server sets `httpOnly`/`secure`/`sameSite=strict` cookies; never put refresh tokens in URLs or `localStorage`.

---

### 7. Production webhook test endpoints inject data without auth
**Files:**
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\webhooks\meta\inject-test-lead\route.js` lines 9–41
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\webhooks\meta\test\route.js` lines 20–38

- Under public prefix `/api/webhooks/` (`middleware.js` line 17) — **not** in production block list (only `/api/debug*`, `/api/scrape`, etc. are blocked at lines 108–114).
- `inject-test-lead` creates real CRM leads for any `?businessId=`.
- `meta/test` accepts **any** verify token (line 21).

**Fix:** Delete or gate behind `NODE_ENV !== 'production'` + admin secret; remove from public middleware prefix.

---

## High

### 8. Edge middleware does not verify JWT signatures
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\middleware.js`  
**Lines:** 72–76, 124–139

- `hasValidTokenFormat()` only checks three dot-separated segments.
- Any route under a protected prefix that **omits** `withAuth` in the handler is effectively open to forged tokens.

**Affected handlers (verified no `withAuth`):**
| Path | File | Lines |
|------|------|-------|
| AI proxy routes | `app/api/ai/copilot/route.js` | 3–19 |
| | `app/api/ai/sentiment/route.js` | 3–15 |
| | `app/api/ai/forecast/route.js` | 3+ |
| | `app/api/ai/audit/route.js` | 3+ |
| | `app/api/ai/strategy/route.js` | 3+ |
| | `app/api/ai/full-report/route.js` | 3–15 |
| PDF export | `app/api/automation/leads/export/pdf/route.js` | 5–168 |
| Call integration | (see Critical #3) | |

**Fix:** Verify JWT in middleware with `jwt.verify` (or always require `withAuth`/`withTenantAuth` on every protected handler and add CI lint rule).

---

### 9. JWT/session stored insecurely (XSS-theft surface)
**Files:**
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\components\auth\AuthPages.jsx` lines 66–73
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\auth\google\complete\page.js` lines 28–36

- Tokens in `localStorage` (`userToken`, `refreshToken`).
- Cookie: `document.cookie = token=...; samesite=lax` — no `httpOnly`, no `secure`, not `sameSite=strict`.
- Login returns tokens in JSON body (`app/api/auth/login/route.js` lines 75–86), not `Set-Cookie`.

**Fix:** Issue `httpOnly; Secure; SameSite=Strict` cookies server-side; keep refresh token out of JS reach; use short-lived access tokens.

---

### 10. Meta generic webhook: signature skipped for Instagram + conditional leadgen
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\webhooks\meta\route.js`

- Instagram branch (lines 146–166): processes events with **no** `x-hub-signature-256` check.
- Leadgen branch (lines 94–117): signature verified only when `business && signature`; if business not resolved or header missing, `processLeadgenPayload` still runs (line 117).

**Fix:** Require valid signature for all POST paths before processing; reject when `signature` missing in production.

---

### 11. Interakt webhook auth fails open
**Files:**
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\lib\webhookSecurity.js` lines 81–83
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\integrations\webhooks\interakt-reply\route.js` lines 26–31

- `verifyInteraktToken`: if `INTERAKT_WEBHOOK_TOKEN` unset, returns `true`.
- Route is under `/api/integrations/` (middleware JWT-shape gate), but external webhooks cannot supply JWT — likely broken in prod; if middleware is bypassed or token format spoofed, unauthenticated WhatsApp message injection is possible.
- Global phone lookup (lines 65–68) can attach messages to wrong tenant’s lead.

**Fix:** Require `INTERAKT_WEBHOOK_TOKEN` in production; move to `/api/webhooks/` public prefix with token-only auth; scope lead lookup by business.

---

### 12. `business/settings` returns raw integration credentials
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\business\settings\route.js`  
**Lines:** 18–24

- GET returns full `integrationCredentials` (encrypted SMTP/WhatsApp/Meta secrets) to any user with `revenue-config` plan access.

**Fix:** Return redacted view (e.g. `hasPassword: true`, host/port only); never send ciphertext to client unless required for a specific edit flow.

---

### 13. `/api/auth/me` exposes business API key
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\auth\me\route.js`  
**Line:** 50

- Returns `apiKey: business.apiKey` to all authenticated users.

**Fix:** Omit from default response; expose only to owners via separate rotated-key endpoint with audit log.

---

### 14. Hardcoded encryption fallback key
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\lib\encryption.js`  
**Lines:** 11–14

- If `ENCRYPTION_KEY` missing, uses fixed hex key `4a6164...` for all AES-256-CBC credential encryption.
- `ENCRYPTION_KEY` is commented optional in `.env.example` (line 11), not in `lib/env.js` `PROD_REQUIRED`.

**Fix:** Add `ENCRYPTION_KEY` to production required vars; fail startup if missing; never use static fallback outside dev.

---

### 15. Admin DB console: raw Mongo query injection
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\admin\db\route.js`  
**Lines:** 136–142

- `find` action spreads client-supplied `query` object directly into `Model.find(findQuery)`.
- Password gate only (`requireAdminPassword`, line 92); no timing-safe compare; single shared password.

**Fix:** Allowlist query fields per model; reject `$`-prefixed operators; use constant-time password compare; require JWT + admin role in addition to password.

---

## Medium

### 16. Rate limiting absent or fails open on sensitive endpoints
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\lib\rateLimit.js` lines 21–23, 42–44

| Endpoint | Rate limited? |
|----------|---------------|
| `/api/auth/login` | Yes (10/min) — `login/route.js` line 93 |
| `/api/auth/refresh` | Yes (20/min) |
| `/api/auth/register` | **No** — `register/route.js` line 10 |
| `/api/auth/forgot-password` | **No** — `forgot-password/route.js` line 4 |
| `/api/public/chatbot` | **No** |
| `/api/meetings/book` | **No** |
| `/api/website-funnel/leads` | **No** |

- Without `REDIS_URL`, limiter **always allows** (fail-open, line 22).

**Fix:** Add `withRateLimit` to register/forgot-password/public ingest endpoints; fail-closed or in-memory fallback when Redis unavailable in production.

---

### 17. ReDoS / regex injection in search filters
**Files:**
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\automation\leads\route.js` lines 94–100
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\lib\crm\queryBuilder.js` lines 17–19
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\clients\route.js` lines 27–32

- User `search` passed unescaped into `$regex` (unlike `admin/db` which escapes at line 75).

**Fix:** Escape regex metacharacters or use MongoDB Atlas Search/text index; cap search length.

---

### 18. Google OAuth `state` not bound to session (login CSRF)
**Files:**
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\auth\google\route.js` lines 22–24
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\auth\google\callback\route.js` line 33

- `state` is static `login:0` / `register:1` — no nonce, no server-side validation.

**Fix:** Generate random `state`, store in `httpOnly` cookie, validate on callback.

---

### 19. Register returns non-functional dummy JWT
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\auth\register\route.js`  
**Line:** 110

- `token: "dummy-token-" + user[0]._id` — not a signed JWT; no refresh token issued; inconsistent with login flow.

**Fix:** Use `generateTokenPair` + `RefreshToken.store` like login; or force login after register.

---

### 20. Token accepted via query string globally
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\middleware.js` lines 65–67

- `?token=` works for all protected API routes (intended for SSE at `realtime/stream/route.js` line 10).
- Tokens appear in access logs, Referer, browser history.

**Fix:** Restrict query-token to SSE path only; use cookie auth for EventSource where possible.

---

### 21. Cloudinary signing lacks upload constraints
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\cloudinary-sign\route.js` lines 19–28

- Signs `{ timestamp }` only — no `folder`, `upload_preset`, max bytes, or allowed formats bound to tenant.

**Fix:** Include `folder: tenant.businessId`, `allowed_formats`, `max_file_size` in signed params.

---

### 22. Dev-only debug endpoint leaks SMTP config
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\debug\email-test\route.js` lines 6–64

- Unauthenticated; returns host, username, decryption status; tests SMTP.
- Blocked in production middleware (line 110) but fully open in dev/staging.

**Fix:** Require admin auth in all environments or remove.

---

### 23. `activate-trial` self-service without abuse controls
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\business\activate-trial\route.js` lines 15–23

- Any tenant user can flip `free` → `trial` with no payment/eligibility check.

**Fix:** Enforce one-time trial per business/email; audit log; optional payment method.

---

### 24. External integrations webhook path mismatch
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\integrations\webhooks\[secret]\route.js`

- Under `/api/integrations/` (JWT-shape protected), not `/api/webhooks/` public prefix — external callers cannot POST without spoofing JWT shape + knowing URL structure.

**Fix:** Move to `/api/webhooks/integrations/[secret]` public prefix (secret-only auth), with rate limiting.

---

## Low

### 25. CSRF helper exists but unused on cookie-auth routes
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\lib\security\csrf.js` — no route imports `withCsrf`.

**Fix:** Apply `withCsrf` to state-changing routes that rely on cookie auth.

---

### 26. Long JWT expiry (7d access, 30d refresh)
**Files:**
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\lib\auth.js` line 5
- `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\lib\security\refreshToken.js` lines 5–6

**Fix:** Shorten access token (15m–1h); keep refresh rotation (already implemented well).

---

### 27. `REFRESH_TOKEN_SECRET` falls back to `JWT_SECRET`
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\lib\security\refreshToken.js` line 9

**Fix:** Require separate `REFRESH_TOKEN_SECRET` in production.

---

### 28. `images.remotePatterns` allows any HTTPS host
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\next.config.mjs` lines 13–17

**Fix:** Restrict to known CDNs (Cloudinary, etc.).

---

### 29. Public chatbot / businessId enumeration
**Files:** `app/api/public/chatbot/route.js`, `app/api/public/chatbot/config/route.js` — no rate limit; `businessId` is guessable ObjectId.

**Fix:** Rate limit; use opaque public widget keys instead of raw `businessId`.

---

### 30. `forgot-password` is a no-op stub
**File:** `c:\Users\saura\OneDrive\Desktop\LeadForGrow-1\app\api\auth\forgot-password\route.js` lines 10–14

- No token generation, no email — not a vulnerability, but endpoint is abusable for email enumeration timing if implemented naively later.

---

## What is already done well (preserve these)

1. **Route-level tenant isolation** — `withTenantAuth` + `resolveTenant()` enforces JWT `businessId` ↔ user `businessId` match (`lib/auth.js` lines 202–205). CRM routes sampled (`leads`, `contacts`, `deals`, `tasks`, `access/*`) consistently scope queries by `businessId`.

2. **Legacy auth hardening** — `x-user-id` and `?userId=` rejected in middleware (`middleware.js` 92–104) and `rejectLegacyAuth()` (`lib/auth.js` 91–116).

3. **Refresh token rotation** — Server-side hashed storage, revoke-on-refresh, `type: 'refresh'` claim (`models/access/RefreshToken.js`, `app/api/auth/refresh/route.js`).

4. **Billing webhooks** — Stripe `constructEvent` (`lib/billing/stripe.js` 42–46) and Razorpay HMAC (`lib/billing/razorpay.js` 26–32) verified before side effects.

5. **Per-business Meta webhook** — `app/api/webhooks/meta/[businessId]/route.js` verifies signature with candidate secrets (lines 158–194) before leadgen/WhatsApp processing.

6. **Production env validation** — JWT length/insecure value checks (`lib/env.js` 77–80); prod requires `LFG_ADMIN_PASSWORD`, `CRON_SECRET`.

7. **Security headers** — HSTS, `X-Frame-Options`, `nosniff` in `next.config.mjs` (31–41) and middleware (78–84).

8. **Cron protection** — Bearer `CRON_SECRET` on cron routes (`app/api/cron/process-tasks/route.js` 15–22).

9. **CMS cross-tenant guard** — `assertTenantBusinessId()` in `app/api/clients/route.js` (lines 16–19).

10. **Input sanitization utilities** — Prototype-pollution blocking in `lib/security/sanitize.js` (used in tests; extend to more routes).

11. **Automated security tests** — Refresh token + Meta signature tests in `tests/security.test.js`.

12. **Local upload disabled in production** — `app/api/upload/route.js` lines 6–13.

13. **Login rate limiting** — 10 req/min/IP when Redis is available.

---

## Priority remediation order

1. Lock down `user/profile/[id]` and `website-funnel/leads` (immediate data integrity risk).
2. Add real auth to `call-integration/*` and `websites/[id]`.
3. Remove/protect production Meta test/inject webhooks.
4. Fix OAuth token delivery (no tokens in URL/localStorage).
5. Verify JWT in middleware **or** enforce `withAuth` on every handler under protected prefixes (CI check).
6. Harden cookie flags + move to server-set `httpOnly` sessions.
7. Close Meta Instagram/conditional leadgen signature gaps.
8. Add rate limits + Redis fail-closed for auth/public ingest endpoints.
9. Redact secrets from `business/settings` and `/api/auth/me` responses.
10. Require `ENCRYPTION_KEY` and separate refresh secret in production.

I can switch to Agent mode and implement fixes in priority order if you want.

[REDACTED]