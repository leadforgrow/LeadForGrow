import { dbConnect } from '@/lib/mongodb';
import { CMS_Service, CMS_Task } from '@/models/cms/ServiceTask';
import CMS_ActivityLog from '@/models/cms/ActivityLog';
import { NextResponse } from 'next/server';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { assertClientInTenant, getTenantBusinessId } from '@/lib/cms/assertTenantBusiness';

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const body = await request.json();
    const { triggerType, clientId, serviceId } = body;
    const businessId = getTenantBusinessId(tenant);

    if (!triggerType) {
      return NextResponse.json({ error: 'Missing triggerType' }, { status: 400 });
    }

    const clientDenied = await assertClientInTenant(clientId, tenant);
    if (clientDenied) {
      return NextResponse.json({ success: false, error: clientDenied.error }, { status: clientDenied.status });
    }

    const results = [];

    switch (triggerType) {
      case 'CLIENT_ONBOARDED':
        if (clientId) {
          const welcomeTasks = [
            { title: 'Initial Strategy Call', priority: 'High', dueDate: new Date(Date.now() + 86400000) },
            { title: 'Account Access Setup', priority: 'Medium', dueDate: new Date(Date.now() + 172800000) },
          ];

          for (const t of welcomeTasks) {
            const task = await CMS_Task.create({
              ...t,
              clientId,
              businessId,
              status: 'To Do',
              auditLog: [{ action: 'Auto-generated via Client Onboarding Rule', timestamp: new Date() }],
            });
            results.push(task);
          }
        }
        break;

      case 'MONTHLY_CYCLE_RENEWAL': {
        const services = await CMS_Service.find({ businessId, status: 'In Progress', type: 'Monthly' });
        for (const service of services) {
          const recurringTask = await CMS_Task.create({
            title: `Monthly Audit: ${service.name}`,
            clientId: service.clientId,
            serviceId: service._id,
            businessId,
            isRecurring: true,
            status: 'To Do',
            dueDate: new Date(Date.now() + 604800000),
            auditLog: [{ action: `Auto-generated for cycle ${new Date().getMonth() + 1}`, timestamp: new Date() }],
          });
          results.push(recurringTask);
        }
        break;
      }

      case 'INVOICE_OVERDUE':
        if (clientId) {
          await CMS_ActivityLog.create({
            clientId,
            businessId,
            type: 'Auto Event',
            action: 'Overdue Invoice Alert generated',
            isVisibleToClient: false,
            details: { reason: '30 day threshold exceeded', serviceId },
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
});
