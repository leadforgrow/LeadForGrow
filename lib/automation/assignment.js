import mongoose from 'mongoose';
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import User from '@/models/User';

/**
 * Assign a lead using business assignment strategy (round-robin, least-busy, solo).
 */
export async function assignLead(lead, business, strategyOverride) {
  const strategy = strategyOverride || business.settings?.assignmentStrategy || 'solo';
  const businessId = business._id;
  const targetBizId = typeof businessId === 'string' ? new mongoose.Types.ObjectId(businessId) : businessId;

  let assignedTo = business.ownerId;

  if (strategy === 'solo' || strategy === 'solo_owner') {
    assignedTo = business.ownerId;
  } else if (strategy === 'round-robin' || strategy === 'round_robin') {
    const teamMembers = await User.find({
      businessId: targetBizId,
      active: { $ne: false },
    }).sort({ lastActivityAt: 1, _id: 1 });

    if (teamMembers.length === 0) {
      assignedTo = business.ownerId;
    } else {
      assignedTo = teamMembers[0]._id;
      await User.findByIdAndUpdate(assignedTo, { $set: { lastActivityAt: new Date() } });
    }
  } else if (strategy === 'least-busy' || strategy === 'load_balanced') {
    const teamMembers = await User.find({ businessId: targetBizId, active: { $ne: false } });
    if (teamMembers.length === 0) {
      assignedTo = business.ownerId;
    } else {
      let minCount = Infinity;
      for (const member of teamMembers) {
        const count = await Lead.countDocuments({
          businessId: targetBizId,
          assignedTo: member._id,
          status: { $in: ['new', 'follow-up', 'contacted'] },
        });
        if (count < minCount) {
          minCount = count;
          assignedTo = member._id;
        }
      }
    }
  }

  await Lead.updateOne(
    { _id: lead._id },
    { $set: { assignedTo, 'metadata.autoAssigned': true, 'metadata.assignmentStrategy': strategy } }
  );

  return assignedTo;
}

export default { assignLead };
