// Provider topology: dependency and report-writer issues between providers,
// service resource conflicts, and the readiness status, graph, and next step
// derived from them.
import { dependentClosure } from "../core/graph-execution.mjs";
import { bestEffort } from "../core/best-effort.mjs";

export function visitProviderTopology(providers, provider, trail, state) {
  if (state.visiting.has(provider)) {
    state.issues.push(`provider dependency cycle: ${[...trail, provider].join(" -> ")}`);
    return;
  }
  if (state.visited.has(provider) || !providers[provider]) return;
  state.visiting.add(provider);
  for (const dependency of providers[provider].dependsOn || [])
    visitProviderTopology(providers, dependency, [...trail, provider], state);
  state.visiting.delete(provider);
  state.visited.add(provider);
}

export function providerDependencyIssues(providers) {
  const state = {
    issues: [],
    visiting: new Set(),
    visited: new Set()
  };
  for (const provider of Object.keys(providers))
    visitProviderTopology(providers, provider, [], state);
  return state.issues;
}

export function providerReportIssues(providers) {
  const issues = [];
  const reportOwners = new Map();
  for (const [provider, config] of Object.entries(providers)) {
    if (config.report) {
      const key = config.report.replaceAll("\\", "/");
      const owner = reportOwners.get(key);
      const command = JSON.stringify(config.command || []);
      if (owner && owner.command !== command)
        issues.push(`structured report collision: ${key} (${owner.provider}, ${provider})`);
      else reportOwners.set(key, { provider, command });
    }
    if (config.readiness?.url && !config.readiness.expectBody &&
        !config.readiness.expectHeader)
      issues.push(`provider '${provider}' readiness lacks an identity body/header`);
  }
  return issues;
}

export function serviceResourceIssues(services = {}) {
  const issues = [];
  const owners = new Map();
  for (const [service, config] of Object.entries(services)) {
    let port = null;
    port = bestEffort(() => new URL(config.readiness.url).port || null, port);
    const resources = [...(config.resources || []), ...(port ? [`port:${port}`] : [])];
    for (const resource of resources) {
      const owner = owners.get(resource);
      if (owner && owner !== service)
        issues.push(`service resource collision: ${resource} (${owner}, ${service})`);
      else owners.set(resource, service);
    }
  }
  return issues;
}

export function topologyIssuesOperation({ evidence }, id) {
  const contract = evidence(id);
  const providers = contract.providers || {};
  return [
    ...providerDependencyIssues(providers),
    ...providerReportIssues(providers),
    ...serviceResourceIssues(contract.execution?.services)
  ];
}

export function readinessStatus({
  pending, issues, leases, repositoryConflicts,
  unavailable, repositoryIssues, unconfigured
}) {
  if (pending.length) return "NEEDS_CODE_CHANGE";
  if (issues.length) return "CONFIGURATION_ERROR";
  if (leases.length || repositoryConflicts.length) return "BLOCKED_BY_ACTIVE_WORK";
  if (unavailable.length || repositoryIssues.length) return "INFRASTRUCTURE_ERROR";
  if (unconfigured.length) return "NEEDS_USER_DECISION";
  return "READY";
}

export function readinessGraph(plan, pending) {
  if (!plan?.graph) return null;
  const pendingNodeIds = pending.map((task) => `task:${task.id}`).filter((nodeId) =>
    plan.graph.nodes.some((node) => node.id === nodeId));
  const blockedNodes = dependentClosure(plan.graph, pendingNodeIds);
  const completedTaskNodes = plan.graph.nodes.filter((node) =>
    node.kind === "task" && !pendingNodeIds.includes(node.id)).map((node) => node.id);
  return {
    version: plan.graph.version,
    revision: plan.graph.revision,
    identity: plan.graph.identity,
    nodeCount: plan.graph.nodes.length,
    edgeCount: plan.graph.edges.length,
    pendingNodes: pendingNodeIds,
    affectedNodes: blockedNodes,
    preservedNodes: completedTaskNodes.filter((node) => !blockedNodes.includes(node))
  };
}

export function readinessNext(context, input) {
  const {
    id, status, pending, issues, surfaceFixits, leases,
    repositoryConflicts, unconfigured, unavailable, repositoryIssues = []
  } = input;
  if (status === "NEEDS_CODE_CHANGE") return context.codeChangeRecovery(id, pending);
  if (status === "CONFIGURATION_ERROR")
    return context.configurationRecovery(id, issues, surfaceFixits);
  if (status === "BLOCKED_BY_ACTIVE_WORK")
    return context.activeWorkRecovery(id, leases, repositoryConflicts);
  if (status === "NEEDS_USER_DECISION")
    return unconfigured.map((provider) => context.externalEvidenceRecovery(id, provider));
  if (status === "INFRASTRUCTURE_ERROR")
    return [
      ...(repositoryIssues.length ? [{
        kind: "repair-repository-binding",
        reason: repositoryIssues.join("; "),
        command: `cloop sandbox create ${id} --all`,
        inspectCommand: `cloop sandbox inspect ${id}`
      }] : []),
      ...unavailable.map((provider) => context.unavailableProviderRecovery(id, provider))
    ];
  return [];
}
