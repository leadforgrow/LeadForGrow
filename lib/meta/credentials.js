import { decrypt } from '@/lib/encryption';

function resolveSecret(value) {
  if (!value) return null;
  if (typeof value === 'string' && value.includes(':')) {
    try {
      return decrypt(value);
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * Resolve Meta Lead Ads credentials from Integration record (preferred) or Business legacy fields.
 */
export async function resolveMetaAdsCredentials(business) {
  const Integration = (await import('@/models/Integration')).default;
  const { decryptCredentials } = await import('@/lib/integrations/credentials');

  const integration = await Integration.findOne({
    businessId: business._id,
    integrationId: 'meta-ads',
    status: 'connected'
  });

  if (integration?.credentials) {
    const decrypted = decryptCredentials('meta-ads', integration.credentials);
    return {
      pageId: decrypted.pageId,
      accessToken: decrypted.accessToken,
      verifyToken: decrypted.verifyToken,
      appSecret: decrypted.appSecret,
      appId: decrypted.appId,
      source: 'integration'
    };
  }

  const legacy = business.integrationCredentials?.facebookAds || {};
  return {
    pageId: legacy.pageId,
    accessToken: resolveSecret(legacy.accessToken),
    verifyToken: resolveSecret(legacy.verifyToken),
    appSecret: resolveSecret(legacy.appSecret),
    appId: legacy.appId,
    source: 'business_legacy'
  };
}
