import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Message from '@/models/automation/Message';
import { withPermissions } from '@/lib/rbac';

/**
 * PATCH /api/automation/inbox/messages/:id
 * body: { action: 'star' | 'unstar' | 'trash' | 'restore' }
 *
 * Simple per-message state toggles. Kept in one endpoint so the frontend
 * doesn't have to remember /star, /unstar, /trash routes. All actions are
 * idempotent (starring an already-starred message succeeds silently).
 *
 * Tenant scoping is enforced by the businessId filter — no cross-tenant
 * access even if a caller guesses another tenant's message id.
 */
async function handler(req, ctx) {
  try {
    const { user } = req;
    const { id } = await ctx.params;
    const { action } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const validActions = ['star', 'unstar', 'trash', 'restore'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    await dbConnect();

    const update = {};
    if (action === 'star') update.starred = true;
    if (action === 'unstar') update.starred = false;
    if (action === 'trash') update.isDeleted = true;
    if (action === 'restore') update.isDeleted = false;

    const message = await Message.findOneAndUpdate(
      { _id: id, businessId: user.businessId },
      { $set: update },
      { new: true }
    );

    if (!message) {
      // 404 not 403 — don't leak whether the id exists in another tenant.
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: String(message._id),
        starred: message.starred,
        isDeleted: message.isDeleted,
      },
    });
  } catch (error) {
    console.error('[Inbox API] message action:', error);
    return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
  }
}

export const PATCH = withPermissions(['dashboard_access', 'reports_access'], handler);
