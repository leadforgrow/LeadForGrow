import { dbConnect } from "@/lib/mongodb";
import Task from '@/models/automation/Task';
import User from '@/models/User';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';

// Helper to get user and business
async function getUserAndBusiness(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return { error: 'Authentication required', status: 401 };
  }
  
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User not found', status: 404 };
  }
  
  const business = await Business.findById(user.businessId);
  if (!business) {
    return { error: 'Business not found', status: 404 };
  }
  
  return { user, business };
}

// GET - Fetch tasks with filters
export async function GET(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { user, business } = result;
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
}

// POST - Create new task
export async function POST(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    const body = await request.json();
    const { leadId, type, title, description, dueDate, assignedTo } = body;
    
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
      status: 'pending'
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('leadId', 'name phone serviceInterest')
      .populate('assignedTo', 'email firstName lastName');
    
    return NextResponse.json({ success: true, data: populatedTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
}
