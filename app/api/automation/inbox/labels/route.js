import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import InboxLabel from '@/models/omnichannel/InboxLabel';
import { withPermissions } from '@/lib/rbac';

async function getHandler(req) {
  try {
    const { user } = req;
    await dbConnect();
    const labels = await InboxLabel.find({ businessId: user.businessId, archived: false }).sort({ name: 1 });
    return NextResponse.json({ success: true, data: labels });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

async function postHandler(req) {
  try {
    const { user } = req;
    const body = await req.json();
    const { name, color, description } = body;
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 });
    }
    await dbConnect();
    const label = await InboxLabel.create({
      businessId: user.businessId,
      name: name.trim(),
      color: color || '#6366f1',
      description,
    });
    return NextResponse.json({ success: true, data: label }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Label already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export const GET = withPermissions(['dashboard_access', 'reports_access'], getHandler);
export const POST = withPermissions(['dashboard_access', 'reports_access'], postHandler);
