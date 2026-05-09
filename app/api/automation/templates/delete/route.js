import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import AutomationRule from '@/models/automation/AutomationRule';
import User from '@/models/User';

/**
 * POST /api/automation/templates/delete
 * Deletes a template (AutomationRule) from the database
 */
export async function POST(request) {
  try {
    const { templateId, userId } = await request.json();

    if (!templateId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user || !user.businessId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure the template belongs to the business
    const deleted = await AutomationRule.findOneAndDelete({
      _id: templateId,
      businessId: user.businessId,
      type: 'manual_template'
    });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Template not found or unauthorized' }, { status: 404 });
    }

    console.log(`[TemplateDelete] Template ${templateId} deleted for business ${user.businessId}`);
    return NextResponse.json({ success: true, message: 'Template deleted successfully' });

  } catch (error) {
    console.error('[TemplateDelete] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
