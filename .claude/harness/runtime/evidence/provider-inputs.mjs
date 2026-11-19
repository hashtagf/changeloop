// A provider's inputs and identity: the workspace files its command reads,
// the patterns and roots that scope its input hash, the adapter fingerprint,
// and the claims it proves per repository.
import { existsSync, statSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { providerTimeoutMs } from "./provider-catalog.mjs";
import { SCREENSHOT_SKIPPED_DIRECTORIES, VISUAL_BUILT_IN, VISUAL_CAPABILITY } from "./visual-review.mjs";
import { bestEffort } from "../core/best-effort.mjs";

export function inputPatternMatches(rel, pattern) {
  if (pattern.endsWith("/**"))
    return rel === pattern.slice(0, -3) || rel.startsWith(pattern.slice(0, -2));
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -1);
    return rel.startsWith(prefix) && !rel.slice(prefix.length).includes("/");
  }
  return rel === pattern || rel.startsWith(`${pattern.replace(/\/$/, "")}/`);
}

function providerInputCovers(config, repositoryId, rel) {
  return (config.inputs || []).some((raw) => {
    const normalized = raw.replaceAll("\\", "/").replace(/^\.\/+/, "");
    const scoped = normalized.match(/^([a-z0-9][a-z0-9._-]*):(.*)$/i);
    if (scoped && scoped[1] !== repositoryId) return false;
    return inputPatternMatches(rel, scoped ? scoped[2] : normalized);
  });
}

export function commandWorkspaceFiles(config, workspace) {
  const files = [];
  const report = typeof config?.report === "string"
    ? config.report.replaceAll("\\", "/").replace(/^\.\/+/, "") : null;
  for (const token of config?.command || []) {
    if (!token || token.startsWith("-") || isAbsolute(token) ||
        token.split(/[\\/]+/).includes("..")) continue;
    const rel = token.replaceAll("\\", "/").replace(/^\.\/+/, "");
    // A report is an output contract, even when the command receives its path
    // as an argument. Binding it as an input would reject the first run after
    // the file appears and would make the provider depend on its own output.
    if (rel === report) continue;
    const path = join(workspace, rel);
    bestEffort(() => {
      if (existsSync(path) && statSync(path).isFile()) files.push(rel);
    });
  }
  return [...new Set(files)].sort();
}

export function uncoveredCommandWorkspaceFiles({
  config, workspace, repositoryId = "root", tracked = (..._args) => false,
  declared = (..._args) => false
}) {
  // Pure checks first: `tracked` may have to consult Git.
  return commandWorkspaceFiles(config, workspace).filter((rel) =>
    !declared(rel) && !providerInputCovers(config, repositoryId, rel) && !tracked(rel));
}

export function providerEvidencePolicy(config = {}) {
  return {
    timeoutMs: providerTimeoutMs(config),
    minimum: config.minimum ?? null,
    report: config.report || null,
    reportFormat: config.reportFormat || null,
    classification: config.classification || null,
    resultProtocol: config.resultProtocol || null,
    criticalCases: [...(config.criticalCases || [])].sort(),
    requiredMutants: [...(config.requiredMutants || [])].sort(),
    mutantKillers: Object.fromEntries(Object.entries(config.mutantKillers || {})
      .sort(([left], [right]) => left.localeCompare(right))),
    foregroundRequired: Boolean(config.foregroundRequired),
    foregroundAvailable: Boolean(config.foregroundAvailable),
    readiness: config.readiness || null
  };
}

export function providerReceiptWriterConflicts(configuredProviders, capabilityOf) {
  const discoveryWriters = new Map();
  const conflicts = [];
  for (const [provider, config] of Object.entries(configuredProviders || {})) {
    if (config?.adapter !== "test-discovery" ||
        capabilityOf(provider, config) !== "test") continue;
    const output = config.discoveryProvider || "discovery";
    if (output === provider)
      conflicts.push({ output, producers: [provider, provider], kind: "same-provider" });
    const prior = discoveryWriters.get(output);
    if (prior && prior !== provider)
      conflicts.push({ output, producers: [prior, provider], kind: "multiple-producers" });
    discoveryWriters.set(output, provider);
  }
  return conflicts;
}

export function adapterConfigurationIdentity(config = {}, command = null) {
  return {
    repository: config.repository || null,
    adapter: config.adapter || "external",
    adapterVersion: String(config.version || "1"),
    command: command || config.command || null,
    inputMode: config.inputMode || null,
    project: config.project || null,
    outputs: config.outputs || [],
    resources: config.resources || null,
    dependsOn: config.dependsOn || []
  };
}

export function adapterServiceIdentity(context, id, config = {}) {
  if (!config.service) return null;
  return {
    name: config.service,
    config: context.evidence(id).execution?.services?.[config.service] || null
  };
}

export function createAdapterFingerprint(context, id, provider, config, command = null) {
  const identity = adapterConfigurationIdentity(config, command);
  return context.stableHash({
    adapterProtocolVersion: context.adapterProtocolVersion,
    providerProtocolVersion: context.providerProtocolVersion,
    provider,
    capability: context.providerCapability(provider, config),
    repository: identity.repository,
    repositories: context.providerRepositories(id, provider, config)
      .map((repository) => repository.id),
    adapter: identity.adapter,
    adapterVersion: identity.adapterVersion,
    command: identity.command,
    claims: context.providerClaims(id, provider, config),
    environment: context.environmentDescriptor(config, id),
    inputMode: identity.inputMode,
    project: identity.project,
    outputs: identity.outputs,
    resources: identity.resources,
    dependsOn: identity.dependsOn,
    service: adapterServiceIdentity(context, id, config),
    executionPolicy: providerEvidencePolicy(config)
  });
}

export function providerHashField(capability, packetBound) {
  if (capability === "review") return "reviewHash";
  return packetBound ? "workspaceHash" : "codeHash";
}

export function providerHashExplicitlyScoped(config) {
  return Boolean(config?.repository || config?.repositories ||
    config?.adapter === "contract-digest");
}

export function repositoryFieldHash(context, id, snapshot, repository, field) {
  return snapshot.repositories?.[repository.id]?.[field] ||
    context.singleRelevantSnapshot(id, repository.workspacePath, true)[field];
}

export function providerWorkspaceHashOperation(context, id, provider, fallback = null) {
  const config = context.providerConfig(id, provider);
  const capability = context.providerCapability(provider, config);
  const field = providerHashField(
    capability, context.packetBoundCapability(id, provider));
  const explicitlyScoped = providerHashExplicitlyScoped(config);
  const repositories = context.providerRepositories(id, provider, config);
  if (!explicitlyScoped) {
    if (field === "workspaceHash") return fallback || context.relevantHash(id);
    return context.relevantSnapshot(id)[field] || fallback || context.relevantHash(id);
  }
  const snapshot = context.relevantSnapshot(id);
  if (repositories.length === 1)
    return repositoryFieldHash(context, id, snapshot, repositories[0], field);
  return context.stableHash({
    version: 1,
    field,
    repositories: repositories.map((repository) => ({
      id: repository.id,
      hash: repositoryFieldHash(context, id, snapshot, repository, field)
    }))
  });
}

export function normalizedProviderInputPatterns(inputs = []) {
  return [...new Set(inputs.map((item) =>
    item.replaceAll("\\", "/").replace(/^\.\/+/, "")))].sort();
}

export function providerInputRoots(context, id, workspace, patterns) {
  const scoped = patterns.filter((pattern) => /^[a-z0-9][a-z0-9._-]*:/i.test(pattern));
  const roots = new Map([
    [workspace, patterns.filter((pattern) => !scoped.includes(pattern))]
  ]);
  for (const pattern of scoped) {
    const separator = pattern.indexOf(":");
    const repositoryId = pattern.slice(0, separator);
    const rest = pattern.slice(separator + 1);
    const root = context.canonicalPath(context.repositoryById(id, repositoryId).workspacePath);
    roots.set(root, [...(roots.get(root) || []), rest]);
  }
  return roots;
}

export function collectProviderInputFiles(context, dir, base, patterns, label, files) {
  for (const entry of context.readDirectory(dir, { withFileTypes: true })) {
    if (context.excludedDirectories.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectProviderInputFiles(context, path, base, patterns, label, files);
      continue;
    }
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    const rel = relative(base, path).replaceAll("\\", "/");
    if (patterns.some((pattern) => context.inputPatternMatches(rel, pattern)))
      files.push({
        path: label ? `${label}:${rel}` : rel,
        identity: context.filesystemEntryIdentity(path)
      });
  }
}

export function sortProviderInputFiles(files) {
  return files.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
}

export function providerInputIdentityOperation(context, id, provider,
    config = context.providerConfig(id, provider), globalHash = null) {
  const workspace = context.canonicalPath(context.providerWorkspace(id, provider, config));
  if (!Array.isArray(config?.inputs) || config.inputs.length === 0) {
    const workspaceHash = globalHash || context.providerWorkspaceHash(id, provider);
    return {
      mode: "global",
      patterns: [],
      files: [],
      fingerprint: context.stableHash({ mode: "global", workspaceHash })
    };
  }
  const patterns = normalizedProviderInputPatterns(config.inputs);
  const roots = providerInputRoots(context, id, workspace, patterns);
  const files = [];
  for (const [base, scopePatterns] of roots) {
    if (!scopePatterns.length || !context.pathExists(base)) continue;
    collectProviderInputFiles(context, base, base, scopePatterns,
      base === workspace ? null : context.repositoryLabel(id, base), files);
  }
  // Screenshots usually sit in tool output directories the workspace walk
  // skips; the visual receipt is bound to them all the same.
  const screenshots = config.builtIn === VISUAL_BUILT_IN && Array.isArray(config.screenshots)
    ? normalizedProviderInputPatterns(config.screenshots) : [];
  if (screenshots.length && context.pathExists(workspace)) {
    const seen = new Set(files.map((file) => file.path));
    const extra = [];
    collectProviderInputFiles({ ...context, excludedDirectories: SCREENSHOT_SKIPPED_DIRECTORIES },
      workspace, workspace, screenshots, null, extra);
    files.push(...extra.filter((file) => !seen.has(file.path)));
  }
  sortProviderInputFiles(files);
  return {
    mode: "declared",
    patterns,
    files,
    fingerprint: context.stableHash({ mode: "declared", patterns, files })
  };
}

export function claimsForCapability(context, id, claims, capability) {
  if (capability === "review") return context.scopedReviewClaims(claims);
  // A visual provider covers the claims the prototype is bound to, in either
  // mode; only a strict binding also makes it required.
  if (capability === VISUAL_CAPABILITY) {
    const bound = new Set(context.evidence(id).visualClaims || []);
    return claims.filter((claim) =>
      bound.has(claim.id) || claim.capabilities.includes(VISUAL_CAPABILITY));
  }
  // A browser provider's screenshots feed the visual review, so it also covers
  // the claims the prototype is bound to; otherwise the wiring the start
  // template shows (a screenshot command the visual provider depends on)
  // would have no claim to record. Work that owes browser (ui) covers every claim.
  if (capability === "browser" && !context.policyCapabilities(id).includes("browser")) {
    const bound = new Set(context.evidence(id).visualClaims || []);
    return claims.filter((claim) => claim.capabilities.includes("browser") || bound.has(claim.id) ||
      claim.capabilities.includes(VISUAL_CAPABILITY));
  }
  if (capability === "acceptance") {
    const ids = context.resolvedAcceptance(
      id, context.loadRuntime(id), context.evidence(id)).claimIds;
    return claims.filter((claim) => ids.includes(claim.id));
  }
  if (context.policyCapabilities(id).includes(capability)) return claims;
  return claims.filter((claim) =>
    claim.capabilities.includes(capability) ||
    (capability === "discovery" && claim.capabilities.includes("test")));
}

export function providerClaimRepositories(config) {
  if (config?.repositories) return config.repositories;
  if (config?.adapter === "contract-digest") return Object.keys(config.contract || {});
  if (config?.repository) return [config.repository];
  return null;
}

export function claimsInRepositories(claims, repositories) {
  if (!repositories) return claims;
  return claims.filter((claim) =>
    !claim.repositories || claim.repositories.some((repository) =>
      repositories.includes(repository)));
}

export function claimsForProviderOperation(context, id, provider) {
  const claims = context.evidence(id).claims;
  const config = context.providerConfig(id, provider);
  const capability = context.providerCapability(provider, config);
  const scoped = claimsForCapability(context, id, claims, capability);
  return claimsInRepositories(scoped, providerClaimRepositories(config));
}
