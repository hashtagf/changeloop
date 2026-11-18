import {
  agreementDriftError, agreementIdentity, agreementRestoredNotice,
  amendedAgreementMatches, amendedPacketSource, carryApprovalAcrossBookkeeping,
  repairWhitespaceDrift, restoreDriftedAgreement, userDecisionError
} from "../../core/user-decisions.mjs";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { nextCommand, resumeThrough } from "../../core/next-step.mjs";
import { matchesSecurityTerm, materialSecurityTriggers } from "../authority/security-policy.mjs";
import { targetEditDigest, targetEditPaths } from "../transaction/target-edits.mjs";
import { openQuestionItems } from "../validation/reader-guide.mjs";
import {
  proposalOpenQuestions, reviewRouteLabel, synchronizeProposalClassification
} from "../draft/draft-packet-render.mjs";
import { formatApprovalDelta } from "./amendment-record.mjs";

// The spec approval after one consent. Without a role it is the whole
// approval and covers every lane required now (a lane a later revision adds is
// asked again). A role's lane added after the whole approval extends it and
// never revokes it; otherwise the approval completes once every required lane
// has consented.
function specApprovalValue({ role, required, lanes, prior, priorComplete, consent, decisionRef }) {
  if (role === null) {
    for (const lane of required) lanes[lane] = consent;
    return { required: true, ...consent, ...(required.length ? { lanes, requiredLanes: required } : {}) };
  }
  lanes[role] = consent;
  if (priorComplete) return { ...prior, lanes, requiredLanes: required };
  if (!required.every((lane) => lanes[lane])) return { required: true, lanes, requiredLanes: required };
  return { required: true, ...consent,
    decisionRef: required.map((lane) => lanes[lane].decisionRef).join(",") || decisionRef,
    lanes, requiredLanes: required };
}

export function createChangeResolution(ctx) {
  const {
    approvalLanes, approvalPacketRootFor, atomicStep, changePath, fail, loadRuntime,
    materializeStandardArtifacts, now, preexistingDirty, root, saveRuntime,
    securityTerms, validate, workflowPolicy
  } = ctx;

  function applyGroundingReopen(state, flags) {
    if (flags["reopen-grounding"]) {
      const decisionRef = String(flags["decision-ref"] || "").trim();
      const reason = String(flags["reopen-reason"] || "").trim();
      if (!decisionRef || !reason)
        fail("--reopen-grounding requires --decision-ref and --reopen-reason");
      if (state.groundingReopenPending)
        fail("grounding already has an open revision; complete and validate that batch first");
      if (!state.groundingDigest)
        fail("--reopen-grounding requires a currently locked grounding ledger");
      if ((state.groundingReopens || []).some((row) => row.decisionRef === decisionRef))
        fail("--decision-ref was already used for a grounding reopen");
      state.groundingReopenPending = {
        version: 1,
        decisionRef,
        reason,
        priorDigest: state.groundingDigest,
        priorLockedAt: state.groundingLockedAt || null,
        openedAt: now()
      };
      delete state.groundingDigest;
      delete state.groundingLockedAt;
      state.contractRevision = Number(state.contractRevision || 0) + 1;
      // Reopening the ledger is the user's own decision; it changes no packet
      // byte, so the consent already given follows it to the new revision.
      carryApprovalAcrossBookkeeping(root, state.id || state.changeId, state,
        `grounding-reopen: ${reason}`, now);
    } else if ((flags["decision-ref"] && !flags["ci-not-required"]) || flags["reopen-reason"])
      fail("--decision-ref and --reopen-reason require --reopen-grounding");
  }

  // Signed CI is project policy, read once at creation and pinned into the
  // change. A project that relaxes `land.riskBasedCi` afterwards — the
  // historical default many installs still carry — was left with every open
  // change pinned to the old value, and the only ways out were a hand edit of
  // runtime state or of foundation.json from inside Build, which the phase
  // guard rightly refuses. Resolve re-reads the policy, and a user who cannot
  // produce signed CI for one change records that decision here instead.
  function applyResolveCiPolicy(state, flags) {
    if (flags["ci-not-required"]) {
      const decisionRef = String(flags["decision-ref"] || "").trim();
      if (!decisionRef) fail("--ci-not-required requires --decision-ref");
      state.riskBasedCiRequired = false;
      state.ciWaiver = { version: 1, decisionRef, declaredAt: now() };
      return;
    }
    if (state.ciWaiver) return;
    state.riskBasedCiRequired = state.schema === "foundation-standard" &&
      workflowPolicy().land?.riskBasedCi === true;
  }

  function applyResolveAttributes(state, flags) {
    // The only consumer gates on strict equality with "unclear", so an
    // unvalidated value silently defeats the /investigate blocker it feeds.
    if (flags.ambiguity && !["clear", "unclear"].includes(flags.ambiguity))
      fail("--ambiguity must be clear|unclear");
    for (const key of ["ambiguity", "impact", "coupling"])
      if (flags[key]) state[key] = flags[key];
    // Sizes are stored lowercase and validated. `--size` was accepted verbatim
    // with no enum, so `--size medium` or `--size 5` persisted happily, and the
    // one place that read it compared against the literal "S" — which
    // `startAtomic`'s own "xs" could never match. Now that size scales the
    // request budget, an unrecognized value would silently take the default
    // lane instead of the one the author asked for.
    if (flags.size) {
      const size = String(flags.size).toLowerCase();
      if (!["xs", "s", "m", "l"].includes(size)) fail("--size must be xs|s|m|l");
      state.size = size;
    }
    // The paths the author expects to touch, declared before they exist. Policy
    // infers capabilities from the *changed* surface, which at change time is
    // empty — so a `.tsx` file pulls `accessibility` only once it is written,
    // by which point the contract is signed and the evidence is collected.
    // Declaring nothing keeps that behavior exactly; this is advisory input to
    // a forecast, never an input to enforcement.
    if (flags.surface !== undefined) {
      const globs = String(flags.surface).split(",")
        .map((value) => value.trim()).filter(Boolean);
      if (!globs.length) fail("--surface requires at least one path or glob");
      state.declaredSurface = [...new Set(globs)].sort();
    }
  }

  function applyResolveSecurity(state, flags) {
    // Word boundaries, not substrings. `includes("access")` fired on
    // "accessibility" and `includes("migration")` on "migration guide", so
    // routine work acquired external review it did not need — while the
    // trigger the docs promise ("semantic, not syntax") went unmet either way.
    // Thai terms, written without word spaces, match as substrings.
    const termsIn = (value) =>
      securityTerms.filter((term) => matchesSecurityTerm(value, term));
    const explicitSecurity = String(flags.security || "").split(",")
      .map((value) => value.trim()).filter((value) => value && value.toLowerCase() !== "none");
    // Declared triggers (the draft, `--security`, or a prior resolve) keep
    // their full weight. A term found only in the intent text is a keyword
    // signal: it makes review required and nothing else, so a rapid change
    // that mentions "billing" stays on the rapid lane (user decision).
    const keywordOnly = new Set((state.keywordSecurityTriggers || [])
      .map((value) => String(value).trim().toLowerCase()));
    state.securityTriggers = materialSecurityTriggers([
      ...(state.securityTriggers || []).filter((value) =>
        !["", "none"].includes(String(value).trim().toLowerCase()) &&
        !keywordOnly.has(String(value).trim().toLowerCase())),
      ...termsIn(flags.security), ...explicitSecurity
    ], state.intent, securityTerms);
    const declared = new Set(state.securityTriggers.map((value) => value.toLowerCase()));
    const keywordTriggers = materialSecurityTriggers(termsIn(state.intent), state.intent, securityTerms)
      .filter((value) => !declared.has(value.toLowerCase()));
    if (keywordTriggers.length) state.keywordSecurityTriggers = keywordTriggers;
    else delete state.keywordSecurityTriggers;
    // Coupling alone no longer summons a reviewer. `coupled` means the change
    // spans components, which earns the standard schema's design.md and specs/
    // below — but at low impact there is nothing for an independent reader to
    // protect, and the cross-repository cases that do matter are caught
    // separately: reviewPolicy raises `multi-repository-claim` for any claim
    // above low impact that spans repositories, without consulting this flag.
    const declaredReview = state.impact === "high" ||
      (state.coupling === "coupled" && state.impact !== "low") ||
      state.securityTriggers.length > 0 || Boolean(flags.review);
    state.reviewRequired = declaredReview || keywordTriggers.length > 0;
    // Persisted only for the keyword-only case so verification risk can tell
    // it from a declared review (`--review`, impact, coupling, triggers).
    if (!declaredReview && keywordTriggers.length) state.reviewKeywordOnly = true;
    else delete state.reviewKeywordOnly;
    return { declaredReview };
  }

  function applyResolveAcceptance(state, flags) {
    if (flags["acceptance-required"] && flags["acceptance-not-required"])
      fail("resolve cannot combine --acceptance-required and --acceptance-not-required");
    if ((flags["acceptance-reason"] || flags["acceptance-claims"]) &&
        !flags["acceptance-required"])
      fail("--acceptance-reason and --acceptance-claims require --acceptance-required");
    if (flags["acceptance-required"]) {
      const reason = String(flags["acceptance-reason"] || "").trim();
      if (!reason) fail("--acceptance-required requires --acceptance-reason");
      const acceptanceClaims = String(flags["acceptance-claims"] || "").split(",")
        .map((value) => value.trim()).filter(Boolean);
      state.acceptance = {
        version: 2,
        decision: "required",
        required: true,
        reason,
        claimIds: acceptanceClaims,
        scopeOrigin: "explicit",
        declaredAt: now()
      };
    } else if (flags["acceptance-not-required"])
      state.acceptance = {
        version: 2, decision: "not-required", required: false,
        reason: null, claimIds: [], declaredAt: now()
      };
  }

  // A review required only by intent keywords does not upgrade the lane.
  function upgradeResolvedSchema(id, state, { declaredReview = state.reviewRequired } = {}) {
    if (state.schema === "foundation-rapid" &&
        (state.impact !== "low" || state.coupling !== "isolated" || declaredReview ||
         state.acceptance?.required)) {
      state.schema = "foundation-standard";
      state.upgradedFrom = "foundation-rapid";
      state.groundingRequired = workflowPolicy().workflow.grounding === "required";
      state.nfrAssessmentRequired = true;
      state.decisionMetadataRequired = true;
      state.semanticInvariantsRequired = true;
      state.riskBasedCiRequired = !state.ciWaiver &&
        workflowPolicy().land?.riskBasedCi === true;
      // The rapid packet has no design.md and no specs/, which the standard
      // schema requires. Leaving them absent made `validate` refuse a change
      // whose only listed next command was `validate` — a dead end that had to
      // be guessed out of. Instantiate them here, with the upgrade.
      materializeStandardArtifacts(id, state.intent);
      return true;
    }
    return false;
  }

  // Best effort: the packet's claims and grounding as they stand at resolve.
  // Validation recomputes the authoritative route from the same inputs.
  function resolutionReviewLabel(id, state) {
    const dir = changePath(id);
    const parse = (name) => {
      try { return JSON.parse(readFileSync(join(dir, name), "utf8")); } catch { return null; }
    };
    const claims = parse("evidence.yaml")?.claims;
    return reviewRouteLabel({
      lowRiskModel: workflowPolicy().review?.lowRiskModel,
      modelByTier: workflowPolicy().review?.modelByTier,
      state,
      claims: Array.isArray(claims) ? claims : [],
      grounding: parse("grounding.yaml")
    });
  }

  function printResolution(id, state, upgraded) {
    // The surface line appears only when one was declared, so a change that
    // never used the flag keeps producing the output it produced before it
    // existed.
    const surfaceLine = state.declaredSurface?.length
      ? `\n  surface: ${state.declaredSurface.join(", ")}` : "";
    // Named only when a decision waived it, so every earlier output is intact.
    const ciLine = state.ciWaiver
      ? `\n  signed CI: waived (${state.ciWaiver.decisionRef})` : "";
    console.log(`RESOLVED ${id}\n  impact: ${state.impact}\n  coupling: ${state.coupling}\n  review: ${resolutionReviewLabel(id, state)}\n  acceptance: ${state.acceptance?.decision || (state.acceptance?.required ? "required" : "legacy-not-required")}\n  security: ${[...state.securityTriggers,
      ...(state.keywordSecurityTriggers || []).map((value) => `${value} (intent keyword: review only)`)
    ].join(", ") || "none"}${surfaceLine}${ciLine}\n  schema: ${state.schema}${upgraded ? " (upgraded from foundation-rapid; design.md and specs/ added)" : ""}${atomicStep.output ? "" : `\n  next: ${nextCommand(state.status, id, state)}`}`);
  }

  function approvalPacketRoot(id) {
    return approvalPacketRootFor(loadRuntime(id), id);
  }

  // Open questions live in the proposal's "Decisions to ratify and open
  // questions" section (design.md no longer repeats them); a packet compiled
  // earlier keeps them under design.md's "### Open questions".
  function designOpenQuestions(id, packetRoot = approvalPacketRoot(id)) {
    const dir = join(packetRoot, "openspec", "changes", id);
    const designPath = join(dir, "design.md");
    const proposalPath = join(dir, "proposal.md");
    return [...new Set([
      ...(existsSync(designPath) ? openQuestionItems(readFileSync(designPath, "utf8")) : []),
      ...(existsSync(proposalPath) ? proposalOpenQuestions(readFileSync(proposalPath, "utf8")) : [])
    ])];
  }

  // The questions an approval would be refused over, as the user decision the
  // agent asks in one batch. Null when nothing is open.
  function openQuestionsDecision(id) {
    const questions = designOpenQuestions(id);
    if (!questions.length) return null;
    const error = userDecisionError("OPEN_QUESTIONS",
      `Ask the user the design's open questions before approving the spec: ${questions.join(" | ")}`, [
        { id: "answer", outcome: "Answer each open question; the agent records the answers in the " +
          "draft and revises the change, then asks for spec approval again" },
        { id: "pause", outcome: "Leave the change unapproved for now" }
      ], "answer");
    error.decision.questions = questions;
    return error;
  }

  function resolveChange(id, flags) {
    const decisionFlags = ["approve-spec", "continue-review", "accept-target-edits"];
    if (decisionFlags.some((key) => flags[key])) {
      const decisionRef = String(flags["decision-ref"] || "").trim();
      if (!decisionRef) fail("This operation requires --decision-ref from an explicit user answer");
      if (Object.keys(flags).some((key) => ![...decisionFlags, "decision-ref", "role"].includes(key)) ||
          decisionFlags.filter((key) => flags[key]).length > 1)
        fail("Record one user decision at a time, separately from agreement edits");
      const role = flags.role === undefined ? null : String(flags.role).trim();
      if (role !== null && !flags["approve-spec"]) fail("--role applies only to --approve-spec");
      if (role !== null) {
        const { configured } = approvalLanes(id, loadRuntime(id));
        if (!configured.length)
          fail("--role needs approval.roles in foundation.json; without lanes approve once without --role");
        if (!configured.includes(role))
          fail(`unknown approval role '${role}'; approval.roles allows: ${configured.join(", ")}`);
      }
      const state = loadRuntime(id);
      if (state.status === "archived") fail(`change '${id}' is already archived`);
      let approvedDelta = null;
      if (flags["approve-spec"]) {
        validate(id, "root", { quiet: true });
        const current = loadRuntime(id);
        const approvalRoot = current.workspace?.path &&
          existsSync(join(current.workspace.path, "openspec", "changes", id))
          ? current.workspace.path : root;
        // Consent binds one identity; an isolated packet that matches neither
        // the target nor the latest amendment could never satisfy the approval
        // check. The amended packet stays the agreement whatever bookkeeping
        // moved the revision counter after the amendment.
        const amended = approvalRoot !== root &&
          amendedAgreementMatches(current, approvalRoot, id);
        const amendedSource = amendedPacketSource(root, current);
        const drifted = approvalRoot !== root && !amended &&
          agreementIdentity(approvalRoot, id) !== agreementIdentity(root, id) &&
          (amendedSource || !repairWhitespaceDrift(root, approvalRoot, id));
        const restored = drifted && restoreDriftedAgreement(root, approvalRoot, id, Date.now(),
          amendedSource || undefined);
        if (restored) console.error(agreementRestoredNotice(id, restored));
        const drift = drifted && !restored ? agreementDriftError(id, approvalRoot) : null;
        if (drift) fail(drift.message, 1, { owner: drift.owner, boundary: drift.boundary, code: drift.code });
        // Consent covers a settled agreement: an open question is answered and
        // revised into the change first, never approved around.
        const openQuestions = designOpenQuestions(id, approvalRoot);
        if (openQuestions.length)
          fail("resolve the design's open questions before approving the spec:\n  - " +
            `${openQuestions.join("\n  - ")}\nAsk the user, record the answers, and revise the change.`);
        const consent = { identity: agreementIdentity(approvalRoot, id),
          revision: Number(current.contractRevision || 0), decisionRef, approvedAt: now() };
        const { required } = approvalLanes(id, current);
        const prior = current.specApproval || {};
        // Only consent given on these exact bytes and revision survives.
        const lanes = Object.fromEntries(Object.entries(prior.lanes || {})
          .filter(([, lane]) => lane?.identity === consent.identity && Number(lane.revision) === consent.revision));
        const priorComplete = prior.identity === consent.identity && Number(prior.revision) === consent.revision;
        current.specApproval = specApprovalValue({ role, required, lanes, prior, priorComplete, consent, decisionRef });
        approvedDelta = current.specApproval.identity ? current.pendingApprovalDelta || null : null;
        if (current.specApproval.identity) delete current.pendingApprovalDelta;
        saveRuntime(current);
      } else if (flags["accept-target-edits"]) {
        // Binds the exact edited bytes: a later edit is a new question.
        const dirtyNow = preexistingDirty(root);
        const snapshot = state.workspace?.targetDirty || state.workspace?.preexisting || {};
        const paths = targetEditPaths(snapshot, dirtyNow);
        if (!paths.length) fail("No target checkout edits outside the sandbox need a decision");
        state.targetEditsAccepted = { digest: targetEditDigest(paths, dirtyNow), paths,
          decisionRef, acceptedAt: now() };
        saveRuntime(state);
      } else {
        // Compatibility: review is bounded by its rounds, not elapsed time,
        // so there is no window to extend. The flag stays accepted.
        console.log(`NOTE: review has no time window; '--continue-review' changes nothing`);
      }
      const lanesState = flags["approve-spec"] ? loadRuntime(id).specApproval : null;
      const pendingLanes = lanesState && !lanesState.identity
        ? (lanesState.requiredLanes || []).filter((lane) => !lanesState.lanes?.[lane]) : [];
      console.log(`DECISION RECORDED ${id}\n` +
        (role !== null ? `  approval lane: ${role}\n` : "") +
        (pendingLanes.length ? `  approval lanes still needed: ${pendingLanes.join(", ")}\n` : "") +
        (approvedDelta ? `  approved requirement delta:\n${formatApprovalDelta(approvedDelta)}\n` : "") +
        `  next: cloop advance ${id} --through ${flags["approve-spec"]
          ? resumeThrough(loadRuntime(id))
          : flags["accept-target-edits"] ? "archived" : "proven"}`);
      return;
    }
    const state = loadRuntime(id);
    applyGroundingReopen(state, flags);
    applyResolveAttributes(state, flags);
    const { declaredReview } = applyResolveSecurity(state, flags);
    applyResolveAcceptance(state, flags);
    applyResolveCiPolicy(state, flags);
    const upgraded = upgradeResolvedSchema(id, state, { declaredReview });
    const proposalPath = join(changePath(id), "proposal.md");
    if (existsSync(proposalPath)) {
      const proposal = readFileSync(proposalPath, "utf8");
      const synchronized = synchronizeProposalClassification(proposal, state,
        { reviewLabel: proposal.includes("\n- Review: ") ? resolutionReviewLabel(id, state) : "" });
      if (synchronized !== proposal) writeFileSync(proposalPath, synchronized);
    }
    state.resolvedAt = now();
    saveRuntime(state);
    printResolution(id, state, upgraded);
    return { state, upgraded };
  }

  return {
    designOpenQuestions, openQuestionsDecision, resolveChange
  };
}
