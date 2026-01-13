/**
 * Call Automation Module - Usage Limits Configuration
 * These are the default limits applied if no business-specific limits are found.
 */
export const callLimits = {
  // Monthly defaults
  DEFAULT_MAX_CALLBACKS_PER_MONTH: 50,
  DEFAULT_MAX_TOTAL_SECONDS_PER_MONTH: 3000, // 50 mins
  
  // Per-call constraints
  MAX_SECONDS_PER_CALLBACK: 60,
  MIN_CALLBACK_DELAY_SECONDS: 30,
  
  // Script constraints
  AI_SCRIPT_MAX_DURATION_SECONDS: 60,
  AI_SCRIPT_SILENCE_TIMEOUT_SECONDS: 5
};
