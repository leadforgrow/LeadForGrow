import { callController } from './call_controller';

/**
 * Call Automation - Internal Route Mappings
 * Bridged to Next.js API routes (/app/api/automation/call-integration/route.js)
 */
export const callRoutes = {
  handleWebhook: callController.handleWebhook,
  handleCompletion: callController.handleCallbackCompletion
};

export default callRoutes;
