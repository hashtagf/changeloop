// Capabilities a harness-owned provider can produce without project tooling.
// Accessibility (a static read of the markup a change touched) and browser
// (the running app, where the project serves one and Chrome is installed).
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ACCESSIBILITY_BUILT_IN } from "../../evidence/accessibility-check.mjs";
import { APP_SMOKE_BUILT_IN } from "../../evidence/app-smoke-check.mjs";

export function builtInCovers(config) {
  return [ACCESSIBILITY_BUILT_IN, APP_SMOKE_BUILT_IN].includes(config?.builtIn);
}

// A capability the declared work type owes is enforced as soon as a
// harness-owned provider can produce it (accessibility for `ui`), so a missing
// project tool never downgrades it to an advisory.
// A committed quality/foundation-quality.json is the project wiring
// static-analysis: evidence bootstrap binds it to `quality run --enforce`, so
// an onboarded project's ratchets check every change the policy flags.
export function projectWiredCapabilities(root) {
  return existsSync(join(root, "quality", "foundation-quality.json")) ? ["static-analysis"] : [];
}

export function builtInOwedCapabilities(workTypeActions, providerConfig) {
  return new Set((workTypeActions || []).map((action) => action.capability)
    .filter((capability) => builtInCovers(providerConfig(capability))));
}

// What a path-inferred capability nobody wired asks for.
export function inferredAdvisoryNext(id, capability) {
  if (capability === "browser")
    return "the built-in running-app check needs a dev/start/serve/preview script or an index.html and Chrome " +
      `(or CHROME_PATH); otherwise configure a project-owned browser provider in openspec/changes/${id}/execution.yaml, ` +
      "or accept the advisory";
  return capability === "accessibility"
    ? "declare workType 'ui' to enforce the built-in accessibility check, configure a project-owned " +
      `accessibility command in openspec/changes/${id}/execution.yaml, or accept the advisory`
    : `configure a project-owned ${capability} provider in openspec/changes/${id}/execution.yaml, ` +
      "or accept the advisory";
}
