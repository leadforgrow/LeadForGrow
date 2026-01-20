import Agency from '@/models/Agency';
import Client from '@/models/Client';
import { isAgencyPlan } from './planResolver';

/**
 * Agency Guards
 * 
 * Authorization and validation helpers.
 * 
 * RULES:
 * - Verify agency ownership
 * - Verify client ownership
 * - Prevent cross-agency access
 * 
 * ISOLATION: Pure authorization logic
 */

/**
 * Check if user is an agency owner
 * @param {string} userId - User ID
 * @param {string} planName - User's plan name
 * @returns {boolean} - True if user is agency owner
 */
export function isAgencyOwner(userId, planName) {
  if (!userId || !planName) {
    return false;
  }
  
  return isAgencyPlan(planName);
}

/**
 * Get agency for user (if exists)
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - Agency document or null
 */
export async function getAgencyForUser(userId) {
  if (!userId) {
    return null;
  }
  
  const agency = await Agency.findOne({ ownerId: userId, status: 'active' });
  return agency;
}

/**
 * Verify agency ownership
 * @param {string} agencyId - Agency ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if user owns agency
 */
export async function verifyAgencyOwnership(agencyId, userId) {
  if (!agencyId || !userId) {
    return false;
  }
  
  const agency = await Agency.findOne({ _id: agencyId, ownerId: userId });
  return !!agency;
}

/**
 * Verify client belongs to agency
 * @param {string} clientId - Client ID
 * @param {string} agencyId - Agency ID
 * @returns {Promise<boolean>} - True if client belongs to agency
 */
export async function verifyClientOwnership(clientId, agencyId) {
  if (!clientId || !agencyId) {
    return false;
  }
  
  const client = await Client.findOne({ _id: clientId, agencyId });
  return !!client;
}

/**
 * Verify user has access to client (via agency)
 * @param {string} clientId - Client ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if user has access
 */
export async function verifyClientAccess(clientId, userId) {
  if (!clientId || !userId) {
    return false;
  }
  
  const agency = await getAgencyForUser(userId);
  if (!agency) {
    return false;
  }
  
  return await verifyClientOwnership(clientId, agency._id.toString());
}

/**
 * Get agency with ownership check
 * @param {string} agencyId - Agency ID
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - Agency document or null
 * @throws {Error} - If ownership verification fails
 */
export async function getAgencyWithOwnershipCheck(agencyId, userId) {
  if (!agencyId || !userId) {
    throw new Error('Agency ID and User ID are required');
  }
  
  const agency = await Agency.findById(agencyId);
  
  if (!agency) {
    throw new Error('Agency not found');
  }
  
  if (agency.ownerId.toString() !== userId) {
    throw new Error('Unauthorized: You do not own this agency');
  }
  
  return agency;
}

/**
 * Get client with ownership check
 * @param {string} clientId - Client ID
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - Client document or null
 * @throws {Error} - If ownership verification fails
 */
export async function getClientWithOwnershipCheck(clientId, userId) {
  if (!clientId || !userId) {
    throw new Error('Client ID and User ID are required');
  }
  
  const client = await Client.findById(clientId).populate('agencyId');
  
  if (!client) {
    throw new Error('Client not found');
  }
  
  if (!client.agencyId || client.agencyId.ownerId.toString() !== userId) {
    throw new Error('Unauthorized: You do not have access to this client');
  }
  
  return client;
}

/**
 * Require agency plan
 * @param {string} planName - User's plan name
 * @throws {Error} - If not an agency plan
 */
export function requireAgencyPlan(planName) {
  if (!isAgencyPlan(planName)) {
    throw new Error('This feature requires an Agency plan');
  }
}
