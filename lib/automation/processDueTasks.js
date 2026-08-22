import { dbConnect } from "@/lib/mongodb";
import Task from "@/models/automation/Task";
import Business from "@/models/Business";
import Activity from "@/models/automation/Activity";
import { sendCustomerEmail } from "@/lib/integrations/email";
import { sendAutoWhatsApp } from "@/lib/integrations/whatsapp";

/**
 * Find due, autoSend-enabled tasks and dispatch them (email/WhatsApp).
 * Shared by the HTTP cron route (for externally-scheduled platforms like Vercel)
 * and the standalone worker process (which self-schedules via setInterval so
 * this runs even on deployments with no external cron configured).
 */
export async function processDueTasks() {
  await dbConnect();
  const now = new Date();
  const MAX_BATCH = 200;
  const MAX_SEND_ATTEMPTS = 5;

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
      let actualChannel = task.type;

      if (task.type === 'email') {
        sendResult = await sendCustomerEmail(lead, business, message, task.title);
      } else if (task.type === 'whatsapp') {
        sendResult = await sendAutoWhatsApp(lead, business, message);

        // A delayed follow-up almost always targets a lead who's gone quiet —
        // which means Meta's 24h customer-care window is closed and free-form
        // WhatsApp text is guaranteed to fail (not flaky, deterministic). Rather
        // than silently give up after 5 attempts, fall back to email once so
        // the message still reaches the lead somehow.
        const windowClosed = !sendResult.success && /24h window closed/i.test(sendResult.error || '');
        if (windowClosed && lead.email) {
          const emailResult = await sendCustomerEmail(lead, business, message, task.title);
          if (emailResult.success) {
            sendResult = emailResult;
            actualChannel = 'email';
          }
        }
      }

      if (sendResult.success) {
        task.status = 'completed';
        task.completedAt = new Date();
        task.notes = (task.notes || '') + `\n[AutoSuccess] Follow-up dispatched automatically via ${actualChannel} at ${new Date().toISOString()}`
          + (actualChannel !== task.type ? ` (fell back from ${task.type} — WhatsApp 24h window was closed)` : '');
        await task.save();

        await Activity.create({
          leadId: lead._id,
          businessId: business._id,
          type: 'automation_executed',
          description: `Scheduled ${task.type} follow-up executed automatically`
            + (actualChannel !== task.type ? ` via ${actualChannel} (WhatsApp window closed)` : ''),
          performedBy: business.ownerId,
          metadata: {
            taskId: task._id,
            channel: actualChannel,
            executionTime: new Date()
          }
        });

        if (lead.status === 'new') {
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
        task.autoSendAttempts = (task.autoSendAttempts || 0) + 1;
        task.notes = (task.notes || '') + `\n[AutoErr] Attempt ${task.autoSendAttempts}/${MAX_SEND_ATTEMPTS} failed to send ${task.type}: ${sendResult.error || 'Unknown Error'}`;

        if (task.autoSendAttempts >= MAX_SEND_ATTEMPTS) {
          task.autoSend = false;
          task.notes += `\n[AutoErr] Max attempts reached — automation disabled, please follow up manually.`;
        }

        await task.save();
        results.push({ taskId: task._id, status: 'failed', error: sendResult.error });
      }
    } catch (err) {
      console.error(`[ProcessDueTasks] Critical error processing task ${task._id}:`, err);
    }
  }

  return { processed: dueTasks.length, results };
}

export default { processDueTasks };
