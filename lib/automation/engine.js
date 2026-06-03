/**
 * Unified automation engine — single entry point.
 * Re-exports the production engine and provides backward-compatible aliases.
 */
export { automationEngine } from '../automationEngine';

import { automationEngine as engine } from '../automationEngine';

/** @deprecated Use automationEngine.processLeadTrigger */
export async function triggerForNewLead(lead, businessId) {
  const Lead = (await import('@/models/automation/Lead')).default;
  const fullLead = lead.businessId ? lead : await Lead.findById(lead._id || lead);
  if (!fullLead) return;
  return engine.processLeadTrigger(fullLead, 'onLeadReceived');
}

export default engine;
