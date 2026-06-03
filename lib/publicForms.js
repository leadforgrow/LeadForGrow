/** Public contact / embed form token (safe to expose client-side). */
export const CONTACT_FORM_TOKEN =
  process.env.NEXT_PUBLIC_CONTACT_FORM_TOKEN ||
  'lfg_form_cc85630e9faab53e1c3c61921d7d4e2f3ed64869f499b07e8bbb4f27c3073c27';

/** CRM form API base URL — same-origin in browser unless NEXT_PUBLIC_FORM_API_URL is set. */
export function getFormApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_FORM_API_URL) {
    return process.env.NEXT_PUBLIC_FORM_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.leadforgrow.com';
  return base.replace(/\/$/, '');
}

export function getFormSubmitUrl() {
  return `${getFormApiBaseUrl()}/api/forms/submit`;
}

export function getFormConfigUrl(token = CONTACT_FORM_TOKEN) {
  return `${getFormApiBaseUrl()}/api/forms/config?token=${encodeURIComponent(token)}`;
}
