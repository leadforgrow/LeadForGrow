import Business from '@/models/Business';

export async function getAiSettings(businessId) {
  const business = await Business.findById(businessId).select('settings.ai businessName').lean();
  return {
    ...(business?.settings?.ai || {}),
    businessName: business?.businessName,
  };
}

export async function updateAiSettings(businessId, updates) {
  const allowed = [
    'enabled', 'tone', 'personality', 'languages', 'customInstructions',
    'confidenceThreshold', 'handoffEnabled', 'handoffKeywords', 'workingHoursOnly',
    'escalationRules', 'model', 'agentEnabled', 'replyAssistEnabled',
  ];
  const patch = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) patch[`settings.ai.${key}`] = updates[key];
  }
  const business = await Business.findByIdAndUpdate(businessId, { $set: patch }, { new: true });
  return business?.settings?.ai;
}

export default { getAiSettings, updateAiSettings };
