# DECISIONS.md — Decisions Log

This file records every non-trivial decision made by Claude Code while working in this repo, in reverse-chronological order (newest first). "Non-trivial" means: a choice between two or more reasonable approaches, a tradeoff, a deviation from an obvious/default path, or anything a future session would need context to avoid re-litigating or reversing by accident. See `CLAUDE.md` for the plain change log.

Entry format:
```
## YYYY-MM-DD — short title
Context: <what prompted the decision>
Decision: <what was decided>
Alternatives considered: <other options and why they were passed over>
Consequences: <what this commits future work to, if anything>
```

---

## 2026-09-03 — Email auto-reply v1 uses a template, not an AI call
Context: User asked to build an "AI auto-reply after 5 minutes" for the SLA safety net. Two flavors were on the table — (A) a holding message that just acknowledges receipt and sets expectation, (B) a full AI-generated answer using the knowledge base.
Decision: Shipped Flavor A with a mustache-style template + variable substitution. No AI provider call. Message goes out via the same `sendChannelEmail` pipeline as manual composer sends, tagged `origin='automation'` so it shows the "Auto" pill in the inbox.
Alternatives considered: (B) Full AI response — rejected for v1 because hallucinations on outbound customer email are brand-damaging in a way inbound triage isn't. The user's own KB isn't guaranteed to be complete either, so the AI would speculate on gaps. Deferred behind an explicit tenant opt-in for a future iteration.
Consequences: The plumbing (queue job, guardrails, per-conversation pause, template renderer) is designed so swapping `renderTemplate()` for an AI call is a one-function change — call sites don't need to know. Guardrails already exist (skip on angry/refund/cancel keywords, business hours only, one-per-conversation) which the AI flavor will need anyway.

## 2026-09-03 — Guardrails default: skip on negative sentiment keywords
Context: Auto-reply needs a way to avoid replying to angry / urgent / legally-sensitive messages, where a generic "we'll get back to you" is worse than silence.
Decision: Denylist-based keyword match on subject + body (case-insensitive, substring). Default list: `angry, refund, cancel, complaint, lawyer, sue, terrible, awful`. Match is deliberately eager — "cancellation" triggers on "cancel" — because a false positive here just means "human handles it," which is the safer failure mode.
Alternatives considered: Real sentiment analysis via AI — better precision but adds latency + API cost + a dependency. Deferred until keyword matching proves insufficient. Also considered per-tenant customization only (no defaults), rejected because most tenants won't discover this feature and would ship without guardrails.
Consequences: The default list is baked into the schema. Tenants can override in Settings → Email Accounts → Auto-Reply. Future AI sentiment classifier can layer on top without removing the keyword denylist.

## 2026-09-03 — Business-wide setting + per-conversation pause (not per-user)
Context: Ownership question — who controls the auto-reply behavior?
Decision: Business-wide toggle (all mailboxes on that tenant get the same rules) with an `autoReplyPaused` boolean override on each Conversation for one-off "VIP, don't auto-reply here" overrides.
Alternatives considered: Per-EmailAccount setting — would let Alice have auto-reply on and Bob off. Rejected because we have 2 users and the added complexity isn't warranted; also, mixed behavior on the same customer thread across users would be confusing.
Consequences: If a tenant later needs per-mailbox control, migration is additive (add `EmailAccount.autoReplyOverride` optional field, resolver picks account setting if present else falls back to business). No breaking change.

## 2026-09-03 — `onePerConversation` sets `autoReplyPaused=true` after firing
Context: We need to make sure the safety-net reply fires at most once per conversation, even if the customer sends a rapid follow-up.
Decision: After a successful auto-reply send, the worker sets `Conversation.autoReplyPaused = true` (in addition to updating `lastAutoReplyAt` for UI display). Belt-and-braces: the worker also independently checks `lastAutoReplyAt` on entry.
Alternatives considered: TTL-based cooldown (24h) — more forgiving for legitimate multi-day threads, but adds time-based logic that's harder to reason about. Rejected because the intent of a safety net is "one nudge, then let the human take over"; the human can un-pause the conversation if they want the safety-net to resume.
Consequences: If a tenant wants the safety net to fire multiple times per conversation, they uncheck the guardrail. The Conversation-level pause remains permanent until an agent flips it back.

---

## 2026-09-03 — Adopt mandatory change/decision logging
Context: User instructed that from now on, every change made in this repo must be recorded in `CLAUDE.md` and every decision taken must be recorded in `DECISIONS.md`, without exception, in every session.
Decision: Created both files at the repo root with a fixed entry format. This rule is now treated as a standing project convention: before ending any session that touched code or made a judgment call, append the corresponding entries to these two files.
Alternatives considered: A single combined log — rejected because the user explicitly asked for two separate files with distinct purposes (what changed vs. why).
Consequences: Every future session in this repo must update both files. If a session makes code changes but forgets to log them, that is a process failure to correct immediately, not a style choice.
