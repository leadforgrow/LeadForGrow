/**
 * Limit Checker
 * 
 * Validates actions against agency plan limits.
 * 
 * RULES:
 * - All limits read from DB
 * - Usage checked atomically
 * - Returns structured errors
 * - No silent failures
 * 
 * ISOLATION: Pure validation logic, DB queries done by caller
 */

/**
 * Check if client creation is allowed
 * @param {object} limits - Agency limits from DB
 * @param {object} usage - Current usage from DB
 * @returns {object} - { allowed: boolean, reason: string|null }
 */
export function canCreateClient(limits, usage) {
  if (!limits || !usage) {
    return {
      allowed: false,
      reason: 'Missing limits or usage data'
    };
  }
  
  const currentClients = usage.usage?.clientsUsed || 0;
  const maxClients = limits.maxClients || 0;
  
  if (currentClients >= maxClients) {
    return {
      allowed: false,
      reason: `Client limit reached (${currentClients}/${maxClients}). Upgrade your plan to add more clients.`,
      code: 'CLIENT_LIMIT_EXCEEDED',
      current: currentClients,
      max: maxClients
    };
  }
  
  return {
    allowed: true,
    reason: null
  };
}

/**
 * Check if team member addition is allowed
 * @param {object} limits - Agency limits from DB
 * @param {object} usage - Current usage from DB
 * @returns {object} - { allowed: boolean, reason: string|null }
 */
export function canAddTeamMember(limits, usage) {
  if (!limits || !usage) {
    return {
      allowed: false,
      reason: 'Missing limits or usage data'
    };
  }
  
  const currentSeats = usage.usage?.teamSeatsUsed || 0;
  const maxSeats = limits.maxTeamSeats || 0;
  
  if (currentSeats >= maxSeats) {
    return {
      allowed: false,
      reason: `Team seat limit reached (${currentSeats}/${maxSeats}). Upgrade your plan to add more team members.`,
      code: 'TEAM_LIMIT_EXCEEDED',
      current: currentSeats,
      max: maxSeats
    };
  }
  
  return {
    allowed: true,
    reason: null
  };
}

/**
 * Check if lead ingestion is allowed
 * @param {object} limits - Agency limits from DB
 * @param {object} usage - Current usage from DB
 * @param {number} count - Number of leads to add (default: 1)
 * @returns {object} - { allowed: boolean, reason: string|null }
 */
export function canIngestLeads(limits, usage, count = 1) {
  if (!limits || !usage) {
    return {
      allowed: false,
      reason: 'Missing limits or usage data'
    };
  }
  
  const currentLeads = usage.usage?.leadsUsed || 0;
  const maxLeads = limits.maxLeadsPerMonth || 0;
  
  if (currentLeads + count > maxLeads) {
    return {
      allowed: false,
      reason: `Monthly lead limit reached (${currentLeads}/${maxLeads}). Upgrade your plan or wait for next billing cycle.`,
      code: 'LEAD_LIMIT_EXCEEDED',
      current: currentLeads,
      max: maxLeads,
      requested: count
    };
  }
  
  return {
    allowed: true,
    reason: null
  };
}

/**
 * Calculate remaining capacity
 * @param {object} limits - Agency limits from DB
 * @param {object} usage - Current usage from DB
 * @returns {object} - Remaining capacity for each resource
 */
export function calculateRemainingCapacity(limits, usage) {
  if (!limits || !usage) {
    return {
      clients: 0,
      teamSeats: 0,
      leads: 0
    };
  }
  
  return {
    clients: Math.max(0, limits.maxClients - (usage.usage?.clientsUsed || 0)),
    teamSeats: Math.max(0, limits.maxTeamSeats - (usage.usage?.teamSeatsUsed || 0)),
    leads: Math.max(0, limits.maxLeadsPerMonth - (usage.usage?.leadsUsed || 0))
  };
}

/**
 * Calculate usage percentage
 * @param {object} limits - Agency limits from DB
 * @param {object} usage - Current usage from DB
 * @returns {object} - Usage percentages
 */
export function calculateUsagePercentage(limits, usage) {
  if (!limits || !usage) {
    return {
      clients: 0,
      teamSeats: 0,
      leads: 0
    };
  }
  
  const safePercentage = (used, max) => {
    if (!max || max === 0) return 0;
    return Math.min(100, Math.round((used / max) * 100));
  };
  
  return {
    clients: safePercentage(usage.usage?.clientsUsed || 0, limits.maxClients),
    teamSeats: safePercentage(usage.usage?.teamSeatsUsed || 0, limits.maxTeamSeats),
    leads: safePercentage(usage.usage?.leadsUsed || 0, limits.maxLeadsPerMonth)
  };
}
