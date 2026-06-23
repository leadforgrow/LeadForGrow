import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import EmailAccount from '@/models/omnichannel/EmailAccount';
import { withPermissions } from '@/lib/rbac';

async function getHandler(req) {
  try {
    const { user } = req;
    await dbConnect();
    const accounts = await EmailAccount.find({ businessId: user.businessId, archived: { $ne: true } })
      .select('-imap.password -smtp.password -oauth.refreshToken')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

async function postHandler(req) {
  try {
    const { user } = req;
    const body = await req.json();
    const { email, displayName, imap, smtp, oauth } = body;
    if (!email?.trim()) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }
    await dbConnect();
    const account = await EmailAccount.create({
      businessId: user.businessId,
      email: email.trim().toLowerCase(),
      displayName,
      imap,
      smtp,
      oauth,
      status: 'active',
    });
    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Account already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export const GET = withPermissions(['dashboard_access', 'reports_access'], getHandler);
export const POST = withPermissions(['dashboard_access', 'reports_access'], postHandler);
