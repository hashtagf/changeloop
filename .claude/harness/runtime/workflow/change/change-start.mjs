import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { isSemanticVersion } from "../validation/draft-version.mjs";
import { hotfixRegressionIssues } from "../validation/hotfix-regression.mjs";
import { TYPE_SURFACES, checklistNoteLine } from "../prototype/prototype-checklist.mjs";
import { inspectSemanticSources } from "../validation/semantic-source-inventory.mjs";
import { semanticIntakeResumeProjection } from "../draft/semantic-intake-state.mjs";
import { taskRepositoryIssues, verifyPathIssues } from "../draft/amendment-verify.mjs";
import { behaviorChangingTypes, verifyShapeIssues } from "../validation/verify-shape.mjs";
import {
  bindingRecord, scenarioBindingIssues, scenarioTestBinding
} from "../validation/scenario-test-binding.mjs";
import { validateInvestigationBinding } from "../investigation/investigation-runtime.mjs";
import { derivedByHarness, inferWorkTypes } from "../validation/dev-document.mjs";
import { coverageNoteLine } from "../validation/packet-overview.mjs";
import { riskDerivationSummary } from "../validation/draft-risk.mjs";
import {
  approvalPackageLine, draftChangeId, draftNameFromPath, semanticDraftKeepsDesign
} from "../draft/draft-packet-render.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import {
  INCOMPLETE_INTAKE, apiContractErrorIssues, atomicStartPreflight, compiledDraftSource,
  draftRequirementFingerprints, openQuestionLines, pathRiskNoteLine, riskSignalValues, scratchNoteLine
} from "./change-start-values.mjs";

export function createChangeStart(ctx) {
  const {
    approvalPackageLink, assertChangeAvailable, atomicStep, bindClaudeSession,
    complianceGate, createChange, declaredRepositories,
    designOpenQuestions, designWarningLines, domainLanguageIssues, fail, git,
    inspectDraft, intelligenceUsable, lessonsSourcePaths, loadDraft, loadRuntime,
    materializeDraft, measureStage, packetFileLines,
    recordPrototypeSync, repositoryIntelligence, resolveChange, rollbackStart, root,
    saveRuntime, semanticIntakeStatePath, semanticSourceInspection, slugify,
    startDraftSource, startResume, trapFailures, validate, workflowPolicy
  } = ctx;

  // Typed draft risk signals stay on the change so review routing can read
  // them at Prove (see review-routing SECURITY_RISK_SIGNAL_TIERS). Absent
  // signals leave the state untouched, so existing fingerprints do not move.
  function persistRiskSignals(id, signals) {
    const values = riskSignalValues(signals);
    const state = loadRuntime(id);
    if (!values.length && state.riskSignals === undefined) return;
    if (values.length) state.riskSignals = values;
    else delete state.riskSignals;
    saveRuntime(state);
  }

  // The archived changes a draft declares it fixes stay on the change so an
  // escaped defect links back to its origin. Absent, the state is untouched.
  function persistFixes(id, fixes) {
    const values = Array.isArray(fixes) ? fixes : [];
    const state = loadRuntime(id);
    if (!values.length && state.fixes === undefined) return;
    if (values.length) state.fixes = [...values];
    else delete state.fixes;
    saveRuntime(state);
  }

  // Each declared fix names a change archived under
  // openspec/changes/archive/<YYYY-MM-DD>-<id>, which Git carries across machines.
  function fixesIssues(draft) {
    const archive = join(root, "openspec", "changes", "archive");
    const archived = new Set(existsSync(archive)
      ? readdirSync(archive, { withFileTypes: true }).filter((entry) => entry.isDirectory())
        .map((entry) => entry.name.match(/^\d{4}-\d{2}-\d{2}-(.+)$/)?.[1]).filter(Boolean)
      : []);
    return (Array.isArray(draft?.fixes) ? draft.fixes : [])
      .filter((id) => typeof id === "string" && id.trim() && !archived.has(id.trim()))
      .map((id) => `semantic draft fixes ${id.trim()} is not an archived change`);
  }

  function startResolutionFlags(draft, classification, rapid) {
    const { impact, coupling, securityTriggers } = classification;
    return {
      impact,
      coupling,
      size: String(draft.size || (rapid ? "xs" : "s")).toLowerCase(),
      security: securityTriggers.join(","),
      review: Boolean(draft.reviewRequired),
      "acceptance-required": Boolean(draft.acceptance?.required),
      "acceptance-not-required": !draft.acceptance?.required,
      "acceptance-reason": draft.acceptance?.reason || undefined,
      "acceptance-claims": (draft.acceptance?.claimIds || []).join(",") || undefined
    };
  }

  // Draft v4 compilation requires the semantic intake snapshot for the same
  // draft path to be current and DONE. Start and revise share this gate; only
  // their snapshot namespace and resume route differ. With `reinspect`, a
  // missing or stale snapshot is re-inspected in place: DONE continues, and any
  // other action is returned under INCOMPLETE_INTAKE instead of failing.
  function completedDraftIntake(source, draftPath, { statePath, resume, inspect, reinspect = false }) {
    if (!isSemanticVersion(source.version)) return null;
    const inspectedIntake = () => {
      const inspected = inspect();
      if (inspected.action === "DONE") return inspected.effectiveness || null;
      if (reinspect) return { [INCOMPLETE_INTAKE]: inspected };
      fail(`version-4 drafts require a current completed semantic intake; ` +
        `resume with '${resume}'`);
    };
    let intakeState = null;
    if (existsSync(statePath)) {
      try { intakeState = JSON.parse(readFileSync(statePath, "utf8")); }
      catch { intakeState = null; }
    }
    if (!intakeState) return inspectedIntake();
    const sourcePath = relative(root, resolve(root, draftPath)).replaceAll("\\", "/");
    const intelligence = repositoryIntelligence(source, [sourcePath]);
    const sourceInspection = intelligenceUsable(intelligence)
      ? semanticSourceInspection(source, null, intelligence.selected)
      : inspectSemanticSources({ projectRoot: root, sourcePaths: lessonsSourcePaths() });
    const projection = semanticIntakeResumeProjection(intakeState, source, {
      resumeRoute: resume, sourceInventory: sourceInspection.inventory
    });
    const investigationIssues = source.investigation === undefined ? []
      : validateInvestigationBinding({ projectRoot: root, binding: source.investigation, git });
    if (!intelligenceUsable(intelligence) || sourceInspection.findings.length ||
        investigationIssues.length ||
        projection.status !== "current" || projection.action?.action !== "DONE") {
      if (reinspect) return inspectedIntake();
      fail(`version-4 drafts require a current completed semantic intake; ` +
        `resume with '${resume}'`);
    }
    return intakeState.effectiveness || null;
  }

  // Every start-time draft check that does not need created state. Inspect
  // reports these with the compiler's issues, so one EDIT carries them all;
  // `structural: false` (the compiler already refused the draft) skips only
  // the evidence-wiring row, which a refused compile cannot produce.
  function startDraftChecks(draft, { structural = true, regressionRequired = false } = {}) {
    const preflight = atomicStartPreflight(draft, {
      groundingRequired: workflowPolicy().workflow.grounding === "required" ||
        Boolean(draft.grounding)
    });
    // A low-impact draft that already carries design content (file map, UI
    // states, decisions, answered intake choices...) would lose it in the rapid
    // packet, which has no design.md or specs/. Keep it on the standard schema;
    // the preflight gates still apply the rapid lane's requirements.
    const keepsDesign = semanticDraftKeepsDesign(draft, preflight.rapid);
    const rapid = preflight.rapid && !keepsDesign;
    const issues = [...preflight.issues.filter((issue) =>
      structural || !issue.includes("executable evidence wiring")), ...domainLanguageIssues(draft),
      // Caught here, in the same EDIT batch, instead of when Build runs the check.
      ...verifyPathIssues(draft.tasks, { exists: (path) => existsSync(join(root, path)) }),
      // A task is ticked by its verify, and each scenario is proven by a test file.
      ...verifyShapeIssues(draft.tasks, { workTypes: inferWorkTypes(draft) }),
      ...scenarioBindingIssues(scenarioTestBinding(draft),
        { behaviorChanging: behaviorChangingTypes(inferWorkTypes(draft)) }),
      // Build dispatches each task to its repository; a task whose files live
      // in a declared repository but is bound to root would build elsewhere.
      ...taskRepositoryIssues(draft.tasks, {
        repositories: declaredRepositories(), selection: draft.repositories, exists: existsSync
      }),
      ...apiContractErrorIssues(draft), ...fixesIssues(draft),
      ...(regressionRequired ? hotfixRegressionIssues(draft) : [])];
    return { issues, preflight, keepsDesign, rapid };
  }

  function preflightDraft(draftPath, source, { regressionRequired = false } = {}) {
    const draft = measureStage("change.load-draft", () =>
      loadDraft(draftPath, { deferPolicy: true, preparedSource: source }));
    const { issues, preflight, keepsDesign, rapid } =
      measureStage("change.preflight", () => startDraftChecks(draft, { regressionRequired }));
    if (issues.length)
      fail(`start draft preflight failed:\n  - ${issues.join("\n  - ")}`);
    const { classification } = preflight;
    if (keepsDesign)
      console.log("NOTE: the draft carries design content, so it uses foundation-standard " +
        "to keep design.md and specs/");
    const derived = riskDerivationSummary(draft);
    if (derived) console.log(`NOTE: ${derived}`);
    const coverage = coverageNoteLine(draft);
    if (coverage) console.log(`NOTE: ${coverage}`);
    const scratch = scratchNoteLine(draft);
    if (scratch) console.log(`NOTE: ${scratch}`);
    const prototypeNote = checklistNoteLine(draft, { workTypes: inferWorkTypes(draft).filter((type) => TYPE_SURFACES[type]) });
    if (prototypeNote) console.log(`NOTE: ${prototypeNote}`);
    const pathRisk = pathRiskNoteLine(draft);
    if (pathRisk) console.log(`NOTE: ${pathRisk}`);
    const filled = derivedByHarness(draft, { standard: !rapid });
    if (filled.length)
      console.log(`NOTE: derived by harness (listed in proposal.md): ${
        filled.map((line) => line.replace(/\*\*([^*]+):\*\*.*$/, "$1").toLowerCase()).join(", ")}`);
    return { draft, rapid, resolutionFlags: startResolutionFlags(draft, classification, rapid) };
  }

  // Bare `change start <draft>` inspects and starts in one command: a DONE
  // intake continues to the atomic start, while any other inspect action is
  // printed exactly as `--inspect` would and returned without creating state.
  function startAtomic(draftPath, options = {}) {
    const { source, folderIssues } = startDraftSource(draftPath);
    const inspect = () => inspectDraft(draftPath, { quiet: true, preparedSource: source, folderIssues });
    // Folder issues and a pending compliance action never pass a recorded
    // intake: they always reinspect, so the EDIT or ASK_USER is returned.
    const completedIntakeEffectiveness = folderIssues.length || complianceGate(source)
      ? { [INCOMPLETE_INTAKE]: inspect() }
      : completedDraftIntake(source, draftPath, {
        statePath: semanticIntakeStatePath(draftPath),
        resume: startResume(draftPath),
        inspect,
        reinspect: true
      });
    const incomplete = completedIntakeEffectiveness?.[INCOMPLETE_INTAKE];
    if (incomplete) {
      console.log(JSON.stringify(incomplete, null, 2));
      return incomplete;
    }
    const { draft, rapid, resolutionFlags } =
      preflightDraft(draftPath, source, { regressionRequired: true });
    const id = draftChangeId(draft, slugify, { draftName: draftNameFromPath(draftPath) });
    assertChangeAvailable(id);
    try {
      trapFailures(() => {
        measureStage("change.materialize", () => createChange(draft.intent, { rapid, id: draft.id || id }, draft, {
          availabilityChecked: true,
          deferSessionBinding: true
        }));
        atomicStep.output = true;
        // Typed risk signals persist before resolve: its printed review route
        // read the state without them and called an input-domain change
        // "not required" even though Prove then ran a medium-tier review.
        persistRiskSignals(id, draft.riskSignals);
        let resolution;
        try { resolution = measureStage("change.resolve", () => resolveChange(id, resolutionFlags)); }
        finally { atomicStep.output = false; }
        // Resolve upgrades a rapid draft only on a declared signal; intent
        // keywords make review required without changing the lane. Only an
        // upgrade needs a second projection; the common path was previously
        // rewritten unconditionally after createChange had already materialized it.
        if (resolution.upgraded) materializeDraft(id, draft);
        persistFixes(id, draft.fixes);
        // Atomic start is a public Change gate. Use the same explicit validation
        // as `change validate`, including OpenSpec strict lint when available.
        measureStage("change.validate", () => validate(id, "root"));
        bindClaudeSession(id, "change");
        const pending = loadRuntime(id);
        pending.specApproval = { required: true };
        if (isSemanticVersion(draft._semanticVersion)) {
          pending.requirementFingerprints = draftRequirementFingerprints(draft);
          // The compiled-from draft, so `change revise --merge` takes a patch.
          pending.draftSource = compiledDraftSource(pending, source);
          pending.scenarioTestBinding = bindingRecord(scenarioTestBinding(draft));
        }
        if (completedIntakeEffectiveness)
          pending.semanticIntakeEffectiveness = completedIntakeEffectiveness;
        saveRuntime(pending);
        const openQuestions = designOpenQuestions(id, root);
        bestEffort(() => recordPrototypeSync(id)); // advisory
        console.log(`AGREED ${id}\n  inspect: openspec/changes/${id}/\n` + packetFileLines(id) +
          "  awaiting user approval before Build\n" +
          approvalPackageLine(approvalPackageLink(id)) +
          openQuestionLines(openQuestions) +
          designWarningLines(draft, loadRuntime(id).schema, source) +
          `  next: ${openQuestions.length
            ? `ask these with the approval, record the answers in the draft, then cloop change revise ${id} ${draftPath} --approve-spec --decision-ref <user-decision> --through proven`
            : `cloop advance ${id} --approve-spec --decision-ref <user-decision> --through proven`}`);
      });
    } catch (error) {
      let rollbackIssues;
      try { rollbackIssues = rollbackStart(id) || []; }
      catch (rollbackError) {
        rollbackIssues = [`rollback failed: ${rollbackError.message || rollbackError}`];
      }
      const failure = error?.message || String(error);
      const detail = rollbackIssues.length
        ? `${failure}; rollback issues: ${rollbackIssues.join("; ")}`
        : `${failure}; partial atomic start rolled back`;
      fail(detail);
    }
    if (options.consumeDraft) {
      const draftFile = resolve(root, draftPath);
      // A v5 draft is a folder; a file draft stays a single unlink.
      try { rmSync(draftFile, { recursive: true }); }
      catch (error) {
        console.error(`WARNING: atomic start succeeded but could not remove draft '${
          relative(root, draftFile)}': ${error.message}`);
      }
    }
    try { rmSync(semanticIntakeStatePath(draftPath), { force: true }); }
    catch (error) {
      console.error(`WARNING: atomic start succeeded but could not remove semantic intake state: ${
        error.message}`);
    }
    return id;
  }

  return {
    completedDraftIntake, persistFixes, persistRiskSignals, preflightDraft, startAtomic,
    startDraftChecks
  };
}
