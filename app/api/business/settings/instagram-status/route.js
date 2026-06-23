import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { withPlanAccess } from '@/lib/accessControl';

export const GET = withPlanAccess('settings', async (req) => {
  try {
    await dbConnect();
    const business = await Business.findById(req.user.businessId);
    if (!business) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const ig = business.integrationCredentials?.instagram || {};
    const fb = business.integrationCredentials?.facebookAds || {};

    const enabled = ig.enabled || (fb.enabled && fb.pageId);
    const instagram = {
      enabled: !!enabled,
      pageId: ig.pageId || fb.pageId,
      igUserId: ig.igUserId,
      username: ig.username || fb.pageName,
      profilePicture: ig.profilePicture,
      accessToken: ig.accessToken ? '••••' : undefined,
      webhookStatus: ig.webhookStatus || (enabled ? 'active' : 'pending'),
      lastSyncAt: ig.lastSyncAt || ig.lastVerified || fb.lastVerified,
      lastVerified: ig.lastVerified,
    };

    return NextResponse.json({ success: true, data: { instagram } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withPlanAccess('settings', async (req) => {
  try {
    const appId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/meta/callback?scope=instagram`;
    if (!appId) {
      return NextResponse.json({
        success: false,
        error: 'META_APP_ID not configured. Add it to environment variables.',
      }, { status: 400 });
    }
    const scopes = ['instagram_basic', 'instagram_manage_messages', 'pages_show_list', 'pages_messaging'].join(',');
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=instagram`;
    return NextResponse.json({ success: true, data: { authUrl } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const DELETE = withPlanAccess('settings', async (req) => {
  try {
    await dbConnect();
    const business = await Business.findById(req.user.businessId);
    if (!business) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    business.integrationCredentials.instagram = {
      enabled: false,
      pageId: null,
      igUserId: null,
      username: null,
      accessToken: null,
      profilePicture: null,
      webhookStatus: 'pending',
    };
    await business.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
