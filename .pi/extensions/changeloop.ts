// Development loader for this source checkout. Consumer projects use init --host pi.
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createBashTool, createLocalBashOperations } from "@earendil-works/pi-coding-agent";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { importNative } from '../lib/native-import.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const bin = join(root, ".pi/bin");
const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;

export default async function changeloop(pi: ExtensionAPI) {
  // Pi reloads this TS entry, but native ESM otherwise retains an old adapter.
  const adapter = join(root, '.claude/harness/adapters/pi-extension.mjs');
  const revision = createHash('sha256').update(readFileSync(adapter)).digest('hex');
  const { default: install } = await importNative(pathToFileURL(adapter).href + '?pi-revision=' + revision);
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
