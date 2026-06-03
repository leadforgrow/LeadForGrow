/**
 * Runs a Node script with --use-system-ca so outbound HTTPS trusts the OS
 * certificate store on Windows. Use via: node scripts/with-system-ca.mjs <script> [args...]
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/with-system-ca.mjs <script> [args...]');
  process.exit(1);
}

const [script, ...scriptArgs] = args;
const scriptPath = path.resolve(script);

const result = spawnSync(process.execPath, ['--use-system-ca', scriptPath, ...scriptArgs], {
  stdio: 'inherit',
  env: process.env,
  shell: false,
});

process.exit(result.status ?? 1);
