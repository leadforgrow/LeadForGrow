import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { resolveUserAccess, getWorkspaceUsage } from '@/lib/access/resolver';
import { MODULE_GROUPS } from '@/lib/access/catalog';

export const GET = withTenantAuth(async (req) => {
  try {
    await dbConnect();
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { user, business } = tenant;
    const access = await resolveUserAccess({
      userId: user._id,
      businessId: business._id,
      business,
      user,
    });

    const usage = await getWorkspaceUsage(business._id);
    const quotas = access.quotas || {};

    const usageLimits = [
      { id: 'teamSeats', label: 'Team seats', used: usage.teamSeats, limit: quotas.maxTeamMembers || 1 },
      { id: 'contacts', label: 'Contacts', used: usage.contacts, limit: quotas.maxLeadsPerMonth || 50 },
      { id: 'automationRules', label: 'Automation rules', used: usage.automationRules, limit: quotas.maxAutomationRules || 3 },
      { id: 'forms', label: 'Forms', used: usage.forms, limit: quotas.maxForms || 1 },
      { id: 'workflows', label: 'Workflows', used: usage.workflows, limit: quotas.maxAutomationRules || 3 },
      { id: 'aiCredits', label: 'AI credits', used: usage.aiCredits, limit: access.tierFeatures?.ai_assistant ? 500 : 0 },
      { id: 'apiRequests', label: 'API requests', used: usage.apiRequests, limit: access.tierFeatures?.api_access ? 10000 : 0 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        access,
        moduleGroups: MODULE_GROUPS,
        usage,
        usageLimits,
      },
    });
  } catch (error) {
    console.error('[Access Context]', error);
    return NextResponse.json({ success: false, error: 'Failed to load access context' }, { status: 500 });
  }
});
