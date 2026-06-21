import { metaLog, metaWarn } from '@/lib/meta/logger';
import { throwIfMetaGraphError } from '@/lib/meta/token';

const GRAPH_VERSION = 'v21.0';
const LEADGEN_FIELD = 'leadgen';

/**
 * Subscribe a Facebook Page to send leadgen webhooks to this app's callback URL.
 * Requires the app's Webhooks product to be configured in Meta Developer Console.
 */
export async function subscribePageToLeadgenWebhooks(pageId, pageAccessToken) {
  if (!pageId || !pageAccessToken) {
    throw new Error('Page ID and access token are required for webhook subscription');
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/subscribed_apps`;
  const body = new URLSearchParams({
    subscribed_fields: LEADGEN_FIELD,
    access_token: pageAccessToken
  });

  metaLog('Webhook Subscribe', `Subscribing page ${pageId} to ${LEADGEN_FIELD}`);

  const response = await fetch(url, { method: 'POST', body });
  const data = await response.json();

  throwIfMetaGraphError(response, data);

  metaLog('Webhook Subscribe', `Page ${pageId} subscribed successfully`, data);

  return {
    success: true,
    pageId: String(pageId),
    subscribedFields: LEADGEN_FIELD
  };
}

/**
 * Check whether the page has any app subscribed (best-effort health check).
 */
export async function getPageWebhookSubscriptionStatus(pageId, pageAccessToken) {
  if (!pageId || !pageAccessToken) {
    return { subscribed: false, message: 'Missing page ID or token' };
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/subscribed_apps`);
  url.searchParams.set('access_token', pageAccessToken);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'Could not read page webhook subscription';
    metaWarn('Webhook Subscribe', message);
    return { subscribed: false, message };
  }

  const apps = Array.isArray(data.data) ? data.data : [];
  metaLog('Webhook Subscribe', `GET /${pageId}/subscribed_apps`, { appCount: apps.length, apps });

  return {
    subscribed: apps.length > 0,
    appCount: apps.length,
    apps,
    raw: data
  };
}
