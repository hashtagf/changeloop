import { currentWaivers } from "../../core/user-decisions.mjs";

export function waiverRequest(flags, fail) {
  const capability = String(flags.capability || "").trim();
  const decisionRef = String(flags["decision-ref"] || "").trim();
  const reason = String(flags.reason || "").trim();
  if (!capability) fail("change waive requires --capability <capability>");
  if (!decisionRef)
    fail("change waive requires --decision-ref <host-user-decision>; ask the user to authorize withdrawing this gate before recording it");
  return { capability, decisionRef, reason };
}

export function revokeGateWaiver(context, id, state, waivers, request) {
  if (!waivers.some((row) => row.capability === request.capability))
    context.fail(`capability '${request.capability}' has no recorded waiver to revoke`);
  state.waivers = waivers.filter((row) => row.capability !== request.capability);
  context.saveRuntime(state);
  context.log(`WAIVER REVOKED ${id}/${request.capability}\n  the capability is required again\n  next: cloop advance ${id} --through proven`);
}

export function assertWaivableCapability(context, id, request, waivers) {
  if (!request.reason) context.fail("change waive requires --reason <why>");
  if (request.capability === "acceptance")
    context.fail(`acceptance cannot be waived here; withdraw the requirement instead: cloop change resolve ${id} --acceptance-not-required`);
  if (waivers.some((row) => row.capability === request.capability))
    context.fail(`capability '${request.capability}' is already waived`);
  const required = context.requiredProviders(id);
  const capabilityOf = (provider) => required.includes(provider) &&
    context.providerCapability(provider, context.providerConfig(id, provider)) || provider;
  if (!required.includes(request.capability) && !required.some((provider) =>
    capabilityOf(provider) === request.capability))
    context.fail(`capability '${request.capability}' is not required by change '${id}'; nothing to waive`);
  // Waiving test also withdraws the discovery check that counts its tests.
  const withdrawn = new Set([request.capability,
    ...(request.capability === "test" ? ["discovery"] : [])]);
  if (required.every((provider) => withdrawn.has(capabilityOf(provider))))
    context.fail(`waiving '${request.capability}' would leave change '${id}' with no required ` +
      "evidence: its proof would have no receipt manifest and Land refuses that proof. " +
      `Repair the failing provider, or amend the agreement: cloop change amend ${id} <amendment.json>`);
}

export function waiveGateOperation(context, id, flags = {}) {
  const request = waiverRequest(flags, context.fail);
  const state = context.loadRuntime(id);
  if (state.status === "archived") context.fail(`change '${id}' is already archived`);
  if (flags.revoke)
    return revokeGateWaiver(context, id, state, state.waivers || [], request);
  const waivers = currentWaivers(state, context.relevantHash?.(id));
  assertWaivableCapability(context, id, request, waivers);
  // Waiving visual while differences are pending accepts exactly those.
  const drift = request.capability === "visual" ? state.visualRepair?.drift : null;
  if (drift) state.visualRepair = { ...state.visualRepair, drift: null };
  state.waivers = [...(state.waivers || []).filter((row) => row.capability !== request.capability), {
    capability: request.capability,
    reason: request.reason,
    authority: { kind: "host-user-decision", reference: request.decisionRef },
    recordedAt: context.now(),
    ...(drift ? { acceptedFindings: drift.findings || [] } : {}),
    ...(context.relevantHash ? { binding: { workspaceHash: context.relevantHash(id),
      contractRevision: Number(state.contractRevision || 0) } } : {})
  }];
  context.saveRuntime(state);
  context.log(`GATE WAIVED ${id}/${request.capability}\n  reason: ${request.reason}\n  decision: ${request.decisionRef}\n  recorded in proof advisories; the claim keeps declaring it\n  next: cloop advance ${id} --through proven`);
}

// The user's "accept" answer to a pending visual drift: the visual gate is
// withdrawn under the same rules as `change waive` (a reason and a decision
// reference, bound to the current workspace and contract revision), and the
// row keeps the differences the user accepted, so proof and Land report a
// mismatch the user accepted rather than a pass.
export function recordVisualDriftWaiver(context, id, /** @type {{ decisionRef?: any, reason?: any }} */ { decisionRef, reason } = {}) {
  const request = waiverRequest({ capability: "visual", "decision-ref": decisionRef, reason },
    context.fail);
  if (!request.reason) context.fail("accepting visual differences requires a reason");
  const state = context.loadRuntime(id);
  const drift = state.visualRepair?.drift;
  if (!drift) context.fail(`change '${id}' has no pending visual drift to accept`);
  state.waivers = [...(state.waivers || []).filter((row) => row.capability !== "visual"), {
    capability: "visual",
    reason: request.reason,
    authority: { kind: "host-user-decision", reference: request.decisionRef },
    recordedAt: context.now(),
    acceptedFindings: drift.findings || [],
    binding: { workspaceHash: context.relevantHash(id),
      contractRevision: Number(state.contractRevision || 0) }
  }];
  state.visualRepair = { ...state.visualRepair, drift: null };
  context.saveRuntime(state);
  return state.waivers.at(-1);
}
