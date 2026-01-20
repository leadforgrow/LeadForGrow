import Agency from '@/models/Agency';
import AgencyUsage from '@/models/AgencyUsage';
import { resolveAgencyLimits } from './planResolver';

/**
 * Usage Reader
 * 
 * Safe queries for agency usage data.
 * 
 * RULES:
 * - Always returns current billing cycle usage
 * - Creates usage document if missing
 * - No mutations, read-only
 * 
 * ISOLATION: DB queries isolated to agency collections
 */

/**
 * Get current usage for an agency
 * @param {string} agencyId - Agency ID
 * @returns {Promise<object>} - Usage document
 */
export async function getCurrentUsage(agencyId) {
  if (!agencyId) {
    throw new Error('Agency ID is required');
  }
  
  // Get agency to determine billing cycle
  const agency = await Agency.findById(agencyId);
  if (!agency) {
    throw new Error('Agency not found');
  }
  
  const { year, month } = agency.getCurrentBillingMonth();
  
  // Get or create usage document for current month
  const usage = await AgencyUsage.getOrCreateForMonth(agencyId, year, month);
  
  return usage;
}

/**
 * Get usage summary with limits
 * @param {string} agencyId - Agency ID
 * @returns {Promise<object>} - Usage summary with limits
 */
export async function getUsageSummary(agencyId) {
  if (!agencyId) {
    throw new Error('Agency ID is required');
  }
  
  const agency = await Agency.findById(agencyId);
  if (!agency) {
    throw new Error('Agency not found');
  }
  
  const usage = await getCurrentUsage(agencyId);
  const limits = resolveAgencyLimits(agency);
  
  return {
    limits,
    usage: usage.usage,
    billingPeriod: {
      year: usage.billingYear,
      month: usage.billingMonth
    },
    remaining: {
      clients: Math.max(0, limits.maxClients - usage.usage.clientsUsed),
      teamSeats: Math.max(0, limits.maxTeamSeats - usage.usage.teamSeatsUsed),
      leads: Math.max(0, limits.maxLeadsPerMonth - usage.usage.leadsUsed)
    }
  };
}

/**
 * Get usage history for an agency
 * @param {string} agencyId - Agency ID
 * @param {number} months - Number of months to retrieve (default: 6)
 * @returns {Promise<Array>} - Array of usage documents
 */
export async function getUsageHistory(agencyId, months = 6) {
  if (!agencyId) {
    throw new Error('Agency ID is required');
  }
  
  const usageHistory = await AgencyUsage.find({ agencyId })
    .sort({ billingYear: -1, billingMonth: -1 })
    .limit(months);
  
  return usageHistory;
}

/**
 * Check if usage needs reset (new billing cycle)
 * @param {string} agencyId - Agency ID
 * @returns {Promise<boolean>} - True if reset needed
 */
export async function needsUsageReset(agencyId) {
  if (!agencyId) {
    throw new Error('Agency ID is required');
  }
  
  const agency = await Agency.findById(agencyId);
  if (!agency) {
    throw new Error('Agency not found');
  }
  
  const { year, month } = agency.getCurrentBillingMonth();
  
  const currentUsage = await AgencyUsage.findOne({
    agencyId,
    billingYear: year,
    billingMonth: month
  });
  
  // If no usage document exists for current month, reset is needed
  return !currentUsage;
}
