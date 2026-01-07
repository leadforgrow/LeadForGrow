import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Task from '@/models/automation/Task';
import Activity from '@/models/automation/Activity';
import mongoose from 'mongoose';
import { withPlanAccess } from '@/lib/accessControl';

// PUT - Update task
export async function PUT(request, { params }) {
  return withPlanAccess(request, 'tasks', async (req, user) => {
    try {
      await dbConnect();
      const { id } = await params;
      const businessId = user.businessId;
      const body = await request.json();
      const { performedBy, status, dueDate, notes } = body;
      
      const task = await Task.findOne({ _id: id, businessId });
      if (!task) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      
      const updates = {};
      if (status) {
        updates.status = status;
        if (status === 'completed') {
          updates.completedAt = new Date();
          updates.completedBy = performedBy || user._id;
          
          await Activity.create({
            leadId: task.leadId, businessId,
            type: 'follow_up_completed',
            description: `Follow-up task completed: ${task.title}`,
            performedBy: performedBy || user._id,
            metadata: { taskId: id }
          });

          // Sync with Lead status
          const Lead = mongoose.models.Lead || (await import('@/models/automation/Lead')).default;
          const lead = await Lead.findById(task.leadId);
          if (lead && lead.status === 'new') {
            lead.status = 'contacted';
            lead.lastContactedAt = new Date();
            await lead.save();

            await Activity.create({
              leadId: lead._id, businessId,
              type: 'status_change',
              description: `Status automatically updated to 'contacted' after completing task: ${task.title}`,
              performedBy: user._id
            });
          }
        }
      }
      
      if (dueDate) {
        updates.dueDate = new Date(dueDate);
        // If it was cancelled or completed, maybe it should go back to pending if rescheduled?
        // But usually rescheduling happens for pending tasks.
      }
      if (notes) updates.notes = notes;
      
      const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true })
        .populate('leadId', 'name phone serviceInterest')
        .populate('assignedTo', 'email');
      
      return NextResponse.json({ success: true, data: updatedTask });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
  });
}

// DELETE - Delete task
export async function DELETE(request, { params }) {
  return withPlanAccess(request, 'tasks', async (req, user) => {
    try {
      await dbConnect();
      const { id } = await params;
      const businessId = user.businessId;
      
      const task = await Task.findOneAndDelete({ _id: id, businessId });
      if (!task) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      
      return NextResponse.json({ success: true, message: 'Task deleted' });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
  });
}
