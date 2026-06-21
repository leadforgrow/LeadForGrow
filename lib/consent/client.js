import { CONTACT_FORM_TOKEN } from '@/lib/publicForms';

export const CONSENT_STORAGE_KEY = 'lfg_cookie_consent';
export const VISITOR_ID_KEY = 'lfg_visitor_id';
export const CONSENT_VERSION = '1.0';
export const PENDING_VIEWS_KEY = 'lfg_pending_page_views';

export function getFormApiBaseUrl() {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

export function getConsentLogUrl() {
  return `${getFormApiBaseUrl()}/api/consent/log`;
}

export function getConsentTrackUrl() {
  return `${getFormApiBaseUrl()}/api/consent/track`;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function generateVisitorId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `vis_${crypto.randomUUID()}`;
  }
  return `vis_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export function getConsentState() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;
  const parsed = safeParse(raw);
  if (!parsed?.status) return null;
  return {
    status: parsed.status,
    analyticsAllowed: Boolean(parsed.analyticsAllowed),
    marketingAllowed: Boolean(parsed.marketingAllowed),
    decidedAt: parsed.decidedAt || null,
    consentVersion: parsed.consentVersion || CONSENT_VERSION,
    visitorId: parsed.visitorId || getVisitorId(),
  };
}

export function saveConsentState(state) {
  if (typeof window === 'undefined') return;
  const payload = {
    ...state,
    visitorId: state.visitorId || getVisitorId(),
    consentVersion: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('lfg-consent-changed', { detail: payload }));
}

export function hasAnalyticsConsent() {
  const state = getConsentState();
  return state?.status === 'granted' && state.analyticsAllowed;
}

export function hasMarketingConsent() {
  const state = getConsentState();
  return state?.status === 'granted' && state.marketingAllowed;
}

export function queuePageView(view) {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return;
  const pending = safeParse(localStorage.getItem(PENDING_VIEWS_KEY)) || [];
  pending.push({ ...view, viewedAt: new Date().toISOString() });
  localStorage.setItem(PENDING_VIEWS_KEY, JSON.stringify(pending.slice(-30)));
}

export function flushPendingPageViews() {
  if (typeof window === 'undefined') return [];
  const pending = safeParse(localStorage.getItem(PENDING_VIEWS_KEY)) || [];
  localStorage.removeItem(PENDING_VIEWS_KEY);
  return pending;
}

export async function logConsentToServer({
  status,
  analyticsAllowed,
  marketingAllowed,
  pageViews = [],
  notes = '',
}) {
  const visitorId = getVisitorId();
  const payload = {
    token: CONTACT_FORM_TOKEN,
    visitorId,
    status,
    analyticsAllowed,
    marketingAllowed,
    consentVersion: CONSENT_VERSION,
    sourcePage: window.location.href,
    locale: navigator.language || 'en',
    regionHint: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    pageViews,
    notes,
  };

  const resp = await fetch(getConsentLogUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    throw new Error(data.error || 'Failed to log consent');
  }

  return data;
}

export async function trackPageViewToServer({ path, title, durationSec = 0 }) {
  if (!hasAnalyticsConsent()) return null;

  const resp = await fetch(getConsentTrackUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: CONTACT_FORM_TOKEN,
      visitorId: getVisitorId(),
      path,
      title,
      durationSec,
    }),
  });

  const data = await resp.json();
  return data;
}

export function getConsentPayloadForForms() {
  const state = getConsentState();
  const visitorId = getVisitorId();
  return {
    visitorId,
    cookieConsent: state?.status || 'pending',
    analyticsAllowed: state?.analyticsAllowed ?? false,
    marketingAllowed: state?.marketingAllowed ?? false,
    consentVersion: state?.consentVersion || CONSENT_VERSION,
    consentDecidedAt: state?.decidedAt || null,
  };
}
