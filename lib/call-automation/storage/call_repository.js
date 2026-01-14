import { dbConnect } from '@/lib/mongodb';
import CallMissed from '@/lib/call-automation/domain/call_missed.entity';
import CallCallback from '@/lib/call-automation/domain/call_callback.entity';
import CallUsage from '@/lib/call-automation/domain/call_usage.entity';
import Business from '@/models/Business'; // Import main Business model

export const callRepository = {
  // Missed Calls
  createMissedCall: async (data) => {
    await dbConnect();
    const result = await CallMissed.create(data);
    console.log(`[DB] Created CallMissed: ${result._id}`);
    return result;
  },
  
  findMissedCallById: async (id) => {
    await dbConnect();
    return await CallMissed.findById(id);
  },
  
  updateMissedCallStatus: async (id, status) => {
    await dbConnect();
    const result = await CallMissed.findByIdAndUpdate(id, { status }, { new: true });
    console.log(`[DB] Updated CallMissed ${id} status to: ${status}`);
    return result;
  },

  getRecentMissedCalls: async (businessId, limit = 10, businessNumber = null) => {
    await dbConnect();
    const query = { businessId, status: 'missed' };
    if (businessNumber) {
      query.businessNumber = businessNumber;
    }
    return await CallMissed.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  deleteMissedCall: async (id) => {
    await dbConnect();
    return await CallMissed.findByIdAndDelete(id);
  },

  // Callbacks
  createCallback: async (data) => {
    await dbConnect();
    const result = await CallCallback.create(data);
    console.log(`[DB] Created CallCallback: ${result._id}`);
    return result;
  },
  
  getCallbackByMissedCallId: async (missedCallId) => {
    await dbConnect();
    return await CallCallback.findOne({ missedCallId });
  },
  
  // Usage
  getUsage: async (businessId, month) => {
    await dbConnect();
    return await CallUsage.findOne({ businessId, month });
  },
  
  connectPhone: async (businessId, month, phone) => {
    await dbConnect();
    const result = await CallUsage.findOneAndUpdate(
      { businessId, month },
      { connectedPhone: phone },
      { upsert: true, new: true }
    );
    console.log(`[DB] Connected phone ${phone} for business ${businessId}`);
    return result;
  },
  
  incrementUsage: async (businessId, month, secondsUsed) => {
    await dbConnect();
    const result = await CallUsage.findOneAndUpdate(
      { businessId, month },
      { 
        $inc: { callbacksUsed: 1, secondsUsed },
        $setOnInsert: { businessId, month }
      },
      { upsert: true, new: true }
    );
    console.log(`[DB] Incremented usage for business ${businessId}: +1 callback, +${secondsUsed}s`);
    return result;
  },
  
  setLimitReached: async (businessId, month, Reached) => {
    await dbConnect();
    const result = await CallUsage.findOneAndUpdate(
      { businessId, month },
      { limitReached: Reached },
      { new: true }
    );
    console.log(`[DB] Set limit reached for business ${businessId}: ${Reached}`);
    return result;
  },

  // Configuration
  getBusinessSettings: async (businessId) => {
    await dbConnect();
    const business = await Business.findById(businessId).select('settings.callAutomation');
    return business?.settings?.callAutomation || {};
  },

  updateBusinessSettings: async (businessId, settings) => {
    await dbConnect();
    const business = await Business.findByIdAndUpdate(
      businessId,
      { $set: { 'settings.callAutomation': settings } },
      { new: true }
    ).select('settings.callAutomation');
    console.log(`[DB] Updated settings for business ${businessId}`);
    return business?.settings?.callAutomation;
  }
};
