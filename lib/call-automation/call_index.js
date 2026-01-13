import callRoutes from './call_routes';

/**
 * Call Automation Module Entry Point
 */
export const CallAutomationModule = {
  routes: callRoutes,
  
  /**
   * Initialize module-specific configurations or listeners
   */
  init: () => {
    console.log('--- Call Automation Module Initialized ---');
    console.log('Status: ACTIVE');
    console.log('Route: /automation/call-integration');
    console.log('-----------------------------------------');
  }
};

export default CallAutomationModule;
