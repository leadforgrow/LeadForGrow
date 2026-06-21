import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { verifyMetaSignature } from '@/lib/webhookSecurity';
import { getMetaLeadDetails, buildMetaLeadGraphUrl } from '@/lib/meta/ads';
import { resolveMetaAdsCredentials } from '@/lib/meta/credentials';
import { leadManager } from '@/lib/automation/leadManager';
import { metaLog, metaWarn, metaError } from '@/lib/meta/logger';

function logStep(step, message, data) {
  metaLog(`Webhook Step ${step}`, message, data);
}

function logHeaders(headers) {
  const safe = {};
  headers.forEach((value, key) => {
    safe[key] = key.toLowerCase().includes('signature') ? `${value.slice(0, 12)}…` : value;
  });
  return safe;
}

function respond200(body, step) {
  logStep(step, 'Returning HTTP 200', body);
  return NextResponse.json(body, { status: 200 });
}

function findLeadgenChange(payload) {
  if (payload?.sample?.field === 'leadgen') {
    return { change: payload.sample, entry: null, source: 'payload.sample' };
  }

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change?.field === 'leadgen') {
        return { change, entry, source: 'entry.changes' };
      }
    }
  }

  return null;
}

function stripGraphDebug(leadData) {
  if (!leadData) return leadData;
  const { __graphDebug, ...payload } = leadData;
  return payload;
}

/**
 * GET - Meta Webhook Verification (The Challenge)
 */
export async function GET(request, { params }) {
    const { businessId } = await params;
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('[Meta][Webhook] Verification request for business:', businessId);

    if (mode === 'subscribe' && token) {
        await dbConnect();
        const business = await Business.findById(businessId);
        
        if (!business) {
            return new Response('Business not found', { status: 404 });
        }

        const metaCreds = await resolveMetaAdsCredentials(business);
        const storedWAToken = business.integrationCredentials?.whatsapp?.verifyToken;

        const { decrypt } = await import('@/lib/encryption');
        const resolveToken = (t) => {
            if (t && t.includes(':')) {
                try { return decrypt(t); } catch (e) { return t; }
            }
            return t;
        };

        const resolvedWA = resolveToken(storedWAToken);
        const resolvedAds = metaCreds.verifyToken;

        if (resolvedWA === token || resolvedAds === token) {
            const isAds = resolvedAds === token;
            const path = isAds ? 'integrationCredentials.facebookAds.enabled' : 'integrationCredentials.whatsapp.enabled';
            if (!business.get(path)) {
                business.set(path, true);
                business.markModified('integrationCredentials');
                await business.save();
            }

            return new Response(challenge, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        console.warn('[Meta][Webhook] Token mismatch. WA:', resolvedWA, '| Ads:', resolvedAds, '| Got:', token);
    }

    return new Response('Verification failed', { status: 403 });
}

/**
 * POST - Handle Incoming Webhook Events (Lead Ads + WhatsApp)
 */
export async function POST(request, { params }) {
    const { businessId } = await params;
    const receivedAt = new Date().toISOString();

    logStep(1, `POST request received — businessId=${businessId}, at=${receivedAt}`);

    let rawBody = '';
    let payload = null;

    try {
        logStep(2, 'Request headers', logHeaders(request.headers));

        rawBody = await request.text();
        logStep(3, 'Raw request body', rawBody);

        try {
            payload = JSON.parse(rawBody);
        } catch (parseError) {
            logStep(3, 'JSON parse FAILED', parseError.message);
            metaError('Webhook Step 3', 'JSON parse stack', parseError);
            return respond200({ success: false, error: 'Invalid JSON body', step: 'parse' }, '3-error');
        }

        await dbConnect();
        const business = await Business.findById(businessId);

        if (!business) {
            logStep(1, `Business not found: ${businessId}`);
            return respond200({ success: false, error: 'Business not found', businessId }, '1-error');
        }

        const signature = request.headers.get('x-hub-signature-256');
        const metaCreds = await resolveMetaAdsCredentials(business);
        const appSecret = metaCreds.appSecret;

        let signatureResult = {
            checked: false,
            valid: null,
            reason: null,
            signaturePresent: Boolean(signature),
            appSecretPresent: Boolean(appSecret)
        };

        if (appSecret && signature) {
            signatureResult.checked = true;
            signatureResult.valid = verifyMetaSignature(rawBody, signature, appSecret);
            signatureResult.reason = signatureResult.valid ? 'verified' : 'invalid_signature';
        } else if (signature && !appSecret) {
            signatureResult.checked = false;
            signatureResult.valid = null;
            signatureResult.reason = 'signature_present_but_app_secret_missing';
        } else {
            signatureResult.checked = false;
            signatureResult.valid = null;
            signatureResult.reason = 'no_signature_or_no_app_secret';
        }

        logStep(4, 'Signature verification result', signatureResult);

        if (signatureResult.checked && signatureResult.valid === false) {
            return respond200({ success: false, error: 'Invalid signature', signatureResult }, '4-error');
        }

        logStep(5, 'Parsed entry array', payload.entry ?? null);
        logStep(5, 'Payload object type', payload.object ?? null);

        const allChanges = (payload.entry || []).flatMap((entry, entryIndex) =>
            (entry.changes || []).map((change, changeIndex) => ({
                entryIndex,
                changeIndex,
                entryId: entry.id,
                field: change.field,
                value: change.value
            }))
        );
        logStep(6, 'Parsed changes (all entries)', allChanges.length ? allChanges : payload.sample ?? 'none');

        const leadgenMatch = findLeadgenChange(payload);

        if (leadgenMatch) {
            const { change: leadgenChange, entry: leadgenEntry, source } = leadgenMatch;
            const value = leadgenChange.value || {};

            const leadgenId = value.leadgen_id != null ? String(value.leadgen_id) : null;
            const pageId = value.page_id != null ? String(value.page_id) : null;
            const formId = value.form_id != null ? String(value.form_id) : null;

            logStep(7, `leadgen_id (from ${source})`, leadgenId);
            logStep(8, 'page_id', pageId);
            logStep(9, 'form_id', formId);
            logStep(9, 'Configured credentials', {
                credSource: metaCreds.source,
                configuredPageId: metaCreds.pageId,
                tokenPresent: Boolean(metaCreds.accessToken),
                appSecretPresent: Boolean(metaCreds.appSecret)
            });

            if (metaCreds.pageId && pageId && metaCreds.pageId !== pageId) {
                logStep(8, 'page_id MISMATCH — rejecting', {
                    webhookPageId: pageId,
                    configuredPageId: metaCreds.pageId
                });
                return respond200({ success: false, error: 'Page ID mismatch', pageId, configuredPageId: metaCreds.pageId }, '8-error');
            }

            if (!leadgenId) {
                logStep(7, 'leadgen_id MISSING — cannot fetch lead');
                return respond200({ success: false, error: 'Missing leadgen_id' }, '7-error');
            }

            const accessToken = metaCreds.accessToken;
            if (!accessToken) {
                logStep(9, 'Page Access Token MISSING');
                return respond200({ success: false, error: 'Page Access Token not configured' }, '9-error');
            }

            logStep(10, 'Graph API request URL', buildMetaLeadGraphUrl(leadgenId));

            let leadData;
            try {
                leadData = await getMetaLeadDetails(leadgenId, accessToken);
            } catch (graphError) {
                const debug = graphError.graphDebug || {};
                logStep(11, 'Graph API response (error)', debug.graphResponse ?? graphError.message);
                logStep(11, 'Graph API status (error)', debug.graphStatus ?? 'unknown');
                metaError('Webhook Step 11', 'Graph API error', graphError);
                return respond200({
                    success: false,
                    error: graphError.message,
                    graphStatus: debug.graphStatus,
                    graphResponse: debug.graphResponse
                }, '11-error');
            }

            const { __graphDebug } = leadData;
            logStep(11, 'Graph API status', __graphDebug?.graphStatus);
            logStep(11, 'Full Graph API response', __graphDebug?.graphResponse);
            logStep(12, 'Parsed field_data', __graphDebug?.parsedFieldData);

            const leadPayload = stripGraphDebug(leadData);
            logStep(13, 'Final object passed to leadManager.processMetaLead', leadPayload);

            let saveResult;
            try {
                saveResult = await leadManager.processMetaLead(businessId, leadPayload);
            } catch (saveError) {
                logStep(14, 'Database save FAILED', saveError.message);
                metaError('Webhook Step 14', 'Database save FAILED', saveError);
                return respond200({ success: false, error: saveError.message, step: 'database_save' }, '14-error');
            }

            logStep(14, 'Database save result', saveResult);

            return respond200({
                success: saveResult.status === 'success' || saveResult.status === 'skipped',
                status: saveResult.status,
                leadId: saveResult.leadId?.toString?.() ?? saveResult.leadId,
                reason: saveResult.reason ?? null
            }, '15-done');
        }

        logStep(6, 'No leadgen change found — checking WhatsApp');

        const { extractWhatsAppPayload } = await import('@/lib/whatsapp/attribution');
        const data = extractWhatsAppPayload(payload);
        
        if (!data) {
            logStep(6, 'No actionable event in payload');
            return respond200({ success: true, message: 'No actionable event', object: payload.object }, '6-noop');
        }

        const waResult = await leadManager.processIncomingMessage(businessId, {
            messageId: data.messageId,
            senderId: data.fromPhone,
            senderName: data.fromName,
            body: data.text,
            type: 'text',
            timestamp: data.timestamp,
            referral: data.referral,
            raw: data.rawMessage
        });

        logStep(14, 'WhatsApp processing result', waResult);
        return respond200({ success: true, channel: 'whatsapp', status: waResult.status }, '15-whatsapp');

    } catch (error) {
        logStep(15, 'Uncaught exception', error.message);
        metaError('Webhook Step 15', 'Uncaught exception', error);
        metaLog('Webhook Step 15', `Context — businessId=${businessId}, rawBodyLength=${rawBody?.length ?? 0}`);
        return respond200({
            success: false,
            error: error.message,
            step: 'uncaught_exception'
        }, '15-error');
    }
}
