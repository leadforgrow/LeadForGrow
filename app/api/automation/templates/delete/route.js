import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import AutomationRule from '@/models/automation/AutomationRule';
import { withTenantAuth, resolveTenant } from '@/lib/auth';

export const POST = withTenantAuth(async (req) => {
  try {
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { templateId } = await req.json();
    if (!templateId) {
      return NextResponse.json({ success: false, error: 'Missing templateId' }, { status: 400 });
    }

    await dbConnect();
    const deleted = await AutomationRule.findOneAndDelete({
      _id: templateId,
      businessId: tenant.business._id,
      type: 'manual_template',
    });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Template not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('[TemplateDelete] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
