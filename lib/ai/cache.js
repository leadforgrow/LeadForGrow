const store = new Map();
const DEFAULT_TTL = 5 * 60 * 1000;

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet(key, value, ttlMs = DEFAULT_TTL) {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function cacheKey(parts) {
  return parts.filter(Boolean).join(':');
}

export default { cacheGet, cacheSet, cacheKey };
