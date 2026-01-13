/**
 * lib/phone_normalization.js
 * Normalizes phone numbers to E.164 format for telephony providers like Twilio.
 */

/**
 * Normalizes a phone number string.
 * @param {string} phone The raw phone number
 * @param {string} defaultCountryCode Default country code (e.g. '+91')
 * @returns {string} Normalized E.164 phone number
 */
export function normalizePhoneNumber(phone, defaultCountryCode = '+91') {
  if (!phone) return phone;

  // Remove all non-digit characters except the leading plus
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If it already starts with +, assume it's E.164
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If it's 10 digits and doesn't start with +, prepend default country code
  if (cleaned.length === 10) {
    return `${defaultCountryCode}${cleaned}`;
  }

  // If it starts with 0 and is 11 digits (like 08810...), remove 0 and prepend default
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `${defaultCountryCode}${cleaned.slice(1)}`;
  }

  // Fallback: just prepend + if missing, but this is risky
  return `+${cleaned}`;
}
