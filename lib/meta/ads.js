/**
 * Fetch lead details from Meta Graph API
 * @param {string} leadId - The Meta Lead ID
 * @param {string} pageAccessToken - The Page Access Token
 * @returns {Promise<Object>} The lead data
 */
export async function getMetaLeadDetails(leadId, pageAccessToken) {
  try {
    const url = `https://graph.facebook.com/v19.0/${leadId}?access_token=${pageAccessToken}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Meta API request failed');
    }

    const leadData = await response.json();
    
    // Parse form data
    const fieldData = leadData.field_data.reduce((acc, field) => {
      acc[field.name] = field.values[0];
      return acc;
    }, {});

    // Common field mapping heuristics
    const email = fieldData.email || fieldData.email_address || fieldData.Email;
    const phone = fieldData.phone_number || fieldData.full_phone_number || fieldData.phone || fieldData['phone number'];
    const name = fieldData.full_name || fieldData.Name || `${fieldData.first_name || ''} ${fieldData.last_name || ''}`.trim();

    return {
      metaLeadId: leadData.id,
      receivedAt: leadData.created_time,
      adId: leadData.ad_id,
      adName: leadData.ad_name,
      adsetId: leadData.adset_id,
      adsetName: leadData.adset_name,
      campaignId: leadData.campaign_id,
      campaignName: leadData.campaign_name,
      formId: leadData.form_id,
      platform: leadData.platform,
      fields: fieldData,
      email,
      phone,
      name: name || 'Meta Lead'
    };
  } catch (error) {
    console.error('[Meta Ads] Error fetching lead details:', error.message);
    throw error;
  }
}
