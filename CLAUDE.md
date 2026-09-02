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
