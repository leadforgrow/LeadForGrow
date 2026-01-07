import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';
import Task from '@/models/automation/Task';
import User from '@/models/User';
import { withPlanAccess } from '@/lib/accessControl';
import { triggerAutomationForLead } from '@/lib/leadProcessor';

// GET - Fetch single lead with details
export async function GET(request, { params }) {
  return withPlanAccess(request, 'leads', async (req, user) => {
    try {
      const { id } = await params;
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
      
      return NextResponse.json({ success: true, data: { ...lead, activities } });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
  });
}

// PUT - Update lead
export async function PUT(request, { params }) {
  return withPlanAccess(request, 'leads', async (req, user) => {
    try {
      const { id } = await params;
      const businessId = user.businessId;
      const body = await request.json();
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
          performedBy: performedBy || user._id,
          metadata: { oldValue: oldStatus, newValue: status }
        });
      }
      
      if (assignedTo !== undefined && assignedTo !== lead.assignedTo?.toString()) {
        updates.assignedTo = assignedTo;
        activities.push({
          leadId: id, businessId,
          type: 'assigned',
          description: assignedTo ? 'Lead assigned to team member' : 'Lead unassigned',
          performedBy: performedBy || user._id
        });
      }
      
      if (priority) updates.priority = priority;
      
      if (nextFollowUpAt) {
        updates.nextFollowUpAt = new Date(nextFollowUpAt);
        activities.push({
          leadId: id, businessId,
          type: 'follow_up_scheduled',
          description: `Follow-up scheduled for ${new Date(nextFollowUpAt).toLocaleString()}`,
          performedBy: performedBy || user._id
        });
      }
      
      if (note) {
        updates.$push = {
          notes: { text: note, addedBy: performedBy || user._id, addedAt: new Date() }
        };
        activities.push({
          leadId: id, businessId,
          type: 'note_added',
          description: 'Note added to lead',
          performedBy: performedBy || user._id
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
}

// DELETE - Archive lead
export async function DELETE(request, { params }) {
  return withPlanAccess(request, 'leads', async (req, user) => {
    try {
      const { id } = await params;
      const businessId = user.businessId;
      
      const lead = await Lead.findOneAndUpdate({ _id: id, businessId }, { archived: true }, { new: true });
      if (!lead) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      
      return NextResponse.json({ success: true, message: 'Lead archived' });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
  });
}
