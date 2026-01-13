import { dbConnect } from '@/lib/mongodb';
import { CMS_Service, CMS_Task } from '@/models/cms/ServiceTask';
import CMS_ActivityLog from '@/models/cms/ActivityLog';
import { NextResponse } from 'next/server';

/**
 * @api {post} /api/clients/automation/trigger POST - Trigger a rule-based automation
 */

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { triggerType, clientId, businessId, serviceId, userId } = body;

    if (!triggerType || !businessId) {
      return NextResponse.json({ error: 'Missing triggerType or businessId' }, { status: 400 });
    }

    let results = [];

    switch (triggerType) {
      case 'CLIENT_ONBOARDED':
        // Logic: Create welcome tasks and initial service audit
        if (clientId) {
          const welcomeTasks = [
            { title: 'Initial Strategy Call', priority: 'High', dueDate: new Date(Date.now() + 86400000) },
            { title: 'Account Access Setup', priority: 'Medium', dueDate: new Date(Date.now() + 172800000) }
          ];

          for (const t of welcomeTasks) {
            const task = await CMS_Task.create({
              ...t,
              clientId,
              businessId,
              status: 'To Do',
              auditLog: [{ action: 'Auto-generated via Client Onboarding Rule', timestamp: new Date() }]
            });
            results.push(task);
          }
        }
        break;

      case 'MONTHLY_CYCLE_RENEWAL':
        // Logic: Regenerate recurring tasks for all active services
        const services = await CMS_Service.find({ businessId, status: 'In Progress', type: 'Monthly' });
        for (const service of services) {
          const recurringTask = await CMS_Task.create({
            title: `Monthly Audit: ${service.name}`,
            clientId: service.clientId,
            serviceId: service._id,
            businessId,
            isRecurring: true,
            status: 'To Do',
            dueDate: new Date(Date.now() + 604800000), // Due in 7 days
            auditLog: [{ action: `Auto-generated for cycle ${new Date().getMonth() + 1}`, timestamp: new Date() }]
          });
          results.push(recurringTask);
        }
        break;

      case 'INVOICE_OVERDUE':
        // Logic: Notify account manager and log event
        if (clientId) {
          await CMS_ActivityLog.create({
            clientId,
            businessId,
            type: 'Auto Event',
            action: '🚨 Overdue Invoice Alert generated',
            isVisibleToClient: false,
            details: { reason: '30 day threshold exceeded' }
          });
        }
        break;

      default:
        return NextResponse.json({ error: 'Unsupported trigger type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, trigger: triggerType, itemsGenerated: results.length });
  } catch (error) {
    console.error('[CMS_AUTOMATION_TRIGGER]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
