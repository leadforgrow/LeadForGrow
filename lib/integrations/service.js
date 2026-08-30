import Integration from '@/models/Integration';
import IntegrationLog from '@/models/IntegrationLog';
import Business from '@/models/Business';
import {
  INTEGRATION_CATALOG,
  getCatalogEntry,
  validateCredentials
} from './catalog';
import { encrypt } from '@/lib/encryption';
import {
  encryptCredentials,
  decryptCredentials,
  redactCredentials,
  mergeCredentialsForUpdate,
  buildWebhookUrl
} from './credentials';
import { testIntegration, syncIntegration } from './testers';
import { migrateLegacyCredentials } from './migrate';

function formatIntegrationForClient(catalogEntry, record, business, baseUrl) {
  const connected = record?.status === 'connected';
  const health = connected ? (record?.health || 'unknown') : 'disconnected';

  return {
    id: catalogEntry.id,
    name: catalogEntry.name,
    category: catalogEntry.category,
    description: catalogEntry.description,
    color: catalogEntry.color,
    initials: catalogEntry.initials,
    authType: catalogEntry.authType,
    oauthProvider: catalogEntry.oauthProvider || null,
    fields: catalogEntry.fields,
    features: catalogEntry.features || [],
    permissions: catalogEntry.features || [],
    connected,
    status: record?.status || 'disconnected',
    health,
    credentials: record ? redactCredentials(catalogEntry.id, record.credentials || {}) : {},
    config: record?.config || {
      syncEnabled: true,
      webhookEnabled: true,
      autoSync: false,
      syncIntervalMinutes: 60
    },
    oauth: record?.oauth
      ? {
          connectedEmail: record.oauth.connectedEmail,
          accountName: record.oauth.accountName,
          scopes: record.oauth.scopes,
          expiresAt: record.oauth.expiresAt
        }
      : null,
    sync: record?.sync || null,
    account: record?.accountInfo?.label || record?.oauth?.connectedEmail || null,
    accountInfo: record?.accountInfo || null,
    lastSynced: record?.sync?.lastSyncedAt || null,
    lastTestedAt: record?.lastTestedAt || null,
    lastTestResult: record?.lastTestResult || null,
    connectedAt: record?.connectedAt || null,
    webhookUrl: buildWebhookUrl(baseUrl, catalogEntry, business),
    webhookPath: catalogEntry.webhookPath || null,
    usesBusinessWebhookSecret: catalogEntry.usesBusinessWebhookSecret || false,
    recordId: record?._id?.toString() || null
  };
}

export async function listIntegrations(businessId, baseUrl) {
  await migrateLegacyCredentials(businessId);

  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');

  if (!business.webhookSecret) {
    business.generateWebhookSecret();
    await business.save();
  }

  const records = await Integration.find({ businessId });
  const recordMap = Object.fromEntries(records.map((r) => [r.integrationId, r]));

  const integrations = INTEGRATION_CATALOG.map((entry) =>
    formatIntegrationForClient(entry, recordMap[entry.id], business, baseUrl)
  );

  const stats = {
    total: integrations.length,
    connected: integrations.filter((i) => i.connected).length,
    healthy: integrations.filter((i) => i.health === 'healthy').length,
    needsAttention: integrations.filter((i) => ['warning', 'error'].includes(i.health)).length,
    disconnected: integrations.filter((i) => !i.connected).length
  };

  return { integrations, stats, categories: getCategories() };
}

export function getCategories() {
  const cats = new Set(INTEGRATION_CATALOG.map((i) => i.category));
  return [
    { id: 'all', label: 'All integrations' },
    ...Array.from(cats).map((c) => ({
      id: c,
      label: c.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    }))
  ];
}

export async function getIntegrationDetail(businessId, integrationId, baseUrl) {
  const entry = getCatalogEntry(integrationId);
  if (!entry) throw new Error('Unknown integration');

  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');

  const record = await Integration.findOne({ businessId, integrationId });
  return formatIntegrationForClient(entry, record, business, baseUrl);
}

async function writeLog(businessId, integrationId, action, status, message, metadata = {}, durationMs) {
  await IntegrationLog.create({
    businessId,
    integrationId,
    action,
    status,
    message,
    metadata,
    durationMs
  });
}

async function syncLegacyBusinessCredentials(business, integrationId, credentials, status, health) {
  const entry = getCatalogEntry(integrationId);
  if (!entry?.legacyKey) return;

  const decrypted = decryptCredentials(integrationId, credentials);

  if (entry.legacyKey === 'whatsapp') {
    const provider = entry.legacyProvider || 'meta';
    const whatsapp = {
      enabled: status === 'connected',
      provider,
      lastVerified: new Date()
    };

    if (provider === 'meta') {
      whatsapp.apiKey = decrypted.accessToken;
      whatsapp.phoneNumberId = decrypted.phoneNumberId;
      whatsapp.businessAccountId = decrypted.businessAccountId;
      whatsapp.appId = decrypted.appId;
      whatsapp.appSecret = decrypted.appSecret;
      whatsapp.verifyToken = decrypted.verifyToken;
    } else if (provider === 'interakt') {
      whatsapp.interaktApiKey = decrypted.apiKey;
      whatsapp.phoneNumberId = decrypted.whatsappNumber;
    }

    business.set('integrationCredentials.whatsapp', {
      ...(business.integrationCredentials?.whatsapp?.toObject?.() || business.integrationCredentials?.whatsapp || {}),
      ...whatsapp
    });
    business.set('integrationHealth.whatsapp', {
      status: health === 'healthy' ? 'healthy' : health === 'error' ? 'failing' : 'unknown',
      lastSuccessAt: status === 'connected' ? new Date() : business.integrationHealth?.whatsapp?.lastSuccessAt,
      lastError: health === 'error' ? 'Connection failed' : null
    });
    business.markModified('integrationCredentials');
    business.markModified('integrationHealth');
  }

  if (entry.legacyKey === 'email') {
    const provider = entry.legacyProvider || 'smtp';
    const host =
      decrypted.host && !String(decrypted.host).includes('titan')
        ? decrypted.host
        : 'smtp.hostinger.com';
    const port = Number(decrypted.port) || 465;

    const email = {
      enabled: status === 'connected',
      provider,
      host,
      port,
      username: decrypted.username,
      password: decrypted.password,
      fromEmail: decrypted.fromEmail || decrypted.username,
      fromName: decrypted.fromName || business.businessName || '',
      lastVerified: new Date(),
    };

    business.set('integrationCredentials.email', {
      ...(business.integrationCredentials?.email?.toObject?.() ||
        business.integrationCredentials?.email ||
        {}),
      ...email,
    });
    business.set('integrationHealth.email', {
      status:
        health === 'healthy' ? 'healthy' : health === 'error' ? 'failing' : 'unknown',
      lastSuccessAt:
        status === 'connected'
          ? new Date()
          : business.integrationHealth?.email?.lastSuccessAt,
      lastError: health === 'error' ? 'Connection failed' : null,
    });
    business.markModified('integrationCredentials');
    business.markModified('integrationHealth');
  }

  if (entry.legacyKey === 'facebookAds') {
    business.set('integrationCredentials.facebookAds', {
      ...(business.integrationCredentials?.facebookAds?.toObject?.() || business.integrationCredentials?.facebookAds || {}),
      enabled: status === 'connected',
      pageId: decrypted.pageId,
      accessToken: decrypted.accessToken,
      verifyToken: decrypted.verifyToken,
      appId: decrypted.appId,
      appSecret: decrypted.appSecret,
      adAccountId: decrypted.adAccountId,
      lastVerified: new Date()
    });
    business.markModified('integrationCredentials');
  }

  await business.save();
}

/**
 * Strip characters that browsers/node refuse to put in HTTP headers.
 * Meta / Interakt / all API credentials are ASCII by design; smart quotes,
 * ellipsis and other 8-bit chars sneak in when users paste from Notes,
 * WhatsApp, Google Docs, or auto-corrected sources — and then every downstream
 * fetch crashes with "Cannot convert argument to a ByteString".
 */
function toPlain(v) {
  if (!v) return {};
  if (typeof v.toObject === 'function') return v.toObject();
  return v;
}

function sanitizeCredentialsInput(creds) {
  const out = {};
  for (const [key, value] of Object.entries(creds || {})) {
    if (typeof value !== 'string') { out[key] = value; continue; }
    // Preserve the redaction placeholder (bullets) so mergeCredentialsForUpdate
    // downstream can correctly identify "keep existing secret" intent.
    if (value === '••••••••' || value.startsWith('••••')) { out[key] = value; continue; }
    // Trim + strip anything above ASCII 0x7E — Meta / Interakt / etc. credentials
    // are all printable ASCII; smart quotes and ellipsis break Fetch headers.
    out[key] = value.trim().replace(/[^\x20-\x7E]/g, '');
  }
  return out;
}

export async function connectIntegration(businessId, integrationId, payload, userId, baseUrl) {
  const entry = getCatalogEntry(integrationId);
  if (!entry) throw new Error('Unknown integration');

  const credentials = sanitizeCredentialsInput(payload.credentials || {});
  const { config = {}, testOnConnect = true } = payload;

  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');

  if (entry.usesBusinessWebhookSecret && !business.webhookSecret) {
    business.generateWebhookSecret();
    await business.save();
  }

  let record = await Integration.findOne({ businessId, integrationId });
  const existingCreds = record?.credentials || {};

  // Validate against the MERGED view — a field the user left blank is fine
  // as long as a previous save has stored a value for it.
  const mergedForValidation = { ...toPlain(existingCreds), ...credentials };
  const { valid, errors } = validateCredentials(integrationId, mergedForValidation);
  if (!valid) throw new Error(errors.join(', '));

  let encryptedCreds = mergeCredentialsForUpdate(integrationId, credentials, existingCreds);

  if (integrationId === 'meta-ads') {
    const decrypted = decryptCredentials(integrationId, encryptedCreds);
    const { resolveLongLivedPageToken } = await import('@/lib/meta/token');
    const appSecret = decrypted.appSecret?.includes(':') ? (await import('@/lib/encryption')).decrypt(decrypted.appSecret) : decrypted.appSecret;
    const resolved = await resolveLongLivedPageToken({
      accessToken: decrypted.accessToken?.includes(':') ? (await import('@/lib/encryption')).decrypt(decrypted.accessToken) : decrypted.accessToken,
      pageId: decrypted.pageId,
      appId: decrypted.appId,
      appSecret
    });
    if (resolved.exchanged && resolved.accessToken) {
      encryptedCreds = mergeCredentialsForUpdate(integrationId, { accessToken: resolved.accessToken }, encryptedCreds);
    }
  }

  if (!record) {
    record = new Integration({ businessId, integrationId });
  }

  record.credentials = encryptedCreds;
  record.config = { ...record.config?.toObject?.() || record.config || {}, ...config };
  record.connectedBy = userId;
  record.connectedAt = new Date();
  record.disconnectedAt = null;

  let testResult = { success: true, message: 'Credentials saved' };

  if (testOnConnect && entry.authType !== 'oauth') {
    const decrypted = decryptCredentials(integrationId, encryptedCreds);
    testResult = await testIntegration(integrationId, decrypted, business);

    record.lastTestedAt = new Date();
    record.lastTestResult = { success: testResult.success, message: testResult.message };

    if (testResult.accountInfo) {
      record.accountInfo = { ...record.accountInfo?.toObject?.() || record.accountInfo || {}, ...testResult.accountInfo };
    }

    if (testResult.refreshedToken) {
      encryptedCreds = mergeCredentialsForUpdate(integrationId, { accessToken: testResult.refreshedToken }, encryptedCreds);
      record.credentials = encryptedCreds;
    }
  }

  if (testResult.success) {
    record.status = 'connected';
    record.health = 'healthy';
  } else if (testResult.tokenExpired) {
    record.status = 'needs_reauth';
    record.health = 'error';
  } else {
    record.status = 'sync_failed';
    record.health = 'error';
  }

  await record.save();
  await syncLegacyBusinessCredentials(business, integrationId, encryptedCreds, record.status, record.health);

  if (integrationId === 'meta-ads' && testResult.success) {
    const decrypted = decryptCredentials(integrationId, encryptedCreds);
    const { subscribePageToLeadgenWebhooks } = await import('@/lib/meta/subscribe');
    const { metaLog, metaWarn } = await import('@/lib/meta/logger');

    try {
      await subscribePageToLeadgenWebhooks(decrypted.pageId, decrypted.accessToken);
      testResult.message = `${testResult.message} · Instant lead webhooks subscribed`;
      metaLog('Connect', `Page ${decrypted.pageId} subscribed to leadgen webhooks`);
    } catch (subErr) {
      metaWarn('Connect', 'Page webhook subscription failed', subErr.message);
      testResult.message = `${testResult.message} · Webhook subscribe failed — set callback URL in Meta App → Webhooks → Page → leadgen`;
    }

    record.lastTestResult = { success: testResult.success, message: testResult.message };
    await record.save();
  }

  await writeLog(
    businessId,
    integrationId,
    'connect',
    testResult.success ? 'success' : 'failed',
    testResult.message,
    { testOnConnect },
    testResult.durationMs
  );

  return {
    integration: formatIntegrationForClient(entry, record, business, baseUrl),
    testResult
  };
}

export async function updateIntegration(businessId, integrationId, payload, baseUrl) {
  const entry = getCatalogEntry(integrationId);
  if (!entry) throw new Error('Unknown integration');

  const record = await Integration.findOne({ businessId, integrationId });
  if (!record) throw new Error('Integration not connected');

  const { credentials, config, webhook } = payload;

  if (credentials) {
    const { valid, errors } = validateCredentials(integrationId, {
      ...redactCredentials(integrationId, record.credentials),
      ...credentials
    });
    if (!valid) throw new Error(errors.join(', '));
    record.credentials = mergeCredentialsForUpdate(integrationId, credentials, record.credentials);
  }

  if (config) record.config = { ...record.config?.toObject?.() || record.config || {}, ...config };
  if (webhook) record.webhook = { ...record.webhook?.toObject?.() || record.webhook || {}, ...webhook };

  await record.save();

  const business = await Business.findById(businessId);
  await syncLegacyBusinessCredentials(business, integrationId, record.credentials, record.status, record.health);

  await writeLog(businessId, integrationId, 'update', 'success', 'Integration settings updated');

  return formatIntegrationForClient(entry, record, business, baseUrl);
}

export async function disconnectIntegration(businessId, integrationId, baseUrl) {
  const entry = getCatalogEntry(integrationId);
  if (!entry) throw new Error('Unknown integration');

  const record = await Integration.findOne({ businessId, integrationId });
  if (!record) throw new Error('Integration not found');

  record.status = 'disconnected';
  record.health = 'unknown';
  record.disconnectedAt = new Date();
  await record.save();

  const business = await Business.findById(businessId);
  await syncLegacyBusinessCredentials(business, integrationId, {}, 'disconnected', 'unknown');

  await writeLog(businessId, integrationId, 'disconnect', 'success', 'Integration disconnected');

  return formatIntegrationForClient(entry, record, business, baseUrl);
}

export async function testIntegrationConnection(businessId, integrationId, baseUrl) {
  const entry = getCatalogEntry(integrationId);
  if (!entry) throw new Error('Unknown integration');

  const record = await Integration.findOne({ businessId, integrationId });
  if (!record) throw new Error('Integration not connected');

  const business = await Business.findById(businessId);
  const decrypted = decryptCredentials(integrationId, record.credentials);

  const testResult = await testIntegration(integrationId, decrypted, business);

  record.lastTestedAt = new Date();
  record.lastTestResult = { success: testResult.success, message: testResult.message };

  if (testResult.success) {
    record.health = 'healthy';
    record.status = 'connected';
    if (testResult.accountInfo) {
      record.accountInfo = { ...record.accountInfo?.toObject?.() || record.accountInfo || {}, ...testResult.accountInfo };
    }
  } else {
    record.health = 'error';
    record.status = 'sync_failed';
  }

  await record.save();
  await syncLegacyBusinessCredentials(business, integrationId, record.credentials, record.status, record.health);

  await writeLog(
    businessId,
    integrationId,
    'test',
    testResult.success ? 'success' : 'failed',
    testResult.message,
    {},
    testResult.durationMs
  );

  return {
    testResult,
    integration: formatIntegrationForClient(entry, record, business, baseUrl)
  };
}

export async function runIntegrationSync(businessId, integrationId, baseUrl) {
  const { metaLog, metaError } = await import('@/lib/meta/logger');

  metaLog('Sync Service', `runIntegrationSync start — businessId=${businessId}, integration=${integrationId}`);

  const entry = getCatalogEntry(integrationId);
  if (!entry) throw new Error('Unknown integration');

  const record = await Integration.findOne({ businessId, integrationId });
  if (!record || record.status !== 'connected') {
    metaLog('Sync Service', `Integration not connected — status=${record?.status ?? 'missing'}`);
    throw new Error('Integration not connected');
  }

  metaLog('Sync Service', 'Integration record found', {
    integrationId,
    status: record.status,
    health: record.health,
    lastSyncedAt: record.sync?.lastSyncedAt
  });

  const business = await Business.findById(businessId);
  const start = Date.now();

  record.sync = record.sync || {};
  record.sync.lastSyncStatus = 'pending';
  await record.save();
  metaLog('Sync Service', 'Sync status set to pending');

  let result;
  try {
    result = await syncIntegration(integrationId, record, business);
    metaLog('Sync Service', 'syncIntegration returned', result);
  } catch (err) {
    metaError('Sync Service', 'syncIntegration threw', err);
    throw err;
  }

  record.sync.lastSyncedAt = new Date();
  record.sync.lastSyncStatus = result.success ? 'success' : 'failed';
  record.sync.lastSyncError = result.success ? null : result.message;
  record.sync.syncCount = (record.sync.syncCount || 0) + 1;

  if (!result.success && result.tokenExpired) {
    record.status = 'needs_reauth';
    record.health = 'error';
    metaLog('Sync Service', 'Meta token expired — integration marked needs_reauth');
  }

  await record.save();

  metaLog('Sync Service', `Sync record saved — status=${record.sync.lastSyncStatus}, count=${record.sync.syncCount}`);

  await writeLog(
    businessId,
    integrationId,
    'sync',
    result.success ? 'success' : 'failed',
    result.message,
    {
      recordsProcessed: result.recordsProcessed,
      skipped: result.skipped,
      failed: result.failed,
      formsCount: result.formsCount,
      totalLeadsSeen: result.totalLeadsSeen
    },
    Date.now() - start
  );

  metaLog('Sync Service', `runIntegrationSync complete in ${Date.now() - start}ms`);

  return {
    syncResult: result,
    integration: formatIntegrationForClient(entry, record, business, baseUrl)
  };
}

export async function getIntegrationLogs(businessId, integrationId, { limit = 50, offset = 0 } = {}) {
  const logs = await IntegrationLog.find({ businessId, integrationId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const total = await IntegrationLog.countDocuments({ businessId, integrationId });

  return {
    logs: logs.map((l) => ({
      id: l._id.toString(),
      action: l.action,
      status: l.status,
      message: l.message,
      metadata: l.metadata,
      durationMs: l.durationMs,
      createdAt: l.createdAt
    })),
    total
  };
}

export async function simulateOAuthConnect(businessId, integrationId, oauthData, userId, baseUrl) {
  const entry = getCatalogEntry(integrationId);
  if (!entry || entry.authType !== 'oauth') throw new Error('OAuth not supported for this integration');

  let record = await Integration.findOne({ businessId, integrationId });
  if (!record) {
    record = new Integration({ businessId, integrationId });
  }

  record.oauth = {
    accessToken: oauthData.accessToken ? encrypt(oauthData.accessToken) : undefined,
    refreshToken: oauthData.refreshToken ? encrypt(oauthData.refreshToken) : undefined,
    expiresAt: oauthData.expiresAt,
    scopes: oauthData.scopes || [],
    connectedEmail: oauthData.connectedEmail,
    accountName: oauthData.accountName
  };
  record.status = 'connected';
  record.health = 'healthy';
  record.connectedAt = new Date();
  record.connectedBy = userId;
  record.accountInfo = {
    label: oauthData.connectedEmail || oauthData.accountName,
    externalId: oauthData.connectedEmail
  };

  await record.save();

  const business = await Business.findById(businessId);
  await writeLog(businessId, integrationId, 'oauth', 'success', `OAuth connected: ${oauthData.connectedEmail || 'account'}`);

  return formatIntegrationForClient(entry, record, business, baseUrl);
}
