import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Activity from '@/models/automation/Activity';
import User from '@/models/User';
import Business from '@/models/Business';

// Helper to get user and business
async function getUserAndBusiness(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return { error: `Authentication required: ${new URL(request.url).pathname}`, status: 401 };
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
        return { error: 'User not found', status: 404 };
    }

    const business = await Business.findById(user.businessId);
    if (!business) {
        return { error: 'Business not found', status: 404 };
    }

    return { user, business };
}

// GET - Fetch recent activities
export async function GET(request) {
    try {
        const result = await getUserAndBusiness(request);
        if (result.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: result.status });
        }

        const { business } = result;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 20;

        const activities = await Activity.find({ businessId: business._id })
            .populate('leadId', 'name phone serviceInterest')
            .populate('performedBy', 'firstName lastName')
            .sort({ performedAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, data: activities });
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch activities' }, { status: 500 });
    }
}
