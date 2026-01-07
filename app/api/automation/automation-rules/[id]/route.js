import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import AutomationRule from '@/models/automation/AutomationRule';
import { withPlanAccess } from '@/lib/accessControl';

// PUT - Update a rule (toggle enabled or change config)
export async function PUT(request, { params }) {
  return withPlanAccess(request, 'automation', async (req, user) => {
    try {
      await dbConnect();
      
      const { id } = await params;
      const body = await request.json();
      const { enabled, config } = body;
      const businessId = user.businessId;
      
      const updates = {};
      if (enabled !== undefined) updates.enabled = enabled;
      if (config) updates.config = config;
      
      const rule = await AutomationRule.findOneAndUpdate(
        { _id: id, businessId },
        updates,
        { new: true }
      );
      
      if (!rule) {
        return NextResponse.json(
          { success: false, error: 'Rule not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: rule
      });
      
    } catch (error) {
      console.error('Error updating automation rule:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update rule' },
        { status: 500 }
      );
    }
  });
}
