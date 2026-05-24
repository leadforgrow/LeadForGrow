import Integration from '@/models/Integration';
import Business from '@/models/Business';
import { getCatalogEntry } from './catalog';
import { encryptCredentials } from './credentials';

/**
 * One-time migration from Business.integrationCredentials → Integration documents.
 */
export async function migrateLegacyCredentials(businessId) {
  const business = await Business.findById(businessId);
  if (!business?.integrationCredentials) return;

  const creds = business.integrationCredentials;

  // WhatsApp Meta
  if (creds.whatsapp?.enabled && creds.whatsapp.provider !== 'interakt') {
    await upsertFromLegacy(businessId, 'whatsapp-cloud', {
      accessToken: creds.whatsapp.apiKey,
      phoneNumberId: creds.whatsapp.phoneNumberId,
      businessAccountId: creds.whatsapp.businessAccountId,
      appSecret: creds.whatsapp.appSecret,
      verifyToken: creds.whatsapp.verifyToken,
      appId: creds.whatsapp.appId || ''
    }, creds.whatsapp.lastVerified);
  }

  // WhatsApp Interakt
  if (creds.whatsapp?.enabled && creds.whatsapp.provider === 'interakt') {
    await upsertFromLegacy(businessId, 'interakt', {
      apiKey: creds.whatsapp.interaktApiKey,
      workspaceId: creds.whatsapp.workspaceId || '',
      whatsappNumber: creds.whatsapp.phoneNumberId || ''
    }, creds.whatsapp.lastVerified);
  }

  // Meta Ads / Facebook
  if (creds.facebookAds?.enabled) {
    await upsertFromLegacy(businessId, 'meta-ads', {
      accessToken: creds.facebookAds.accessToken,
      pageId: creds.facebookAds.pageId,
      verifyToken: creds.facebookAds.verifyToken,
      appId: creds.facebookAds.appId || '',
      appSecret: creds.facebookAds.appSecret || '',
      adAccountId: creds.facebookAds.adAccountId || ''
    }, creds.facebookAds.lastVerified);
  }
}

async function upsertFromLegacy(businessId, integrationId, rawCredentials, lastVerified) {
  const existing = await Integration.findOne({ businessId, integrationId });
  if (existing) return;

  const entry = getCatalogEntry(integrationId);
  if (!entry) return;

  const encrypted = encryptCredentials(integrationId, rawCredentials);

  await Integration.create({
    businessId,
    integrationId,
    status: 'connected',
    health: 'healthy',
    credentials: encrypted,
    connectedAt: lastVerified || new Date(),
    lastTestedAt: lastVerified,
    lastTestResult: { success: true, message: 'Migrated from legacy credentials' },
    config: { syncEnabled: true, webhookEnabled: true }
  });
}
