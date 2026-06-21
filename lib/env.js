/**
 * Centralized environment validation.
 * Fails fast in production when critical secrets are missing.
 */

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

/** Variables required in all environments */
const REQUIRED = ['MONGODB_URI', 'JWT_SECRET'];

/** Variables required only in production */
const PROD_REQUIRED = [
  'JWT_SECRET',
  'MONGODB_URI',
  'LFG_ADMIN_PASSWORD',
  'CRON_SECRET',
];

/** Recommended for production worker tier */
const PROD_RECOMMENDED = ['REDIS_URL'];

const WARNINGS = [];

function requireVar(name) {
  const value = process.env[name];
  if (value && value.trim() !== '') return value;

  // Dev-only fallback for JWT to allow local bootstrapping
  if (isDev && name === 'JWT_SECRET') {
    console.warn('[Env] DEV ONLY: JWT_SECRET not set — using insecure dev fallback. Copy .env.example → .env.local');
    return 'dev-only-jwt-secret-do-not-use-in-production';
  }

  if (isDev && name === 'MONGODB_URI') {
    throw new Error(
      `[Env] Missing MONGODB_URI. Copy .env.example to .env.local and set your Atlas connection string.`
    );
  }




  

  throw new Error(
    `[Env] Missing required environment variable: ${name}. ` +
      'Copy .env.example to .env.local and configure all secrets.'
  );
}

function warnIfMissing(name, message) {
  if (!process.env[name]) {
    WARNINGS.push(`[Env] ${name} not set — ${message}`);
  }
}

/**
 * Validate environment at startup. Call from mongodb.js and worker entrypoints.
 */
export function validateEnv(options = {}) {
  const { strict = isProd } = options;

  for (const name of REQUIRED) {
    if (strict) requireVar(name);
    else warnIfMissing(name, 'required for secure operation');
  }

  if (strict) {
    for (const name of PROD_REQUIRED) {
      requireVar(name);
    }
    for (const name of PROD_RECOMMENDED) {
      warnIfMissing(name, 'background jobs will run synchronously (not scalable)');
    }

    // Reject known insecure fallback values in production
    const jwt = process.env.JWT_SECRET;
    if (jwt && (jwt === 'lfg_fallback_secret' || jwt.length < 32)) {
      throw new Error('[Env] JWT_SECRET must be a strong random string (32+ chars) in production');
    }

    const adminPw = process.env.LFG_ADMIN_PASSWORD;
    if (adminPw && (adminPw === 'lfg' || adminPw.length < 12)) {
      throw new Error('[Env] LFG_ADMIN_PASSWORD must be a strong password in production');
    }
  }

  if (WARNINGS.length && isDev) {
    WARNINGS.forEach((w) => console.warn(w));
  }

  return {
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    redisUrl: process.env.REDIS_URL,
    isProd,
    isDev,
  };
}

/** Lazy singleton — validated once per process */
let _validated = false;
export function ensureEnv() {
  if (!_validated) {
    validateEnv({ strict: isProd });
    _validated = true;
  }
}

export function getEnv(name, fallback = undefined) {
  return process.env[name] ?? fallback;
}

export function requireEnv(name) {
  return requireVar(name);
}
