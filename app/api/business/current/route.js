import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import { withAuth } from '@/lib/auth';

export const GET = withAuth()(async (req) => {
  try {
    await dbConnect();
    const user = req.user;

    if (!user.businessId) {
      return NextResponse.json({ success: false, error: 'User not associated with a business' }, { status: 400 });
    }

    const business = await Business.findById(user.businessId, 'businessName _id');

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      businessId: business._id,
      businessName: business.businessName
    });
  } catch (error) {
    console.error('[Business Current] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
