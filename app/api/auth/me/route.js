import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { resolveTenant } from '@/lib/auth';

export const GET = withAuth()(async (req) => {
  try {
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { user, business } = tenant;

    const RolePermission =
      mongoose.models.RolePermission || (await import('@/models/RolePermission')).default;
    const rolePerm = await RolePermission.findOne({
      role: { $regex: new RegExp(`^${user.role}$`, 'i') },
    });

    const permissions = rolePerm ? [...rolePerm.permissions] : [];
    if (['owner', 'super', 'agency_owner'].includes(user.role?.toLowerCase())) {
      permissions.push(
        'dashboard_access',
        'reports_access',
        'live_chat_access',
        'leads_view',
        'leads_edit',
        'leads_delete',
        'team_manage',
        'settings_manage',
        'billing_manage'
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        businessId: business._id,
        companyName: business.businessName,
        plan: business.plan || 'free',
        quotas: business.quotas || {},
        usage: business.usage || {},
        onboardingComplete: business.onboardingComplete || false,
        // Weak-password rotation flag — surfaced here so a session that was
        // established BEFORE we tightened the policy can still be redirected
        // to /rotate-password when the client next queries /me (i.e. app boot).
        mustRotatePassword: user.mustRotatePassword === true,
        // API key is sensitive — only workspace owners/admins may see it
        ...(['owner', 'admin', 'super', 'agency_owner', 'CLIENT_ADMIN'].includes(user.role)
          ? { apiKey: business.apiKey }
          : {}),
        permissions: [...new Set(permissions)],
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
