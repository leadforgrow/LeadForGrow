import { decrypt } from '@/lib/encryption';
import { metaLog, metaWarn } from '@/lib/meta/logger';

function resolveSecret(value) {
  if (!value) return null;
  if (typeof value === 'string' && value.includes(':')) {
    try {
      return decrypt(value);
    } catch (e) {
      metaWarn('Credentials', 'Failed to decrypt secret field', e.message);
      return value;
    }
  }
  return value;
}

/**
 * Resolve Meta Lead Ads credentials from Integration record (preferred) or Business legacy fields.
 */
export async function resolveMetaAdsCredentials(business) {
  metaLog('Credentials', `Resolving Meta Ads credentials for business ${business._id}`);

  const Integration = (await import('@/models/Integration')).default;
  const { decryptCredentials } = await import('@/lib/integrations/credentials');

  const integration = await Integration.findOne({
    businessId: business._id,
    integrationId: 'meta-ads',
    status: 'connected'
  });

  if (integration?.credentials) {
    const decrypted = decryptCredentials('meta-ads', integration.credentials);
    metaLog('Credentials', 'Loaded from Integration record', {
      source: 'integration',
      pageId: decrypted.pageId,
      appId: decrypted.appId,
      hasAccessToken: Boolean(decrypted.accessToken),
      hasAppSecret: Boolean(decrypted.appSecret),
      hasVerifyToken: Boolean(decrypted.verifyToken)
    });
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
  metaLog('Credentials', 'Loaded from Business legacy fields', {
    source: 'business_legacy',
    pageId: legacy.pageId,
    appId: legacy.appId,
    enabled: legacy.enabled,
    hasAccessToken: Boolean(legacy.accessToken),
    hasAppSecret: Boolean(legacy.appSecret),
    hasVerifyToken: Boolean(legacy.verifyToken)
  });

  if (!legacy.pageId && !legacy.accessToken) {
    metaWarn('Credentials', 'No Meta Ads credentials found in Integration or Business');
  }

  return {
    pageId: legacy.pageId,
    accessToken: resolveSecret(legacy.accessToken),
    verifyToken: resolveSecret(legacy.verifyToken),
    appSecret: resolveSecret(legacy.appSecret),
    appId: legacy.appId,
    source: 'business_legacy'
  };
}
