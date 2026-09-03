# CLAUDE.md — Change Log

This file is a running log of every change made in this repo by Claude Code, in reverse-chronological order (newest first). Every session must append an entry here before ending. See `DECISIONS.md` for the reasoning behind non-obvious choices — this file records *what* changed, that file records *why*.

Entry format:
```
## YYYY-MM-DD — short title
Branch: <branch name>
Files: <files touched>
What changed: <plain description>
Related decisions: <link to DECISIONS.md entry, if any>
```

---

## 2026-09-04 — Rich WYSIWYG signature editor + multi-signature per mailbox
Branch: feature/rich-signature-editor
Files:
- `app/automation/components/settings/RichSignatureEditor.jsx` (new — TipTap-based WYSIWYG editor with toolbar: bold/italic/underline/strike, text color picker, alignment, bullet & numbered lists, insert link, insert image via Cloudinary, S/M/L logo resize, clear formatting, live preview toggle)
- `app/automation/components/settings/signatureTemplates.js` (new — 4 email-safe table-based HTML templates: two-column with divider, logo on top, corporate, minimal text-only)
- `app/automation/components/settings/MultiSignatureEditor.jsx` (new — Hostinger-style manager: dropdown of saved signatures + Create new + rename + Delete + Make default + Save; embedded mode fires onChange live for use inside larger forms)
- `app/components/icons/AiBadgeIcon.jsx` (new — shared inline-SVG "AI" badge icon; black rounded box + white centered "AI" text + two gold sparkles)
- `models/omnichannel/EmailAccount.js` (added `signatures[]` sub-schema {id,name,html,isDefault,createdAt}; legacy `signature` string kept as fallback; new `resolveSignatureHtml(signatureId?)` instance method with priority order: signatureId → default → legacy → '')
- `app/api/automation/inbox/email-accounts/route.js` (POST accepts `signatures[]` on create; normalizes: exactly-one-default enforced, cap at 20, ids auto-generated)
- `app/api/automation/inbox/email-accounts/[id]/route.js` (PATCH whitelists `signatures[]` with same normalizer)
- `app/api/automation/inbox/send/route.js` (accepts `signatureId` from composer, forwards to sendChannelEmail)
- `lib/omnichannel/emailService.js` (uses `resolveSignatureHtml(signatureId)` for outbound signature; legacy signatureLogoUrl only prepended for plain-text legacy signatures)
- `app/automation/settings/email/page.js` (both Add flows — Gmail wizard + Custom IMAP/SMTP — use `<MultiSignatureEditor embedded>` for consistency; connected-account accordion uses standalone MultiSignatureEditor; SLA card badge redesigned with the new shared AiBadgeIcon)
- `app/automation/components/chat/ChatInput.jsx` (new signature-picker icon in composer toolbar for email channel; popover with radio list of signatures scoped to the current From mailbox; auto-picks the mailbox's default; passes signatureId through to send payload)
- `package.json` + `package-lock.json` (added TipTap v3.31.2: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-color, @tiptap/extension-text-style, @tiptap/extension-link, @tiptap/extension-image, @tiptap/extension-text-align, @tiptap/extension-placeholder, @tiptap/extension-table, @tiptap/extension-table-row, @tiptap/extension-table-cell, @tiptap/extension-table-header — all MIT-licensed)

What changed: replaced the plain textarea signature field with a WYSIWYG editor at Hostinger polish level. Users can now save multiple named signatures per mailbox ("Sales", "HR", "Personal") and pick which one to attach at compose time via a small pen-icon dropdown in the composer toolbar. Templates provide one-click professional signatures; the placeholder LOGO auto-swaps for the user's uploaded image via Cloudinary. Fully unified UX — the same MultiSignatureEditor UI appears in the Add SMTP/IMAP form, Gmail Connect wizard, and connected-account accordion, so there's no "wait, this looks different from before" moment after saving.

Design intent details:
- Custom Table/TableRow/TableCell TipTap extensions preserve `style`, `align`, `valign`, `width`, `bgcolor` attributes on parse+render (default TipTap only kept colspan/rowspan/colwidth) — needed so email-safe inline styles like `border-right: 2px solid ...` survive the round-trip through the editor.
- Image extension configured with `inline: true` + custom `width`/`height`/`style` attribute preservers so the S/M/L resize buttons + logo placement inside table cells work correctly.
- Signature templates use table-based HTML (not flex/grid) for cross-client rendering in Gmail/Outlook/Apple Mail.
- MultiSignatureEditor accepts a ref-stashed onChange in embedded mode to avoid infinite render loops from parent inline arrow callbacks.
- Signature preview panel matches how the signature actually renders in a real inbox: left-aligned at the bottom of the mock email body (not centered — that would mislead users about how recipients see it).

Related decisions: see DECISIONS.md 2026-09-04 signature editor entries.

## 2026-09-03 — Instagram comments: webhook ingestion + reply-from-inbox (Phase 1)
Branch: feature/whatsapp-templates-and-broadcasts
Files:
- `lib/instagram/handler.js` (added `parseInstagramChanges` + `processInstagramCommentEvent`; exported `IG_COMMENT_PARTICIPANT_PREFIX = 'ig_comment:'`; stores `metadata.lastCommentId` on Conversation for reply targeting)
- `lib/instagram/send.js` (added `sendInstagramCommentReply(business, commentId, text)` — POST to Graph API `/{comment_id}/replies`)
- `app/api/webhooks/meta/route.js` (extended the `payload.object === 'instagram'` branch to iterate `payload.entry[]`, process both `entry.messaging[]` for DMs and `entry.changes[]` for comments; returns processed count)
- `app/api/automation/inbox/send/route.js` (Instagram branch now detects `participantId.startsWith('ig_comment:')` and routes to `sendInstagramCommentReply` using `conversation.metadata.lastCommentId`; refuses media replies since Meta doesn't support them on comments)
- `lib/automation/triggerHub.js` (registered `instagram_comment` in `EVENT_TO_ENGINE_TRIGGER` and `EVENT_TO_SEQUENCE_TRIGGER`)
- `models/automation/AutomationSequence.js` (added `instagram_comment` to `triggerType` enum)
- `lib/sequences/constants.js` (added `trigger_instagram_comment` node + mapping in `TRIGGER_ENGINE_MAP`)

What changed: Instagram DMs were already ingested end-to-end. This session adds the comments half — public comments on IG posts now land in the Unified Inbox as their own conversations (one per commenter, keyed by `ig_comment:<commenterId>` so they never merge with the same person's DM thread), can be replied to from the composer (posts a nested reply via Meta's Graph API), and fire the `instagram_comment` automation trigger so sequences can react.

Scope deliberately excluded from Phase 1: an automated `send_instagram_comment_reply` sequence action (added to constants briefly then removed — no executor case yet); a comment→DM auto-response rule builder (Phase 2); an SLA safety-net auto-reply for DMs (Phase 3, will reuse the email pattern); a settings UI to onboard IG credentials (Pistons Garage's creds already live on `business.integrationCredentials.instagram`, so Phase 1 is unblocked without one).

Meta app config the tenant still needs (one-time, done on their side): add Instagram product to the shared app, connect a Business/Creator IG account linked to a Facebook Page, generate a Page Access Token with scopes `instagram_basic + instagram_manage_messages + instagram_manage_comments + pages_manage_metadata + pages_show_list`, and subscribe webhook fields `messages`, `comments`, `messaging_postbacks`, `mentions`. Webhook URL is the existing `/api/webhooks/meta` — Meta multiplexes WhatsApp + Instagram over the one endpoint.

Related decisions: see DECISIONS.md 2026-09-03 IG comment participant keying entry.

## 2026-09-03 — Prod fixes: cookie banner persistence + register rate limit
Branch: master
Files:
- `app/components/consent/CookieConsentManager.jsx` (persist consent to localStorage BEFORE the server audit call so it survives slow/failed network; added dismiss X on banner that counts as decline)
- `lib/rateLimit.js` (added `Retry-After` header + retry-window seconds in error body on 429)
- `app/api/auth/register/route.js` (loosen limit from 5/min to 10/min per IP, matches login)

What changed: two independent prod issues surfaced in Vercel logs. (1) The cookie consent banner reappeared on every visit because `saveConsentState` ran only after `await logConsentToServer()`; a slow or blocked audit call meant nothing was persisted. Made persistence optimistic — the choice is saved instantly on click and the audit log is best-effort in the background. (2) Register endpoint was returning 429 to a real user because the rate-limit was tighter than login's (5/min vs 10/min per IP) and a user retrying after a password-policy or "user already exists" 400 could exhaust the window. Bumped register to 10/min to match login and added a proper `Retry-After` header so the client can surface a specific wait time.

Related decisions: see DECISIONS.md 2026-09-03 register-rate-limit and cookie-persist entries.

## 2026-09-03 — Email SLA safety-net auto-reply (Step 9)
Branch: master
Files:
- `models/Business.js` (added `settings.emailAutoReply` sub-schema: enabled/thresholdMinutes/template/guardrails/telemetry)
- `models/omnichannel/Conversation.js` (added `autoReplyPaused`, `lastAutoReplyAt`)
- `lib/emailAutoReply.js` (new — worker function + scheduleAutoReplyForInbound helper; template-based, no AI call yet)
- `lib/queue.js` (new `enqueueEmailAutoReply` helper + `email-auto-reply` job branch in BullMQ worker)
- `lib/omnichannel/emailService.js` (`ingestInboundEmail` fires `scheduleAutoReplyForInbound` after inbound message is persisted; fire-and-forget, non-blocking)
- `app/automation/settings/email/page.js` (new `AutoReplyCard` + `AutoReplyConfig` components rendered above the accounts list)

What changed: shipped the SLA safety-net auto-reply. When a customer email arrives and no human replies within N minutes (default 5), a polite holding message goes out from the same mailbox the thread belongs to. Includes guardrails: business-hours-only, one-per-conversation, and skip-keyword blocklist (`angry`, `refund`, `cancel`, etc.). Reuses Step 8's `origin='automation'` provenance so auto-replies show the violet "Auto" pill in the inbox and don't fool the "Human replies" filter. Business-wide setting with per-conversation `autoReplyPaused` override for VIP threads.

Design intent: template + variable substitution instead of a real AI call for v1. Reasons: reliability (no hallucination risk on outbound customer email), no API-key dependency, hot-swappable by replacing `renderTemplate()` inside `runAutoReplyJob` when we're ready for AI. The plumbing is designed so swapping in an AI provider later doesn't touch call sites.

Related decisions: see DECISIONS.md 2026-09-03 auto-reply entry.

### Prior undocumented work observed on this branch (2026-08-30 to 2026-09-02, inherited)
The working tree had a large multi-user email feature already built across ~15 files before this session logged its first entry. Confirmed from the modified/untracked file list — matches an "Option A" implementation: per-user `EmailAccount` with encryption at write, Gmail App-Password wizard, `sendChannelEmail` builds per-account Nodemailer transports, IMAP sync cron at `app/api/cron/email-sync`, threading via In-Reply-To / References headers, `origin` provenance on Message + `lastMessageOrigin` cache on Conversation, folder tabs wired end-to-end with per-message star/trash actions, compact composer collapse-when-idle, signature + logo (Cloudinary upload OR URL paste), sidebar unread-badge fix, reply-timing SLA pill on conversation cards, draft auto-save, snooze presets, keyboard shortcuts (j/k/e/s/#/?), and real-time SSE user signals (live green dot, toast on incoming, opt-in sound).

None of that work has its own log entry — this line is the paper trail. Future sessions modifying any of those areas should confirm intent with the user before further changes.

---

## 2026-09-03 — Set up CLAUDE.md and DECISIONS.md
Branch: feature/whatsapp-templates-and-broadcasts
Files: `CLAUDE.md` (new), `DECISIONS.md` (new)
What changed: Created this change log and the companion decisions log at the user's request. Going forward, every change made in this repo is recorded here, and every non-trivial decision is recorded in `DECISIONS.md`.
Related decisions: see DECISIONS.md 2026-09-03 entry.

### Branch state observed at setup time (not made by this session)
The working tree already had substantial uncommitted changes on this branch before this session started, in the omnichannel inbox / email-sync area:
- Modified: `app/api/automation/inbox/{conversations,email-accounts,send}/route.js`, most of `app/automation/chat/*` and `app/automation/hooks/{useChatInbox,useSidebar}.js`, `app/automation/settings/email/page.js`, `lib/automationEngine.js`, `lib/broadcasts/engine.js`, `lib/integrations/email.js`, `lib/meetings/email.js`, `lib/omnichannel/{conversationService,emailService,emailSync}.js`, `lib/sequences/executor.js`, `models/automation/Message.js`, `models/omnichannel/{Conversation,EmailAccount}.js`, `app/components/landing/CustomerJourneySection.jsx`.
- New, untracked: `app/api/automation/inbox/email-accounts/[id]/`, `app/api/automation/inbox/messages/[id]/`, `app/api/cron/email-sync/`, `lib/omnichannel/mailerFromAccount.js`.
- This looks like an in-progress IMAP/email-account sync + unified inbox feature layered on top of the WhatsApp templates/broadcasts work already on this branch (see project memory `project_known_issues.md`). Not yet reviewed or attributed to a specific prior session in this log — first change to that area in a future session should confirm intent before modifying further.
