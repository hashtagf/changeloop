import { agreementIdentity } from "../../core/user-decisions.mjs";
import {
  existsSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync,
  writeFileSync
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { DRAFT_FOLDER_VERSION } from "../draft/draft-folder.mjs";
import { resumeThrough } from "../../core/next-step.mjs";
import { mergeSemanticDraft } from "../draft/semantic-draft.mjs";
import { expandMinimalSemanticDraft } from "../draft/semantic-draft-minimal.mjs";
import { isRecordedSemanticVersion, isSemanticVersion } from "../validation/draft-version.mjs";
import { bindingRecord, scenarioTestBinding } from "../validation/scenario-test-binding.mjs";
import { withDerivedRisk } from "../validation/draft-risk.mjs";
import { formatApprovalDelta } from "./amendment-record.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import {
  INCOMPLETE_INTAKE, compiledDraftSource, draftRequirementFingerprints, mergeApprovalDelta, openQuestionLines,
  requirementDelta, requirementFingerprints
} from "./change-start-values.mjs";

export function createChangeRevision(ctx) {
  const {
    amendmentRevision, approvalLanes, approvalPacketRootFor, assertAmendmentRevision, atomicStep,
    bindClaudeSession, changePath, completedDraftIntake, createChange,
    designOpenQuestions, designWarningLines, draftSource, fail,
    inspectSemanticIntakeSource, loadRuntime, materializeDraft, minimalDraftContext, now,
    packetFileLines, pathInside, persistFixes, persistRiskSignals, preflightDraft,
    readJson, recordPrototypeSync, resolveChange, root, saveRuntime,
    semanticIntakeStatePath, setOperationChangeId, slugify, trapFailures, validate,
    withAmendmentLock
  } = ctx;

  function packetFingerprints(dir) {
    const evidencePath = join(dir, "evidence.yaml");
    const claims = existsSync(evidencePath) ? readJson(evidencePath).claims || [] : [];
    const specsDir = join(dir, "specs");
    const specTexts = existsSync(specsDir)
      ? readdirSync(specsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
        .map((entry) => join(specsDir, entry.name, "spec.md"))
        .filter((path) => existsSync(path)).sort()
        .map((path) => readFileSync(path, "utf8"))
      : [];
    return requirementFingerprints({ claims, specTexts });
  }

  function recordApprovalDelta(state, delta) {
    state.pendingApprovalDelta = {
      ...mergeApprovalDelta(state.pendingApprovalDelta, delta),
      revision: Number(state.contractRevision || 0)
    };
    return state.pendingApprovalDelta;
  }

  // The user approves a change once. A later revision or amendment that only
  // adds or revises requirements is the agent carrying out that consent, so
  // the current approval moves to the new packet with an audit row; Land still
  // shows the real diff. Removing a requirement narrows what the user agreed
  // to and still asks, as does a change that was never approved.
  function carrySpecApproval(prior, next, id, delta, reason) {
    const approval = prior.specApproval;
    if (!approval?.identity || !approval.decisionRef || prior.pendingApprovalDelta ||
        Number(approval.revision) !== Number(prior.contractRevision || 0) ||
        delta.removed?.length) return false;
    const carriedAt = now();
    const fromRevision = Number(approval.revision);
    const toRevision = Number(next.contractRevision || 0);
    const { carriedFrom: _prior, ...consent } = approval;
    const identity = agreementIdentity(approvalPacketRootFor(next, id), id);
    // Lane consent carries under the same rule as the whole approval.
    const lanes = consent.lanes ? Object.fromEntries(Object.entries(consent.lanes)
      .map(([role, lane]) => [role, { ...lane, identity, revision: toRevision }])) : undefined;
    const carried = { ...consent, ...(lanes ? { lanes } : {}), identity,
      revision: toRevision, carriedFrom: { revision: fromRevision, reason, carriedAt } };
    // The revision may route new roles: carried lanes still count, and a newly
    // required lane must approve before the approval is whole again.
    const { required } = approvalLanes(id, next);
    const missing = required.filter((role) => !lanes?.[role]);
    if (required.length && (lanes || missing.length)) {
      const { identity: _identity, revision: _revision, decisionRef: _ref, approvedAt: _at, ...rest } = carried;
      next.specApproval = missing.length
        ? { ...rest, required: true, lanes: lanes || {}, requiredLanes: required }
        : { ...carried, requiredLanes: required };
    } else next.specApproval = carried;
    next.approvalCarries = [...(prior.approvalCarries || []), {
      fromRevision, toRevision, reason,
      delta: { added: delta.added || [], revised: delta.revised || [], removed: [] },
      carriedAt
    }];
    delete next.pendingApprovalDelta;
    return true;
  }

  function revisionRuntimePath(id) {
    return join(root, ".foundation", "runtime", `${id}.json`);
  }

  // A pre-Build revision replaces the whole compiled packet, so it is limited
  // to changes whose agreement has not produced any Build or Prove result.
  function assertRevisable(id) {
    // Archive moves the packet but keeps runtime state, so status is checked
    // first to return the successor-change route rather than "not found".
    if (!existsSync(revisionRuntimePath(id)))
      fail(`change revise requires an existing active change; '${id}' was not found`);
    const state = loadRuntime(id);
    if (["proven", "archived"].includes(state.status))
      fail(`change revise cannot rewrite an agreement in '${state.status}' status; ` +
        "start a successor change");
    if (!existsSync(changePath(id)))
      fail(`change revise requires an existing active change; '${id}' was not found`);
    if (!isRecordedSemanticVersion(state.semanticDraftVersion))
      fail(`change revise requires a semantic-draft change; '${id}' is not one`);
    const amend = `cloop change amend ${id} <amendment.json> --inspect`;
    const receipts = join(root, ".foundation", "receipts", id);
    const built = (state.workspace && (state.workspace.mode !== "current" ||
        resolve(state.workspace.path || root) !== resolve(root))) ||
      (existsSync(receipts) && readdirSync(receipts).length > 0) ||
      /^\s*-\s*\[[xX]\]/m.test(readFileSync(join(changePath(id), "tasks.md"), "utf8"));
    if (built)
      fail(`change revise is only available before Build; '${id}' has Build or proof state. ` +
        `Use '${amend}' instead`);
    return state;
  }

  // A revise recompiles the whole draft; requirement keys and the capability
  // the replaced packet already uses keep their identity.
  function priorDraftIdentity(id) {
    const evidencePath = join(changePath(id), "evidence.yaml");
    const claims = existsSync(evidencePath) ? readJson(evidencePath).claims || [] : [];
    const specs = join(changePath(id), "specs");
    return {
      priorRequirementKeys: [...new Set([
        ...Object.keys(loadRuntime(id).requirementFingerprints || {}),
        ...claims.map((claim) => String(claim?.requirementKey || "").trim()).filter(Boolean)
      ])],
      priorCapabilities: existsSync(specs)
        ? readdirSync(specs, { withFileTypes: true })
          .filter((entry) => entry.isDirectory()).map((entry) => entry.name)
        : []
    };
  }

  // `merge` applies the file as a patch to the draft the change was compiled
  // from (see mergeSemanticDraft); without it the file is the whole draft.
  function revisionSource(id, draftPath, { merge = false } = {}) {
    const folderIssues = [];
    const source = merge ? mergedRevisionSource(id, draftPath)
      : draftSource(draftPath, priorDraftIdentity(id), { folderIssues });
    if (source.id !== undefined && source.id !== id && slugify(source.id) !== id)
      fail(`change revise draft id '${source.id}' does not match change '${id}'`);
    const revision = { ...source, id };
    if (folderIssues.length) revisionFolderIssues.set(revision, folderIssues);
    return revision;
  }

  // A v5 folder's heading/prose issues, keyed by the revision source they
  // belong to; kept off the draft so its digest and recorded copy stay clean.
  const revisionFolderIssues = new WeakMap();

  function mergedRevisionSource(id, draftPath) {
    const path = resolve(root, draftPath);
    if (!pathInside(root, path) || !existsSync(path))
      fail("change revise --merge requires a JSON patch file inside the project");
    if (statSync(path).isDirectory())
      fail("change revise --merge takes a JSON patch file; pass a v5 draft folder without --merge");
    const state = loadRuntime(id);
    const base = state.draftSource?.draft;
    if (!base || typeof base !== "object")
      fail(`change revise --merge needs the draft '${id}' was compiled from, which changes ` +
        "started before partial revision do not record; pass the whole revised draft without --merge");
    if (state.draftSource.contractRevision !== Number(state.contractRevision || 0))
      fail(`change revise --merge cannot patch '${id}': its agreement changed after the recorded ` +
        "draft (an amendment or grounding reopen); pass the whole revised draft without --merge");
    const patch = readJson(path);
    // A merge patches content; moving the draft between versions (v4 to v5)
    // changes how every row is read, so it takes a whole-draft revision.
    if (patch?.version !== undefined && patch.version !== base.version)
      fail(`change revise --merge cannot change the draft version of '${id}' ` +
        `(${base.version ?? "unversioned"} to ${patch.version}); pass the whole revised draft without --merge`);
    let merged;
    try { merged = mergeSemanticDraft(base, patch); }
    catch (error) { fail(`change revise --merge: ${error.message || error}`); }
    // A minimal draft stays minimal, so rows the patch adds without a key get
    // derived keys, titles, and scenario names exactly as at start. A minimal
    // v5 draft keeps version 5; only the implicit v4 version is dropped.
    if (merged._minimalDraft && patch.version === undefined && merged.version !== DRAFT_FOLDER_VERSION)
      delete merged.version;
    // A minimal v5 draft is keyed after its first expansion; its marker is what
    // keeps it minimal, so only an implicit-v4 draft drops it.
    if (merged.version !== DRAFT_FOLDER_VERSION) delete merged._minimalDraft;
    return withDerivedRisk(
      expandMinimalSemanticDraft(merged, { ...minimalDraftContext, ...priorDraftIdentity(id) }));
  }

  function reviseRoute(id, draftPath, merge) {
    return `cloop change revise ${id} ${draftPath}${merge ? " --merge" : ""}`;
  }

  function revisionIntakeOptions(id, draftPath, source, { merge = false } = {}) {
    const resume = `${reviseRoute(id, draftPath, merge)} --inspect`;
    return {
      statePath: semanticIntakeStatePath(draftPath, `revise:${id}`),
      resume,
      inspect: () => inspectRevision(id, draftPath, { quiet: true, preparedSource: source, merge })
    };
  }

  function inspectRevision(id, draftPath, options = {}) {
    assertRevisable(id);
    const merge = Boolean(options.merge);
    const source = options.preparedSource || revisionSource(id, draftPath, { merge });
    if (!isSemanticVersion(source.version))
      fail(`change revise --inspect requires a semantic-draft v4 or v5 draft; got version ${source.version}`);
    const { statePath, resume } = revisionIntakeOptions(id, draftPath, source, { merge });
    return inspectSemanticIntakeSource(source, {
      statePath, resume, quiet: options.quiet,
      excludedSourcePath: relative(root, resolve(root, draftPath)).replaceAll("\\", "/"),
      extraIssues: revisionFolderIssues.get(source) || [],
      // A change created before the rule existed is never blocked by it.
      regressionRequired: loadRuntime(id)?.regressionRequired === true
    });
  }

  function reviseChange(id, draftPath, options = {}) {
    const observedRevision = amendmentRevision(assertRevisable(id));
    return withAmendmentLock(id, observedRevision,
      () => reviseChangeUnlocked(id, draftPath, options, observedRevision), "change revision");
  }

  function reviseChangeUnlocked(id, draftPath, options, expectedRevision) {
    const prior = assertRevisable(id);
    setOperationChangeId(id);
    const merge = Boolean(options.merge);
    const source = revisionSource(id, draftPath, { merge });
    const intake = revisionIntakeOptions(id, draftPath, source, { merge });
    // One call: a missing or stale intake is inspected in place. DONE revises;
    // any other action is printed as `--inspect` would and nothing changes.
    // Folder prose issues never pass a recorded intake: they always reinspect.
    const completedIntakeEffectiveness = revisionFolderIssues.has(source)
      ? { [INCOMPLETE_INTAKE]: intake.inspect() }
      : completedDraftIntake(source, draftPath, { ...intake, reinspect: true });
    const incomplete = completedIntakeEffectiveness?.[INCOMPLETE_INTAKE];
    if (incomplete) {
      console.log(JSON.stringify(incomplete, null, 2));
      return incomplete;
    }
    const { draft, rapid, resolutionFlags } = preflightDraft(draftPath, source,
      { regressionRequired: prior.regressionRequired === true });

    // Build does not take this lock, so recheck that no workspace, receipt, or
    // revision appeared during intake and compilation before anything moves.
    assertAmendmentRevision(id, expectedRevision, "change revision");
    assertRevisable(id);
    const basePath = changePath(id);
    const runtimeFile = revisionRuntimePath(id);
    // Changes compiled before draft fingerprints existed compare both sides
    // from their packets so one method never marks every requirement revised.
    const storedBefore = prior.requirementFingerprints;
    const before = storedBefore || packetFingerprints(basePath);
    const priorRuntime = readFileSync(runtimeFile);
    const transactionRoot = mkdtempSync(join(dirname(basePath), `.${id}-revise-`));
    const priorPath = join(transactionRoot, "prior");
    let moved = false;
    let delta;
    try {
      renameSync(basePath, priorPath);
      moved = true;
      trapFailures(() => {
        createChange(draft.intent, { rapid, id }, draft, {
          availabilityChecked: true, deferSessionBinding: true
        });
        // Signals persist before resolve so its printed review route counts them.
        persistRiskSignals(id, draft.riskSignals);
        atomicStep.output = true;
        let resolution;
        try { resolution = resolveChange(id, resolutionFlags); }
        finally { atomicStep.output = false; }
        if (resolution.upgraded) materializeDraft(id, draft);
        persistFixes(id, draft.fixes);
        validate(id, "root");
        bindClaudeSession(id, "change");
        const next = loadRuntime(id);
        next.revision = Number(prior.revision || 0) + 1;
        next.contractRevision = Number(prior.contractRevision || 0) + 1;
        next.executionRevision = Number(prior.executionRevision || 0) + 1;
        next.createdAt = prior.createdAt || next.createdAt;
        // A revision keeps the creation-time rule set: a change created before
        // the hotfix regression rule never gains it by being revised.
        if (prior.regressionRequired === true) next.regressionRequired = true;
        else delete next.regressionRequired;
        if (prior.budget) next.budget = prior.budget;
        next.specApproval = { required: true };
        if (completedIntakeEffectiveness)
          next.semanticIntakeEffectiveness = completedIntakeEffectiveness;
        const draftFingerprints = draftRequirementFingerprints(draft);
        delta = requirementDelta(before,
          storedBefore ? draftFingerprints : packetFingerprints(basePath));
        next.requirementFingerprints = draftFingerprints;
        next.draftSource = compiledDraftSource(next, source);
        next.scenarioTestBinding = bindingRecord(scenarioTestBinding(draft));
        if (!carrySpecApproval(prior, next, id, delta, "pre-build-revision")) {
          if (prior.pendingApprovalDelta) next.pendingApprovalDelta = prior.pendingApprovalDelta;
          recordApprovalDelta(next, delta);
        }
        next.revisions = [...(prior.revisions || []), {
          version: 1, revision: next.contractRevision, kind: "pre-build-revision",
          delta, appliedAt: now()
        }];
        saveRuntime(next);
      });
    } catch (error) {
      const issues = [];
      try {
        if (moved) {
          rmSync(basePath, { recursive: true, force: true });
          renameSync(priorPath, basePath);
        }
        writeFileSync(runtimeFile, priorRuntime);
      } catch (restoreError) {
        issues.push(`restore failed: ${restoreError.message || restoreError}; ` +
          `prior packet retained at ${relative(root, priorPath)}`);
      }
      if (!issues.length) rmSync(transactionRoot, { recursive: true, force: true });
      fail(`${error?.message || error}; ${issues.length
        ? issues.join("; ") : "change revision rolled back"}`);
    }
    rmSync(transactionRoot, { recursive: true, force: true });
    if (options.consumeDraft) {
      // A v5 draft is a folder; a file draft stays a single unlink.
      try { rmSync(resolve(root, draftPath), { recursive: true }); }
      catch (error) {
        console.error(`WARNING: revision succeeded but could not remove draft '${
          draftPath}': ${error.message}`);
      }
    }
    try { rmSync(intake.statePath, { force: true }); }
    catch (error) {
      console.error(`WARNING: revision succeeded but could not remove semantic intake state: ${
        error.message}`);
    }
    const state = loadRuntime(id);
    const pending = state.pendingApprovalDelta;
    const openQuestions = designOpenQuestions(id, root);
    bestEffort(() => recordPrototypeSync(id)); // advisory
    console.log(`REVISED ${id}\n  revision: ${state.contractRevision}\n` +
      (pending
        ? `  requirement delta awaiting approval:\n${formatApprovalDelta(pending)}\n`
        : `  requirement delta (covered by the current approval):\n${formatApprovalDelta(delta)}\n`) +
      `  inspect: openspec/changes/${id}/\n` + packetFileLines(id) +
      openQuestionLines(openQuestions) +
      designWarningLines(draft, state.schema, source) +
      `  next: ${openQuestions.length
        ? `ask these with the approval, record the answers in the draft, then ${reviseRoute(id, draftPath, merge)} --approve-spec --decision-ref <user-decision> --through proven`
        : pending || !state.specApproval?.identity
          ? `cloop advance ${id} --approve-spec --decision-ref <user-decision> --through proven`
          : `cloop advance ${id} --through ${resumeThrough(state)}`}`);
    return delta;
  }

  return {
    carrySpecApproval, inspectRevision, recordApprovalDelta, reviseChange
  };
}
