import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { resolveMetaAdsCredentials } from '@/lib/meta/credentials';
import { leadManager } from '@/lib/automation/leadManager';
import { metaLog, metaError } from '@/lib/meta/logger';
import { extractLeadgenFromPayload, processMetaLeadgenWebhook } from '@/lib/meta/leadgenHandler';
import {
  recordMetaWebhookIngress,
  finalizeMetaWebhookIngress,
  collectMetaAppSecretCandidates,
  verifyMetaWebhookSignature,
  parseLeadgenFields
} from '@/lib/meta/webhookIngress';

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
  const match = extractLeadgenFromPayload(payload);
  if (!match) return null;
  return { change: { field: 'leadgen', value: match.value }, entry: null, source: match.source };
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
    const routeLabel = `businessId:${businessId}`;

    logStep(1, `POST request received — route=${routeLabel}, at=${receivedAt}`);

    let rawBody = '';
    let payload = null;
    let ingressId = null;

    try {
        logStep(2, 'Request URL', request.url);
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

        const ingressDoc = await recordMetaWebhookIngress({
            route: routeLabel,
            request,
            businessId,
            rawBody,
            payload
        });
        ingressId = ingressDoc._id;

        const parsedFields = parseLeadgenFields(payload);
        logStep(5, 'Payload object', parsedFields.object);
        logStep(5, 'Payload entry', parsedFields.entry);
        logStep(6, 'Payload changes', parsedFields.changes);
        logStep(7, 'leadgen_id', parsedFields.leadgen_id);
        logStep(8, 'page_id', parsedFields.page_id);
        logStep(9, 'form_id', parsedFields.form_id);

        if (!parsedFields.leadgenFound) {
            logStep(6, 'No leadgen field in payload — full payload logged above');
        }

        const business = await Business.findById(businessId);

        if (!business) {
            logStep(1, `Business not found: ${businessId}`);
            await finalizeMetaWebhookIngress(ingressId, {
                outcome: 'failed',
                processing: { step: 'business_not_found', error: `Business not found: ${businessId}` }
            });
            return respond200({ success: false, error: 'Business not found', businessId }, '1-error');
        }

        const signature = request.headers.get('x-hub-signature-256');
        const metaCreds = await resolveMetaAdsCredentials(business);
        const secretCandidates = await collectMetaAppSecretCandidates(metaCreds, business);
        const signatureResult = verifyMetaWebhookSignature(rawBody, signature, secretCandidates);

        logStep(4, 'Signature verification', {
            received: signatureResult.received,
            expected: signatureResult.expected,
            verified: signatureResult.valid,
            matchedSource: signatureResult.matchedSource,
            reason: signatureResult.reason,
            candidates: signatureResult.candidates
        });

        if (signature && signatureResult.valid === false) {
            await finalizeMetaWebhookIngress(ingressId, {
                outcome: 'rejected',
                processing: {
                    step: 'signature_invalid',
                    error: 'Invalid signature — webhook rejected before lead processing',
                    result: signatureResult
                },
                signature: {
                    received: signatureResult.received,
                    expected: signatureResult.expected,
                    verified: false,
                    secretSource: signatureResult.matchedSource,
                    candidates: signatureResult.candidates
                }
            });
            return respond200({
                success: false,
                error: 'Invalid signature',
                step: 'signature',
                signatureResult
            }, '4-error');
        }

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
            const { change: leadgenChange, source } = leadgenMatch;
            const value = leadgenChange.value || {};

            logStep(9, 'Configured credentials', {
                credSource: metaCreds.source,
                configuredPageId: metaCreds.pageId,
                tokenPresent: Boolean(metaCreds.accessToken),
                appSecretPresent: Boolean(metaCreds.appSecret)
            });

            const result = await processMetaLeadgenWebhook(business, value, { source: `webhook:${source}` });

            logStep(14, 'Leadgen processing result', result);

            await finalizeMetaWebhookIngress(ingressId, {
                outcome: result.success ? 'success' : 'failed',
                processing: { step: result.step || 'leadgen_complete', result }
            });

            return respond200({
                success: result.success,
                status: result.status,
                leadId: result.leadId,
                reason: result.reason ?? null,
                error: result.error ?? null,
                tokenExpired: result.tokenExpired ?? false
            }, result.success ? '15-done' : '15-error');
        }

        logStep(6, 'No leadgen change found — checking WhatsApp');

        const { extractWhatsAppPayload } = await import('@/lib/whatsapp/attribution');
        const data = extractWhatsAppPayload(payload);
        
        if (!data) {
            logStep(6, 'No actionable event in payload');
            await finalizeMetaWebhookIngress(ingressId, {
                outcome: 'noop',
                processing: { step: 'no_actionable_event', result: { object: payload.object } }
            });
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
        if (ingressId) {
            await finalizeMetaWebhookIngress(ingressId, {
                outcome: 'failed',
                processing: { step: 'uncaught_exception', error: error.message }
            });
        }
        return respond200({
            success: false,
            error: error.message,
            step: 'uncaught_exception'
        }, '15-error');
    }
}
