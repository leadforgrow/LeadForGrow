import Lead from '@/models/automation/Lead';
import Message from '@/models/automation/Message';
import Task from '@/models/automation/Task';
import MeetingBooking from '@/models/meetings/MeetingBooking';
import { generateSummary } from '@/lib/ai/summarize';
import { getLeadMemory } from '@/lib/ai/memory';
import { qualifyLead } from '@/lib/ai/qualify';

export async function prepareMeetingBriefing({ businessId, businessName, leadId, meetingId }) {
  const [lead, messages, memories, meeting] = await Promise.all([
    Lead.findOne({ _id: leadId, businessId }).lean(),
    Message.find({ businessId, leadId }).sort({ timestamp: -1 }).limit(30).lean(),
    getLeadMemory(businessId, leadId),
    meetingId ? MeetingBooking.findById(meetingId).lean() : null,
  ]);

  const qualification = lead ? await qualifyLead({ lead, messages, notes: lead.notes }) : null;

  const content = [
    `Lead: ${lead?.name} (${lead?.phone || lead?.email})`,
    `Status: ${lead?.status}, Source: ${lead?.source}`,
    `Qualification: ${qualification?.temperature} — ${qualification?.summary}`,
    `Meeting: ${meeting?.title || 'Scheduled call'} at ${meeting?.startTime || 'TBD'}`,
    `Memory:\n${memories.map((m) => `- ${m.value}`).join('\n')}`,
    `Recent messages:\n${messages.slice(0, 10).map((m) => `${m.direction}: ${m.content?.body}`).join('\n')}`,
  ].join('\n\n');

  const briefing = await generateSummary({
    businessId,
    businessName,
    type: 'meeting',
    content: `Prepare a sales briefing for the upcoming meeting.\n\n${content}`,
    entityType: 'meeting',
    entityId: meetingId,
    persist: true,
  });

  return { briefing: briefing.summary, qualification, lead, meeting };
}

export async function processMeetingAfter({ businessId, businessName, leadId, meetingId, notes = '' }) {
  const content = notes || 'Meeting completed.';
  const summary = await generateSummary({
    businessId,
    businessName,
    type: 'meeting',
    content,
    entityType: 'meeting',
    entityId: meetingId,
    persist: true,
  });

  const tasks = [];
  if (leadId && summary.keyPoints?.length) {
    for (const point of summary.keyPoints.slice(0, 3)) {
      const task = await Task.create({
        businessId,
        leadId,
        title: point.replace(/^[-•]\s*/, '').slice(0, 120),
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 86400000),
        source: 'ai_meeting',
      });
      tasks.push(task);
    }
  }

  return { summary, tasks };
}

export default { prepareMeetingBriefing, processMeetingAfter };
