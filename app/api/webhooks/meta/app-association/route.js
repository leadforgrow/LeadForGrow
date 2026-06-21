import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Integration from '@/models/Integration';
import { decryptCredentials } from '@/lib/integrations/credentials';
import { resolveMetaAdsCredentials } from '@/lib/meta/credentials';
import { metaError } from '@/lib/meta/logger';
import { getRecentWebhookIngress } from '@/lib/meta/webhookIngress';
import {
  getAppWebhookSubscriptions,
  getAppMetadata,
  getPageLeadgenForms,
  getPageSubscribedApps,
  postPageSubscribedApps,
  analyzeAppSubscriptions
} from '@/lib/meta/appAssociation';

const EXPECTED_APP_ID = '2089887098254828';
const PAGE_ID = '1130878270106336';

/**
 * GET /api/webhooks/meta/app-association?businessId=...&forceSubscribe=1
 * Meta App ↔ Page association only (why Meta never POSTs webhooks).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const forceSubscribe = searchParams.get('forceSubscribe') === '1';

  if (!businessId) {
    return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400 });
  }

  try {
    await dbConnect();

    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    const integration = await Integration.findOne({ businessId, integrationId: 'meta-ads' });
    const metaCreds = await resolveMetaAdsCredentials(business);
    const decrypted = integration?.credentials
      ? decryptCredentials('meta-ads', integration.credentials)
      : null;

    const pageId = String(metaCreds.pageId || PAGE_ID);
    const pageAccessToken = metaCreds.accessToken;
    const appId = String(metaCreds.appId || decrypted?.appId || EXPECTED_APP_ID);
    const appSecret = metaCreds.appSecret || decrypted?.appSecret;

    const perBusinessCallback = `https://leadforgrow.com/api/webhooks/meta/${businessId}`;
    const genericCallback = 'https://leadforgrow.com/api/webhooks/meta';

    const appMetadata = appSecret ? await getAppMetadata(appId, appSecret) : { ok: false, error: 'no_app_secret' };
    const appSubscriptions = appSecret
      ? await getAppWebhookSubscriptions(appId, appSecret)
      : { ok: false, error: 'no_app_secret' };

    const subscriptionAnalysis = appSubscriptions.ok
      ? analyzeAppSubscriptions(appSubscriptions.data, [perBusinessCallback, genericCallback])
      : null;

    const pageForms = pageAccessToken
      ? await getPageLeadgenForms(pageId, pageAccessToken)
      : { ok: false, error: 'no_page_token' };

    const subscribedAppsBefore = appSecret
      ? await getPageSubscribedApps(pageId, pageAccessToken, appId, appSecret)
      : null;

    let postSubscribe = null;
    let subscribedAppsAfter = null;

    if (forceSubscribe && pageAccessToken) {
      postSubscribe = await postPageSubscribedApps(pageId, pageAccessToken, 'leadgen');
      subscribedAppsAfter = appSecret
        ? await getPageSubscribedApps(pageId, pageAccessToken, appId, appSecret)
        : null;
    }

    const ingress = await getRecentWebhookIngress({ pageId, limit: 10 });

    const connectLogMessage = integration?.lastTestResult?.message ?? null;
    const connectRanSubscribe = connectLogMessage?.includes('Instant lead webhooks subscribed') ?? false;
    const connectSubscribeFailed = connectLogMessage?.includes('Webhook subscribe failed') ?? false;

    const forms = pageForms.ok ? (pageForms.data?.data ?? []) : [];
    const formsOnWrongPage = forms.filter((f) => f.page_id && String(f.page_id) !== pageId);

    return NextResponse.json({
      success: true,
      diagnosis: 'Meta is not POSTing — this endpoint checks App↔Page association and app-level webhook config only.',
      businessId,
      pageId,
      crmAppId: appId,
      expectedAppId: EXPECTED_APP_ID,
      appIdMatches: appId === EXPECTED_APP_ID,

      callbackUrls: {
        crmExpectedPerBusiness: perBusinessCallback,
        crmExpectedGeneric: genericCallback,
        note: 'Meta App Dashboard → Webhooks → Page callback must match ONE of these exactly (no www, no trailing slash)'
      },

      appMetadata: appMetadata.ok ? appMetadata.data : appMetadata,

      appWebhookSubscriptions: {
        httpStatus: appSubscriptions.status,
        ok: appSubscriptions.ok,
        raw: appSubscriptions.data,
        analysis: subscriptionAnalysis,
        interpretation: !appSubscriptions.ok
          ? 'Cannot read app subscriptions — check App ID and App Secret in CRM'
          : !subscriptionAnalysis?.hasPageLeadgenSubscription
            ? 'ROOT CAUSE LIKELY: App has no active Page webhook subscription with leadgen field at app level — Meta will never POST'
            : !subscriptionAnalysis?.callbackUrlMatchesCrm
              ? 'ROOT CAUSE LIKELY: App webhook callback URL in Meta dashboard does not match CRM URLs above'
              : 'App-level webhook looks configured — check page subscribed_apps below'
      },

      pageLeadgenForms: {
        ok: pageForms.ok,
        formCount: forms.length,
        forms: forms.map((f) => ({
          id: f.id,
          name: f.name,
          status: f.status,
          leads_count: f.leads_count,
          page_id: f.page_id
        })),
        formsOnDifferentPage: formsOnWrongPage,
        interpretation:
          forms.length === 0
            ? 'No lead forms on this page — ads may use another page\'s form'
            : formsOnWrongPage.length > 0
              ? 'Some forms are on a different page_id than configured in CRM'
              : `All ${forms.length} form(s) belong to page ${pageId}`
      },

      pageSubscribedApps: {
        before: subscribedAppsBefore,
        postSubscribe: postSubscribe
          ? {
              httpStatus: postSubscribe.status,
              ok: postSubscribe.ok,
              response: postSubscribe.data
            }
          : null,
        after: subscribedAppsAfter,
        interpretation: {
          getBlockedByPermission:
            subscribedAppsBefore?.pageToken?.data?.error?.message?.includes('pages_manage_metadata') ?? false,
          postSubscribeSucceeded: postSubscribe?.ok ?? false,
          testingToolNoAppAssociated:
            'Lead Ads Testing Tool requires page↔app link visible via subscribed_apps OR correct app selected in tool. GET may fail without pages_manage_metadata even when POST {success:true}.',
          reconnectFlow: {
            lastConnectMessage: connectLogMessage,
            ranSubscribeOnConnect: connectRanSubscribe,
            subscribeFailedOnConnect: connectSubscribeFailed,
            codePath: 'lib/integrations/service.js:267-279 calls subscribePageToLeadgenWebhooks on connect'
          }
        }
      },

      developmentMode: {
        note: 'App Live vs Development is not exposed reliably via Graph API on all apps.',
        testingToolBehavior:
          'In Development mode: Lead Ads Testing Tool often shows "no app associated" unless you are an app admin/developer/tester AND the page is subscribed. Real production ad leads from LIVE campaigns can still webhook in Live mode apps; dev mode restricts test tool and non-role users.',
        recommendation:
          'Confirm in Meta Developer Console → App settings → App mode = Live for production lead ads. Add pages_manage_metadata to token to verify subscribed_apps via GET.'
      },

      tokenPermissions: {
        hasPagesManageMetadata: 'Unknown without debug_token — add pages_manage_metadata to token generation to read GET /subscribed_apps',
        getSubscribedAppsError: subscribedAppsBefore?.pageToken?.data?.error ?? null,
        postSubscribedAppsResult: postSubscribe?.data ?? null
      },

      webhookIngressProof: {
        metaPostsReceived: ingress.length,
        realMetaPostsObserved: ingress.some(
          (r) => r.parsed?.leadgen_id && !['123', 'test', '999888777666'].includes(String(r.parsed.leadgen_id))
        ),
        lastIngress: ingress[0] ?? null,
        conclusion:
          ingress.length === 0 ||
          !ingress.some((r) => r.outcome === 'success' && r.parsed?.leadgen_id)
            ? 'No successful real Meta webhook has reached our server — delivery blocked before our code runs'
            : 'At least one webhook reached server'
      },

      requiredActions: buildRequiredActions(subscriptionAnalysis, postSubscribe, subscribedAppsBefore, connectRanSubscribe)
    });
  } catch (error) {
    metaError('App Association', 'Diagnostic failed', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function buildRequiredActions(analysis, postSubscribe, subscribedBefore, connectRanSubscribe) {
  const actions = [];

  if (!analysis?.hasPageLeadgenSubscription) {
    actions.push({
      priority: 1,
      action: 'Meta Developer Console → your App → Webhooks → Page → Add subscription',
      details: 'Set callback URL to https://leadforgrow.com/api/webhooks/meta/696956dde910b99089019e29 and subscribe to leadgen field'
    });
  }

  if (analysis && !analysis.callbackUrlMatchesCrm) {
    actions.push({
      priority: 1,
      action: 'Fix App webhook callback URL in Meta Dashboard',
      details: `Current app callbacks: ${JSON.stringify(analysis.configuredCallbacks)} — must match CRM URL exactly`
    });
  }

  if (!connectRanSubscribe) {
    actions.push({
      priority: 2,
      action: 'Reconnect Meta Ads in CRM to run POST /subscribed_apps',
      details: 'lib/integrations/service.js:273 — or call ?forceSubscribe=1 on this endpoint'
    });
  }

  if (subscribedBefore?.pageToken?.data?.error?.code === 200) {
    actions.push({
      priority: 2,
      action: 'Regenerate Page Access Token with pages_manage_metadata permission',
      details: 'Needed to verify GET /subscribed_apps — Testing Tool may also require stronger page permissions'
    });
  }

  if (postSubscribe?.ok && postSubscribe?.data?.success) {
    actions.push({
      priority: 3,
      action: 'POST /subscribed_apps returned success — page should be linked to app',
      details: 'If Testing Tool still fails, verify same App ID 2089887098254828 is selected in the tool'
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}
