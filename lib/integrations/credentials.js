import { encrypt, decrypt, isEncrypted } from '@/lib/encryption';
import { getCatalogEntry, getSecretFieldKeys } from './catalog';

const MASK = '••••••••';

export function encryptCredentials(integrationId, credentials = {}, existing = {}) {
  const secretKeys = getSecretFieldKeys(integrationId);
  const out = { ...existing, ...credentials };

  for (const key of secretKeys) {
    const val = credentials[key];
    if (val === undefined || val === null || val === '') continue;
    if (val === MASK || val.startsWith('••••')) continue; // masked placeholder from client
    if (!isEncrypted(val)) out[key] = encrypt(val);
  }

  return out;
}

export function decryptCredentials(integrationId, credentials = {}) {
  const secretKeys = getSecretFieldKeys(integrationId);
  const out = { ...credentials };

  for (const key of secretKeys) {
    if (out[key] && isEncrypted(out[key])) {
      out[key] = decrypt(out[key]);
    }
  }

  return out;
}

export function redactCredentials(integrationId, credentials = {}) {
  const entry = getCatalogEntry(integrationId);
  if (!entry) return credentials;

  const out = { ...credentials };
  for (const field of entry.fields) {
    if (field.secret && out[field.key]) {
      out[field.key] = MASK;
    }
  }
  return out;
}

export function mergeCredentialsForUpdate(integrationId, incoming = {}, existing = {}) {
  const secretKeys = getSecretFieldKeys(integrationId);
  const merged = { ...existing };

  for (const [key, val] of Object.entries(incoming)) {
    if (secretKeys.includes(key) && (val === MASK || val?.startsWith?.('••••'))) {
      continue; // keep existing secret
    }
    if (val !== undefined && val !== null) merged[key] = val;
  }

  return encryptCredentials(integrationId, merged, existing);
}

export function buildWebhookUrl(baseUrl, catalogEntry, business) {
  if (!catalogEntry?.webhookPath) return null;
  let path = catalogEntry.webhookPath;
  path = path.replace('{businessId}', business._id.toString());
  if (path.includes('{webhookSecret}')) {
    if (!business.webhookSecret) return null;
    path = path.replace('{webhookSecret}', business.webhookSecret);
  }
  return `${baseUrl}${path}`;
}
