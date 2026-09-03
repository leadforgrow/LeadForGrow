import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import EmailAccount from '@/models/omnichannel/EmailAccount';
import { withPermissions } from '@/lib/rbac';

/**
 * DELETE /api/automation/inbox/email-accounts/:id
 *
 * Soft-disconnect: flips status to 'archived' and blanks stored credentials
 * so the row stays for historical Message references but can't be used again.
 * Hard-delete is refused — Messages FK to this row and orphaning them would
 * break threading.
 *
 * Access: personal owners + workspace admins.
 */
async function deleteHandler(req, ctx) {
  try {
    const { user } = req;
    const { id } = await ctx.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    await dbConnect();
    const account = await EmailAccount.findOne({ _id: id, businessId: user.businessId });
    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    if (account.type === 'personal' && String(account.userId) !== String(user.userId)) {
      const role = (user.role || '').toLowerCase();
      const isAdmin = ['owner', 'admin', 'super', 'super_admin', 'agency_owner'].includes(role);
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    account.status = 'archived';
    account.syncEnabled = false;
    // Blank secrets so a compromised DB read after archival can't be used to
    // impersonate the mailbox. Provider still owns the account; if the user
    // wants to reconnect they enter creds again.
    if (account.imap) account.imap.password = '';
    if (account.smtp) account.smtp.password = '';
    if (account.oauth) {
      account.oauth.accessToken = '';
      account.oauth.refreshToken = '';
    }
    await account.save();

    return NextResponse.json({
      success: true,
      data: { accountId: String(account._id), status: 'archived' },
    });
  } catch (error) {
    console.error('[EmailAccounts DELETE]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/automation/inbox/email-accounts/:id
 *
 * Update user-editable fields on an existing account. Deliberately narrow:
 * we accept signature, displayName, isDefault, syncEnabled only. Credentials
 * (imap/smtp password, oauth tokens) are NOT patchable here — those require
 * the full connect flow to re-verify with the provider.
 *
 * Access: personal owners + workspace admins (same as delete).
 */
async function patchHandler(req, ctx) {
  try {
    const { user } = req;
    const { id } = await ctx.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const body = await req.json();
    await dbConnect();

    const account = await EmailAccount.findOne({ _id: id, businessId: user.businessId });
    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    }

    if (account.type === 'personal' && String(account.userId) !== String(user.userId)) {
      const role = (user.role || '').toLowerCase();
      const isAdmin = ['owner', 'admin', 'super', 'super_admin', 'agency_owner'].includes(role);
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    // Whitelist of patchable fields — refuse anything else silently.
    // A wildcard patch here is a common source of privilege-escalation bugs.
    if (typeof body.signature === 'string') account.signature = body.signature;
    if (typeof body.displayName === 'string') account.displayName = body.displayName;
    if (typeof body.signatureLogoUrl === 'string' || body.signatureLogoUrl === null) {
      account.signatureLogoUrl = body.signatureLogoUrl || undefined;
    }
    if (typeof body.signatureLogoWidth === 'number' && body.signatureLogoWidth > 0) {
      account.signatureLogoWidth = Math.min(600, Math.max(40, body.signatureLogoWidth));
    }
    if (typeof body.syncEnabled === 'boolean') account.syncEnabled = body.syncEnabled;

    // Multi-signature support. Accept the whole array on save; normalize and
    // enforce invariants server-side (client is untrusted): every entry gets
    // a stable id + trimmed name, at most one isDefault (auto-promote first
    // entry if none is marked), max 20 signatures per account.
    if (Array.isArray(body.signatures)) {
      const cleaned = body.signatures
        .filter((s) => s && typeof s === 'object')
        .slice(0, 20)
        .map((s) => ({
          id:
            (typeof s.id === 'string' && s.id.trim()) ||
            `sig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          name: (typeof s.name === 'string' ? s.name.trim() : '') || 'Signature',
          html: typeof s.html === 'string' ? s.html : '',
          isDefault: !!s.isDefault,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        }));
      // Enforce: exactly one default. If several claim it, keep the first.
      // If none claim it and the list is non-empty, promote the first entry.
      let sawDefault = false;
      for (const s of cleaned) {
        if (s.isDefault && !sawDefault) sawDefault = true;
        else s.isDefault = false;
      }
      if (!sawDefault && cleaned.length) cleaned[0].isDefault = true;
      account.signatures = cleaned;
    }
    if (typeof body.isDefault === 'boolean') {
      // If setting this account as default, clear default from other accounts
      // belonging to the same user so the partial unique index (Step 1) stays
      // happy. A transaction would be safer under contention; single-writer
      // per user makes it fine for now.
      if (body.isDefault && account.userId) {
        await EmailAccount.updateMany(
          { businessId: user.businessId, userId: account.userId, _id: { $ne: account._id } },
          { $set: { isDefault: false } }
        );
      }
      account.isDefault = body.isDefault;
    }

    await account.save();

    // Strip secrets before returning.
    const safe = account.toObject();
    if (safe.imap) delete safe.imap.password;
    if (safe.smtp) delete safe.smtp.password;
    if (safe.oauth) {
      delete safe.oauth.accessToken;
      delete safe.oauth.refreshToken;
    }

    return NextResponse.json({ success: true, data: safe });
  } catch (error) {
    console.error('[EmailAccounts PATCH]', error);
    return NextResponse.json({ success: false, error: 'Failed to update account' }, { status: 500 });
  }
}

export const DELETE = withPermissions(['dashboard_access', 'reports_access'], deleteHandler);
export const PATCH = withPermissions(['dashboard_access', 'reports_access'], patchHandler);
