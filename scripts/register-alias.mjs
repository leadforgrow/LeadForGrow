/**
 * Node entry hook: registers the "@/" alias resolver so code written for the
 * Next.js bundler (jsconfig paths + extensionless imports) also runs under
 * plain Node (standalone worker, scripts).
 *
 * Usage: node --import ./scripts/register-alias.mjs <entry.js>
 */
import { register } from 'node:module';

register(new URL('./alias-loader.mjs', import.meta.url));
