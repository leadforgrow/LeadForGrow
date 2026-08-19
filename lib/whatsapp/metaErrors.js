/**
 * Human-readable translations for Meta WhatsApp Cloud API error codes.
 * Every code returns { title, explanation, actionable } — actionable being
 * something the user can actually do to fix it.
 *
 * Source: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
 */
const CODE_MAP = {
  '131047': {
    title: '24-hour window closed',
    explanation: 'You can only send free-text messages within 24 hours of the customer messaging you.',
    actionable: 'Use an approved template message instead, or wait for the customer to reply first.',
  },
  '131048': {
    title: 'Rate limit hit',
    explanation: 'Meta capped your send rate for the day.',
    actionable: 'Reduce send volume. Meta increases limits as your quality rating stays green.',
  },
  '131051': {
    title: 'Unsupported message type',
    explanation: 'This message type is not allowed on your business tier.',
    actionable: 'Contact Meta support or upgrade your tier.',
  },
  '131056': {
    title: 'Duplicate message (pair)',
    explanation: 'Meta detected the same message being sent to the same pair within a short window.',
    actionable: 'Wait a few seconds and retry, or vary the message content.',
  },
  '132000': {
    title: 'Number of parameters does not match',
    explanation: 'The template expects N variables but you sent a different count.',
    actionable: 'Check the template body on Meta side and make sure your variable mapping matches.',
  },
  '132001': {
    title: 'Template not found',
    explanation: 'The template name or language does not match any approved template.',
    actionable: 'Verify the template name is correct and the language code matches (e.g. en_US vs en).',
  },
  '132005': {
    title: 'Translated text too long',
    explanation: 'A variable value exceeds 1024 characters after substitution.',
    actionable: 'Shorten the value passed for one of your {{n}} variables.',
  },
  '132007': {
    title: 'Structure unavailable',
    explanation: 'Template body was empty or the template is not properly configured.',
    actionable: 'Edit the template on Meta and ensure the body is filled.',
  },
  '132012': {
    title: 'Parameter format mismatch',
    explanation: 'A parameter you sent does not match what the template expects — most often a variable in the header or a URL button was not filled, or the counts differ.',
    actionable: 'Open the template in WhatsApp Templates. If it has {{n}} in the header or in a button URL, add mapping for those too. Also strip line breaks and tabs from variable values.',
  },
  '132015': {
    title: 'Template paused',
    explanation: 'Meta paused this template because of low customer engagement or high block/report rate.',
    actionable: 'Wait 24 hours, then Meta may reactivate. Consider editing the template.',
  },
  '132016': {
    title: 'Template disabled',
    explanation: 'Meta disabled this template due to policy violations.',
    actionable: 'Create a new template with different content.',
  },
  '131026': {
    title: 'Message undeliverable',
    explanation: 'The recipient does not have WhatsApp, or their number is not reachable.',
    actionable: 'Verify the number is valid and the person uses WhatsApp.',
  },
  '131052': {
    title: 'Media download failed',
    explanation: 'Meta could not download the media URL you provided.',
    actionable: 'Make sure the URL is publicly reachable and returns the correct MIME type.',
  },
  '190': {
    title: 'Access token expired or revoked',
    explanation: 'Your Meta System User token is no longer valid.',
    actionable: 'Generate a new permanent System User token and update it in Settings → Integrations → WhatsApp.',
  },
  '10': {
    title: 'Permission denied',
    explanation: 'Your access token is missing a required Meta permission.',
    actionable: 'Regenerate the System User token with scopes whatsapp_business_management, whatsapp_business_messaging, business_management.',
  },
};

/**
 * @param {string|number} code
 * @param {string} rawMessage - fallback text
 * @returns {{code:string, title:string, explanation:string, actionable:string, isKnown:boolean}}
 */
export function decodeMetaError(code, rawMessage = '') {
  const key = String(code || '').replace(/^#/, '');
  const entry = CODE_MAP[key];
  if (entry) {
    return { code: `#${key}`, ...entry, isKnown: true };
  }
  return {
    code: key ? `#${key}` : 'unknown',
    title: 'Delivery failed',
    explanation: rawMessage || 'Meta rejected the message with no further detail.',
    actionable: 'Check the raw Meta error in the recipient row for more context.',
    isKnown: false,
  };
}

/**
 * Extract error code from arbitrary error text like "(#132012) Parameter format…"
 */
export function extractErrorCode(text) {
  if (!text) return null;
  const m = String(text).match(/\(#(\d+)\)/) || String(text).match(/\bcode[:\s]*(\d+)/i);
  return m ? m[1] : null;
}
