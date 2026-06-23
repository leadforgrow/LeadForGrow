/**
 * IMAP email sync — polls connected accounts and ingests new messages.
 * Requires imapflow (optional dependency) or falls back to manual ingest API.
 */
import { ingestInboundEmail } from '@/lib/omnichannel/emailService';

export async function syncEmailAccount(account) {
  if (!account.imap?.host) {
    return { synced: 0, skipped: true, reason: 'IMAP not configured' };
  }

  try {
    // Dynamic import keeps bundle optional until IMAP is configured
    const { ImapFlow } = await import('imapflow');
    const client = new ImapFlow({
      host: account.imap.host,
      port: account.imap.port || 993,
      secure: account.imap.secure !== false,
      auth: {
        user: account.imap.username || account.email,
        pass: account.imap.password,
      },
    });

    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    let synced = 0;

    try {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      for await (const msg of client.fetch({ since: weekAgo }, { envelope: true, source: true })) {
        const from = msg.envelope?.from?.[0];
        const fromEmail = from?.address;
        if (!fromEmail) continue;

        const body = msg.source?.toString?.() || '';
        await ingestInboundEmail(account.businessId, {
          from: fromEmail,
          fromName: from?.name,
          subject: msg.envelope?.subject || '(no subject)',
          body: body.substring(0, 5000),
          externalMessageId: msg.uid?.toString() || `imap_${Date.now()}`,
          threadId: msg.envelope?.messageId,
          timestamp: msg.envelope?.date || new Date(),
        });
        synced += 1;
      }
    } finally {
      lock.release();
    }

    await client.logout();
    account.lastSyncAt = new Date();
    account.status = 'active';
    await account.save();

    return { synced };
  } catch (error) {
    account.status = 'error';
    account.lastError = error.message;
    await account.save();
    return { synced: 0, error: error.message };
  }
}

export default { syncEmailAccount };
