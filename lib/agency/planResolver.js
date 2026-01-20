/**
 * Plan Resolver
 * 
 * Detects if a user is an agency and extracts plan limits.
 * 
 * RULES:
 * - Any plan name containing "agency" (case-insensitive) = agency user
 * - Limits are read from Agency document, never inferred
 * - No hardcoded plan names or limits
 * 
 * ISOLATION: Pure function, no DB calls, no side effects
 */

/**
 * Check if a plan name indicates an agency plan
 * @param {string} planName - The plan name to check
 * @returns {boolean} - True if agency plan
 */
export function isAgencyPlan(planName) {
  if (!planName || typeof planName !== 'string') {
    return false;
  }
  
  return planName.toLowerCase().includes('agency');
}

/**
 * Extract plan tier from plan name
 * @param {string} planName - The plan name
 * @returns {string|null} - Plan tier (starter, growth, pro) or null
 */
export function extractPlanTier(planName) {
  if (!planName || typeof planName !== 'string') {
    return null;
  }
  
  const normalized = planName.toLowerCase();
  
  if (normalized.includes('starter')) return 'starter';
  if (normalized.includes('growth')) return 'growth';
  if (normalized.includes('pro')) return 'pro';
  
  return null;
}

/**
 * Get default limits based on plan tier
 * These are ONLY used during agency creation, never for enforcement
 * @param {string} tier - Plan tier (starter, growth, pro)
 * @returns {object} - Default limits
 */
export function getDefaultLimitsForTier(tier) {
  const defaults = {
    starter: {
      maxClients: 5,
      maxTeamSeats: 5,
      maxLeadsPerMonth: 1000
    },
    growth: {
      maxClients: 20,
      maxTeamSeats: 20,
      maxLeadsPerMonth: 5000
    },
    pro: {
      maxClients: 40,
      maxTeamSeats: 40,
      maxLeadsPerMonth: 10000
    }
  };
  
  return defaults[tier] || defaults.starter;
}

/**
 * Resolve agency limits from agency document
 * @param {object} agency - Agency document from DB
 * @returns {object} - Limits object
 */
export function resolveAgencyLimits(agency) {
  if (!agency || !agency.limits) {
    throw new Error('Invalid agency document');
  }
  
  return {
    maxClients: agency.limits.maxClients || 0,
    maxTeamSeats: agency.limits.maxTeamSeats || 0,
    maxLeadsPerMonth: agency.limits.maxLeadsPerMonth || 0
  };
}
