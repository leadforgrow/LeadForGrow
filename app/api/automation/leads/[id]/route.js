import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';
import Task from '@/models/automation/Task';
import Message from '@/models/automation/Message';
import User from '@/models/User';
import { withPlanAccess } from '@/lib/accessControl';
import { triggerAutomationForLead } from '@/lib/leadProcessor';

// GET - Fetch single lead with details
export const GET = withPlanAccess('leads', async (req, { params }) => {
  try {
    const { id } = await params;
    const user = req.user;
    const businessId = user.businessId;

    const lead = await Lead.findOne({ _id: id, businessId })
      .populate('assignedTo', 'email')
      .lean();

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const activities = await Activity.find({ leadId: id })
      .populate('performedBy', 'email')
      .sort({ performedAt: -1 })
      .lean();

    const messages = await Message.find({ leadId: id, businessId })
      .sort({ timestamp: 1 })
      .lean();

    return NextResponse.json({ success: true, data: { ...lead, activities, messages } });
  } catch (error) {
    console.error('Fetch lead error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
});

// PUT - Update lead
export const PUT = withPlanAccess('leads', async (req, { params }) => {
  try {
    const { id } = await params;
    const user = req.user;
    const businessId = user.businessId;
    const body = await req.json();
    const { performedBy, status, assignedTo, priority, nextFollowUpAt, note } = body;

    const lead = await Lead.findOne({ _id: id, businessId });
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const updates = {};
    const activities = [];

    // Status change
    if (status && status !== lead.status) {
      const oldStatus = lead.status;
      updates.status = status;

      if (status === 'contacted') {
        updates.lastContactedAt = new Date();
        // HUMAN ACTION FLOW: Auto-close pending automation tasks
        await Task.updateMany(
          { leadId: id, status: 'pending' },
          { status: 'completed', completedAt: new Date() }
        );
      } else if (status === 'converted') {
        updates.convertedAt = new Date();
      } else if (status === 'lost') {
        updates.lostAt = new Date();
      }

      activities.push({
        leadId: id, businessId,
        type: 'status_changed',
        description: `Status changed from ${oldStatus} to ${status}`,
        performedBy: performedBy || user.userId,
        metadata: { oldValue: oldStatus, newValue: status }
      });
    }

    if (assignedTo !== undefined && assignedTo !== lead.assignedTo?.toString()) {
      updates.assignedTo = assignedTo;
      activities.push({
        leadId: id, businessId,
        type: 'assigned',
        description: assignedTo ? 'Lead assigned to team member' : 'Lead unassigned',
        performedBy: performedBy || user.userId
      });
    }

    if (priority) updates.priority = priority;

    if (nextFollowUpAt) {
      updates.nextFollowUpAt = new Date(nextFollowUpAt);
      activities.push({
        leadId: id, businessId,
        type: 'follow_up_scheduled',
        description: `Follow-up scheduled for ${new Date(nextFollowUpAt).toLocaleString()}`,
        performedBy: performedBy || user.userId
      });
    }

    if (note) {
      updates.$push = {
        notes: { text: note, addedBy: performedBy || user.userId, addedAt: new Date() }
      };
      activities.push({
        leadId: id, businessId,
        type: 'note_added',
        description: 'Note added to lead',
        performedBy: performedBy || user.userId
      });
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, updates, { new: true }).populate('assignedTo', 'email');
    if (activities.length > 0) await Activity.insertMany(activities);

    // Trigger automation on status change
    if (status && status !== lead.status) {
      // Trigger as a side effect
      triggerAutomationForLead(id, businessId, 'onStatusChange').catch(err => {
        console.error('[Automation] Trigger failed for status change:', err);
      });
    }

    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
});

// DELETE - Hard delete lead and related data
export const DELETE = withPlanAccess('leads', async (req, { params }) => {
  try {
    const { id } = await params;
    const user = req.user;
    const businessId = user.businessId;

    // 1. Verify existence and ownership
    const lead = await Lead.findOne({ _id: id, businessId });
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    // 2. Cascading Deletion
    const deleteResults = await Promise.all([
      Lead.deleteOne({ _id: id, businessId }),
      Activity.deleteMany({ leadId: id, businessId }),
      Task.deleteMany({ leadId: id, businessId }),
      Message.deleteMany({ leadId: id, businessId })
    ]);

    console.log(`[LeadsAPI] Lead ${id} and related data deleted. Result:`, deleteResults);

    return NextResponse.json({
      success: true,
      message: 'Lead and all associated data permanently deleted from database'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 500 });
  }
});
