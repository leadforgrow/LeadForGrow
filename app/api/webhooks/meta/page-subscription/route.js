import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Integration from '@/models/Integration';
import { decryptCredentials } from '@/lib/integrations/credentials';
import { resolveMetaAdsCredentials } from '@/lib/meta/credentials';
import { metaLog, metaError } from '@/lib/meta/logger';

const GRAPH_VERSION = 'v25.0';
const EXPECTED_APP_ID = '2089887098254828';
const LEADGEN_FIELD = 'leadgen';

async function graphGet(path, accessToken) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  url.searchParams.set('access_token', accessToken);
  const response = await fetch(url.toString());
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

async function graphPost(path, accessToken, params) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${path}`;
  const body = new URLSearchParams({ ...params, access_token: accessToken });
  const response = await fetch(url, { method: 'POST', body });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

function appInSubscriptionList(apps, appId) {
  const list = Array.isArray(apps) ? apps : [];
  return list.find((row) => String(row.id) === String(appId) || String(row.app_id) === String(appId));
}

/**
 * GET /api/webhooks/meta/page-subscription?businessId=...&subscribe=1
 * Uses CRM Page Access Token to inspect / fix page ↔ app subscription (subscribed_apps).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const subscribe = searchParams.get('subscribe') === '1';

  if (!businessId) {
    return NextResponse.json({ success: false, error: 'businessId query param required' }, { status: 400 });
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

    const pageId = metaCreds.pageId || decrypted?.pageId;
    const pageAccessToken = metaCreds.accessToken;
    const crmAppId = metaCreds.appId || decrypted?.appId || null;

    if (!pageId || !pageAccessToken) {
      return NextResponse.json({
        success: false,
        error: 'Page ID or Page Access Token missing in CRM credentials'
      }, { status: 400 });
    }

    metaLog('Page Subscription', `GET subscribed_apps for page ${pageId}`, { businessId, crmAppId });

    const getBefore = await graphGet(`${pageId}/subscribed_apps`, pageAccessToken);

    let postSubscribe = null;
    let getAfter = null;
    const beforeApps = getBefore.data?.data ?? [];
    const expectedPresent = Boolean(appInSubscriptionList(beforeApps, EXPECTED_APP_ID));

    const shouldSubscribe =
      subscribe &&
      getBefore.ok &&
      (!beforeApps.length || !expectedPresent);

    if (shouldSubscribe) {
      metaLog('Page Subscription', `POST subscribed_apps for page ${pageId}`);
      postSubscribe = await graphPost(`${pageId}/subscribed_apps`, pageAccessToken, {
        subscribed_fields: LEADGEN_FIELD
      });
      getAfter = await graphGet(`${pageId}/subscribed_apps`, pageAccessToken);
    }

    const afterApps = (getAfter ?? getBefore).data?.data ?? [];
    const afterExpectedPresent = Boolean(appInSubscriptionList(afterApps, EXPECTED_APP_ID));

    return NextResponse.json({
      success: true,
      businessId,
      pageId: String(pageId),
      pageName: 'Leadforgrow',
      crmAppId: crmAppId ? String(crmAppId) : null,
      expectedAppId: EXPECTED_APP_ID,
      crmAppIdMatchesExpected: crmAppId ? String(crmAppId) === EXPECTED_APP_ID : null,
      graphVersion: GRAPH_VERSION,
      step1_get_subscribed_apps: {
        httpStatus: getBefore.status,
        ok: getBefore.ok,
        response: getBefore.data
      },
      step2_post_subscribed_apps: postSubscribe
        ? {
            required: true,
            httpStatus: postSubscribe.status,
            ok: postSubscribe.ok,
            response: postSubscribe.data
          }
        : {
            required: false,
            reason: expectedPresent
              ? `App ${EXPECTED_APP_ID} already in subscribed_apps`
              : subscribe
                ? 'subscribe=1 not set — pass ?subscribe=1 to attempt POST'
                : 'Page already has subscribed apps but not expected app — pass ?subscribe=1'
          },
      step3_get_subscribed_apps_after: getAfter
        ? {
            httpStatus: getAfter.status,
            ok: getAfter.ok,
            response: getAfter.data
          }
        : null,
      summary: {
        appsBeforeCount: beforeApps.length,
        appsAfterCount: afterApps.length,
        expectedAppPresentBefore: expectedPresent,
        expectedAppPresentAfter: afterExpectedPresent,
        postSubscribeRequired: shouldSubscribe,
        testingToolHint:
          !afterExpectedPresent
            ? 'Meta Lead Ads Testing Tool shows "no app associated" when page subscribed_apps is empty or does not include your app ID'
            : 'Page is subscribed to expected app — Testing Tool should list this app if you select the same app in Graph API Explorer / Testing Tool'
      },
      errors: [getBefore, postSubscribe, getAfter]
        .filter(Boolean)
        .filter((r) => !r.ok)
        .map((r) => r.data?.error || r.data)
    });
  } catch (error) {
    metaError('Page Subscription', 'Diagnostic failed', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
