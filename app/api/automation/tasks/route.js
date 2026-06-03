import { dbConnect } from '@/lib/mongodb';
import Task from '@/models/automation/Task';
import Lead from '@/models/automation/Lead';
import { NextResponse } from 'next/server';
import { withTenantAuth, resolveTenant } from '@/lib/auth';

export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { user, business } = tenant;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'today', 'overdue', 'upcoming'
    const assignedTo = searchParams.get('assignedTo');
    const leadId = searchParams.get('leadId');

    const query = { businessId: business._id, status: 'pending' };

    // Role-based filtering: members only see their own tasks
    if (user.role === 'member') {
      query.assignedTo = user._id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (leadId) query.leadId = leadId;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (filter === 'today') {
      query.dueDate = { $gte: today, $lt: tomorrow };
    } else if (filter === 'overdue') {
      query.dueDate = { $lt: today };
    } else if (filter === 'upcoming') {
      query.dueDate = { $gte: tomorrow };
    }

    const tasks = await Task.find(query)
      .populate('leadId', 'name phone serviceInterest')
      .populate('assignedTo', 'email firstName lastName')
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
  }
});

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { business } = tenant;
    const body = await request.json();
    const { leadId, type, title, description, dueDate, assignedTo, autoSend, messageContent } = body;

    if (!leadId || !type || !title || !dueDate || !assignedTo) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const task = await Task.create({
      businessId: business._id,
      leadId,
      type,
      title,
      description,
      dueDate: new Date(dueDate),
      assignedTo,
      status: 'pending',
      autoSend: !!autoSend,
      messageContent
    });

    const populatedTask = await Task.findById(task._id)
      .populate('leadId', 'name phone serviceInterest')
      .populate('assignedTo', 'email firstName lastName');

    return NextResponse.json({ success: true, data: populatedTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
});
