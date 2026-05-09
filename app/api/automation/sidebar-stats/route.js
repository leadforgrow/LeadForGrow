import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Lead from '@/models/automation/Lead';
import Task from '@/models/automation/Task';
import AutomationRule from '@/models/automation/AutomationRule';
import Event from '@/models/automation/Event';
import { withAuth } from '@/lib/auth';

export const GET = withAuth()(async (req) => {
  try {
    await dbConnect();
    const user = req.user;
    const businessId = user.businessId;

    const [unreadLeads, overdueTasks, activeAutomations, activeEvents] = await Promise.all([
      Lead.countDocuments({ businessId, isRead: false, archived: false }),
      Task.countDocuments({ businessId, status: 'pending', dueDate: { $lt: new Date() } }),
      AutomationRule.countDocuments({ businessId, enabled: true }),
      Event.countDocuments({ businessId, active: true })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        unreadLeads,
        overdueTasks,
        activeAutomations,
        activeEvents
      }
    });
  } catch (error) {
    console.error('[Sidebar Stats API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
