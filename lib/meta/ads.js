/**
 * Fetch lead details from Meta Graph API
 * @param {string} leadId - The Meta Lead ID (leadgen_id)
 * @param {string} pageAccessToken - The Page Access Token
 * @returns {Promise<Object>} The lead data mapped for CRM ingestion
 */
export async function getMetaLeadDetails(leadId, pageAccessToken) {
  const fields = [
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

  const url = `https://graph.facebook.com/v21.0/${leadId}?fields=${fields}`;

  console.log(`[Meta Ads] Graph API request for leadgen_id: ${leadId}`);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${pageAccessToken}` }
  });

  const leadData = await response.json();
  console.log(`[Meta Ads] Graph API status: ${response.status}`);
  console.log(`[Meta Ads] Graph API response:`, JSON.stringify(leadData));

  if (!response.ok) {
    const err = leadData.error || {};
    console.error('[Meta Ads] Graph API error:', {
      status: response.status,
      message: err.message,
      code: err.code,
      error_subcode: err.error_subcode
    });
    throw new Error(err.message || `Meta API request failed (${response.status})`);
  }

  const rawFieldData = Array.isArray(leadData.field_data) ? leadData.field_data : [];
  const fieldData = rawFieldData.reduce((acc, field) => {
    const values = Array.isArray(field.values) ? field.values : [];
    acc[field.name] = values.length > 1 ? values.join(', ') : values[0];
    return acc;
  }, {});

  console.log('[Meta Ads] Parsed field_data:', JSON.stringify(fieldData));

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

  return {
    metaLeadId: String(leadData.id || leadId),
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
}
