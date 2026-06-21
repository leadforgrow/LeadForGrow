import { metaLog } from '@/lib/meta/logger';

const GRAPH_VERSION = 'v25.0';

export function buildAppAccessToken(appId, appSecret) {
  if (!appId || !appSecret) return null;
  return `${appId}|${appSecret}`;
}

export async function graphRequest(path, accessToken, { method = 'GET', params = {} } = {}) {
  if (method === 'GET') {
    const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
    url.searchParams.set('access_token', accessToken);
    for (const [key, value] of Object.entries(params)) {
      if (value != null) url.searchParams.set(key, String(value));
    }
    const response = await fetch(url.toString());
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${path}`;
  const body = new URLSearchParams({ ...params, access_token: accessToken });
  const response = await fetch(url, { method: 'POST', body });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

/**
 * App-level webhook subscriptions (callback URL Meta uses for POST delivery).
 * Requires App access token: {app-id}|{app-secret}
 */
export async function getAppWebhookSubscriptions(appId, appSecret) {
  const appToken = buildAppAccessToken(appId, appSecret);
  if (!appToken) {
    return { ok: false, error: 'Missing appId or appSecret' };
  }

  metaLog('App Association', `GET /${appId}/subscriptions`);
  const result = await graphRequest(`${appId}/subscriptions`, appToken);
  return { appTokenUsed: 'app_id|app_secret', ...result };
}

/**
 * Basic app metadata (Live vs Development is dashboard-only; log what Graph exposes).
 */
export async function getAppMetadata(appId, appSecret) {
  const appToken = buildAppAccessToken(appId, appSecret);
  if (!appToken) return { ok: false, error: 'Missing appId or appSecret' };

  return graphRequest(`${appId}`, appToken, {
    params: { fields: 'name,category,link,restrictions' }
  });
}

/**
 * Lead forms on the page — confirms forms belong to configured page.
 */
export async function getPageLeadgenForms(pageId, pageAccessToken) {
  metaLog('App Association', `GET /${pageId}/leadgen_forms`);
  return graphRequest(`${pageId}/leadgen_forms`, pageAccessToken, {
    params: { fields: 'id,name,status,leads_count,page_id', limit: 50 }
  });
}

/**
 * Page subscribed apps — try page token and app token.
 */
export async function getPageSubscribedApps(pageId, pageAccessToken, appId, appSecret) {
  const pageResult = await graphRequest(`${pageId}/subscribed_apps`, pageAccessToken);

  const appToken = buildAppAccessToken(appId, appSecret);
  let appTokenResult = null;
  if (appToken) {
    appTokenResult = await graphRequest(`${pageId}/subscribed_apps`, appToken);
  }

  return { pageToken: pageResult, appToken: appTokenResult };
}

export async function postPageSubscribedApps(pageId, pageAccessToken, subscribedFields = 'leadgen') {
  metaLog('App Association', `POST /${pageId}/subscribed_apps fields=${subscribedFields}`);
  return graphRequest(`${pageId}/subscribed_apps`, pageAccessToken, {
    method: 'POST',
    params: { subscribed_fields: subscribedFields }
  });
}

export function analyzeAppSubscriptions(subscriptionsData, expectedCallbackUrls = []) {
  const rows = Array.isArray(subscriptionsData?.data) ? subscriptionsData.data : [];
  const pageSubs = rows.filter((r) => r.object === 'page');

  const callbacks = pageSubs.map((r) => ({
    object: r.object,
    callback_url: r.callback_url,
    active: r.active,
    fields: r.fields || r.subscribed_fields || [],
    hasLeadgen: (r.fields || r.subscribed_fields || []).includes('leadgen')
  }));

  const normalizedExpected = expectedCallbackUrls.map((u) => u?.replace(/\/$/, ''));
  const callbackMatch = callbacks.some((c) =>
    normalizedExpected.some((exp) => c.callback_url?.replace(/\/$/, '') === exp)
  );

  return {
    totalSubscriptions: rows.length,
    pageSubscriptions: callbacks,
    hasPageLeadgenSubscription: callbacks.some((c) => c.hasLeadgen && c.active !== false),
    callbackUrlMatchesCrm: callbackMatch,
    configuredCallbacks: callbacks.map((c) => c.callback_url)
  };
}
