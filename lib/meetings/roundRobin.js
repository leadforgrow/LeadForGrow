import mongoose from 'mongoose';
import MeetingBooking from '@/models/meetings/MeetingBooking';
import TeamMember from '@/models/automation/TeamMember';

/**
 * Assign next available host using round-robin, priority, or fixed owner.
 */
export async function assignHost({ meetingType, businessId, leadScore = 0 }) {
  const mode = meetingType.assignmentMode || 'round_robin';
  const hostIds =
    meetingType.hostIds?.length > 0
      ? meetingType.hostIds.map(String)
      : [String(meetingType.ownerId)];

  if (mode === 'fixed') {
    return meetingType.ownerId;
  }

  const activeMembers = await TeamMember.find({
    businessId,
    active: true,
    userId: { $in: hostIds },
  }).lean();

  const eligibleIds = activeMembers.length
    ? activeMembers.map((m) => String(m.userId))
    : hostIds;

  if (mode === 'priority' && meetingType.priorityHostIds?.length) {
    const priority = meetingType.priorityHostIds.map(String);
    for (const pid of priority) {
      if (eligibleIds.includes(pid)) {
        const available = await isHostAvailable(pid, businessId, meetingType);
        if (available) return pid;
      }
    }
  }

  if (mode === 'lead_score' && leadScore >= 70 && meetingType.priorityHostIds?.length) {
    const top = String(meetingType.priorityHostIds[0]);
    if (eligibleIds.includes(top)) return top;
  }

  const hostObjectIds = eligibleIds.map((id) => new mongoose.Types.ObjectId(id));
  const counts = await MeetingBooking.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(String(meetingType.businessId)),
        assignedTo: { $in: hostObjectIds },
        status: { $in: ['scheduled', 'confirmed'] },
        startTime: { $gte: new Date() },
      },
    },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [String(c._id), c.count])
  );

  let selected = eligibleIds[0];
  let minCount = Infinity;

  for (const id of eligibleIds) {
    const c = countMap[id] || 0;
    if (c < minCount) {
      minCount = c;
      selected = id;
    }
  }

  return selected;
}

async function isHostAvailable(userId, businessId, meetingType) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const count = await MeetingBooking.countDocuments({
    businessId,
    assignedTo: userId,
    startTime: { $gte: todayStart, $lte: todayEnd },
    status: { $in: ['scheduled', 'confirmed'] },
  });

  const limit = meetingType.availabilityRules?.dailyLimit || 0;
  if (limit > 0 && count >= limit) return false;
  return true;
}
