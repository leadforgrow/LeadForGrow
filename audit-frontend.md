## Component architecture (verified)

**Layout shell** — `app/automation/layout.js` wraps all CRM routes in:
- `AccessControl` (plan gate + boot loader)
- `AccessProvider` + `UpgradeGateModal`
- `BusinessAssistantRoot` (AI FAB/panel)
- `Sidebar` (`components/Sidebar.js` → Suspense → `components/layout/Sidebar.jsx`)
- `main` scroll region, `GlobalDialer`, `ReminderMonitor`

**Navigation** — `components/layout/constants.js` defines `NAV_GROUPS` (CRM, Communication, Insights, Settings). `useSidebar` loads user/stats; `SidebarSection` + `SidebarItem` render filtered links with badges. Theme toggle lives in `components/layout/WorkspaceSwitcher.jsx` via root `ThemeProvider` (`app/components/ThemeContext.js`).

**Data layer** — Feature pages are `'use client'` and delegate to workspace hooks (`useLeadsWorkspace`, `useContactsWorkspace`, `useDealsWorkspace`, `useTasksWorkspace`, etc.). Almost all API calls go through `authFetch` / `authJson` in `lib/apiClient.js`, which attaches JWT and redirects on 401.

**UI primitives** — `app/components/ui/` has `Button`, `Card`, `Input`, `Badge`, `Heading`, `IntelligenceIcon`. Inside `app/automation/**`, only `Heading` is imported (integrations page). CRM UI is built from domain components (`LeadTable`, `ContactCreateModal`, `DealDrawer`, etc.) with inline Tailwind and hardcoded hex palettes—not the shared UI kit.

---

## Prioritized issues (concrete, code-verified)

### P0 — Broken routes / broken behavior

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 1 | **Broken export link** — `href="/automation/leads/export/excel"` navigates to a non-existent page. Export is an API POST via `exportLeads()` in the hook, not a route. | `app/automation/components/dashboard/premium/PremiumDashboardHeader.jsx` **L130–136** | Replace `<Link href="...">` with `<button onClick={() => exportLeads('excel')}>` (pass handler from dashboard page/hook), or wire the chevron dropdown to the same function. |
| 2 | **Call timer never increments** — `useEffect` interval reads stale `status`; effect deps are only `[callData]`, so when `setStatus('live')` runs the interval still sees `'connecting'`. | `app/automation/components/LiveDialer.js` **L19–36**, **L26–29** | Add `status` to deps, or use `setDuration(prev => prev + 1)` unconditionally while connected, or store `status` in a ref updated synchronously. |
| 3 | **Call completion bypasses `authFetch`** — raw `fetch` to `/api/automation/calls/complete` hand-rolls auth header; no shared 401 redirect/clear session. | `app/automation/components/LiveDialer.js` **L105–120** | Replace with `authFetch('/api/automation/calls/complete', { method: 'POST', body: JSON.stringify(...) })`. |

---

### P1 — React / data-fetching bugs

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 4 | **No fetch abort / unmount guard** — `setContact`/`setLoading` can run after navigate away. | `app/automation/contacts/[id]/page.js` **L15–20** | Use `AbortController` + `authFetch` signal, or `let cancelled = false` in effect cleanup. |
| 5 | **Pipelines fetch silently fails** — no check of `data.success`, no error UI; user sees empty editor. | `app/automation/pipelines/page.js` **L17–31** | If `!data.success`, `setError(data.error)`, toast, keep skeleton/retry UI. |
| 6 | **`fetchCounts` over-fetches** — runs 4 parallel task API calls on **every** `tasks` change (including after mark-done). | `app/automation/hooks/useTasksWorkspace.js` **L95–97** | Remove `tasks` from deps; refresh counts only on filter change, mount, and explicit `refresh()`. |
| 7 | **`fetchDeals` double-fetch on mount** — `fetchDeals` depends on `selectedPipeline` and sets `selectedPipeline` inside itself, triggering a second fetch. | `app/automation/hooks/useDealsWorkspace.js` **L92–120**, **L107–109** | Split pipeline selection into its own effect, or remove `selectedPipeline` from `fetchDeals` deps and use functional update only when needed. |
| 8 | **No AbortController in any workspace hook** — all hooks (`useLeadsWorkspace`, `useContactsWorkspace`, `useChatInbox`, `useSidebar`, `ReminderMonitor`, etc.) can set state after unmount on slow responses. | e.g. `useContactsWorkspace.js` **L57–79**, `useChatInbox.js` **L132–146**, `ReminderMonitor.js` **L46–50** | Add `AbortController` per effect or `mounted` ref pattern in shared hook helper. |

---

### P2 — Missing loading / error / empty states

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 9 | **Leads page: fetch errors = toast only, no inline error** — unlike dashboard/reports. | `app/automation/hooks/useLeadsWorkspace.js` **L110–112**; `leads/page.js` has no `ws.error` branch | Add `error` state in hook; render banner like `app/automation/page.js` **L32–37** or `reports/page.js` **L48–50**. |
| 10 | **Contacts / companies / deals / tasks: same toast-only error pattern** | `useContactsWorkspace.js` **L70–71**, `useDealsWorkspace.js` **L111–112**, `useTasksWorkspace.js` **L45–46** | Add `error` + retry UI on each list page. |
| 11 | **Leads desktop table: weak empty state** — text only, no CTA; contacts/companies/deals have richer empty UX. | `app/automation/components/leads/LeadTable.jsx` **L75–79** | Add “Add lead” / “Clear filters” actions like `DealTable.jsx` **L66–80** or `ContactsEmptyState` in `contacts/page.js` **L17–35**. |
| 12 | **Lead kanban: no global empty state** when `leads.length === 0` — shows empty columns only. | `app/automation/components/leads/CRMKanban.jsx` **L67–87**; `leads/page.js` **L98–109** | Render centered empty message + CTA when `ws.leads.length === 0` in kanban mode. |
| 13 | **Contact detail: no error state** for failed fetch (only “not found” after load). | `app/automation/contacts/[id]/page.js` **L15–23** | Track `error` from failed/non-success response; show retry banner. |

---

### P3 — Dark mode inconsistency

Theme system exists: `ThemeProvider` + inline script in `app/layout.js` **L38–42** toggles `dark` on `<html>`. `WorkspaceSwitcher` exposes light/dark toggle.

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 14 | **Premium dashboard is light-only** — hardcoded `#101828`, `bg-white`, no `dark:` variants. | `app/automation/page.js` **L22**; `PremiumDashboardHeader.jsx` **L32–62**; widget cards under `components/dashboard/premium/` | Add `dark:bg-slate-950`, `dark:text-slate-100`, etc., or scope dashboard to light theme explicitly. |
| 15 | **Contacts / companies / deals pages ignore dark mode** — `bg-white` only. | `contacts/page.js` **L46**; `companies/page.js` **L46**; `deals/page.js` **L98** | Match leads/tasks: `bg-white dark:bg-slate-950` on page wrapper; add `dark:` to tables/modals. |
| 16 | **Sidebar is light-only** — no `dark:` on aside/nav borders. | `components/layout/Sidebar.jsx` **L41–45**, **L73–74** | Add `dark:bg-slate-950 dark:border-slate-800` to match `layout.js` **L20–26**. |
| 17 | **Shared UI primitives lack dark styles** — unused in CRM today but incomplete if adopted. | `app/components/ui/Button.jsx` **L20–25**; `Card.jsx` **L14–17**; `Input.jsx` **L13–14**; `Badge.jsx` **L15–20** | Add `dark:` variant classes before rolling into automation. |
| 18 | **CRM modals split dark support** — `CreateTaskModal`/`DemoScheduledModal` have `dark:`; `ContactCreateModal`/`DealCreateModal`/`CompanyCreateModal` are light-only. | `ContactCreateModal.jsx` **L12–13**; `DealCreateModal.jsx` **L11–12**; `CompanyCreateModal.jsx` (same pattern) | Standardize overlay/panel classes from `CreateTaskModal.jsx` **L23–25**. |

---

### P4 — Accessibility

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 19 | **Modals missing dialog semantics** — no `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, or Escape (except `LeadColorPicker`). | `ContactCreateModal.jsx` **L12–21**; `DealCreateModal.jsx` **L11–24**; `UpgradeGateModal.jsx` **L21–41**; `CreateTaskModal.jsx` **L23–30**; `AddMemberModal.jsx` **L17–26** | Extract shared `Modal` with focus trap + `onKeyDown` Escape; wire `aria-labelledby` to heading id. |
| 20 | **Icon-only close buttons lack labels** | `ContactCreateModal.jsx` **L19–21**; `UpgradeGateModal.jsx` **L35–40**; `InboxActionsMenu.jsx` **L42–44** (uses `title` only) | Add `aria-label="Close"` / `aria-label="More actions"`; use `aria-expanded` on menu trigger. |
| 21 | **Table select-all toggles unlabeled** | `LeadTable.jsx` **L43–45**; `ContactTable.jsx` **L40–42**; `CompanyTable.jsx` **L62–64** | `aria-label={allSelected ? 'Deselect all' : 'Select all'}`. |
| 22 | **Inbox dropdown: mouse-only** — no keyboard roving focus / Escape. | `InboxActionsMenu.jsx` **L40–64** | Add `onKeyDown` for Escape/arrows; `role="menu"` / `role="menuitem"`. |
| 23 | **Premium dashboard dead controls** — “Share” and “Customize Widget” buttons have no `onClick`. | `PremiumDashboardHeader.jsx` **L65–96** | Implement handlers or remove/disable with `aria-disabled` until built. |

---

### P5 — Inconsistent UI / dead code

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 24 | **6+ duplicate modal implementations** doing the same overlay/panel/cancel pattern. | `ContactCreateModal`, `CompanyCreateModal`, `DealCreateModal`, `CreateTaskModal`, `AddMemberModal`, `CreateAutomationModal`, `UpgradeGateModal` | Introduce one `CrmModal` primitive; migrate incrementally. |
| 25 | **`app/components/ui/*` largely dead in automation** — `Button`, `Card`, `Input`, `Badge`, `IntelligenceIcon` have **zero** imports under `app/automation/**`. | `app/components/ui/` | Either adopt in new work or document CRM uses bespoke components. |
| 26 | **Unused duplicate `WorkspaceSwitcher`** — settings variant never imported. | `app/automation/components/settings/WorkspaceSwitcher.jsx` (entire file) | Delete or wire into settings layout; sidebar already has the real switcher. |
| 27 | **`IntelligenceIcon` unused app-wide; import order bug** — `HelpCircle` referenced before import statement (hoisted, but file is dead). | `app/components/ui/IntelligenceIcon.jsx` **L51**, **L56** | Remove or fix import order; use only if wired into lead intelligence UI. |

---

### P6 — Visual / responsive bugs

| # | Issue | Location | Fix |
|---|--------|----------|-----|
| 28 | **Contacts & companies: no mobile list** — only `min-w-[1200px]` / `min-w-[1100px]` tables, no `lg:hidden` cards (leads/tasks have mobile cards). | `ContactTable.jsx` **L36**; `CompanyTable.jsx` **L58**; `contacts/page.js`, `companies/page.js` | Add `MobileContactCard` / `MobileCompanyCard` or card layout below `lg`. |
| 29 | **Pipelines editor grid breaks on mobile** — fixed 6-column grid, no horizontal scroll wrapper on rows. | `pipelines/page.js` **L152–163**, **L163** | Wrap in `overflow-x-auto`; use responsive `grid-cols-1 sm:grid-cols-...` or stacked layout on small screens. |
| 30 | **Dynamic Tailwind classes won’t compile** — `text-${color}-500` / `bg-${color}-50` not detected by Tailwind JIT → icons/backgrounds render unstyled. | `NodeSidebar.jsx` **L40**; `SequencesHomeView.jsx` **L133**; `integrations/page.js` **L225–226** | Map colors to static class names (`colorClassMap[sec.color]`). |
| 31 | **Deal kanban columns fixed `w-[280px]`** — OK with `overflow-x-auto` on parent (`DealsKanban.jsx` **L61**), but combined with page `max-w-[1600px]` horizontal scroll is easy to miss on small screens. | `DealKanbanColumn.jsx` **L15** | Add scroll hint or snap scrolling on mobile. |

---

### P7 — Client fetch patterns (summary)

**Good:** Central `authFetch` in `lib/apiClient.js` **L44–66** handles JWT + 401 → clear session + redirect to `/user/register?mode=login&...`.

**Gaps verified:**
- Raw `fetch` in `LiveDialer.js` **L105** and upload paths in `useAutomationRules.js` / `useMediaUpload.js` (Cloudinary/upload — acceptable for non-auth endpoints).
- No shared retry/error boundary; each hook toasts and continues.
- No request deduplication or abort — race conditions possible when filters change quickly (debounced search in contacts/leads/deals mitigates partially).

---

## What’s in good shape (for balance)

- List pages generally have **loading skeletons** (`LeadsSkeleton`, `ContactsSkeleton`, `DealsSkeleton`, `TasksSkeleton`).
- **Contacts, companies, deals (table), tasks** have purposeful **empty states**.
- **Reports** and **dashboard** expose inline **error banners**.
- **Leads** and **tasks** have **responsive mobile card** layouts.
- **Sidebar** nav routes checked against existing pages (`events`, `pipelines`, `automation-rules`, etc.) — only the export **link** above is a confirmed 404.
- `settings/security` **redirects** rather than 404 (`settings/security/page.js` **L3–4**) — nav works but lands on generic settings (minor UX, not broken).

---

If you want these fixed in the repo, switch to **Agent mode** and I can work through P0→P2 first (export link, LiveDialer timer, shared error states, modal primitive).

[REDACTED]