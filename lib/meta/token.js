const GRAPH_VERSION = 'v21.0';

export class MetaGraphError extends Error {
  constructor(message, { tokenExpired = false, code, subcode, raw } = {}) {
    super(message);
    this.name = 'MetaGraphError';
    this.tokenExpired = tokenExpired;
    this.code = code;
    this.subcode = subcode;
    this.raw = raw;
  }
}

export function parseMetaGraphError(body) {
  const err = body?.error || body || {};
  const message = err.message || 'Meta API request failed';
  const code = err.code;
  const subcode = err.error_subcode;
  const tokenExpired =
    code === 190 ||
    subcode === 463 ||
    /session has expired|error validating access token|access token.*expired/i.test(message);

  return { message, code, subcode, tokenExpired };
}

export function throwIfMetaGraphError(response, body) {
  if (response.ok) return body;
  const parsed = parseMetaGraphError(body);
  throw new MetaGraphError(parsed.message, {
    tokenExpired: parsed.tokenExpired,
    code: parsed.code,
    subcode: parsed.subcode,
    raw: body
  });
}

export const META_TOKEN_EXPIRED_USER_MESSAGE =
  'Your Meta Page Access Token has expired. Reconnect Meta Ads: open Meta Business Suite → Settings → Integrations → generate a new Page Access Token, then paste it in Integrations → Meta Ads → Edit credentials.';

/**
 * Exchange a short-lived user token for a long-lived token, then fetch a
 * non-expiring page access token (Meta standard flow).
 */
export async function resolveLongLivedPageToken({ accessToken, pageId, appId, appSecret }) {
  if (!accessToken || !pageId) {
    return { accessToken, exchanged: false, message: 'Missing token or page ID' };
  }

  if (!appId || !appSecret) {
    return { accessToken, exchanged: false, message: 'App ID and App Secret required for token exchange' };
  }

  let userToken = accessToken;

  const exchangeUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
  exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
  exchangeUrl.searchParams.set('client_id', appId);
  exchangeUrl.searchParams.set('client_secret', appSecret);
  exchangeUrl.searchParams.set('fb_exchange_token', accessToken);

  const exchangeRes = await fetch(exchangeUrl.toString());
  const exchangeData = await exchangeRes.json();

  if (exchangeRes.ok && exchangeData.access_token) {
    userToken = exchangeData.access_token;
  }

  const pageUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}`);
  pageUrl.searchParams.set('fields', 'access_token,name,id');
  pageUrl.searchParams.set('access_token', userToken);

  const pageRes = await fetch(pageUrl.toString());
  const pageData = await pageRes.json();

  if (!pageRes.ok) {
    const parsed = parseMetaGraphError(pageData);
    return {
      accessToken,
      exchanged: false,
      message: parsed.message,
      tokenExpired: parsed.tokenExpired
    };
  }

  if (pageData.access_token) {
    return {
      accessToken: pageData.access_token,
      exchanged: true,
      pageName: pageData.name,
      pageId: pageData.id,
      message: 'Long-lived page access token obtained'
    };
  }

  return { accessToken, exchanged: false, message: 'Could not obtain page access token' };
}

export async function validateMetaPageToken(pageId, accessToken) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}?fields=name,id`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await response.json();
  throwIfMetaGraphError(response, data);
  return data;
}
