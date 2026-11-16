// `cloop host pi-runtime`: install this CLI's own package as Pi's
// current shared Change Loop bundle. The shared Pi loader calls it when the
// machine's cloop version differs from Pi's bundle; it is content-addressed,
// so repeating it changes nothing.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { PACKAGE_ROOT } from '../runtime/core/project-installation.mjs';
import { installSharedPi } from './pi-installation.mjs';

const fail = (code, message) => {
  process.stdout.write(`${JSON.stringify({ protocol: 1, error: { code, message } })}\n`);
  process.exit(2);
};
const args = process.argv.slice(2);
let agentDir = process.env.PI_CODING_AGENT_DIR || join(homedir(), '.pi/agent');
for (let index = 0; index < args.length; index += 1) {
  const [flag, value] = [args[index], args[index + 1]];
  if (flag === '--protocol') { if (value !== '1') fail('unsupported-protocol', 'Only protocol 1 is supported.'); index += 1; }
  else if (flag === '--format') { if (value !== 'json') fail('unsupported-format', 'Only json is supported.'); index += 1; }
  else if (flag === '--agent-dir') { if (!value) fail('invalid-arguments', '--agent-dir needs a path.'); agentDir = value; index += 1; }
  else fail('invalid-arguments', `Unknown argument: ${flag}`);
}
try {
  const version = JSON.parse(readFileSync(join(PACKAGE_ROOT, '.claude/harness/protocol.json'), 'utf8')).runtime;
  const installed = installSharedPi(PACKAGE_ROOT, resolve(agentDir));
  process.stdout.write(`${JSON.stringify({ protocol: 1, foundationVersion: version,
    bundle: installed.bundle, runtimeApi: installed.runtimeApi, path: installed.path })}\n`);
} catch (error) { fail('install-failed', error.message); }
