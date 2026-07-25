import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Notification from '@/models/automation/Notification';
import { withAuth } from '@/lib/auth';

export const GET = withAuth()(async (req) => {
  try {
    await dbConnect();
    const userId = req.user.userId;

    // Scope by business too — multi-workspace users must not see cross-tenant notifications
    const query = { userId };
    if (req.user.businessId) query.businessId = req.user.businessId;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('[Notifications API] GET Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = withAuth()(async (req) => {
  try {
    const { notificationId, markAll } = await req.json();
    const userId = req.user.userId;

    await dbConnect();

    if (markAll) {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId }, { isRead: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications API] PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
});
