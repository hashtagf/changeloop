import { currentWaivers } from "../../core/user-decisions.mjs";
import {
  isPostReleaseCapability, reviewCoveredProviders, splitPostReleaseProviders
} from "../../evidence/provider-catalog.mjs";

export function providersForCapability(
  providers, providerCapability, capability, repositories = []
) {
  const instances = [];
  for (const [provider, config] of Object.entries(providers)) {
    if (providerCapability(provider, config) !== capability) continue;
    if (config.repository && repositories.length > 0 &&
        !repositories.includes(config.repository)) continue;
    instances.push(provider);
  }
  return instances;
}

export function addRequiredCapability(context, capability, repositories = []) {
  if (context.waived.has(capability)) return;
  const instances = providersForCapability(
    context.providers, context.providerCapability, capability, repositories);
  if (instances.length)
    for (const provider of instances) context.required.add(provider);
  else context.required.add(capability);
}

export function requiredProvidersOperation(context, id) {
  const state = context.loadRuntime(id);
  const contract = context.evidence(id);
  const capabilityContext = {
    providers: contract.providers || {},
    providerCapability: context.providerCapability,
    waived: new Set(currentWaivers(state, state.waivers?.some((row) => row.binding)
      ? context.relevantHash?.(id) : undefined).map((row) => row.capability)),
    required: new Set()
  };
  for (const claim of contract.claims) {
    for (const capability of claim.capabilities) {
      addRequiredCapability(
        capabilityContext, capability, claim.repositories || []);
      if (capability === "test" && !capabilityContext.waived.has("test"))
        addRequiredCapability(
          capabilityContext, "discovery", claim.repositories || []);
    }
  }
  const reviewRequired = context.reviewPolicy(id, state, contract).required &&
    !capabilityContext.waived.has("review");
  if (reviewRequired) addRequiredCapability(capabilityContext, "review");
  if (context.resolvedAcceptance(id, state, contract).required)
    addRequiredCapability(capabilityContext, "acceptance");
  for (const capability of context.policyCapabilitySplit(id, contract).enforced)
    addRequiredCapability(capabilityContext, capability);
  const qualityMode = context.foundationPolicy?.().quality?.changeGate || "off";
  const highRisk = state.impact === "high" ||
    (state.securityTriggers || []).length > 0;
  if (qualityMode === "enforce-high-risk" && highRisk)
    for (const capability of ["changed-quality", "mutation"])
      addRequiredCapability(capabilityContext, capability);
  // A specialist provider that only repeats the test command is never run:
  // while review is required, review covers its capability (reported as a
  // `covered-by-review` advisory). Without review it stays required, so it is
  // never covered by nothing.
  if (reviewRequired)
    for (const row of reviewCoveredProviders(contract.providers))
      capabilityContext.required.delete(row.provider);
  // A required provider cannot run without the configured providers it
  // depends on (the visual reviewer reads the screenshots a browser provider
  // writes), so they are required with it.
  const pending = [...capabilityContext.required];
  while (pending.length) {
    const dependencies = capabilityContext.providers[pending.pop()]?.dependsOn;
    for (const dependency of Array.isArray(dependencies) ? dependencies : [])
      if (Object.hasOwn(capabilityContext.providers, dependency) &&
          !capabilityContext.required.has(dependency)) {
        capabilityContext.required.add(dependency);
        pending.push(dependency);
      }
  }
  // Post-release signals (release health, experiment guardrails) arrive only
  // after the change ships, so they gate the rollout and never proof or Land.
  return splitPostReleaseProviders([...capabilityContext.required].sort(),
    contract.providers, context.providerCapability).blocking;
}

// The post-release gates the change still owes, as deferred rollout gates:
// configured providers, capabilities its work types owe, and capabilities its
// claims declare. A capability with no provider instance still owes its gate.
export function postReleaseRolloutGates(context, id) {
  const contract = context.evidence(id);
  const providers = contract.providers || {};
  const gates = splitPostReleaseProviders(Object.keys(providers).sort(), providers,
    context.providerCapability).rolloutGates;
  const covered = new Set(gates.map((gate) => gate.capability));
  const owed = new Set(context.policyRolloutCapabilities?.(id) || []);
  for (const claim of contract.claims || [])
    for (const capability of claim.capabilities || [])
      if (isPostReleaseCapability(capability)) owed.add(capability);
  const extra = [...owed].filter((capability) => !covered.has(capability)).sort();
  // A waived capability no longer owes its gate; it stays listed as waived so
  // the handoff and archive still show the user's decision.
  const state = context.loadRuntime?.(id);
  const waived = new Set(state ? currentWaivers(state, state.waivers?.some((row) => row.binding)
    ? context.relevantHash?.(id) : undefined).map((row) => row.capability) : []);
  return [...gates, ...splitPostReleaseProviders(extra, {}, context.providerCapability).rolloutGates]
    .map((gate) => waived.has(gate.capability) ? { ...gate, status: "waived" } : gate);
}

// The capabilities review covers in place of a provider that only repeats the
// test command; empty when review is not required (waived or not selected),
// because then nothing covers them and the provider stays required.
export function reviewCoveredAdvisories(contract, reviewRequired) {
  if (!reviewRequired) return [];
  return reviewCoveredProviders(contract.providers)
    .map((row) => ({
      capability: row.capability, provider: row.provider,
      reason: "covered-by-review", status: "covered-by-review", aliasOf: row.aliasOf,
      detail: `its provider only repeats test provider '${row.aliasOf}', so the required ` +
        "review covers it; no receipt claims it passed",
      next: `wire a project-owned ${row.capability} command in execution.yaml to observe it`
    }));
}

export function missingHighRiskQualityCapabilities(state, claims, policy) {
  if (policy?.quality?.changeGate !== "enforce-high-risk") return [];
  if (state.impact !== "high" && !(state.securityTriggers || []).length) return [];
  return ["changed-quality", "mutation"].filter((capability) =>
    !claims.some((claim) => (claim.capabilities || []).includes(capability)));
}
