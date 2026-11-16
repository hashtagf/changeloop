// Development loader for this source checkout. Consumer projects use init --host pi.
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createBashTool, createLocalBashOperations } from "@earendil-works/pi-coding-agent";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { importRevision } from '../lib/native-import.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const bin = join(root, ".pi/bin");
const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;
// The adapter imports runtime and hook modules; any of them changing is a new revision.
const sources = (dir: string): string[] => !existsSync(dir) ? [] : readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)
  .flatMap((entry) => entry.isDirectory() ? (entry.name === "node_modules" || entry.name === "tests" ? [] : sources(join(dir, entry.name)))
    : /\.(mjs|js|json)$/.test(entry.name) ? [join(dir, entry.name)] : []);

export default async function changeloop(pi: ExtensionAPI) {
  // Pi reloads this TS entry, but native ESM otherwise retains the old adapter graph.
  const adapter = join(root, '.claude/harness/adapters/pi-extension.mjs');
  const hash = createHash('sha256');
  for (const file of ["harness", "hooks"].flatMap((dir) => sources(join(root, ".claude", dir)))) hash.update(file).update('\0').update(readFileSync(file)).update('\0');
  const { default: install } = await importRevision(pathToFileURL(adapter).href, hash.digest('hex'), pathToFileURL(join(root, '.claude')).href);
  install(pi, {
    projectRoot: root,
    hostExecutable: "bash",
    hostPrefixArgs: [join(root, "cli.sh")],
    createBashTool(cwd: string, options: any = {}) {
      return createBashTool(cwd, {
        ...options,
        spawnHook(input) {
          const result = options.spawnHook ? options.spawnHook(input) : input;
          return { ...result, env: { ...result.env, PATH: `${bin}:${result.env.PATH || ""}` } };
        },
      });
    },
    createLocalBashOperations() {
      const local = createLocalBashOperations();
      return {
        exec(command: string, cwd: string, options: any) {
          return local.exec(`export PATH=${quote(`${bin}:${process.env.PATH || ""}`)}\n${command}`, cwd, options);
        },
      };
    },
  });
}
