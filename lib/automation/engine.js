/**
 * Unified automation engine — single entry point.
 * Re-exports the production engine and provides backward-compatible aliases.
 */
import { automationEngine as engine } from '../automationEngine';

export { automationEngine } from '../automationEngine';

/** @deprecated Use automationEngine.processLeadTrigger */
export async function triggerForNewLead(lead, businessId) {
  const Lead = (await import('@/models/automation/Lead')).default;
  const fullLead = lead.businessId ? lead : await Lead.findById(lead._id || lead);
  if (!fullLead) return;
  return engine.processLeadTrigger(fullLead, 'onLeadReceived');
}

// Attach alias so leadManager can call automationEngine.triggerForNewLead(...)
engine.triggerForNewLead = triggerForNewLead;

export default engine;
