import { leadManager } from '@/lib/automation/leadManager';
import { metaLog, metaWarn, metaError } from '@/lib/meta/logger';

const GRAPH_FIELDS = [
  'id',
  'created_time',
  'ad_id',
  'ad_name',
  'adset_id',
  'adset_name',
  'campaign_id',
  'campaign_name',
  'form_id',
  'platform',
  'field_data'
].join(',');

export function buildMetaLeadGraphUrl(leadId) {
  return `https://graph.facebook.com/v21.0/${leadId}?fields=${GRAPH_FIELDS}`;
}

function parseFieldData(rawFieldData) {
  const rows = Array.isArray(rawFieldData) ? rawFieldData : [];
  return rows.reduce((acc, field) => {
    const values = Array.isArray(field.values) ? field.values : [];
    acc[field.name] = values.length > 1 ? values.join(', ') : values[0];
    return acc;
  }, {});
}

/**
 * Map a Meta Graph API lead object to CRM ingestion payload.
 */
export function mapGraphLeadToCrm(leadData, fallbackLeadId) {
  const fieldData = parseFieldData(leadData.field_data);

  const email =
    fieldData.email ||
    fieldData.email_address ||
    fieldData.Email ||
    fieldData.work_email ||
    fieldData['email address'];

  const phone =
    fieldData.phone_number ||
    fieldData.full_phone_number ||
    fieldData.phone ||
    fieldData.Phone ||
    fieldData.mobile ||
    fieldData['phone number'];

  const name =
    fieldData.full_name ||
    fieldData.Full_Name ||
    fieldData.Name ||
    fieldData.name ||
    [fieldData.first_name, fieldData.last_name].filter(Boolean).join(' ').trim() ||
    null;

  const mapped = {
    metaLeadId: String(leadData.id || fallbackLeadId),
    receivedAt: leadData.created_time || new Date().toISOString(),
    adId: leadData.ad_id,
    adName: leadData.ad_name,
    adSetName: leadData.adset_name,
    campaignId: leadData.campaign_id,
    campaignName: leadData.campaign_name,
    formId: leadData.form_id,
    platform: leadData.platform,
    fields: fieldData,
    email: email || null,
    phone: phone || null,
    name: name || 'Meta Lead'
  };

  metaLog('Map Lead', `Mapped lead ${mapped.metaLeadId}`, {
    name: mapped.name,
    email: mapped.email,
    phone: mapped.phone,
    campaignName: mapped.campaignName,
    formId: mapped.formId,
    fieldKeys: Object.keys(fieldData)
  });

  return mapped;
}

async function fetchGraphPaginated(initialUrl, pageAccessToken, label) {
  const all = [];
  let url = initialUrl;
  let page = 0;

  while (url) {
    page += 1;
    metaLog('Graph API', `${label} — page ${page} request`, url.split('?')[0]);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${pageAccessToken}` }
    });
    const json = await response.json();

    metaLog('Graph API', `${label} — page ${page} status ${response.status}`, {
      dataCount: json.data?.length ?? 0,
      hasNext: Boolean(json.paging?.next),
      error: json.error ?? null
    });

    if (!response.ok) {
      const err = json.error || {};
      metaError('Graph API', `${label} failed`, {
        message: err.message,
        status: response.status,
        code: err.code,
        error_subcode: err.error_subcode
      });
      throw new Error(err.message || `Graph API request failed (${response.status})`);
    }

    all.push(...(json.data || []));
    url = json.paging?.next || null;
  }

  metaLog('Graph API', `${label} — total records fetched: ${all.length}`);
  return all;
}

/**
 * Pull all leads from Meta Lead Center (page leadgen forms) into the CRM.
 */
export async function syncMetaLeadsFromLeadCenter(businessId, pageId, pageAccessToken) {
  metaLog('Lead Center', '=== SYNC START ===', { businessId, pageId });

  const formsUrl = `https://graph.facebook.com/v21.0/${pageId}/leadgen_forms?fields=id,name,status,leads_count&limit=100`;
  const forms = await fetchGraphPaginated(formsUrl, pageAccessToken, 'leadgen_forms');

  metaLog('Lead Center', `Forms on page ${pageId}`, forms.map((f) => ({
    id: f.id,
    name: f.name,
    status: f.status,
    leads_count: f.leads_count
  })));

  if (forms.length === 0) {
    metaWarn('Lead Center', 'No leadgen forms found on this page');
    return {
      success: true,
      message: 'No lead forms found on this Facebook Page',
      imported: 0,
      skipped: 0,
      failed: 0,
      formsCount: 0
    };
  }

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  let totalLeadsSeen = 0;

  for (const form of forms) {
    metaLog('Lead Center', `Processing form ${form.id}`, { name: form.name, leads_count: form.leads_count });

    const leadsUrl = `https://graph.facebook.com/v21.0/${form.id}/leads?fields=${GRAPH_FIELDS}&limit=100`;
    let leads = [];

    try {
      leads = await fetchGraphPaginated(leadsUrl, pageAccessToken, `form_${form.id}_leads`);
    } catch (formError) {
      metaError('Lead Center', `Failed to fetch leads for form ${form.id}`, formError);
      failed += 1;
      continue;
    }

    totalLeadsSeen += leads.length;
    metaLog('Lead Center', `Form ${form.id}: ${leads.length} lead(s) to process`);

    for (const lead of leads) {
      try {
        metaLog('Lead Center', `Processing lead ${lead.id}`, {
          created_time: lead.created_time,
          form_id: lead.form_id,
          has_field_data: Array.isArray(lead.field_data)
        });

        const leadPayload = mapGraphLeadToCrm(lead);
        if (!leadPayload.formId) leadPayload.formId = String(form.id);

        metaLog('Lead Center', `Saving lead ${leadPayload.metaLeadId} to CRM`, {
          name: leadPayload.name,
          email: leadPayload.email,
          phone: leadPayload.phone
        });

        const result = await leadManager.processMetaLead(businessId, leadPayload);

        metaLog('Lead Center', `Save result for ${leadPayload.metaLeadId}`, result);

        if (result.status === 'success') {
          imported += 1;
        } else if (result.status === 'skipped') {
          skipped += 1;
          metaLog('Lead Center', `Skipped duplicate lead ${leadPayload.metaLeadId}`, result);
        }
      } catch (leadError) {
        failed += 1;
        metaError('Lead Center', `Failed to import lead ${lead.id}`, leadError);
      }
    }
  }

  const message =
    totalLeadsSeen === 0
      ? `Synced ${forms.length} form(s) — no leads in Meta Lead Center yet`
      : `Imported ${imported} lead(s) from Meta Lead Center (${skipped} already in CRM${failed ? `, ${failed} failed` : ''})`;

  metaLog('Lead Center', '=== SYNC COMPLETE ===', {
    message,
    imported,
    skipped,
    failed,
    formsCount: forms.length,
    totalLeadsSeen
  });

  return {
    success: true,
    message,
    imported,
    skipped,
    failed,
    formsCount: forms.length,
    totalLeadsSeen
  };
}

/**
 * Fetch a single lead by leadgen_id from Meta Graph API (webhook path)
 */
export async function getMetaLeadDetails(leadId, pageAccessToken) {
  const url = buildMetaLeadGraphUrl(leadId);

  metaLog('Graph API', `Fetching single lead ${leadId}`, url);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${pageAccessToken}` }
  });

  const leadData = await response.json();

  metaLog('Graph API', `Single lead response status ${response.status}`, leadData);

  if (!response.ok) {
    const err = leadData.error || {};
    metaError('Graph API', `Single lead fetch failed for ${leadId}`, {
      message: err.message,
      code: err.code,
      error_subcode: err.error_subcode
    });
    const graphError = new Error(err.message || `Meta API request failed (${response.status})`);
    graphError.graphDebug = {
      graphUrl: url,
      graphStatus: response.status,
      graphResponse: leadData,
      parsedFieldData: null
    };
    throw graphError;
  }

  const mapped = mapGraphLeadToCrm(leadData, leadId);

  metaLog('Graph API', `Parsed field_data for lead ${leadId}`, mapped.fields);

  return {
    ...mapped,
    __graphDebug: {
      graphUrl: url,
      graphStatus: response.status,
      graphResponse: leadData,
      parsedFieldData: mapped.fields
    }
  };
}
