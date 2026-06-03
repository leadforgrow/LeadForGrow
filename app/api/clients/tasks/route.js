import { dbConnect } from '@/lib/mongodb';
import { CMS_Task } from '@/models/cms/ServiceTask';
import CMS_ActivityLog from '@/models/cms/ActivityLog';
import { NextResponse } from 'next/server';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import {
  assertClientInTenant,
  assertTenantBusinessId,
  getTenantBusinessId,
} from '@/lib/cms/assertTenantBusiness';

export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const serviceId = searchParams.get('serviceId');
    const businessId = searchParams.get('businessId') || getTenantBusinessId(tenant);
    const status = searchParams.get('status');

    const denied = assertTenantBusinessId(tenant, businessId);
    if (denied) {
      return NextResponse.json({ success: false, error: denied.error }, { status: denied.status });
    }

    const clientDenied = await assertClientInTenant(clientId, tenant);
    if (clientDenied) {
      return NextResponse.json({ success: false, error: clientDenied.error }, { status: clientDenied.status });
    }

    const query = { businessId };
    if (clientId) query.clientId = clientId;
    if (serviceId) query.serviceId = serviceId;
    if (status) query.status = status;

    const tasks = await CMS_Task.find(query)
      .sort({ dueDate: 1, priority: -1 })
      .populate('assignedTo', 'firstName lastName email')
      .populate('clientId', 'companyName');

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('[CMS_TASK_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const body = await request.json();
    const { clientId, title } = body;
    const businessId = getTenantBusinessId(tenant);
    const userId = tenant.user._id;

    if (!clientId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const clientDenied = await assertClientInTenant(clientId, tenant);
    if (clientDenied) {
      return NextResponse.json({ success: false, error: clientDenied.error }, { status: clientDenied.status });
    }

    const task = await CMS_Task.create({ ...body, businessId, userId });

    await CMS_ActivityLog.create({
      clientId,
      businessId,
      type: 'Task Update',
      action: `New task created: ${title}`,
      userId,
      details: { taskId: task._id },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error('[CMS_TASK_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const body = await request.json();
    const { taskId, ...updates } = body;
    const userId = tenant.user._id;
    const businessId = getTenantBusinessId(tenant);

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const task = await CMS_Task.findOne({ _id: taskId, businessId });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const oldStatus = task.status;
    const newStatus = updates.status;

    Object.assign(task, updates);
    task.auditLog.push({
      action: `Updated: ${Object.keys(updates).join(', ')}`,
      userId,
      timestamp: new Date(),
    });

    await task.save();

    if (newStatus && oldStatus !== newStatus) {
      await CMS_ActivityLog.create({
        clientId: task.clientId,
        businessId: task.businessId,
        type: 'Status Change',
        action: `Task "${task.title}" moved from ${oldStatus} to ${newStatus}`,
        userId,
        details: { taskId: task._id, oldStatus, newStatus },
      });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('[CMS_TASK_PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
