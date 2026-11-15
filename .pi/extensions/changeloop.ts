// Development loader for this source checkout. Consumer projects use init --host pi.
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createBashTool, createLocalBashOperations } from "@earendil-works/pi-coding-agent";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import install from "../../.claude/harness/adapters/pi-extension.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const bin = join(root, ".pi/bin");
const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;

export default function changeloop(pi: ExtensionAPI) {
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
