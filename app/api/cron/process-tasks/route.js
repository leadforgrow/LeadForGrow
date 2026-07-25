import { dbConnect } from "@/lib/mongodb";
import Task from "@/models/automation/Task";
import Business from "@/models/Business";
import Lead from "@/models/automation/Lead";
import Activity from "@/models/automation/Activity";
import { sendCustomerEmail } from "@/lib/integrations/email";
import { sendAutoWhatsApp } from "@/lib/integrations/whatsapp";
import { NextResponse } from "next/server";

/**
 * CRON Job Handler for Automated Task Follow-ups
 * This endpoint should be triggered every 1-5 minutes by an external scheduler (e.g. Vercel Cron, GitHub Actions)
 */
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'CRON_SECRET not configured' }, { status: 503 });
    }
  } else if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const now = new Date();
    const MAX_BATCH = 200;
    const MAX_SEND_ATTEMPTS = 5;

    // Find pending tasks with autoSend enabled that are due or past due
    const dueTasks = await Task.find({
      status: 'pending',
      autoSend: true,
      dueDate: { $lte: now },
      $or: [
        { autoSendAttempts: { $exists: false } },
        { autoSendAttempts: { $lt: MAX_SEND_ATTEMPTS } },
      ],
    })
      .sort({ dueDate: 1 })
      .limit(MAX_BATCH)
      .populate('leadId');

    console.log(`[Cron:Tasks] Found ${dueTasks.length} automated tasks to process.`);

    const results = [];
    const businessCache = new Map();

    for (const task of dueTasks) {
      try {
        const bizKey = task.businessId?.toString();
        let business = businessCache.get(bizKey);
        if (business === undefined) {
          business = await Business.findById(task.businessId);
          businessCache.set(bizKey, business);
        }
        if (!business) {
            console.log(`[Cron:Tasks] Business not found for task ${task._id}`);
            continue;
        }
        
        const lead = task.leadId;
        if (!lead) {
            task.status = 'cancelled';
            task.notes = (task.notes || '') + '\n[AutoErr] Lead associated with this task no longer exists.';
            await task.save();
            continue;
        }
        
        const message = task.messageContent || task.description || task.title;
        let sendResult = { success: false, error: 'Unsupported channel' };
        
        if (task.type === 'email') {
          console.log(`[Cron:Tasks] Sending automated email for task ${task._id}`);
          sendResult = await sendCustomerEmail(lead, business, message, task.title);
        } else if (task.type === 'whatsapp') {
          console.log(`[Cron:Tasks] Sending automated WhatsApp for task ${task._id}`);
          sendResult = await sendAutoWhatsApp(lead, business, message);
        }
        
        if (sendResult.success) {
          task.status = 'completed';
          task.completedAt = new Date();
          task.notes = (task.notes || '') + `\n[AutoSuccess] Follow-up dispatched automatically via ${task.type} at ${new Date().toISOString()}`;
          await task.save();
          
          await Activity.create({
            leadId: lead._id,
            businessId: business._id,
            type: 'automation_executed',
            description: `Scheduled ${task.type} follow-up executed automatically: ${task.title}`,
            performedBy: business.ownerId,
            metadata: { 
                taskId: task._id, 
                channel: task.type,
                executionTime: new Date()
            }
          });
          
          // Sync with Lead status (Mark as contacted if still New)
          if (lead && lead.status === 'new') {
            lead.status = 'contacted';
            lead.lastContactedAt = new Date();
            await lead.save();

            await Activity.create({
              leadId: lead._id,
              businessId: business._id,
              type: 'status_change',
              description: `Status automatically updated to 'contacted' after autonomous follow-up task: ${task.title}`,
              performedBy: business.ownerId
            });
          }
          
          results.push({ taskId: task._id, status: 'success' });
        } else {
          console.error(`[Cron:Tasks] Delivery failed for task ${task._id}: ${sendResult.error}`);
          task.autoSendAttempts = (task.autoSendAttempts || 0) + 1;
          task.notes = (task.notes || '') + `\n[AutoErr] Attempt ${task.autoSendAttempts}/${MAX_SEND_ATTEMPTS} failed to send ${task.type}: ${sendResult.error || 'Unknown Error'}`;

          if (task.autoSendAttempts >= MAX_SEND_ATTEMPTS) {
            // Give up automating; leave the task pending for manual follow-up
            task.autoSend = false;
            task.notes += `\n[AutoErr] Max attempts reached — automation disabled, please follow up manually.`;
          }

          await task.save();
          results.push({ taskId: task._id, status: 'failed', error: sendResult.error });
        }
      } catch (err) {
        console.error(`[Cron:Tasks] Critical error processing task ${task._id}:`, err);
      }
    }
    
    return NextResponse.json({ 
        success: true, 
        timestamp: new Date().toISOString(),
        processed: dueTasks.length, 
        results 
    });
  } catch (error) {
    console.error('[Cron:Tasks] Global error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
