import nodemailer from 'nodemailer';
import { decrypt, isEncrypted } from '@/lib/encryption';

/**
 * Build a fresh Nodemailer transporter for a specific EmailAccount row.
 *
 * Deliberately does NOT pool. Each send creates a transporter, sends, and lets
 * the connection close. At 2 users this is negligible; at scale we'd introduce
 * a per-account pool keyed by account._id.
 *
 * The account's password field is stored encrypted at rest (lib/encryption.js).
 * We decrypt inside this function so the plaintext never lives outside a
 * single send's stack frame — no plaintext on the DB, no plaintext in logs,
 * no plaintext on the job payload (relevant when we queue in a later step).
 */
export async function createTransporterForAccount(account) {
  const smtp = account?.smtp;
  if (!smtp?.host || !smtp?.username || !smtp?.password) {
    throw new Error('EmailAccount is missing SMTP host/username/password');
  }

  const rawPassword = isEncrypted(smtp.password) ? decrypt(smtp.password) : smtp.password;
  if (rawPassword === null) {
    throw new Error(
      'CORRUPT_CREDENTIALS: SMTP password could not be decrypted. Reconnect the mailbox in Settings.'
    );
  }

  const port = Number(smtp.port) || 587;
  // Honor stored port/secure. Gmail App-Password path uses 587+STARTTLS; some
  // providers still want 465+implicit-TLS. Do NOT hardcode like the legacy
  // businessMailer.js does — that path forces 587 regardless of stored value.
  const secure = smtp.secure === true || port === 465;

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port,
    secure,
    auth: {
      user: smtp.username,
      pass: rawPassword,
    },
    requireTLS: !secure,
    authMethod: 'LOGIN',
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    // 15s is comfortably above p99 for Gmail/Outlook/Hostinger SMTP handshakes
    // and well under Vercel's function timeout.
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    pool: false,
  });

  return transporter;
}

/**
 * Convention for the "From" header when sending from a personal or shared
 * account. Matches Nodemailer's expected shape: `"Name" <email>`.
 */
export function formatFromHeader(account) {
  const email = account?.smtp?.username || account?.email;
  const name = account?.displayName || account?.email;
  if (!email) throw new Error('EmailAccount has no sender address');
  return name && name !== email ? `"${name}" <${email}>` : email;
}
