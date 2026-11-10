// Installed at .pi/extensions/changeloop.ts. Pi supplies its own SDK.
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createBashTool, createLocalBashOperations } from "@earendil-works/pi-coding-agent";
import install from "../../.claude/harness/adapters/pi-extension.mjs";

export default function changeloop(pi: ExtensionAPI) {
  install(pi, { createBashTool, createLocalBashOperations });
}
