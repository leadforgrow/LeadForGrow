import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import EmailAccount from '@/models/omnichannel/EmailAccount';
import { withPermissions } from '@/lib/rbac';
import { encrypt, isEncrypted } from '@/lib/encryption';

/**
 * Encrypt any credential fields that arrive from the client as plaintext.
 * Safe to call twice: isEncrypted() short-circuits already-ciphertext values,
 * which matters for PATCH flows where the client only re-sends changed fields.
 */
function encryptCredentialsInPlace(target) {
  if (!target || typeof target !== 'object') return;
  for (const key of ['password', 'accessToken', 'refreshToken']) {
    const val = target[key];
    if (typeof val === 'string' && val.length > 0 && !isEncrypted(val)) {
      target[key] = encrypt(val);
    }
  }
}

async function getHandler(req) {
  try {
    const { user } = req;
    await dbConnect();
    // Personal accounts owned by this user + shared/legacy accounts of the
    // business. Real ACL for shared mailboxes is a later phase; today anyone
    // with inbox access sees the business-scoped ones.
    const accounts = await EmailAccount.find({
      businessId: user.businessId,
      status: { $ne: 'archived' },
      $or: [{ userId: user.userId }, { type: { $in: ['shared', 'legacy'] } }],
    })
      .select('-imap.password -smtp.password -oauth.accessToken -oauth.refreshToken')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('[EmailAccounts GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load accounts' }, { status: 500 });
  }
}

async function postHandler(req) {
  try {
    const { user } = req;
    const body = await req.json();
    const {
      email,
      displayName,
      provider,
      type,
      imap,
      smtp,
      oauth,
      signature,
      signatures,
      signatureLogoUrl,
      signatureLogoWidth,
      isDefault,
      syncEnabled,
    } = body;

    if (!email?.trim()) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    // Only admins should be able to create shared mailboxes. Personal is the
    // default and represents "connect my own mailbox".
    const accountType = type === 'shared' ? 'shared' : 'personal';
    if (accountType === 'shared') {
      const role = (user.role || '').toLowerCase();
      const allowed = ['owner', 'admin', 'super', 'super_admin', 'agency_owner'];
      if (!allowed.includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Only workspace admins can create shared mailboxes.' },
          { status: 403 }
        );
      }
    }

    // Encrypt secrets BEFORE Mongoose sees them. Mongoose does not know these
    // fields are sensitive; the DB will store whatever we hand it.
    encryptCredentialsInPlace(imap);
    encryptCredentialsInPlace(smtp);
    encryptCredentialsInPlace(oauth);

    // Normalize signatures[] the same way PATCH does: enforce exactly-one
    // default, cap at 20, generate ids for entries missing them. Silently
    // ignore anything that isn't an object.
    let normalizedSignatures = [];
    if (Array.isArray(signatures)) {
      normalizedSignatures = signatures
        .filter((s) => s && typeof s === 'object')
        .slice(0, 20)
        .map((s) => ({
          id:
            (typeof s.id === 'string' && s.id.trim()) ||
            `sig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          name: (typeof s.name === 'string' ? s.name.trim() : '') || 'Signature',
          html: typeof s.html === 'string' ? s.html : '',
          isDefault: !!s.isDefault,
          createdAt: new Date(),
        }));
      let sawDefault = false;
      for (const s of normalizedSignatures) {
        if (s.isDefault && !sawDefault) sawDefault = true;
        else s.isDefault = false;
      }
      if (!sawDefault && normalizedSignatures.length) normalizedSignatures[0].isDefault = true;
    }

    await dbConnect();
    const account = await EmailAccount.create({
      businessId: user.businessId,
      userId: accountType === 'personal' ? user.userId : null,
      type: accountType,
      email: email.trim().toLowerCase(),
      displayName,
      provider,
      imap,
      smtp,
      oauth,
      signature,
      signatures: normalizedSignatures,
      signatureLogoUrl,
      signatureLogoWidth,
      isDefault: !!isDefault,
      syncEnabled: syncEnabled !== false,
      // New rows start pending — flipped to 'active' by the test endpoint or
      // by the first successful send. Never trust the client's "active" claim.
      status: 'pending',
    });

    // Strip secrets before returning — never send ciphertext back to the browser.
    const safe = account.toObject();
    if (safe.imap) delete safe.imap.password;
    if (safe.smtp) delete safe.smtp.password;
    if (safe.oauth) {
      delete safe.oauth.accessToken;
      delete safe.oauth.refreshToken;
    }

    return NextResponse.json({ success: true, data: safe }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'An account with that email already exists.' },
        { status: 409 }
      );
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('[EmailAccounts POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to create account' }, { status: 500 });
  }
}

export const GET = withPermissions(['dashboard_access', 'reports_access'], getHandler);
export const POST = withPermissions(['dashboard_access', 'reports_access'], postHandler);
