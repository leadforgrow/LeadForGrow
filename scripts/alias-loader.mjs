/**
 * Module resolution hook for plain-Node execution of app code.
 *
 * - Maps "@/foo" to "<repo root>/foo" (mirrors jsconfig.json paths).
 * - Retries extensionless imports with ".js", "/index.js" (Next.js bundler
 *   allows these; native Node ESM does not).
 */
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const RETRY_CODES = new Set(['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT']);

export async function resolve(specifier, context, nextResolve) {
  let spec = specifier;
  if (spec.startsWith('@/')) {
    spec = pathToFileURL(path.join(ROOT, spec.slice(2))).href;
  }

  try {
    return await nextResolve(spec, context);
  } catch (err) {
    if (!RETRY_CODES.has(err?.code)) throw err;
    for (const suffix of ['.js', '/index.js', '.mjs']) {
      try {
        return await nextResolve(spec + suffix, context);
      } catch {
        // fall through to next suffix
      }
    }
    throw err;
  }
}
