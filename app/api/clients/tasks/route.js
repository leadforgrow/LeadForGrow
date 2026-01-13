import { dbConnect } from '@/lib/mongodb';
import { CMS_Task } from '@/models/cms/ServiceTask';
import CMS_ActivityLog from '@/models/cms/ActivityLog';
import { NextResponse } from 'next/server';

/**
 * @api {get} /api/clients/tasks GET - List tasks (filters: client, service, business, status)
 * @api {post} /api/clients/tasks POST - Create task
 * @api {put} /api/clients/tasks PUT - Update task (Kanban move)
 */

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const serviceId = searchParams.get('serviceId');
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    let query = { businessId };
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
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { clientId, businessId, title, userId } = body;

    if (!clientId || !businessId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await CMS_Task.create(body);

    // Update Activity Log
    await CMS_ActivityLog.create({
      clientId,
      businessId,
      type: 'Task Update',
      action: `New task created: ${title}`,
      userId,
      details: { taskId: task._id }
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error('[CMS_TASK_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { taskId, userId, ...updates } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const task = await CMS_Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Track old status for log if it changed
    const oldStatus = task.status;
    const newStatus = updates.status;

    Object.assign(task, updates);
    task.auditLog.push({
      action: `Updated: ${Object.keys(updates).join(', ')}`,
      userId,
      timestamp: new Date()
    });

    await task.save();

    if (newStatus && oldStatus !== newStatus) {
      await CMS_ActivityLog.create({
        clientId: task.clientId,
        businessId: task.businessId,
        type: 'Status Change',
        action: `Task "${task.title}" moved from ${oldStatus} to ${newStatus}`,
        userId,
        details: { taskId: task._id, oldStatus, newStatus }
      });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('[CMS_TASK_PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
