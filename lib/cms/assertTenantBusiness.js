import CMS_Client from '@/models/cms/Client';

/**
 * Ensures CMS legacy routes only access the authenticated user's business.
 */
export function getTenantBusinessId(tenant) {
  return tenant.business._id.toString();
}

export function assertTenantBusinessId(tenant, businessId) {
  const tenantId = getTenantBusinessId(tenant);
  const requested = businessId?.toString();
  if (requested && requested !== tenantId) {
    return { error: 'Access denied: businessId does not match your workspace', status: 403 };
  }
  return null;
}

/** When querying by clientId, verify the client belongs to this tenant. */
export async function assertClientInTenant(clientId, tenant) {
  if (!clientId) return null;
  const businessId = getTenantBusinessId(tenant);
  const client = await CMS_Client.findOne({ _id: clientId, businessId }).select('_id').lean();
  if (!client) {
    return { error: 'Client not found or access denied', status: 404 };
  }
  return null;
}
