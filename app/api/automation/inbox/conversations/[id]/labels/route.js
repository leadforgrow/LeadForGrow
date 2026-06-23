import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/omnichannel/Conversation';
import InboxLabel from '@/models/omnichannel/InboxLabel';
import { withPermissions } from '@/lib/rbac';

async function handler(req, { params }) {
  try {
    const { user } = req;
    const { id } = await params;
    const body = await req.json();
    const { labelIds, add, remove } = body;

    await dbConnect();

    const conversation = await Conversation.findOne({ _id: id, businessId: user.businessId });
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (remove) {
      conversation.labels = conversation.labels.filter(
        (l) => !labelIds?.includes(String(l.labelId))
      );
    } else if (labelIds?.length) {
      const labels = await InboxLabel.find({ _id: { $in: labelIds }, businessId: user.businessId });
      const refs = labels.map((l) => ({ labelId: l._id, name: l.name, color: l.color }));
      if (add) {
        const existing = new Set(conversation.labels.map((l) => String(l.labelId)));
        for (const ref of refs) {
          if (!existing.has(String(ref.labelId))) conversation.labels.push(ref);
        }
      } else {
        conversation.labels = refs;
      }
    }

    await conversation.save();
    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    console.error('[Inbox API] labels:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export const POST = withPermissions(['dashboard_access', 'reports_access'], handler);
