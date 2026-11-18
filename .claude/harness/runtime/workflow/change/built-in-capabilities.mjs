// Capabilities a harness-owned provider can produce without project tooling.
// Today that is accessibility: a static read of the markup a change touched.
import { ACCESSIBILITY_BUILT_IN } from "../../evidence/accessibility-check.mjs";

export function builtInCovers(config) {
  return config?.builtIn === ACCESSIBILITY_BUILT_IN;
}

// A capability the declared work type owes is enforced as soon as a
// harness-owned provider can produce it (accessibility for `ui`), so a missing
// project tool never downgrades it to an advisory.
export function builtInOwedCapabilities(workTypeActions, providerConfig) {
  return new Set((workTypeActions || []).map((action) => action.capability)
    .filter((capability) => builtInCovers(providerConfig(capability))));
}

// What a path-inferred capability nobody wired asks for.
export function inferredAdvisoryNext(id, capability) {
  return capability === "accessibility"
    ? "declare workType 'ui' to enforce the built-in accessibility check, configure a project-owned " +
      `accessibility command in openspec/changes/${id}/execution.yaml, or accept the advisory`
    : `configure a project-owned ${capability} provider in openspec/changes/${id}/execution.yaml, ` +
      "or accept the advisory";
}
