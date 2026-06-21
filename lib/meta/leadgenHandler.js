import Business from '@/models/Business';
import IntegrationLog from '@/models/IntegrationLog';
import { getMetaLeadDetails, buildMetaLeadGraphUrl } from '@/lib/meta/ads';
import { resolveMetaAdsCredentials } from '@/lib/meta/credentials';
import { leadManager } from '@/lib/automation/leadManager';
import { metaLog, metaError } from '@/lib/meta/logger';

function stripGraphDebug(leadData) {
  if (!leadData) return leadData;
  const { __graphDebug, ...payload } = leadData;
  return payload;
}

export function extractLeadgenFromPayload(payload) {
  if (payload?.sample?.field === 'leadgen') {
    return { value: payload.sample.value || {}, source: 'payload.sample' };
  }

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change?.field === 'leadgen') {
        return { value: change.value || {}, source: 'entry.changes', entryId: entry.id };
      }
    }
  }

  return null;
}

/**
 * Find the business that owns a Meta Page ID (Integration record or legacy fields).
 */
export async function findBusinessByMetaPageId(pageId) {
  if (!pageId) return null;

  const pageIdStr = String(pageId);
  const Integration = (await import('@/models/Integration')).default;

  const integration = await Integration.findOne({
    integrationId: 'meta-ads',
    status: 'connected',
    $or: [{ 'credentials.pageId': pageIdStr }, { 'credentials.pageId': pageIdStr.trim() }]
  });

  if (integration) {
    const business = await Business.findById(integration.businessId);
    return business ? { business, integration } : null;
  }

  const business = await Business.findOne({
    $or: [
      { 'integrationCredentials.facebookAds.pageId': pageIdStr },
      { 'integrationCredentials.facebookAds.pageId': pageIdStr.trim() }
    ]
  });

  if (!business) return null;

  const enabled = business.integrationCredentials?.facebookAds?.enabled;
  if (enabled === false) return null;

  return { business, integration: null };
}

async function logWebhookActivity(businessId, status, message, metadata = {}) {
  try {
    await IntegrationLog.create({
      businessId,
      integrationId: 'meta-ads',
      action: 'webhook',
      status,
      message,
      metadata
    });
  } catch (err) {
    metaError('Leadgen Webhook', 'Failed to write integration log', err);
  }
}

/**
 * Process a single Meta leadgen webhook event for a known business.
 */
export async function processMetaLeadgenWebhook(business, leadgenValue, { source = 'webhook' } = {}) {
  const businessId = business._id.toString();
  const leadgenId = leadgenValue.leadgen_id != null ? String(leadgenValue.leadgen_id) : null;
  const pageId = leadgenValue.page_id != null ? String(leadgenValue.page_id) : null;
  const formId = leadgenValue.form_id != null ? String(leadgenValue.form_id) : null;

  metaLog('Leadgen Webhook', `Processing leadgen_id=${leadgenId} page_id=${pageId} form_id=${formId}`, {
    businessId,
    source
  });

  const metaCreds = await resolveMetaAdsCredentials(business);

  if (metaCreds.pageId && pageId && metaCreds.pageId !== pageId) {
    const message = `Page ID mismatch (webhook ${pageId}, configured ${metaCreds.pageId})`;
    await logWebhookActivity(businessId, 'failed', message, { leadgenId, pageId });
    return { success: false, error: message, step: 'page_mismatch' };
  }

  if (!leadgenId) {
    const message = 'Missing leadgen_id in webhook payload';
    await logWebhookActivity(businessId, 'failed', message, { pageId, formId });
    return { success: false, error: message, step: 'missing_leadgen_id' };
  }

  const accessToken = metaCreds.accessToken;
  if (!accessToken) {
    const message = 'Page Access Token not configured';
    await logWebhookActivity(businessId, 'failed', message, { leadgenId });
    return { success: false, error: message, step: 'missing_token' };
  }

  metaLog('Leadgen Webhook', 'Graph API request URL', buildMetaLeadGraphUrl(leadgenId));

  let leadData;
  try {
    leadData = await getMetaLeadDetails(leadgenId, accessToken);
    metaLog('Leadgen Webhook', 'Graph API success — mapped payload preview', {
      metaLeadId: leadData.metaLeadId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      formId: leadData.formId,
      graphStatus: leadData.__graphDebug?.graphStatus,
      graphResponse: leadData.__graphDebug?.graphResponse
    });
  } catch (graphError) {
    metaError('Leadgen Webhook', 'Graph API error', graphError);

    if (graphError.tokenExpired) {
      try {
        const Integration = (await import('@/models/Integration')).default;
        await Integration.findOneAndUpdate(
          { businessId: business._id, integrationId: 'meta-ads', status: 'connected' },
          { status: 'needs_reauth', health: 'error', 'sync.lastSyncError': graphError.message }
        );
      } catch (markErr) {
        metaError('Leadgen Webhook', 'Failed to mark needs_reauth', markErr);
      }
    }

    await logWebhookActivity(businessId, 'failed', graphError.message, {
      leadgenId,
      tokenExpired: Boolean(graphError.tokenExpired)
    });

    return {
      success: false,
      error: graphError.message,
      tokenExpired: Boolean(graphError.tokenExpired),
      step: 'graph_api'
    };
  }

  const leadPayload = stripGraphDebug(leadData);
  metaLog('Leadgen Webhook', 'Calling leadManager.processMetaLead', {
    businessId,
    metaLeadId: leadPayload.metaLeadId,
    name: leadPayload.name,
    email: leadPayload.email,
    phone: leadPayload.phone,
    formId: leadPayload.formId,
    source: 'meta_ads'
  });

  let saveResult;
  try {
    saveResult = await leadManager.processMetaLead(businessId, leadPayload);
  } catch (saveError) {
    metaError('Leadgen Webhook', 'Database save failed', saveError);
    await logWebhookActivity(businessId, 'failed', saveError.message, { leadgenId });
    return { success: false, error: saveError.message, step: 'database_save' };
  }

  const ok = saveResult.status === 'success' || saveResult.status === 'skipped';
  const logMessage =
    saveResult.status === 'success'
      ? `Lead received via webhook (${leadPayload.name || leadPayload.email || leadgenId})`
      : saveResult.status === 'skipped'
        ? `Lead already in CRM (${leadgenId})`
        : saveResult.reason || 'Lead processing finished';

  metaLog('Leadgen Webhook', 'Database save result', {
    businessId,
    leadId: saveResult.leadId?.toString?.() ?? saveResult.leadId,
    status: saveResult.status,
    reason: saveResult.reason
  });

  await logWebhookActivity(businessId, ok ? 'success' : 'warning', logMessage, {
    leadgenId,
    leadId: saveResult.leadId?.toString?.() ?? saveResult.leadId,
    status: saveResult.status
  });

  return {
    success: ok,
    status: saveResult.status,
    leadId: saveResult.leadId?.toString?.() ?? saveResult.leadId,
    reason: saveResult.reason ?? null
  };
}

/**
 * Resolve business from payload and process leadgen (for generic /api/webhooks/meta route).
 */
export async function processLeadgenPayload(payload) {
  const leadgen = extractLeadgenFromPayload(payload);
  if (!leadgen) return null;

  const pageId =
    leadgen.value.page_id != null
      ? String(leadgen.value.page_id)
      : leadgen.entryId != null
        ? String(leadgen.entryId)
        : payload.entry?.[0]?.id != null
          ? String(payload.entry[0].id)
          : null;

  if (!pageId) {
    return { success: false, error: 'Could not determine page ID from webhook', step: 'missing_page_id' };
  }

  const match = await findBusinessByMetaPageId(pageId);
  if (!match) {
    metaLog('Leadgen Webhook', `No business found for page_id=${pageId}`);
    return { success: false, error: `No connected business for page ${pageId}`, step: 'business_not_found' };
  }

  return processMetaLeadgenWebhook(match.business, leadgen.value, { source: leadgen.source });
}
