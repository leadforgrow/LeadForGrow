/**
 * IMAP email sync — polls connected accounts and ingests new messages.
 * Requires imapflow (already installed) — dynamic import keeps the bundle
 * small for pods that never handle IMAP.
 *
 * Called from two places:
 *   1. POST /api/automation/inbox/sync-email  (manual "Sync now" button)
 *   2. GET  /api/cron/email-sync              (scheduled every 5 min)
 */
import { ingestInboundEmail } from '@/lib/omnichannel/emailService';
import { decrypt, isEncrypted } from '@/lib/encryption';

/**
 * IMAP servers report the message's own Message-ID inside `envelope.messageId`,
 * but the In-Reply-To / References headers are inside the raw `source` MIME.
 * We do minimal regex parsing — full MIME parsing would need mailparser, and
 * for threading we only need two header values.
 */
function parseReplyHeaders(rawSource) {
  if (!rawSource) return { inReplyTo: null, references: [] };
  const src = typeof rawSource === 'string' ? rawSource : rawSource.toString('utf8');
  // Only look at the head of the message — bodies can be huge, headers end at
  // the first blank line. This bounds the regex work.
  const headEnd = src.indexOf('\r\n\r\n');
  const head = headEnd > 0 ? src.slice(0, headEnd) : src.slice(0, 8000);

  const inReplyMatch = head.match(/^In-Reply-To:\s*(.+)$/im);
  const referencesMatch = head.match(/^References:\s*([\s\S]+?)(?=\r?\n\S|\r?\n\r?\n|$)/im);

  const inReplyTo = inReplyMatch ? inReplyMatch[1].trim() : null;
  const references = referencesMatch
    ? referencesMatch[1]
        .split(/\s+/)
        .map((s) => s.trim())
        .filter((s) => s.startsWith('<') && s.endsWith('>'))
    : [];

  return { inReplyTo, references };
}

/**
 * Extract a display-safe body from raw MIME.
 *
 * Handles the three shapes we see in practice:
 *   - plain text/plain message → body after the first blank line.
 *   - multipart/alternative → prefer the text/plain part; fall back to
 *     the HTML part with tags stripped.
 *   - multipart/mixed with attachments → same as above, ignore attachment parts.
 *
 * Deliberately regex-only (no mailparser dep). Handles quoted-printable soft
 * line breaks and =XX hex escapes since Hostinger/Gmail both use that encoding
 * a lot. Strips the trailing "> quoted reply" chain when we can detect it —
 * agents want to see the customer's NEW words, not the whole thread history.
 */
function decodeQuotedPrintable(str) {
  if (!str) return '';
  return str
    // Soft line breaks: "=\r\n" or "=\n" mean "join this line to the next"
    .replace(/=\r?\n/g, '')
    // Hex escapes: =XX → the character
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => {
      try { return String.fromCharCode(parseInt(hex, 16)); } catch { return ''; }
    });
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractPlainBody(rawSource) {
  if (!rawSource) return '';
  const src = typeof rawSource === 'string' ? rawSource : rawSource.toString('utf8');

  const headEnd = src.indexOf('\r\n\r\n');
  if (headEnd < 0) return src.slice(0, 5000);

  const headers = src.slice(0, headEnd);
  const rest = src.slice(headEnd + 4);

  const ctMatch = headers.match(/^Content-Type:\s*([^\r\n;]+)(?:;[\s\S]*?boundary\s*=\s*"?([^"\r\n;]+)"?)?/im);
  const contentType = ctMatch ? ctMatch[1].trim().toLowerCase() : 'text/plain';
  const boundary = ctMatch?.[2];

  const cteMatch = headers.match(/^Content-Transfer-Encoding:\s*(\S+)/im);
  const encoding = cteMatch ? cteMatch[1].trim().toLowerCase() : '';

  let bodyText = '';

  if (boundary) {
    // Multipart — split into parts, prefer text/plain, fall back to text/html.
    const parts = rest.split(`--${boundary}`).slice(1); // discard preamble
    let plainPart = null;
    let htmlPart = null;

    for (const part of parts) {
      if (part.startsWith('--')) continue; // closing boundary marker
      const partHeadEnd = part.indexOf('\r\n\r\n');
      if (partHeadEnd < 0) continue;
      const partHeaders = part.slice(0, partHeadEnd);
      const partBody = part.slice(partHeadEnd + 4);
      const partCt = (partHeaders.match(/^Content-Type:\s*([^\r\n;]+)/im)?.[1] || '').toLowerCase().trim();
      const partEncoding = (partHeaders.match(/^Content-Transfer-Encoding:\s*(\S+)/im)?.[1] || '').toLowerCase().trim();

      const decoded = partEncoding === 'quoted-printable' ? decodeQuotedPrintable(partBody)
        : partEncoding === 'base64' ? tryBase64(partBody)
        : partBody;

      if (partCt === 'text/plain' && !plainPart) plainPart = decoded;
      else if (partCt === 'text/html' && !htmlPart) htmlPart = decoded;
    }

    if (plainPart) bodyText = plainPart;
    else if (htmlPart) bodyText = stripHtml(htmlPart);
  } else if (contentType === 'text/html') {
    const decoded = encoding === 'quoted-printable' ? decodeQuotedPrintable(rest)
      : encoding === 'base64' ? tryBase64(rest) : rest;
    bodyText = stripHtml(decoded);
  } else {
    // Plain text — most common for basic clients.
    bodyText = encoding === 'quoted-printable' ? decodeQuotedPrintable(rest)
      : encoding === 'base64' ? tryBase64(rest) : rest;
  }

  // Strip the ">" quoted reply chain — everything from the first line that
  // starts with "On ... wrote:" or ">" is the previous message. Agents want
  // the NEW content, not the reply chain we already have in the thread.
  bodyText = bodyText
    .replace(/^\s*On\s.+?wrote:[\s\S]*$/m, '')
    .split('\n')
    .filter((line) => !/^\s*>/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return bodyText.slice(0, 5000);
}

function tryBase64(str) {
  try {
    return Buffer.from(str.replace(/\s+/g, ''), 'base64').toString('utf8');
  } catch {
    return str;
  }
}

export async function syncEmailAccount(account) {
  if (!account?.imap?.host) {
    return { synced: 0, skipped: true, reason: 'IMAP not configured' };
  }
  if (!account.imap?.username || !account.imap?.password) {
    return { synced: 0, skipped: true, reason: 'IMAP credentials missing' };
  }

  // Decrypt the stored password. isEncrypted() guards against decrypt() on
  // legacy plaintext values (the old rows written before Step 2).
  const rawPassword = isEncrypted(account.imap.password)
    ? decrypt(account.imap.password)
    : account.imap.password;

  if (rawPassword === null) {
    account.status = 'error';
    account.lastError = 'CORRUPT_CREDENTIALS: IMAP password could not be decrypted.';
    await account.save();
    return { synced: 0, error: account.lastError };
  }

  let client;
  let synced = 0;

  try {
    const { ImapFlow } = await import('imapflow');
    client = new ImapFlow({
      host: account.imap.host,
      port: account.imap.port || 993,
      secure: account.imap.secure !== false,
      auth: {
        user: account.imap.username,
        pass: rawPassword,
      },
      // Fail fast — a hung IMAP connection blocks the cron worker.
      socketTimeout: 30000,
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      // Incremental sync: only fetch messages since the last successful run.
      // Falls back to the last 24h on first-ever sync — keeps the initial
      // pull small so a mailbox with 50k messages doesn't stall the cron.
      const since = account.lastSyncAt
        ? new Date(account.lastSyncAt.getTime() - 60_000) // 1-minute overlap for clock skew
        : new Date(Date.now() - 24 * 60 * 60 * 1000);

      for await (const msg of client.fetch(
        { since },
        { envelope: true, source: true, uid: true }
      )) {
        const from = msg.envelope?.from?.[0];
        const fromEmail = from?.address;
        if (!fromEmail) continue;

        // Skip mail WE sent — Gmail's IMAP INBOX doesn't usually include
        // our own outbound, but Sent-All-Mail archives do; a self-sent
        // safety check keeps us from creating phantom "reply from myself".
        if (
          fromEmail.toLowerCase() === (account.email || '').toLowerCase()
        ) {
          continue;
        }

        const rawSource = msg.source?.toString?.('utf8') || '';
        const { inReplyTo, references } = parseReplyHeaders(rawSource);
        // Parse out just the human-readable body — no MIME headers, no
        // multipart boundaries, no quoted-reply chain. Was dumping the
        // whole raw source verbatim which looked deeply unprofessional.
        const readableBody = extractPlainBody(rawSource);

        try {
          await ingestInboundEmail(account.businessId, {
            from: fromEmail,
            fromName: from?.name,
            subject: msg.envelope?.subject || '(no subject)',
            body: readableBody,
            // Prefer the real RFC Message-ID — that's what future replies'
            // In-Reply-To headers will point at.
            externalMessageId:
              msg.envelope?.messageId || `imap_${account._id}_${msg.uid}`,
            threadId: msg.envelope?.messageId,
            inReplyTo,
            references,
            timestamp: msg.envelope?.date || new Date(),
            emailAccountId: account._id,
          });
          synced += 1;
        } catch (perMsgError) {
          // A single bad message must not sink the whole sync. Log and skip.
          console.error(
            `[emailSync] account=${account._id} uid=${msg.uid} failed:`,
            perMsgError.message
          );
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
    client = null;

    account.lastSyncAt = new Date();
    account.status = 'active';
    account.lastError = null;
    await account.save();

    return { synced };
  } catch (error) {
    // Best-effort cleanup — logout() throws if the socket already died.
    if (client) {
      try {
        await client.logout();
      } catch {
        /* ignore */
      }
    }
    account.status = 'error';
    account.lastError = error.message;
    await account.save();
    return { synced: 0, error: error.message };
  }
}

export default { syncEmailAccount };
