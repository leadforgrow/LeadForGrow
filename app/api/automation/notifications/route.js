import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Notification from '@/models/automation/Notification';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        await dbConnect();

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({ success: true, data: notifications });
    } catch (error) {
        console.error('[Notifications API] GET Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { userId, notificationId, markAll } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

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
}
