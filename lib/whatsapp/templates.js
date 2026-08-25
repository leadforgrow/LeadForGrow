import axios from 'axios';

/**
 * WhatsApp Template Sender - Production Utility
 */
export async function sendWhatsAppTemplate({ 
  to, 
  templateName, 
  languageCode = 'en', 
  components = [],
  businessCredentials 
}) {
  const { apiKey, phoneNumberId } = businessCredentials;

  if (!apiKey || !phoneNumberId) {
    throw new Error('Missing WhatsApp configuration for business');
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      },
      components: components // Dynamic variables like {{1}} for name
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return { 
      success: true, 
      messageId: response.data.messages?.[0]?.id,
      raw: response.data 
    };
  } catch (error) {
    const errorData = error.response?.data?.error || { message: error.message };
    console.error('[WhatsAppTemplate] Error sending template:', errorData);
    throw new Error(`WhatsApp API Error: ${errorData.message}`);
  }
}

/**
 * Fetches templates from Meta WhatsApp Business Account.
 * Follows paging.next until exhausted; retries on 429 respecting Retry-After.
 */
export async function fetchMetaTemplates(businessCredentials, { status, maxPages = 20 } = {}) {
  const { apiKey, businessAccountId } = businessCredentials;

  if (!apiKey || !businessAccountId) {
    throw new Error('Missing WhatsApp Business Account ID or API Key');
  }

  const firstUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/message_templates`;
  const all = [];
  let nextUrl = firstUrl;
  let nextParams = { limit: 100, ...(status ? { status } : {}) };
  let pages = 0;

  while (nextUrl && pages < maxPages) {
    const response = await requestWithBackoff(() =>
      axios.get(nextUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        params: nextParams,
        validateStatus: () => true,
      })
    );

    if (response.status >= 400) {
      const errorData = response.data?.error || { message: `HTTP ${response.status}` };
      console.error('[WhatsAppTemplate] Error fetching templates:', errorData);
      throw new Error(`Meta API Error: ${errorData.message}`);
    }

    const page = response.data?.data || [];
    all.push(...page);

    const next = response.data?.paging?.next;
    if (next) {
      nextUrl = next;
      nextParams = undefined;
      pages += 1;
    } else {
      nextUrl = null;
    }
  }

  return all;
}

async function requestWithBackoff(fn, { maxRetries = 3, baseDelayMs = 500 } = {}) {
  let attempt = 0;
  while (true) {
    let response;
    try {
      response = await fn();
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      await sleep(baseDelayMs * Math.pow(2, attempt));
      attempt += 1;
      continue;
    }

    if (response?.status === 429 && attempt < maxRetries) {
      const retryAfter = Number(response.headers?.['retry-after']) || 0;
      const wait = retryAfter > 0 ? retryAfter * 1000 : baseDelayMs * Math.pow(2, attempt);
      await sleep(wait);
      attempt += 1;
      continue;
    }
    return response;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Submits a template to Meta for approval.
 * Returns { id, status, category } where status is typically PENDING right after submission.
 */
export async function createMetaTemplate(businessCredentials, templatePayload) {
  const { apiKey, businessAccountId } = businessCredentials;
  if (!apiKey || !businessAccountId) {
    throw new Error('Missing WhatsApp Business Account ID or API Key');
  }

  const url = `https://graph.facebook.com/v21.0/${businessAccountId}/message_templates`;

  try {
    const response = await axios.post(url, templatePayload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data?.error || { message: error.message };
    console.error('[WhatsAppTemplate] Create failed:', errorData);
    const err = new Error(errorData.error_user_msg || errorData.message || 'Meta template create failed');
    err.metaError = errorData;
    throw err;
  }
}

/**
 * Fetch a single template by its Meta ID — for status refresh.
 */
export async function getMetaTemplateById(businessCredentials, metaTemplateId) {
  const { apiKey } = businessCredentials;
  if (!apiKey || !metaTemplateId) throw new Error('Missing apiKey or metaTemplateId');

  const url = `https://graph.facebook.com/v21.0/${metaTemplateId}`;

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      params: { fields: 'id,name,status,category,language,components,rejected_reason,quality_score' },
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data?.error || { message: error.message };
    console.error('[WhatsAppTemplate] Get status failed:', errorData);
    throw new Error(errorData.message || 'Meta status fetch failed');
  }
}

/**
 * Meta's Resumable Upload API — production-grade way to attach sample media
 * to a template header. Returns a `header_handle` string that Meta accepts
 * during template review. This is the sanctioned path; using raw public URLs
 * works only sometimes.
 *
 * Docs: https://developers.facebook.com/docs/graph-api/guides/upload
 *
 * Two-step protocol:
 *   1) POST /{app-id}/uploads?file_length&file_type   → session id "upload:xyz"
 *   2) POST /{session-id} with Authorization: OAuth <token>
 *      file_offset: 0, body = raw bytes                → { h: "<handle>" }
 *
 * @param {Object}  args
 * @param {string}  args.apiKey       Business's WhatsApp access token (decrypted)
 * @param {string}  args.appId        Meta App ID that owns the WABA
 * @param {Buffer}  args.buffer       File bytes
 * @param {string}  args.mimeType     e.g. 'application/pdf', 'image/png'
 * @param {string} [args.filename]    For logging only
 */
export async function uploadMediaToMeta({ apiKey, appId, buffer, mimeType, filename }) {
  if (!apiKey) throw new Error('WhatsApp access token missing');
  if (!appId) throw new Error('META_APP_ID not configured — required for Meta Resumable Upload');
  if (!buffer?.length) throw new Error('File is empty');
  if (!mimeType) throw new Error('mimeType is required');

  // Step 1 — start session
  const startUrl = new URL(`https://graph.facebook.com/v21.0/${appId}/uploads`);
  startUrl.searchParams.set('file_length', String(buffer.length));
  startUrl.searchParams.set('file_type', mimeType);
  if (filename) startUrl.searchParams.set('file_name', filename);
  startUrl.searchParams.set('access_token', apiKey);

  let startRes;
  try {
    startRes = await axios.post(startUrl.toString(), null, { validateStatus: () => true });
  } catch (err) {
    throw new Error(`Meta upload session start failed: ${err.message}`);
  }
  if (startRes.status >= 400) {
    const msg = startRes.data?.error?.message || `HTTP ${startRes.status}`;
    throw new Error(`Meta upload session start failed: ${msg}`);
  }
  const sessionId = startRes.data?.id;
  if (!sessionId) throw new Error('Meta did not return an upload session id');

  // Step 2 — upload bytes
  const uploadUrl = `https://graph.facebook.com/v21.0/${sessionId}`;
  let uploadRes;
  try {
    uploadRes = await axios.post(uploadUrl, buffer, {
      headers: {
        Authorization: `OAuth ${apiKey}`,
        file_offset: '0',
        'Content-Type': mimeType,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
    });
  } catch (err) {
    throw new Error(`Meta binary upload failed: ${err.message}`);
  }
  if (uploadRes.status >= 400) {
    const msg = uploadRes.data?.error?.message || `HTTP ${uploadRes.status}`;
    throw new Error(`Meta binary upload failed: ${msg}`);
  }
  const handle = uploadRes.data?.h;
  if (!handle) throw new Error('Meta did not return a media handle');

  return handle;
}

/**
 * Fetch quality rating + messaging tier for a WABA phone number.
 *
 * Returns { qualityRating, messagingLimitTier, throughput, displayPhoneNumber, verifiedName }
 *
 * qualityRating:      GREEN | YELLOW | RED | UNKNOWN
 * messagingLimitTier: TIER_50 | TIER_250 | TIER_1K | TIER_10K | TIER_100K | TIER_UNLIMITED
 * throughput.level:   STANDARD | HIGH
 *
 * Use this BEFORE running a big broadcast — YELLOW/RED means Meta will
 * throttle quality-based deliveries (#131049) if you push the same
 * volume/pattern that got you flagged.
 */
export async function getPhoneNumberQuality(businessCredentials) {
  const { apiKey, phoneNumberId } = businessCredentials;
  if (!apiKey || !phoneNumberId) throw new Error('phoneNumberId or apiKey missing');

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: {
        fields: 'display_phone_number,verified_name,quality_rating,messaging_limit_tier,throughput,status,platform_type',
      },
      validateStatus: () => true,
    });
    if (response.status >= 400) {
      const errorData = response.data?.error || { message: `HTTP ${response.status}` };
      throw new Error(errorData.message || 'Meta phone-number fetch failed');
    }
    return {
      qualityRating: response.data.quality_rating || 'UNKNOWN',
      messagingLimitTier: response.data.messaging_limit_tier || 'UNKNOWN',
      throughput: response.data.throughput || null,
      status: response.data.status || null,
      displayPhoneNumber: response.data.display_phone_number || null,
      verifiedName: response.data.verified_name || null,
      platformType: response.data.platform_type || null,
    };
  } catch (error) {
    console.error('[WhatsAppQuality] fetch failed:', error.message);
    throw new Error(error.message || 'Quality fetch failed');
  }
}

/**
 * Delete a template from Meta by name (Meta scopes deletes by template name).
 */
export async function deleteMetaTemplate(businessCredentials, templateName) {
  const { apiKey, businessAccountId } = businessCredentials;
  if (!apiKey || !businessAccountId) throw new Error('Missing credentials');

  const url = `https://graph.facebook.com/v21.0/${businessAccountId}/message_templates`;

  try {
    const response = await axios.delete(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      params: { name: templateName },
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data?.error || { message: error.message };
    console.error('[WhatsAppTemplate] Delete failed:', errorData);
    throw new Error(errorData.message || 'Meta template delete failed');
  }
}
