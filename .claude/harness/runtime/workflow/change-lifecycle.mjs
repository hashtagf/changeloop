import {
  agreementDriftError, agreementIdentity, agreementRestoredNotice, amendedAgreementMatches,
  amendedPacketSource, carryApprovalAcrossBookkeeping, packetIdentity, repairWhitespaceDrift,
  restoreDriftedAgreement, snapshotAmendedPacket, userDecisionError
} from "../core/user-decisions.mjs";
import { createHash } from "node:crypto";
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync,
  realpathSync, statSync, writeFileSync
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { acquireProcessLock } from "../core/process-lock.mjs";
import { requireDeps } from "../core/required-deps.mjs";
import { projectResource } from '../core/project-installation.mjs';
import { DRAFT_FOLDER_VERSION, loadDraftFolder } from "./draft-folder.mjs";
import { transitionLifecycleState } from "../core/lifecycle-reducer.mjs";
import { foundationChangeStores, retiredChangeStores } from "./retired-change-stores.mjs";
import { nextCommand, resumeThrough } from "../core/next-step.mjs";
import { taskBlocks, taskMetadata } from "../contracts/change-artifacts.mjs";
import { matchesSecurityTerm, materialSecurityTriggers } from "./security-policy.mjs";
import {
  expandMinimalSemanticDraft, mergeSemanticDraft, MINIMAL_DRAFT_WRITING, minimalDraftFolderTemplate,
  normalizeSemanticDraft, renderRequirementMarkdown, semanticDraftTemplate, unknownTaskFieldWarnings
} from "./semantic-draft.mjs";
import { isRecordedSemanticVersion, isSemanticVersion } from "./validation/draft-version.mjs";
import { hotfixRegressionIssues } from "./validation/hotfix-regression.mjs";
import {
  FIXES_DIMENSIONS, riskSignalDimensions, semanticIntakeAction, semanticIntakeIssues
} from "./validation/semantic-intake.mjs";
import { inferPathSignals } from "../contracts/scratch-router.mjs";
import { TYPE_SURFACES, checklistNoteLine } from "./prototype-checklist.mjs";
import { materializePrototype, prototypeSelectionIssues } from "./prototype-binding.mjs";
import { inspectSemanticSources } from "./validation/semantic-source-inventory.mjs";
import {
  PROJECT_LESSONS_PATH, inspectRepositoryIntelligence, repositoryIntelligenceRequired,
  skippedRepositoryIntelligence
} from "./validation/repository-intelligence.mjs";
import {
  planSemanticIntakeDepth,
  semanticIntakeEffectivenessSnapshot,
  semanticQuestionQualityFindings
} from "./validation/semantic-intake-intelligence.mjs";
import { planAmendmentInvalidation } from "./validation/amendment-invalidation.mjs";
import {
  planSelectiveProofRecovery, rebindSelectiveProofReceipt, demoteSelectivePreservation
} from "./validation/selective-proof-plan.mjs";
import {
  reduceSemanticIntakeState, semanticDraftDigest, semanticIntakeResumeProjection
} from "./semantic-intake-state.mjs";
import {
  amendmentRepositoryOrderIssues, amendmentTaskRepositoryIssues, amendmentVerifyPathIssues,
  amendmentVerifyShapeIssues, compileSemanticAmendment,
  semanticAmendmentTemplate, taskContractOnlyAmendment, taskRepositoryIssues, verifyPathIssues,
  writeSemanticAmendment
} from "./semantic-amendment.mjs";
import { amendmentInvestigationSource, investigationCoverageIssues,
  renderInvestigationCoverage } from "./validation/investigation-coverage.mjs";
import { behaviorChangingTypes, verifyShapeIssues } from "./validation/verify-shape.mjs";
import {
  amendedScenarioTestBinding, amendmentScenarioBindingIssues, bindingRecord, scenarioBindingIssues,
  scenarioTestBinding
} from "./validation/scenario-test-binding.mjs";
import { changeWorkTypes } from "./task-change.mjs";
import { validateInvestigationBinding } from "./investigation-runtime.mjs";
import {
  designBlueprintWarnings, verifyCountAdvisories
} from "./validation/design-blueprints.mjs";
import {
  derivedByHarness, docsOnlyDraft, inferWorkTypes, withNewPaths
} from "./validation/dev-document.mjs";
import { coverageNoteLine } from "./validation/packet-overview.mjs";
import { complianceAction, complianceEnabledFromConfig } from "./validation/process-fields.mjs";
import { groundingFromQuality } from "./validation/quality-fields.mjs";
import { targetEditDigest, targetEditPaths } from "./target-edits.mjs";
import {
  declaredDraftRisk, riskDerivationSummary, withDerivedRisk
} from "./validation/draft-risk.mjs";
import { openQuestionItems, readerGuideWarnings } from "./validation/reader-guide.mjs";
import {
  approvalPackageLine, draftChangeId, draftNeedsDesign, materializeDraftSpecs, proposalOpenQuestions,
  renderDraftDesign, renderDraftProposal, renderDraftTask, renderDraftTasks, repositoryDraftGuidance,
  reviewRouteLabel, semanticDraftKeepsDesign, synchronizeProposalClassification
} from "./draft-packet-render.mjs";
import {
  amendedReport, amendmentCoverageChanges, amendmentHistoryRow, formatApprovalDelta
} from "./amendment-record.mjs";
// Moved to amendment-record.mjs; re-exported so importers are unchanged.
export { formatApprovalDelta, formatInvalidatedWaivers, invalidatedWaivers } from "./amendment-record.mjs";
// Packet rendering moved to draft-packet-render.mjs; re-exported so importers are unchanged.
export {
  approvalPackageLine, draftBullets, draftChangeId, draftDomainRows, draftNeedsDesign, groupDraftSpecs,
  materializeDraftSpecs, proposalOpenQuestions, proposedDecision, renderDecisionOption, renderDraftDecisions,
  renderDraftDesign, renderDraftProposal, renderDraftSpecDocument, renderDraftTask, renderDraftTasks,
  renderProposedDecisions, renderRapidDecisions, repositoryDraftGuidance, reviewRouteLabel,
  semanticDraftKeepsDesign, synchronizeProposalClassification
} from "./draft-packet-render.mjs";

// Marks a start whose re-inspected intake is not DONE (see completedDraftIntake).
const INCOMPLETE_INTAKE = Symbol("incomplete-intake");

// A v5 draft keeps nfr and observability in change.json. A draft with grounding
// v2 already carries them (withQualityGrounding); one without a grounding v2
// ledger (none, or the decisions-only v3) still gets them in grounding.yaml:
// added to its v3 ledger, or as a derived ledger that no gate validates when
// grounding is not required. v3 and v4 drafts and v2 ledgers are unchanged.
export function v5QualityGrounding(draft, { groundingRequired = false } = {}) {
  if (Number(draft?._semanticVersion ?? draft?.version) !== 5) return null;
  const grounding = draft.grounding;
  if (grounding?.version === 2) return null;
  if (!grounding && groundingRequired) return null;
  if (grounding && grounding.version !== 3) return null;
  const nfr = Array.isArray(draft.nfr) && draft.nfr.length > 0;
  const observability = draft.observability !== undefined && draft.observability !== null;
  if (!nfr && !observability) return null;
  const derived = groundingFromQuality(draft);
  return {
    ...(grounding || { version: 2, derivedFrom: "change.json" }),
    ...(nfr ? { nfrAssessment: derived.nfrAssessment } : {}),
    ...(observability ? { observability: derived.observability } : {})
  };
}

// An amendment that only replaces outline sections changes no requirement,
// claim, or task.
export function sectionsOnlyAmendment(amendment) {
  const list = (field) => Array.isArray(amendment?.[field]) ? amendment[field] : [];
  return list("sections").length > 0 && [
    "addRequirements", "reviseRequirements", "removeRequirements",
    "updateTasks", "addTasks", "removeTasks"
  ].every((field) => !list(field).length);
}

const DOCUMENT_REVIEW_CAPABILITIES = new Set(["review", "acceptance", "semantic-acceptance"]);

// A sections-only amendment rewrites prose the reviewer reads but no claim, so
// it invalidates only whole-packet review providers (and their dependents)
// and preserves every claim-bound receipt. Approval is not reopened.
export function documentSectionInvalidation(providers = {}) {
  const rows = Object.entries(providers || {}).map(([id, config]) => ({ id, ...config }));
  const affected = new Set(rows.filter((row) =>
    DOCUMENT_REVIEW_CAPABILITIES.has(String(row.capability || ""))).map((row) => row.id));
  for (let changed = true; changed;) {
    changed = false;
    for (const row of rows) {
      if (affected.has(row.id)) continue;
      if ((Array.isArray(row.dependsOn) ? row.dependsOn : []).some((id) => affected.has(id))) {
        affected.add(row.id);
        changed = true;
      }
    }
  }
  const affectedProviders = [...affected].sort();
  const preservedProviders = rows.map((row) => row.id).filter((id) => !affected.has(id)).sort();
  const invalidate = affectedProviders.length > 0;
  return {
    version: 1, status: "READY", findings: [],
    affectedClaims: [], affectedTasks: [], affectedProviders, preservedProviders,
    approval: { invalidate: false, reasons: [] },
    proof: {
      invalidate,
      reasons: invalidate ? ["document-sections-changed"] : [],
      invalidateReceipts: affectedProviders,
      preserveReceipts: preservedProviders
    },
    coverage: { global: false, dimensions: ["document-sections"] }
  };
}

// Typed draft risk signals as persisted on the change: lowercased, unique, sorted.
export function riskSignalValues(signals) {
  return [...new Set((Array.isArray(signals) ? signals : [])
    .map((value) => String(value).trim().toLowerCase()).filter(Boolean))].sort();
}

// Each API error a contract lists needs the status or code a client matches
// on; without one the design renders `?` and Build guesses the wire shape.
// An agent repair at inspect, never a user question.
export function apiContractErrorIssues(draft) {
  const contracts = Array.isArray(draft?.apiContracts) ? draft.apiContracts : [];
  const issues = [];
  contracts.forEach((contract, index) => {
    if (!Array.isArray(contract?.errors)) return;
    contract.errors.forEach((error, position) => {
      const identified = error && typeof error === "object"
        ? [error.status, error.code].some((value) =>
          (typeof value === "number" && Number.isFinite(value)) ||
          (typeof value === "string" && value.trim()))
        : /\b[1-5]\d\d\b|\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/.test(String(error ?? ""));
      if (!identified)
        issues.push(`apiContracts[${index}].errors[${position}] needs a status or code ` +
          "(for example { status: 404, code: \"NOT_FOUND\", when: \"...\" })");
    });
  });
  return issues;
}

// Only semantic drafts v4 (JSON) and v5 (folder) are accepted. Earlier
// formats (v1-v3 and unversioned JSON) were retired in 3.7.
export function retiredDraftIssue(version) {
  return [1, 2, 3, undefined, null].includes(version)
    ? `draft version ${version ?? "(none)"} is no longer supported; author a v5 draft folder ` +
      "(cloop change start --template) or a v4 JSON draft"
    : "semantic draft version must be 4 or 5";
}

export function atomicStartPreflight(draft, { groundingRequired = false } = {}) {
  const issues = [];
  if (!isSemanticVersion(draft?.version))
    issues.push(retiredDraftIssue(draft?.version));
  if (!String(draft?.intent || "").trim())
    issues.push("start draft requires non-empty 'intent'");
  const acceptance = draft?.acceptance;
  if (!acceptance || typeof acceptance.required !== "boolean")
    issues.push("start draft requires acceptance.required true|false from an explicit user-facing decision");
  else if (acceptance.required && !String(acceptance.reason || "").trim())
    issues.push("start draft requires acceptance.reason when acceptance.required is true");
  else if (!acceptance.required && (String(acceptance.reason || "").trim() ||
      (acceptance.claimIds || []).length))
    issues.push("start draft acceptance.reason and acceptance.claimIds require acceptance.required true");

  const impact = draft?.impact || "low";
  const coupling = draft?.coupling || "isolated";
  const securityTriggers = draft?.securityTriggers || [];
  if (!["low", "medium", "high"].includes(impact))
    issues.push("start draft impact must be low|medium|high");
  if (!["isolated", "coupled"].includes(coupling))
    issues.push("start draft coupling must be isolated|coupled");
  if (!Array.isArray(securityTriggers) ||
      securityTriggers.some((trigger) => typeof trigger !== "string" || !trigger.trim()))
    issues.push("start draft securityTriggers must be an array of non-empty strings");
  if (draft?.externalOperations !== undefined &&
      !Array.isArray(draft.externalOperations))
    issues.push("draft externalOperations must be an array");
  if (!draft?.execution || draft.execution.version !== 1 ||
      !draft.execution.providers || Object.keys(draft.execution.providers).length === 0)
    issues.push("start draft requires executable evidence wiring: execution must be " +
      '{"version": 1, "providers": {"<name>": {...}}} with at least one provider');

  const safeTriggers = Array.isArray(securityTriggers) ? securityTriggers : [];
  const rapid = impact === "low" && coupling === "isolated" &&
    safeTriggers.filter((trigger) => trigger.toLowerCase() !== "none").length === 0 &&
    !draft?.reviewRequired && !acceptance?.required;
  if (groundingRequired && ![2, 3].includes(draft?.grounding?.version))
    issues.push("start draft requires grounding.version 2 or 3 after the initial Decision Sheet");
  if (!rapid && groundingRequired && draft?.grounding?.version !== 3) {
    const categories = [
      "performance", "capacity", "availability", "securityPrivacy",
      "accessibility", "operability", "compatibility", "recoverability"
    ];
    const missing = categories.filter((category) =>
      !draft?.grounding?.nfrAssessment?.[category]);
    if (missing.length)
      issues.push(`standard start draft requires every grounding.nfrAssessment category before creation: ${missing.join(", ")}`);
  }
  if (!rapid && !Array.isArray(draft?.decisions))
    issues.push("standard start draft requires decisions to be an array; use [] when no durable decision qualifies");
  return { issues, classification: { impact, coupling, securityTriggers: safeTriggers }, rapid };
}

function specRequirementBlocks(specTexts) {
  const blocks = [];
  for (const text of specTexts) {
    let current = null;
    for (const line of String(text || "").split("\n")) {
      if (/^###\s+Requirement:/.test(line)) {
        current = { lines: [line], scenarios: new Set() };
        blocks.push(current);
        continue;
      }
      if (/^##\s/.test(line) || /^###\s/.test(line)) { current = null; continue; }
      if (!current) continue;
      current.lines.push(line);
      const scenario = line.match(/^####\s+Scenario:\s*(.+?)\s*$/);
      if (scenario) current.scenarios.add(scenario[1]);
    }
  }
  return blocks.map((block) => ({
    text: block.lines.join("\n").trim(), scenarios: block.scenarios
  }));
}

/**
 * Fingerprint each semantic requirement of a compiled packet by its claims and
 * the spec block that carries those claims' scenarios. Keys come from
 * `claim.requirementKey`, so legacy claims without one are not tracked.
 */
export function requirementFingerprints({ claims = [], specTexts = [] } = {}) {
  const blocks = specRequirementBlocks(specTexts);
  const byKey = new Map();
  for (const claim of claims) {
    const key = String(claim?.requirementKey || "").trim();
    if (!key) continue;
    byKey.set(key, [...(byKey.get(key) || []), claim]);
  }
  const fingerprints = {};
  for (const [key, rows] of byKey) {
    const scenarios = new Set(rows.map((claim) => claim.scenario).filter(Boolean));
    const text = blocks.filter((block) =>
      [...scenarios].some((name) => block.scenarios.has(name))).map((block) => block.text);
    const ordered = [...rows].sort((left, right) => String(left.id).localeCompare(String(right.id)));
    fingerprints[key] = createHash("sha256")
      .update(JSON.stringify({ claims: ordered, text })).digest("hex");
  }
  return fingerprints;
}

/**
 * Fingerprint each semantic requirement from its authored draft row and
 * evidence entry, so outcome-only edits are visible even in spec-less packets.
 */
export function draftRequirementFingerprints(draft) {
  const fingerprints = {};
  for (const row of Array.isArray(draft?.requirements) ? draft.requirements : []) {
    const key = String(row?.key || "").trim();
    if (!key) continue;
    fingerprints[key] = createHash("sha256")
      .update(JSON.stringify({ requirement: row, evidence: draft.evidence?.[key] ?? null }))
      .digest("hex");
  }
  return fingerprints;
}

export function requirementDelta(before = {}, after = {}) {
  const keys = (object) => Object.keys(object).sort();
  return {
    added: keys(after).filter((key) => !(key in before)),
    revised: keys(after).filter((key) => key in before && before[key] !== after[key]),
    removed: keys(before).filter((key) => !(key in after))
  };
}

/**
 * Fold a new revision delta into the unapproved one so a single approval covers
 * every change since the last approved agreement.
 */
export function mergeApprovalDelta(prior, next) {
  const added = new Set(prior?.added || []);
  const revised = new Set(prior?.revised || []);
  const removed = new Set(prior?.removed || []);
  for (const key of next.added || []) {
    if (removed.delete(key)) revised.add(key);
    else added.add(key);
  }
  for (const key of next.revised || [])
    if (!added.has(key)) revised.add(key);
  for (const key of next.removed || []) {
    revised.delete(key);
    if (!added.delete(key)) removed.add(key);
  }
  const sorted = (set) => [...set].sort();
  return { added: sorted(added), revised: sorted(revised), removed: sorted(removed) };
}

// A waiver bound to an earlier contract revision stops applying when an
// amendment moves the revision; the amendment says which ones, so the gate
// does not silently reappear.
export function priorChangeResidue(root, id) {
  return [
    join(root, ".foundation", "runtime", `${id}.json`),
    join(root, ".foundation", "receipts", id),
    join(root, ".foundation", "evidence", id),
    join(root, ".foundation", "handoffs", id),
    // Per-change bookkeeping (review requests and reports, instruction
    // manifests, the open attestation challenge, delivery state) leaks into a
    // reused id. Without a retirement record it may belong to a live change,
    // so it blocks reuse.
    ...retiredChangeStores(foundationChangeStores(root), id).map(([, path]) => path)
  ].filter((path) => existsSync(path));
}

// The newest retirement record of this id: an abandonment or a Land undo.
function retirementRecord(root, id) {
  const candidates = [
    [join(root, ".foundation", "recovery", "abandoned", id), "abandon.json"],
    [join(root, ".foundation", "recovery", "land-undone", id), "undo.json"]
  ].flatMap(([directory, name]) => existsSync(directory)
    ? readdirSync(directory)
      .filter((entry) => entry === name || entry.startsWith(`${name}.previous-`))
      .map((entry) => ({ directory, mtime: statSync(join(directory, entry)).mtimeMs }))
    : []);
  return candidates.sort((left, right) => right.mtime - left.mtime)[0]?.directory || null;
}

// An abandon (or Land undo) that predates a store's quarantine left that
// per-change bookkeeping behind. That is harness bookkeeping, not a live change,
// when the id's retirement record exists: finish the quarantine into that
// record (a delivery record is moved, never deleted) so the id is reusable
// fresh. Any other residue — runtime, receipts, evidence, handoffs — is left
// alone and still blocks reuse.
export function settleAbandonedReviewResidue(root, id, now) {
  const leaked = retiredChangeStores(foundationChangeStores(root), id);
  const residue = priorChangeResidue(root, id);
  const leakedPaths = leaked.map(([, path]) => path);
  if (!residue.length || residue.some((path) => !leakedPaths.includes(path))) return [];
  const record = retirementRecord(root, id);
  if (!record) return [];
  const moved = [];
  for (const [name, source] of leaked) {
    if (!existsSync(source)) continue;
    const destination = join(record, name);
    if (existsSync(destination))
      renameSync(destination, `${destination}.previous-${
        String(now()).replace(/[^0-9A-Za-z]/g, "-")}`);
    renameSync(source, destination);
    moved.push(name);
  }
  return moved;
}

export function materializeChangeTemplates({
  schema,
  source,
  target,
  intent,
  groundingRequired,
  conditional = false,
  includeDesign = true,
  instantiate
}) {
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, ".openspec.yaml"), schema === "foundation-rapid"
    ? `schema: ${schema}\nskip_specs: true\n`
    : `schema: ${schema}\n`);
  const core = conditional
    ? ["proposal.md", "tasks.md", "evidence.yaml"]
    : ["proposal.md", "tasks.md", "evidence.yaml", "execution.yaml",
        "repositories.yaml", "handoffs.yaml"];
  for (const name of core)
    writeFileSync(join(target, name), instantiate(join(source, name), intent));
  if (groundingRequired && !conditional)
    writeFileSync(join(target, "grounding.yaml"),
      instantiate(join(source, "grounding.yaml"), intent));
  if (schema === "foundation-standard") {
    if (includeDesign)
      writeFileSync(join(target, "design.md"), instantiate(join(source, "design.md"), intent));
    if (!conditional) {
      mkdirSync(join(target, "specs", "change"), { recursive: true });
      writeFileSync(join(target, "specs", "change", "spec.md"),
        instantiate(join(source, "spec.md"), intent));
    }
  }
}

export function initialChangeState({
  root,
  id,
  intent,
  schema,
  groundingRequired,
  riskBasedCi,
  gitHead,
  preexistingDirty,
  initialBudget,
  now,
  semanticDraftVersion = null,
  groundingVersion = null,
  externalOperationsVersion = 1,
  designRequired = true
}) {
  const standard = schema === "foundation-standard";
  return {
    version: 2, id, intent, schema, status: "change", ambiguity: "clear",
    groundingRequired,
    groundingVersion: groundingRequired ? (groundingVersion || 2) : null,
    semanticDraftVersion,
    artifactDefaultsVersion: isSemanticVersion(semanticDraftVersion) ? 2 : null,
    nfrAssessmentRequired: standard && groundingRequired && groundingVersion !== 3,
    decisionMetadataRequired: standard && designRequired,
    semanticInvariantsRequired: standard,
    riskBasedCiRequired: standard && riskBasedCi,
    externalOperationsVersion,
    graphExecutionVersion: 1,
    // Standard changes must pass through the explicit decision boundary before
    // validation. Keep the marker opt-in so runtime files created before this
    // field existed remain valid and rapid changes keep their short lane.
    resolutionRequired: standard,
    resolvedAt: null,
    revision: 0, contractRevision: 0, executionRevision: 0,
    impact: standard ? null : "low",
    coupling: standard ? null : "isolated",
    securityTriggers: [], reviewRequired: false, evidenceCapabilities: [],
    acceptance: {
      version: 2,
      decision: standard ? "undecided" : "not-required",
      required: false, reason: null, claimIds: [], declaredAt: null
    },
    reviewHistory: { version: 1, aiAttempts: 0, totalAttempts: 0, chainHead: null },
    workspace: {
      mode: "current", path: root, baseHead: gitHead(root),
      preexisting: preexistingDirty(root)
    },
    budget: initialBudget(schema, id),
    createdAt: now(), updatedAt: now()
  };
}

// Advisory only, never a repair: what the approval page will lack. A medium or
// high change without concrete examples, a performance change without a target
// number, or a defect or migration without an affected count. Kept apart from
// the coverage note so that line's wording stays unchanged.
const SCRATCH_COUNT_WORK = new Set(["bugfix", "migration", "deprecation"]);
const hasDigit = (value) => /\d/.test(String(value ?? ""));
export function scratchNoteLine(draft) {
  const impact = String(draft?.impact || "").trim().toLowerCase();
  if (impact !== "medium" && impact !== "high") return "";
  const examples = Array.isArray(draft?.examples) ? draft.examples : [];
  const types = new Set((Array.isArray(draft?.workType) ? draft.workType : [draft?.workType]).map((type) => String(type || "")));
  const signals = new Set(Array.isArray(draft?.riskSignals) ? draft.riskSignals : []);
  const gaps = [];
  if (!examples.length) gaps.push("no concrete example (optional 'examples')");
  if (types.has("performance") || signals.has("performance-slo")) {
    const target = examples.some((row) => row?.type === "perf" &&
      (row.metrics || []).some((metric) => typeof metric?.target === "number"));
    if (!target && !hasDigit(draft?.successMeasure)) gaps.push("no target number (perf example target or 'successMeasure')");
  }
  if ([...types].some((type) => SCRATCH_COUNT_WORK.has(type)) && !hasDigit(draft?.scratch?.asIs))
    gaps.push("no affected count (optional 'scratch.asIs')");
  return gaps.length ? `scratch (advisory, approval page): ${gaps.join("; ")}` : "";
}

// Advisory only, never a repair or a gate: a touched path that points at a risk
// the draft neither declares nor covers in discovery (a migration file with no
// persisted-data-change coverage, say). A declared signal is already held to its
// coverage by intake, so only undeclared ones are named here.
export function pathRiskNoteLine(draft) {
  const paths = [
    ...(Array.isArray(draft?.tasks) ? draft.tasks.flatMap((task) => Array.isArray(task?.paths) ? task.paths : []) : []),
    ...(Array.isArray(draft?.fileMap) ? draft.fileMap.map((row) => row?.path).filter(Boolean) : [])
  ];
  const declared = new Set((Array.isArray(draft?.riskSignals) ? draft.riskSignals : [])
    .map((signal) => String(signal).trim().toLowerCase()));
  const covered = new Set((Array.isArray(draft?.discovery?.coverage) ? draft.discovery.coverage : [])
    .filter((row) => ["covered", "not-applicable"].includes(String(row?.status || "").toLowerCase()))
    .map((row) => row.dimension));
  const dimensions = riskSignalDimensions();
  const gaps = inferPathSignals(paths).filter((row) => !declared.has(row.signal)).flatMap((row) => {
    const missing = (dimensions[row.signal] || []).filter((dimension) => !covered.has(dimension));
    return missing.length ? [`${row.path} suggests ${row.signal} (no coverage for ${missing.join(", ")})`] : [];
  });
  return gaps.length
    ? `path risk (advisory): ${gaps.join("; ")}; declare the riskSignal or add discovery coverage rows when it applies`
    : "";
}

export function createChangeLifecycle({
  root,
  policy,
  approvalPackageLink,
  // Records the approval page's digest and the facts digest at start, revise,
  // and amend; advisory, so a failure here never changes the command's result.
  recordPrototypeSync,
  // { configured, required }: roles from approval.roles and the lanes this
  // change needs (configured roles the scratch router selects).
  approvalLanes,
  securityTerms,
  fail,
  pathInside,
  readJson,
  writeJson,
  slugify,
  changePath,
  activeChangePath,
  loadRuntime,
  saveRuntime,
  setOperationChangeId,
  initialBudget,
  git,
  gitHead,
  preexistingDirty,
  now,
  bindClaudeSession,
  validate,
  showPacket,
  measureStage,
  receiptPath,
  receiptValidity,
  contractFingerprint,
  requiredProviders,
  providerConfig,
  claimsForProvider,
  providerWorkspaceHash,
  providerInputIdentity,
  relevantHash,
  stableHash,
  trapFailures,
  rollbackStart,
  repositoryCatalog,
  decisionGateNotice
}) {
  requireDeps("createChangeLifecycle", {
    approvalPackageLink, recordPrototypeSync, approvalLanes, activeChangePath, git,
    receiptPath, receiptValidity, contractFingerprint, requiredProviders, providerConfig,
    claimsForProvider, providerWorkspaceHash, providerInputIdentity, relevantHash, stableHash,
    trapFailures, rollbackStart, repositoryCatalog, decisionGateNotice
  });
  // Declared repositories other than the control root (submodules and
  // registered siblings). An unreadable catalog is reported by the commands
  // that use it; here it only means no repository-binding checks apply.
  function declaredRepositories() {
    try {
      const rows = trapFailures(() => repositoryCatalog())?.repositories;
      return Array.isArray(rows) ? rows.filter((row) => row?.id && row.id !== "root") : [];
    } catch { return []; }
  }

  function changeRepositorySelection(changeDir) {
    const path = join(changeDir, "repositories.yaml");
    if (!existsSync(path)) return ["root"];
    try {
      const rows = readJson(path).repositories;
      return Array.isArray(rows)
        ? rows.map((entry) => typeof entry === "string" ? entry : entry?.id).filter(Boolean)
        : ["root"];
    } catch { return ["root"]; }
  }

  // The selection rows themselves, so a repository `dependsOn` is visible.
  function changeRepositoryRows(changeDir) {
    const path = join(changeDir, "repositories.yaml");
    if (!existsSync(path)) return null;
    try {
      const rows = readJson(path).repositories;
      return Array.isArray(rows) ? rows : null;
    } catch { return null; }
  }

  const workflowPolicy = () => typeof policy === "function" ? policy() : policy;

  function amendmentRevision(state) {
    return JSON.stringify({
      revision: Number(state.revision || 0),
      contractRevision: Number(state.contractRevision || 0),
      executionRevision: Number(state.executionRevision || 0)
    });
  }

  function assertAmendmentRevision(id, expected, label = "change amendment") {
    if (amendmentRevision(loadRuntime(id)) !== expected)
      fail(`${label} for '${id}' conflicted with a newer change revision; ` +
        "reload the active agreement and retry");
  }

  // Amend and revise share one per-change lock so neither can replace the
  // packet or runtime state while the other is mid-transaction.
  function withAmendmentLock(id, observedRevision, operation, label = "change amendment") {
    const lock = acquireProcessLock(
      join(root, ".foundation", "locks", `amend-${id}.lock`), { now });
    if (!lock.acquired)
      fail(`${label} for '${id}' is already in progress; ` +
        "reload the active agreement and retry");
    try {
      assertAmendmentRevision(id, observedRevision, label);
      return operation();
    } finally {
      lock.release();
    }
  }

  function selectiveBinding(id, provider, contractRevision, receipt = null) {
    const config = providerConfig(id, provider);
    const claims = claimsForProvider(id, provider).map((claim) => claim.id).sort();
    const workspaceHash = providerWorkspaceHash(id, provider, relevantHash(id));
    const inputs = providerInputIdentity(id, provider, config, workspaceHash);
    return {
      provider,
      status: receipt?.status || "pass",
      validity: receipt ? receiptValidity(id, provider, workspaceHash).validity : "valid",
      binding: {
        contractRevision,
        providerFingerprint: stableHash({ config, claims }),
        claimsFingerprint: stableHash(claims),
        inputIdentity: inputs
      }
    };
  }
  function templateDir(schema) {
    return projectResource(root, "openspec", "schemas", schema, "templates");
  }

  function instantiate(path, title) {
    return readFileSync(path, "utf8")
      .replaceAll("<title>", title)
      .replaceAll("replace-with-stable-claim-id", `${slugify(title)}-outcome`);
  }

  function assertChangeAvailable(id) {
    if (existsSync(changePath(id))) fail(`change already exists: ${id}`);
    settleAbandonedReviewResidue(root, id, now);
    const residue = priorChangeResidue(root, id);
    if (residue.length)
      fail(`change id '${id}' was used before and its recorded history remains ` +
        `(${residue.map((path) => path.slice(root.length + 1)).join(", ")}); pick a new id`);
  }

  // `folderIssues` (revise) collects a v5 folder's prose issues instead of
  // failing, so they reach the same EDIT batch as the draft's other issues.
  // `allowMissing` (start) also collects an unreadable change.json and returns
  // null, so the folder's issues still come back as one EDIT.
  function draftSource(draftPath, prior = {}, { folderIssues = null, allowMissing = false } = {}) {
    const source = resolve(root, draftPath);
    if (!pathInside(root, source) || !existsSync(source))
      fail("new --draft requires a JSON file inside the project (or a v5 draft folder)");
    // `minimalDraft` is the template's example key, never draft content. A
    // draft without `version` in the minimal v4 shape compiles as v4.
    const raw = statSync(source).isDirectory()
      ? draftFolderSource(source, folderIssues, { allowMissing }) : readJson(source);
    if (raw === null && allowMissing && folderIssues?.length) return null;
    const context = { ...minimalDraftContext, ...prior };
    // Impact and coupling are derived from the draft's content, never lowered.
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || !("minimalDraft" in raw))
      return withDerivedRisk(expandMinimalSemanticDraft(raw, context));
    const { minimalDraft: _example, ...draft } = raw;
    return withDerivedRisk(expandMinimalSemanticDraft(draft, context));
  }

  // A v5 draft folder: change.json plus authored proposal.md and design.md.
  function draftFolderSource(source, collect = null, { allowMissing = false } = {}) {
    const { draft, issues } = loadDraftFolder(source, { name: relative(root, source).replaceAll("\\", "/") || "." });
    if (issues.length && collect && (draft || allowMissing)) { collect.push(...issues); return draft; }
    if (issues.length) fail(`semantic draft validation failed:\n  - ${issues.join("\n  - ")}`);
    return draft;
  }

  // A minimal draft chooses among existing capabilities before inventing one.
  const minimalDraftContext = {
    loadCanonicalSpec: canonicalSpecText,
    listCanonicalCapabilities: () => {
      const specs = join(root, "openspec", "specs");
      if (!existsSync(specs)) return [];
      return readdirSync(specs, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(specs, entry.name, "spec.md")))
        .map((entry) => entry.name).sort();
    }
  };

  function canonicalSpecText(capability) {
    const path = join(root, "openspec", "specs", slugify(capability), "spec.md");
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  }

  function semanticSourcePaths(source) {
    return [...new Set((source.discovery?.coverage || [])
      .flatMap((row) => Array.isArray(row?.sources) ? row.sources : [])
      .map((path) => String(path || "").trim()).filter(Boolean))];
  }

  function semanticIntakeStatePath(sourcePath, scope = "draft") {
    const source = relative(root, resolve(root, sourcePath)).replaceAll("\\", "/");
    // Preserve the v1/v2 draft-state filename while namespacing amendment
    // snapshots so one file can be inspected against different active changes.
    const identity = scope === "draft" ? source : `${scope}\0${source}`;
    const key = createHash("sha256").update(identity).digest("hex").slice(0, 24);
    return join(root, ".foundation", "intake", `${key}.json`);
  }

  // A skipped repository scan still grounds the project's lessons, so even a
  // rapid intake reads them and an edit to them refreshes source coverage.
  function lessonsSourcePaths() {
    return existsSync(join(root, PROJECT_LESSONS_PATH)) ? [PROJECT_LESSONS_PATH] : [];
  }

  function semanticSourceInspection(source, baseline = null, discoveredPaths = []) {
    return inspectSemanticSources({
      projectRoot: root,
      sourcePaths: [...new Set([...semanticSourcePaths(source), ...discoveredPaths])],
      baseline
    });
  }

  function gitVisiblePaths(directory) {
    const tracked = git(["ls-files", "-z"], directory);
    const included = git([
      "ls-files", "-z", "--cached", "--others", "--exclude-standard"
    ], directory);
    if (tracked.status !== 0 || included.status !== 0) return null;
    return {
      trackedPaths: tracked.stdout.split("\0").filter(Boolean),
      includedPaths: included.stdout.split("\0").filter(Boolean)
    };
  }

  // A root that is not a Git repository (a folder that gathers many
  // repositories) is scanned through the repositories it declares, restricted
  // to the draft's selection, plus the seeds that live at the root. Walking the
  // whole folder would reach every unrelated repository and exhaust the scan
  // limits. Without declared repositories the whole-tree walk remains.
  function repositoryGitPaths(source = {}, seeds = []) {
    const rootPaths = gitVisiblePaths(root);
    if (rootPaths) return rootPaths;
    const selected = new Set((Array.isArray(source.repositories) ? source.repositories : [])
      .map((entry) => typeof entry === "string" ? entry : entry?.id).filter(Boolean));
    const repositories = declaredRepositories().filter((row) =>
      ["git", "submodule"].includes(row.type) && (!selected.size || selected.has(row.id)));
    const trackedPaths = [];
    const includedPaths = [];
    for (const repository of repositories) {
      const prefix = String(repository.relativePath || "").replaceAll("\\", "/");
      if (!prefix || prefix === "." || prefix.startsWith("../") || !repository.path) continue;
      const paths = existsSync(repository.path) ? gitVisiblePaths(repository.path) : null;
      if (!paths) continue;
      trackedPaths.push(...paths.trackedPaths.map((path) => `${prefix}/${path}`));
      includedPaths.push(...paths.includedPaths.map((path) => `${prefix}/${path}`));
    }
    if (!includedPaths.length) return { includedPaths: null, trackedPaths: [] };
    for (const seed of [...seeds, ...lessonsSourcePaths()])
      if (existsSync(join(root, seed))) includedPaths.push(seed);
    return { trackedPaths, includedPaths: [...new Set(includedPaths)] };
  }

  // "skipped" (rapid-shaped change) is usable like "ready"; only "blocked" is not.
  const intelligenceUsable = (intelligence) =>
    ["ready", "skipped"].includes(intelligence.repository.status);

  function repositoryIntelligence(source, excludedPaths = [], { standardLane = false } = {}) {
    if (!repositoryIntelligenceRequired(source, { standardLane })) {
      const repository = skippedRepositoryIntelligence();
      const depth = planSemanticIntakeDepth(source, { repository: {} });
      return { repository, depth, selected: lessonsSourcePaths(), selectedBytes: 0 };
    }
    const query = [source.intent, source.why, ...(source.changes || []),
      ...(source.requirements || []).flatMap((row) => [
        row?.key, row?.requirement, row?.description, row?.outcome
      ])];
    const repositoryPaths = repositoryGitPaths(source, semanticSourcePaths(source));
    const excluded = new Set(excludedPaths.map((path) =>
      String(path || "").replaceAll("\\", "/")));
    const repository = inspectRepositoryIntelligence({
      projectRoot: root,
      query,
      seedPaths: semanticSourcePaths(source),
      trackedPaths: repositoryPaths.trackedPaths,
      excludedPaths: [...excluded],
      includedPaths: repositoryPaths.includedPaths === null ? null
        : repositoryPaths.includedPaths.filter((path) => !excluded.has(path)),
      limits: { maxReadSet: 48 }
    });
    const graph = repository.graph || {};
    const surfaces = graph.surfaces || {};
    const depth = planSemanticIntakeDepth(source, { repository: {
      candidateFileCount: repository.candidates?.length || 0,
      integrationCount: surfaces.integrations?.length || 0,
      dependentCount: graph.callers?.length || 0,
      persistenceBoundaryCount: surfaces.persistence?.length || 0,
      permissionBoundaryCount: surfaces.permissions?.length || 0
    } });
    let selectedBytes = 0;
    const selected = [];
    for (const row of repository.readSet || []) {
      if (selected.length >= depth.limits.maxSourceFiles) break;
      if (selectedBytes + row.bytes > depth.limits.maxSourceBytes) continue;
      selected.push(row.path);
      selectedBytes += row.bytes;
    }
    return { repository, depth, selected, selectedBytes };
  }

  function validateDraftFields(draft) {
    // A semantic draft may leave 'why' out; its proposal then has no Why
    // section instead of repeating the intent.
    const requiredStrings = isSemanticVersion(draft._semanticVersion)
      ? ["currentState", "compatibility"] : ["why", "currentState", "compatibility"];
    for (const field of requiredStrings)
      if (!String(draft[field] || "").trim())
        fail(`draft requires non-empty '${field}'`);
    const requiredArrays = isSemanticVersion(draft._semanticVersion)
      ? ["changes", "tasks", "claims", "specs"]
      : ["changes", "nonGoals", "decisions", "risks", "tasks", "claims", "specs"];
    for (const field of requiredArrays)
      if (!Array.isArray(draft[field]) || draft[field].length === 0)
        fail(`draft requires a non-empty '${field}' array`);
  }

  function domainLanguageIssues(draft) {
    if (draft.domainLanguage === undefined) return [];
    if (!Array.isArray(draft.domainLanguage)) return ["draft domainLanguage must be an array"];
    return draft.domainLanguage.flatMap((term, index) => ["term", "meaning", "avoid"]
      .filter((field) => !String(term?.[field] || "").trim())
      .map((field) => `draft domainLanguage[${index}].${field} is required`));
  }

  function validateDraftDomainLanguage(draft) {
    const issues = domainLanguageIssues(draft);
    if (issues.length === 1) fail(issues[0]);
    if (issues.length) fail(`draft domain language validation failed:\n  - ${issues.join("\n  - ")}`);
  }

  function validateDraftPolicy(draft) {
    if (workflowPolicy().workflow.grounding === "required" &&
        ![2, 3].includes(draft.grounding?.version))
      fail("draft requires grounding.version 2 or 3 from the single Decision Sheet");
    if (draft.externalOperations !== undefined && !Array.isArray(draft.externalOperations))
      fail("draft externalOperations must be an array");
  }

  function validateDraftSpec(spec, index, warnedLegacyOperation) {
    const label = `draft specs[${index}]`;
    for (const field of ["name", "requirement", "description"])
      if (!String(spec?.[field] || "").trim()) fail(`${label}.${field} is required`);
    const operation = String(spec.operation || "added").toLowerCase();
    let warned = warnedLegacyOperation;
    if (!spec.operation && !warned) {
      console.error("WARNING: legacy draft specs without operation are treated as added; declare added|modified|removed after comparing the canonical spec");
      warned = true;
    }
    if (!["added", "modified", "removed"].includes(operation))
      fail(`${label}.operation must be added|modified|removed`);
    const scenarios = normalizedDraftScenarios(spec);
    if (operation !== "removed" && scenarios.length === 0)
      fail(`${label}.scenarios must be non-empty for ${operation}`);
    for (const [scenarioIndex, scenario] of scenarios.entries())
      for (const field of ["name", "when", "then"])
        if (!String(scenario?.[field] || "").trim())
          fail(`${label}.scenarios[${scenarioIndex}].${field} is required`);
    if (operation === "removed" && !String(spec.migration || "").trim())
      fail(`${label}.migration is required for removed requirements`);
    return warned;
  }

  function validateDraftSpecs(draft) {
    let warnedLegacyOperation = false;
    for (const [index, spec] of draft.specs.entries()) {
      warnedLegacyOperation = validateDraftSpec(spec, index, warnedLegacyOperation);
    }
  }

  function loadDraft(draftPath, { deferPolicy = false, preparedSource = null } = {}) {
    const source = preparedSource || draftSource(draftPath);
    if (!isSemanticVersion(source.version))
      fail("semantic draft validation failed:\n  - " +
        retiredDraftIssue(source.version));
    let draft = source;
    {
      const normalized = normalizeSemanticDraft(source, slugify, {
        defaultRapidEvidence: true,
        requireScratch: true,
        requireUndo: true,
        repositories: declaredRepositories(),
        loadCanonicalSpec: (capability) => {
          const path = join(root, "openspec", "specs", slugify(capability), "spec.md");
          return existsSync(path) ? readFileSync(path, "utf8") : null;
        }
      });
      if (normalized.issues.length)
        fail(`semantic draft validation failed:\n  - ${normalized.issues.join("\n  - ")}`);
      draft = normalized.draft;
      validateSemanticReferences(draft);
    }
    validateDraftFields(draft);
    validateDraftDomainLanguage(draft);
    if (!deferPolicy) validateDraftPolicy(draft);
    validateDraftSpecs(draft);
    return draft;
  }

  function semanticReferenceIssues(draft) {
    const issues = [];
    const validateLocalFile = (field, value) => {
      const path = resolve(root, value);
      try {
        const project = realpathSync(root);
        const canonical = realpathSync(path);
        if (!pathInside(project, canonical) || !statSync(canonical).isFile())
          throw new Error("not a contained regular file");
      } catch {
        issues.push(`semantic draft ${field} must reference an existing regular file inside the project`);
      }
    };
    const referencedPaths = [];
    if (draft.prototypeSelection?.reference)
      referencedPaths.push(["prototypeSelection.reference", draft.prototypeSelection.reference]);
    for (const [index, row] of (draft.discovery?.coverage || []).entries())
      for (const [sourceIndex, source] of (row.sources || []).entries())
        referencedPaths.push([
          `discovery.coverage[${index}].sources[${sourceIndex}]`, source
        ]);
    for (const [index, diagram] of (draft.diagrams || []).entries()) {
      if (!["mermaid", "svg", "png"].includes(diagram?.type))
        issues.push(`semantic draft diagrams[${index}].type must be mermaid|svg|png`);
      if (!String(diagram?.key || "").trim())
        issues.push(`semantic draft diagrams[${index}].key is required`);
      if (!String(diagram?.purpose || "").trim())
        issues.push(`semantic draft diagrams[${index}].purpose is required`);
      if (diagram.type === "mermaid" && !String(diagram.source || "").trim())
        issues.push(`semantic draft diagrams[${index}].source is required`);
      if (diagram.type !== "mermaid") {
        const path = diagram.path || diagram.source;
        if (!String(path || "").trim())
          issues.push(`semantic draft diagrams[${index}].path is required`);
        else referencedPaths.push([`diagrams[${index}].path`, path]);
      }
    }
    for (const [field, value] of referencedPaths) validateLocalFile(field, value);
    const requirementKeys = draft._requirementKeys?.length ? draft._requirementKeys
      : (draft.claims || []).map((claim) => claim?.requirementKey).filter(Boolean);
    issues.push(...prototypeSelectionIssues(draft.prototypeSelection, requirementKeys));
    for (const [index, integration] of (draft.integrations || []).entries()) {
      const source = String(integration?.documentation?.source || "").trim();
      if (!source) continue;
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(source)) {
        let url;
        try { url = new URL(source); }
        catch {
          issues.push(`semantic draft integrations[${index}].documentation.source must be a valid HTTPS URL`);
          continue;
        }
        if (url.protocol !== "https:")
          issues.push(`semantic draft integrations[${index}].documentation.source must use HTTPS`);
        const version = String(integration?.documentation?.version || "").trim();
        if (/^(?:latest|current|main|master|head)$/i.test(version))
          issues.push(`semantic draft integrations[${index}].documentation.version must identify a fixed version`);
        continue;
      }
      validateLocalFile(`integrations[${index}].documentation.source`, source);
    }
    return issues;
  }

  function validateSemanticReferences(draft) {
    const issues = semanticReferenceIssues(draft);
    if (issues.length) fail(issues.join("\n  - "));
  }

  function normalizedDraftScenarios(spec) {
    if (Array.isArray(spec.scenarios)) return spec.scenarios;
    return (spec.scenario || spec.when || spec.then)
      ? [{ name: spec.scenario, when: spec.when, then: spec.then }]
      : [];
  }

  function renderDraftRequirement(spec) {
    return renderRequirementMarkdown(spec, normalizedDraftScenarios(spec));
  }

  // Design blueprints warn rather than block: the agent completes a thin
  // design before presenting it for approval.
  // The compiled packet's files, so the agent opens real paths instead of
  // guessing where the compiler put each artifact.
  function packetFileLines(id) {
    const base = changePath(id);
    const files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (entry.isFile()) files.push(relative(root, path).split("\\").join("/"));
      }
    };
    try { walk(base); } catch { return ""; }
    const lines = files.sort().map((file) => `  file: ${file}\n`);
    let semantic = false;
    try { semantic = isRecordedSemanticVersion(loadRuntime(id)?.semanticDraftVersion); } catch {}
    if (!files.some((file) => file.includes("/specs/")))
      lines.push(semantic
        ? "  specs: none (docs-only change; it modifies no living spec)\n"
        : "  specs: none (legacy rapid packet without delta specs)\n");
    // The task list, so the agent can start Build without opening tasks.md.
    try {
      for (const line of readFileSync(join(base, "tasks.md"), "utf8").split("\n")) {
        const task = line.match(/^\s*-\s*\[[ xX]\]\s*\*{0,2}(T\d+)\*{0,2}\s*(.*)$/);
        if (!task) continue;
        // Drop the bracketed ledger metadata; keep the outcome and its verify.
        const summary = task[2].replace(/\s*\[[a-z-]+:[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
        lines.push(`  task: ${task[1]} ${summary.slice(0, 200)}\n`);
      }
    } catch {}
    return lines.join("");
  }

  // `source` is the authored draft: unknown task fields are gone after
  // normalization. Every schema prints them; they never block.
  function designWarningLines(draft, schema, source = draft) {
    if (!isSemanticVersion(draft._semanticVersion)) return "";
    const verify = verifyCountAdvisories(draft.tasks)
      .map((warning) => `  verify advisory: ${warning}\n`).join("") +
      unknownTaskFieldWarnings(source).map((warning) => `  task warning: ${warning}\n`).join("");
    if (schema !== "foundation-standard") return verify;
    return [...designBlueprintWarnings(draft), ...readerGuideWarnings(draft)]
      .map((warning) => `  design warning: ${warning}\n`).join("") + verify;
  }

  // Facts the proposal states from policy and topology rather than from the
  // draft: the review route the change will take (the same label resolve
  // prints) and declared repositories its tasks do not select.
  function proposalContext(draft, state) {
    const declared = declaredRepositories().map((row) => row.id);
    const used = new Set([
      ...(Array.isArray(draft.repositories) ? draft.repositories : [])
        .map((entry) => (typeof entry === "string" ? entry : entry?.id)),
      ...(draft.tasks || []).map((task) => task.repository || "root")
    ].filter(Boolean));
    const policy = workflowPolicy();
    return {
      unselectedRepositories: declared.filter((repository) => !used.has(repository)),
      reviewLabel: reviewRouteLabel({
        lowRiskModel: policy.review?.lowRiskModel, modelByTier: policy.review?.modelByTier,
        state: { ...state, impact: draft.impact, coupling: draft.coupling,
          securityTriggers: draft.securityTriggers || [], reviewRequired: Boolean(draft.reviewRequired) },
        claims: draft.claims || []
      })
    };
  }

  function materializeDraft(id, draft) {
    const state = loadRuntime(id);
    const basePath = changePath(id);
    // Task paths their repository's checkout does not have yet read as
    // additions; a repository whose root is unknown throws and stays a change.
    const documented = withNewPaths(draft, (path, repository) => {
      if (!repository) return existsSync(join(root, path));
      const relativePath = declaredRepositories().find((row) => row.id === repository)?.relativePath;
      if (!relativePath) throw new Error(`repository ${repository} has no known root`);
      return existsSync(join(root, relativePath, path));
    });
    writeFileSync(join(basePath, "proposal.md"),
      renderDraftProposal(documented, state, proposalContext(draft, state)));
    // A standard v4 change is built from its dev document, so design.md is
    // always written; v3 keeps writing it only for authored design content.
    if (state.schema === "foundation-standard" &&
        true)
      writeFileSync(join(basePath, "design.md"), renderDraftDesign(documented));
    const qualityGrounding = v5QualityGrounding(draft, { groundingRequired: state.groundingRequired });
    if (qualityGrounding) writeJson(join(basePath, "grounding.yaml"), qualityGrounding);
    else if (state.groundingRequired && draft.grounding)
      writeJson(join(basePath, "grounding.yaml"), draft.grounding);
    writeFileSync(join(basePath, "tasks.md"), renderDraftTasks(draft.tasks));
    materializePrototype({
      root, basePath, selection: draft.prototypeSelection,
      claims: draft.claims || [], tasks: draft.tasks || []
    });
    const contract = readJson(join(basePath, "evidence.yaml"));
    contract.claims = draft.claims;
    if (isSemanticVersion(draft._semanticVersion) && draft._derivedExecution)
      contract.providers = draft.execution.providers;
    writeJson(join(basePath, "evidence.yaml"), contract);
    if (draft.execution && !(isSemanticVersion(draft._semanticVersion) && draft._derivedExecution))
      writeJson(join(basePath, "execution.yaml"), draft.execution);
    if (!isSemanticVersion(draft._semanticVersion) || draft.externalOperations?.length)
      writeJson(join(basePath, "handoffs.yaml"), {
        version: 1,
        operations: draft.externalOperations || []
      });
    if (draft.repositories?.length) writeJson(join(basePath, "repositories.yaml"), {
      version: 1,
      repositories: draft.repositories
    });
    // A semantic rapid draft compiles the same concise delta specs as the
    // standard lane, so Land merges its behavior into openspec/specs. The
    // template's skip_specs marker would contradict them; only a legacy rapid
    // packet without deltas, or declared docs-only work (no system behavior),
    // keeps it.
    const rapidSpecs = state.schema === "foundation-rapid" &&
      isSemanticVersion(draft._semanticVersion) && (draft.specs || []).length > 0 &&
      !docsOnlyDraft(draft);
    if (state.schema === "foundation-standard" || rapidSpecs)
      materializeDraftSpecs({
        basePath, specs: draft.specs, slugify,
        renderRequirement: renderDraftRequirement,
        capabilityExists: (capability) => canonicalSpecText(capability) !== null
      });
    if (rapidSpecs) writeFileSync(join(basePath, ".openspec.yaml"), "schema: foundation-rapid\n");
  }

  // The artifacts the standard schema adds over the rapid one. Written only
  // when absent, so an upgrade never overwrites work already done.
  function materializeStandardArtifacts(id, intent) {
    const source = templateDir("foundation-standard");
    const target = changePath(id);
    const design = join(target, "design.md");
    if (!existsSync(design))
      writeFileSync(design, instantiate(join(source, "design.md"), intent));
    const grounding = join(target, "grounding.yaml");
    if (workflowPolicy().workflow.grounding === "required" && !existsSync(grounding))
      writeFileSync(grounding, instantiate(join(source, "grounding.yaml"), intent));
    const spec = join(target, "specs", "change", "spec.md");
    // A compiled rapid packet already carries its delta specs.
    let hasSpecs = false;
    try {
      hasSpecs = readdirSync(join(target, "specs"), { withFileTypes: true })
        .some((entry) => entry.isDirectory() && existsSync(join(target, "specs", entry.name, "spec.md")));
    } catch {}
    if (!hasSpecs && !existsSync(spec)) {
      mkdirSync(join(target, "specs", "change"), { recursive: true });
      writeFileSync(spec, instantiate(join(source, "spec.md"), intent));
    }
    // The rapid marker declared skip_specs; keeping it beside the specs/ this
    // upgrade just materialized makes the packet self-contradictory and fails
    // OpenSpec strict validation.
    writeFileSync(join(target, ".openspec.yaml"), "schema: foundation-standard\n");
  }

  function createChange(intent, flags, preparedDraft = undefined, options = {}) {
    // An existing well-formed id is kept verbatim so a revise targets the same
    // packet, including one created before ids stopped ending in "-".
    const id = /^[a-z0-9][a-z0-9-]{0,63}$/.test(String(flags.id || ""))
      ? flags.id : slugify(flags.id || intent);
    setOperationChangeId(id);
    // An archived change keeps its runtime state, receipts, and evidence vault
    // as history. A new change reusing the id would inherit them — review
    // rounds it never ran, receipts bound to another workspace — so the id is
    // refused rather than quietly adopted. Atomic start checks once before its
    // rollback boundary so cleanup can never delete a pre-existing change.
    if (!options.availabilityChecked) assertChangeAvailable(id);
    if (preparedDraft === undefined && flags.draft)
      fail("a semantic draft must use 'change start <draft>' so repository intake is enforced");
    const draft = preparedDraft !== undefined ? preparedDraft : null;
    const schema = flags.rapid ? "foundation-rapid" : "foundation-standard";
    const source = templateDir(schema);
    const target = changePath(id);
    const groundingRequired = workflowPolicy().workflow.grounding === "required" ||
      Boolean(draft?.grounding);
    const semantic = isSemanticVersion(draft?._semanticVersion);
    // The rapid schema declares no spec artifact, so a rapid change never has
    // deltas to find. OpenSpec reads that absence as an error — every rapid
    // change was invalid to `openspec validate`, and Land printed five lines of
    // raw validator text at the user for a lane whose whole point is small work.
    // `skip_specs` is the flag OpenSpec's own message names for exactly this.
    materializeChangeTemplates({
      schema, source, target, intent, groundingRequired,
      conditional: semantic,
      includeDesign: !semantic || draftNeedsDesign(draft),
      instantiate
    });
    const state = initialChangeState({
      root, id, intent, schema, groundingRequired,
      riskBasedCi: workflowPolicy().land?.riskBasedCi === true,
      gitHead, preexistingDirty, initialBudget, now,
      semanticDraftVersion: semantic ? draft._semanticVersion : null,
      groundingVersion: draft?.grounding?.version || null,
      externalOperationsVersion: semantic
        ? (draft.externalOperations?.length ? 1 : null) : 1,
      designRequired: !semantic || draftNeedsDesign(draft)
    });
    // The document language is recorded, never applied: the agent writes the
    // prose and the harness does not translate it.
    if (semantic && String(draft.language || "").trim())
      state.documentLanguage = String(draft.language).trim();
    // Marks a change created under the hotfix regression rule, so a later
    // revise keeps enforcing it while older changes stay unaffected.
    if (semantic) state.regressionRequired = true;
    saveRuntime(state);
    if (draft) materializeDraft(id, draft);
    if (!options.deferSessionBinding) bindClaudeSession(id, "change");
    const next = schema === "foundation-standard"
      ? `resolve decisions with change resolve ${id} before authoring or validation`
      : `complete artifacts, validate, then /build ${id}`;
    // Atomic start and revise print one authoritative next step after AGREED
    // or REVISED; a per-step `next` here contradicted it.
    console.log(`CREATED ${id}\n  schema: ${schema}` +
      (options.deferSessionBinding ? "" : `\n  next: ${next}`));
    return id;
  }

  // The minimal v5 folder leads; the typed-field reference follows for richer
  // drafts. The decisions note travels with the template the agent already
  // reads, so recording unasked defaults costs no always-loaded instruction
  // words. `save` leads because agents copy from this output: a shell-written
  // draft is refused by the host, while the file tool falls under the seeded
  // `Edit(/.foundation/drafts/**)` rule. A v4 JSON draft still starts.
  function rapidStartTemplate() {
    return {
      save: "Write each file of minimalDraft (filled in) with the Write tool into the folder " +
        ".foundation/drafts/<id>/ (change.json with version 5, then proposal.md); that path " +
        "is pre-allowed and the tool creates the folder. Do not save it through the shell " +
        "(heredoc, cat >, echo >, mkdir chains): the host refuses those. Then run " +
        "cloop change start .foundation/drafts/<id>; when the request already " +
        "approved the spec, add --approve-spec --decision-ref <ref> and any --through stage " +
        "to that same call.",
      minimalDraft: minimalDraftFolderTemplate(),
      minimalDraftWorkType: "Set workType in change.json to every catalog type the change " +
        "is (feature, bugfix, api, ui, data, migration, …) and copy each type's block from " +
        "workTypeExamples into change.json; the type selects the required sections. Omitted, " +
        "it is guessed from paths and may miss them.",
      minimalDraftProse: "Write prose only under draftFolderV5's listed headings, in outline " +
        "order. why, summary, userStories, and successCriteria go in proposal.md as prose or " +
        "in change.json as fields, not both. The keys below are change.json's typed fields.",
      minimalDraftWriting: MINIMAL_DRAFT_WRITING,
      minimalDraftCapability: "Optionally add a top-level capability to the minimal draft: a " +
        "short noun phrase naming the living spec, such as kanban-board. Omitted, the draft " +
        "joins the matching existing capability or derives a short name from the intent.",
      minimalDraftDecisions: "Add decisions: [{ key, choice, reason? }] to the minimal draft " +
        "for every default you chose without asking the user (for example stack, storage, " +
        "framework); they are listed in the proposal as decided by the agent.",
      // Typed declarations are the only risk input; prose is never scanned, so
      // the template the agent copies from has to say when each one applies.
      minimalDraftRiskSignals: "Add riskSignals: [...] to the minimal draft for each that " +
        "applies: 'access-control' when some callers may act and others must be refused " +
        "(owner, role, admin, 401/403) and then tag at least one scenario access: \"allow\" " +
        "and one access: \"deny\"; 'financial' when money is charged, captured, refunded or " +
        "transferred, or a retry must not repeat it; 'performance-slo' when the request is to " +
        "make something faster or meet a latency/throughput target (prove it with a provider " +
        "using adapter 'benchmark'); 'persisted-data-change' for stored data or schema " +
        "changes; 'external-integration' for third-party calls; 'input-domain' only when " +
        "values from outside the program (an HTTP request, uploaded file, CLI argument or " +
        "message payload) must be validated or rejected, not for ordinary function arguments.",
      minimalDraftRiskCoverage: "Each declared risk signal needs one discovery.coverage row " +
        "per dimension it requires, in the same draft: {\"dimension\": \"<dimension>\", " +
        "\"status\": \"covered\", \"covers\": [\"<requirement key>\"]}, or \"status\": " +
        "\"not-applicable\" with a \"rationale\". Required dimensions: " +
        Object.entries(riskSignalDimensions())
          .map(([signal, dimensions]) => `${signal} → ${dimensions.join(", ")}`).join("; ") +
        `; fixes → ${FIXES_DIMENSIONS.join(", ")}.`,
      minimalDraftHotfix: "A bugfix with variant 'hotfix' needs bugfix.incident.link and at " +
        "least one scenario regressionOf: \"<that link>\" that reproduces the incident and " +
        "fails without the fix, in a requirement proven by an executable capability such as " +
        "the default \"test\".",
      minimalDraftFixes: "When the request reports a defect introduced by an earlier change " +
        "that is already archived under openspec/changes/archive/<date>-<id>, add fixes: " +
        "[\"<id>\"] to the minimal draft and cover the analogous boundaries, not only the " +
        "reported one: fixes requires an input-boundary coverage row whose requirement " +
        "has a scenario for each analogous boundary.",
      ...repositoryDraftGuidance(declaredRepositories()),
      ...semanticDraftTemplate(),
      // The field reference describes change.json, so it carries the v5 version.
      version: DRAFT_FOLDER_VERSION
    };
  }

  function complianceEnabled() {
    const path = join(root, "openspec", "config.yaml");
    return existsSync(path) && complianceEnabledFromConfig(readFileSync(path, "utf8"));
  }

  // The compliance change record is off unless openspec/config.yaml enables
  // it; then the draft's compliance block routes one owned action (or none).
  function complianceGate(source) {
    if (!source || !isSemanticVersion(source.version) || !complianceEnabled()) return null;
    return complianceAction(source.compliance, { enabled: true });
  }

  function inspectSemanticIntakeSource(source, {
    statePath, resume, quiet = false, validateCompiledDraft = true,
    excludedSourcePath = null, standardLane = false, extraIssues = [],
    regressionRequired = false
  }) {
    let previous = null;
    if (existsSync(statePath)) {
      try { previous = JSON.parse(readFileSync(statePath, "utf8")); }
      catch { previous = null; }
    }
    const sameDraft = previous?.draftDigest === semanticDraftDigest(source);
    const intelligence = repositoryIntelligence(source,
      excludedSourcePath ? [excludedSourcePath] : [], { standardLane });
    const sourceInspection = intelligenceUsable(intelligence)
      ? semanticSourceInspection(
        source, sameDraft ? previous?.sourceInventory : null, intelligence.selected)
      : inspectSemanticSources({
        projectRoot: root, sourcePaths: lessonsSourcePaths(),
        baseline: sameDraft ? previous?.sourceInventory : null
      });
    const intakeIssues = semanticIntakeIssues(source);
    const normalized = validateCompiledDraft
      ? normalizeSemanticDraft(source, slugify, {
        defaultRapidEvidence: true,
        requireScratch: true,
        requireUndo: true,
        repositories: declaredRepositories(),
        loadCanonicalSpec: (capability) => {
          const path = join(root, "openspec", "specs", slugify(capability), "spec.md");
          return existsSync(path) ? readFileSync(path, "utf8") : null;
        }
      })
      : { issues: [], draft: source };
    const additionalIssues = [
      ...normalized.issues.filter((issue) => !intakeIssues.includes(issue)),
      // Start rejects these after intake; report them in this same EDIT batch.
      ...(validateCompiledDraft
        ? startDraftChecks(normalized.draft, {
          structural: !normalized.issues.length, regressionRequired
        }).issues
        : []),
      ...semanticReferenceIssues(normalized.draft),
      ...extraIssues,
      ...(source.investigation !== undefined
        ? validateInvestigationBinding({ projectRoot: root, binding: source.investigation, git })
          .map((issue) => `investigation ${issue}`)
        : []),
      ...semanticQuestionQualityFindings(source, {
        sourceFacts: source.discovery?.sourceFacts || [],
        sourceInventory: sourceInspection.inventory
      }).map((finding) => `semantic decision ${finding.code}: ${finding.key || finding.path}`),
      ...(intelligence.repository.status === "blocked"
        ? intelligence.repository.findings.map((finding) =>
          `repository discovery ${finding.code}: ${finding.path || "(root)"}`)
        : []),
      ...sourceInspection.findings.map((finding) =>
        `semantic source ${finding.code}: ${finding.path || "(unknown)"}`)
    ];
    // The harness records the inventory digest itself. `discovery.sourceDigest`
    // is optional; freshness comes from comparing the selected sources against
    // the previous snapshot, so a correct first draft can reach DONE at once.
    // Compliance (opt-in per repository): agent repairs join this EDIT batch;
    // a missing approver is one user question asked after them.
    const compliance = complianceGate(source);
    if (compliance?.owner === "agent") additionalIssues.push(...compliance.issues);
    const action = semanticIntakeAction(source, {
      resume, additionalIssues,
      sourceFreshnessFindings: sourceInspection.staleFindings,
      frontierLimit: intelligence.depth.limits.frontierLimit,
      userQuestion: compliance?.owner === "user"
        ? { key: compliance.field, question: compliance.question, kind: "compliance-approver" }
        : null
    });
    // Stale sources return one EDIT; the snapshot then adopts the current
    // inventory so the re-inspect after the agent re-reads can reach DONE.
    // Retaining the old inventory made every re-inspect stale again.
    const retainedInventory = sourceInspection.inventory;
    const effectiveness = semanticIntakeEffectivenessSnapshot(source, {
      repository: {
        candidateFileCount: intelligence.repository.candidates?.length || 0,
        integrationCount: intelligence.repository.graph?.surfaces?.integrations?.length || 0,
        dependentCount: intelligence.repository.graph?.callers?.length || 0,
        persistenceBoundaryCount:
          intelligence.repository.graph?.surfaces?.persistence?.length || 0,
        permissionBoundaryCount:
          intelligence.repository.graph?.surfaces?.permissions?.length || 0
      },
      sourceFacts: source.discovery?.sourceFacts || [],
      sourceInventory: sourceInspection.inventory,
      history: previous?.effectiveness?.history
    });
    const state = reduceSemanticIntakeState(previous, {
      draft: source, action, resumeRoute: resume, sourceInventory: retainedInventory,
      effectiveness
    });
    writeJson(statePath, state);
    const result = {
      ...action,
      // Advisory: a known runner whose default output Prove cannot count.
      designWarnings: [...designBlueprintWarnings(source), ...verifyCountAdvisories(source.tasks),
        ...unknownTaskFieldWarnings(source)],
      intakeState: {
        path: relative(root, statePath),
        revision: state.revision,
        draftDigest: state.draftDigest,
        sourceDigest: state.sourceInventory?.digest || null
      },
      intelligence: {
        depth: state.effectiveness.depth,
        repository: {
          status: intelligence.repository.status,
          complete: intelligence.repository.complete,
          scan: intelligence.repository.scan,
          selectedSources: intelligence.selected,
          selectedBytes: intelligence.selectedBytes,
          findings: intelligence.repository.findings
        }
      },
      effectiveness: state.effectiveness
    };
    if (!quiet) console.log(JSON.stringify(result, null, 2));
    return result;
  }

  // A v5 folder's heading, order, placeholder, and change.json issues come
  // back as one agent-owned draft-repair EDIT with the resume route; nothing
  // is created. With a readable v4+ change.json they join intake's own issues.
  function startDraftSource(draftPath) {
    const folderIssues = [];
    const source = draftSource(draftPath, {}, { folderIssues, allowMissing: true });
    return { source, folderIssues };
  }

  function startResume(draftPath) {
    return `cloop change start ${draftPath} --inspect`;
  }

  function folderRepairAction(draftPath, folderIssues) {
    return semanticIntakeAction({ version: 5 }, {
      resume: startResume(draftPath), additionalIssues: folderIssues
    });
  }

  function inspectDraft(draftPath, options = {}) {
    const prepared = options.preparedSource
      ? { source: options.preparedSource, folderIssues: options.folderIssues || [] }
      : startDraftSource(draftPath);
    const { source, folderIssues } = prepared;
    // A retired v1-v3 draft (3.7.0 still accepted v3) must read as a draft
    // repair here, not as ready: start refuses it.
    const retired = source && typeof source === "object" && !isSemanticVersion(source.version)
      ? [retiredDraftIssue(source.version)] : [];
    if ((folderIssues.length || retired.length) && !isSemanticVersion(source?.version)) {
      const action = folderRepairAction(draftPath, [...folderIssues, ...retired]);
      if (!options.quiet) console.log(JSON.stringify(action, null, 2));
      return action;
    }
    return inspectSemanticIntakeSource(source, {
      statePath: semanticIntakeStatePath(draftPath),
      resume: startResume(draftPath),
      quiet: options.quiet,
      excludedSourcePath: relative(root, resolve(root, draftPath)).replaceAll("\\", "/"),
      extraIssues: folderIssues,
      // Every change created from now on carries the hotfix regression rule.
      regressionRequired: true
    });
  }

  function amendmentIntakeSource(amendment) {
    return {
      version: 4,
      intent: String(amendment.reason || "Amend the active agreement"),
      impact: amendment.impact || "low",
      coupling: amendment.coupling || "isolated",
      size: amendment.size,
      changeSize: amendment.changeSize,
      requirements: [...(amendment.addRequirements || []),
        ...(amendment.reviseRequirements || [])],
      integrations: amendment.integrations || [],
      externalOperations: amendment.externalOperations || [],
      securityTriggers: amendment.securityTriggers || [],
      riskSignals: amendment.riskSignals || [],
      discovery: amendment.discovery
    };
  }

  function amendmentRepositoryIssues(id, state, amendment) {
    const changeDir = activeChangePath(id, state);
    const tasksPath = join(changeDir, "tasks.md");
    const tasksContent = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "";
    return [
      ...amendmentTaskRepositoryIssues(amendment, tasksContent, {
        repositories: declaredRepositories(),
        selection: changeRepositorySelection(changeDir),
        exists: existsSync
      }),
      // An added task's derived repository order must not close a cycle.
      ...amendmentRepositoryOrderIssues(amendment, tasksContent, {
        repositories: declaredRepositories(),
        selection: changeRepositoryRows(changeDir) || undefined
      })
    ];
  }

  function inspectAmendment(id, amendmentPath, options = {}) {
    const active = loadRuntime(id);
    if (!isSemanticVersion(active.semanticDraftVersion))
      fail(`change amend --inspect requires a semantic-draft v4 or v5 change; '${id}' is version ${
        active.semanticDraftVersion || "legacy"}${isRecordedSemanticVersion(active.semanticDraftVersion)
        ? `; a v3 change has no amendment intake: apply it directly with cloop change amend ${id} ${amendmentPath}`
        : ""}`);
    const path = resolve(root, amendmentPath);
    if (!pathInside(root, path) || !existsSync(path))
      fail("change amend requires a JSON file inside the project");
    const amendment = options.preparedSource || readJson(path);
    // Build creates files in the workspace, so a verify path is checked there.
    const workspaceRoot = active.workspace?.path && existsSync(active.workspace.path)
      ? active.workspace.path : root;
    const tasksPath = join(activeChangePath(id, active), "tasks.md");
    const tasksContent = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "";
    const workTypes = changeWorkTypes(activeChangePath(id, active));
    return inspectSemanticIntakeSource(amendmentIntakeSource(amendment), {
      statePath: semanticIntakeStatePath(amendmentPath, `amend:${id}`),
      resume: `cloop change amend ${id} ${amendmentPath} --inspect`,
      quiet: options.quiet,
      validateCompiledDraft: false,
      excludedSourcePath: relative(root, path).replaceAll("\\", "/"),
      standardLane: active.schema === "foundation-standard",
      extraIssues: [...amendmentVerifyPathIssues(amendment, tasksContent,
        { exists: (candidate) => existsSync(join(workspaceRoot, candidate)) ||
          existsSync(join(root, candidate)) }),
      ...amendmentVerifyShapeIssues(amendment, tasksContent, { workTypes }),
      ...amendmentScenarioBindingIssues(amendment,
        { behaviorChanging: behaviorChangingTypes(workTypes) }),
      ...amendmentRepositoryIssues(id, active, amendment),
      ...investigationCoverageIssues(amendmentInvestigationSource(
        active.investigationAgreement || active.draftSource?.draft, amendment)),
      ...(amendment.investigation ? validateInvestigationBinding({
        projectRoot: root, binding: amendment.investigation, git }) : [])]
    });
  }

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

  // Set while atomic start or revise runs its create/resolve steps, which
  // print their own single `next` at the end.
  let atomicStepOutput = false;

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
    ].join(", ") || "none"}${surfaceLine}${ciLine}\n  schema: ${state.schema}${upgraded ? " (upgraded from foundation-rapid; design.md and specs/ added)" : ""}${atomicStepOutput ? "" : `\n  next: ${nextCommand(state.status, id, state)}`}`);
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
        if (approvalRoot !== root && !amended &&
            agreementIdentity(approvalRoot, id) !== agreementIdentity(root, id) &&
            (amendedSource || !repairWhitespaceDrift(root, approvalRoot, id))) {
          const restored = restoreDriftedAgreement(root, approvalRoot, id, Date.now(),
            amendedSource || undefined);
          if (restored) console.error(agreementRestoredNotice(id, restored));
          else {
            const drift = agreementDriftError(id, approvalRoot);
            fail(drift.message, 1, { owner: drift.owner, boundary: drift.boundary, code: drift.code });
          }
        }
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
        if (role === null) {
          // Approval without a role is the whole approval and covers every lane
          // required now; a lane added by a later revision is asked again.
          for (const lane of required) lanes[lane] = consent;
          current.specApproval = { required: true, ...consent,
            ...(required.length ? { lanes, requiredLanes: required } : {}) };
        } else {
          lanes[role] = consent;
          if (priorComplete) {
            // A lane recorded after the whole approval adds to it, never revokes it.
            current.specApproval = { ...prior, lanes, requiredLanes: required };
          } else {
            const complete = required.every((lane) => lanes[lane]);
            current.specApproval = complete
              ? { required: true, ...consent, decisionRef: required.map((lane) => lanes[lane].decisionRef).join(",") || decisionRef,
                lanes, requiredLanes: required }
              : { required: true, lanes, requiredLanes: required };
          }
        }
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
    const id = draftChangeId(draft, slugify);
    assertChangeAvailable(id);
    try {
      trapFailures(() => {
        measureStage("change.materialize", () => createChange(draft.intent, { rapid, id: draft.id || id }, draft, {
          availabilityChecked: true,
          deferSessionBinding: true
        }));
        atomicStepOutput = true;
        // Typed risk signals persist before resolve: its printed review route
        // read the state without them and called an input-domain change
        // "not required" even though Prove then ran a medium-tier review.
        persistRiskSignals(id, draft.riskSignals);
        let resolution;
        try { resolution = measureStage("change.resolve", () => resolveChange(id, resolutionFlags)); }
        finally { atomicStepOutput = false; }
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
        try { recordPrototypeSync(id); } catch { /* advisory */ }
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

  // Open questions travel with the approval packet, so the user answers them
  // in the same exchange instead of after an approval is refused.
  function openQuestionLines(questions) {
    return questions.length
      ? `  open questions (ask with the approval):\n${questions.map((question) =>
        `    - ${question}`).join("\n")}\n`
      : "";
  }

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

  function approvalPacketRootFor(state, id) {
    return state.workspace?.path &&
      existsSync(join(state.workspace.path, "openspec", "changes", id))
      ? state.workspace.path : root;
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

  // The draft a packet was compiled from, bound to the contract revision it
  // produced: an amendment or grounding reopen afterwards changes the
  // agreement without it, so a partial revision would silently drop that.
  function compiledDraftSource(state, draft) {
    return { contractRevision: Number(state.contractRevision || 0), draft: declaredDraftRisk(draft) };
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
        atomicStepOutput = true;
        let resolution;
        try { resolution = resolveChange(id, resolutionFlags); }
        finally { atomicStepOutput = false; }
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
    try { recordPrototypeSync(id); } catch { /* advisory */ }
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

  // Claims whose command evidence already passed and is still valid: the task
  // verify commands those receipts ran are finished work, not open drafts.
  function provenCommandClaimIds(id) {
    return [...new Set(requiredProviders(id).flatMap((provider) => {
      if (!["command", "test-discovery"].includes(providerConfig(id, provider)?.adapter)) return [];
      const path = receiptPath(id, provider);
      if (!existsSync(path)) return [];
      let receipt = null;
      try { receipt = readJson(path); } catch { return []; }
      if (receipt?.status !== "pass" || receiptValidity(id, provider).validity !== "valid") return [];
      return claimsForProvider(id, provider).map((claim) => claim.id);
    }))];
  }

  function amendChangeUnlocked(id, amendmentPath, options, state, expectedRevision) {
    if (!isRecordedSemanticVersion(state.semanticDraftVersion))
      fail(`change amend requires a semantic-draft change; '${id}' is not one`);
    if (["applied", "archived"].includes(state.status))
      fail(`change amend cannot rewrite an agreement in '${state.status}' status; start a successor change`);
    if (state.land?.status || state.workspace?.applied)
      fail("change amend cannot rewrite an agreement after Land has started; recover Land before starting a successor change");
    const source = resolve(root, amendmentPath);
    if (!pathInside(root, source) || !existsSync(source))
      fail("change amend requires a JSON file inside the project");
    const amendment = readJson(source);
    if (amendment.investigation) {
      const bindingIssues = validateInvestigationBinding({ projectRoot: root, binding: amendment.investigation, git });
      if (bindingIssues.length) fail(`investigation amendment binding failed:\n  - ${bindingIssues.join("\n  - ")}`);
    }
    const amendmentStatePath = semanticIntakeStatePath(amendmentPath, `amend:${id}`);
    let completedAmendmentIntakeEffectiveness = null;
    // A verify-only correction changes no requirement, so it has no semantic
    // intake to complete.
    // A sections-only amendment rewrites prose and no requirement either.
    const sectionsOnly = sectionsOnlyAmendment(amendment);
    if (isSemanticVersion(state.semanticDraftVersion) && !taskContractOnlyAmendment(amendment) &&
        !sectionsOnly) {
      const resume = `cloop change amend ${id} ${amendmentPath} --inspect`;
      let intakeState = null;
      if (existsSync(amendmentStatePath)) {
        try { intakeState = JSON.parse(readFileSync(amendmentStatePath, "utf8")); }
        catch { intakeState = null; }
      }
      const intakeSource = amendmentIntakeSource(amendment);
      const amendmentRelativePath = relative(root, source).replaceAll("\\", "/");
      const intelligence = repositoryIntelligence(intakeSource, [amendmentRelativePath],
        { standardLane: state.schema === "foundation-standard" });
      const sourceInspection = intelligenceUsable(intelligence)
        ? semanticSourceInspection(intakeSource, null, intelligence.selected)
        : inspectSemanticSources({ projectRoot: root, sourcePaths: lessonsSourcePaths() });
      const projection = semanticIntakeResumeProjection(intakeState, intakeSource, {
        resumeRoute: resume, sourceInventory: sourceInspection.inventory
      });
      if (!intelligenceUsable(intelligence) || sourceInspection.findings.length ||
          projection.status !== "current" || projection.action?.action !== "DONE") {
        // One call: inspect in place. DONE amends; any other action is printed
        // as `--inspect` would and the agreement is left untouched.
        const inspected = inspectAmendment(id, amendmentPath,
          { quiet: true, preparedSource: amendment });
        if (inspected.action !== "DONE") {
          console.log(JSON.stringify(inspected, null, 2));
          return inspected;
        }
        completedAmendmentIntakeEffectiveness = inspected.effectiveness || null;
      } else completedAmendmentIntakeEffectiveness = intakeState?.effectiveness || null;
    }
    const basePath = activeChangePath(id, state);
    // A task-contract amendment skips intake, so its repository binding is
    // checked here; an intake amendment was checked by its inspection.
    if (taskContractOnlyAmendment(amendment)) {
      const repositoryIssues = amendmentRepositoryIssues(id, state, amendment);
      if (repositoryIssues.length)
        fail(`semantic amendment validation failed:\n  - ${repositoryIssues.join("\n  - ")}`);
    }
    const contract = readJson(join(basePath, "evidence.yaml"));
    const tasksContent = readFileSync(join(basePath, "tasks.md"), "utf8");
    const compiled = compileSemanticAmendment({
      amendment, contract, tasksContent, slugify, renderTask: renderDraftTask,
      investigationSource: state.investigationAgreement || state.draftSource?.draft,
      semanticDraftVersion: state.semanticDraftVersion,
      provenClaimIds: (amendment?.updateTasks || []).some((task) =>
        task && ["verify", "paths", "dependsOn"].some((field) => Object.hasOwn(task, field))) ||
        (Array.isArray(amendment?.removeTasks) && amendment.removeTasks.length)
        ? provenCommandClaimIds(id) : [],
      retiredTaskIds: (state.amendments || []).flatMap((row) =>
        (row?.removedTasks || []).map((task) => task?.id).filter(Boolean)),
      repositories: declaredRepositories(),
      repositorySelection: changeRepositoryRows(basePath),
      loadCanonicalSpec: (capability) => {
        const path = join(root, "openspec", "specs", slugify(capability), "spec.md");
        return existsSync(path) ? readFileSync(path, "utf8") : null;
      }
    });
    if (compiled.issues.length)
      fail(`semantic amendment validation failed:\n  - ${compiled.issues.join("\n  - ")}`);
    const coverageChanges = amendmentCoverageChanges(compiled);
    const configuredProviderNames = requiredProviders(id);
    const providerEntries = new Map(Object.entries(compiled.providers || {}));
    for (const name of configuredProviderNames) {
      if (providerEntries.has(name)) continue;
      const config = providerConfig(id, name);
      if (config) providerEntries.set(name, config);
    }
    const providers = Object.fromEntries([...providerEntries].map(([name, config]) => [name, {
        capability: config.capability || name,
        ...(Array.isArray(config.claims) ? { claims: config.claims.filter((claim) =>
          !compiled.removedClaimIds.includes(claim)) } : {}),
        ...(Array.isArray(config.dependsOn) ? { dependsOn: config.dependsOn } : {})
      }]
    ));
    const invalidation = sectionsOnly ? documentSectionInvalidation(providers) : planAmendmentInvalidation({
      claims: compiled.claims,
      tasks: taskBlocks(compiled.tasksContent).map(taskMetadata),
      providers,
      coverageDelta: {
        addedClaimIds: compiled.addedClaimIds,
        changedClaimIds: compiled.changedClaimIds,
        removedClaimIds: compiled.removedClaimIds,
        coverageChanges
      },
      priorClaims: compiled.priorClaims
    });
    if (invalidation.status !== "READY")
      fail(`semantic amendment invalidation planning failed:\n  - ${
        invalidation.findings.map((finding) => `${finding.code}: ${finding.message}`).join("\n  - ")}`);
    compiled.invalidation = invalidation;

    const priorContractRevision = Number(state.contractRevision || 0);
    const priorContractFingerprint = contractFingerprint(id);
    const proofAdvancePath = join(root, ".foundation", "evidence", id, "proof-advance.json");
    const priorProofAdvance = existsSync(proofAdvancePath)
      ? readFileSync(proofAdvancePath, "utf8") : null;
    const receiptBackups = new Map();
    const receiptBindings = [];
    if (existsSync(dirname(receiptPath(id, "__provider__")))) {
      for (const provider of invalidation.proof.preserveReceipts) {
        const path = receiptPath(id, provider);
        if (!existsSync(path)) continue;
        const receipt = readJson(path);
        receiptBackups.set(provider, receipt);
        const binding = selectiveBinding(id, provider, priorContractRevision, receipt);
        if (binding) receiptBindings.push(binding);
      }
    }

    const transactionRoot = mkdtempSync(join(dirname(basePath), `.${id}-amend-`));
    const stagedPath = join(transactionRoot, "next");
    const priorPath = join(transactionRoot, "prior");
    cpSync(basePath, stagedPath, { recursive: true, errorOnExist: true });
    // The amendment history line carries the contract revision it produces.
    try {
      writeSemanticAmendment(stagedPath, compiled, slugify,
        { schema: state.schema, revision: priorContractRevision + 1 });
    }
    catch (error) {
      rmSync(transactionRoot, { recursive: true, force: true });
      fail(`${error?.message || error}; semantic amendment rolled back`);
    }
    const priorState = structuredClone(state);
    const rebindAuditPaths = [];
    const rebindAudits = [];
    let installed = false;
    try {
      assertAmendmentRevision(id, expectedRevision);
      renameSync(basePath, priorPath);
      renameSync(stagedPath, basePath);
      installed = true;
      validate(id, "active");
      assertAmendmentRevision(id, expectedRevision);
      const currentContractRevision = priorContractRevision + 1;
      const currentRequiredProviders = requiredProviders(id);
      const currentBindings = invalidation.proof.preserveReceipts
        .map((provider) => selectiveBinding(id, provider, currentContractRevision))
        .filter(Boolean);
      let proofRecovery = planSelectiveProofRecovery({
        changeId: id,
        invalidation,
        requiredProviders: currentRequiredProviders,
        receiptBindings,
        currentBindings,
        priorContractRevision,
        currentContractRevision
      });
      compiled.invalidation.proofRecovery = proofRecovery;
      if (proofRecovery.status === "READY") {
        const nextFingerprint = contractFingerprint(id);
        for (const provider of proofRecovery.providers.preserved) {
          const priorReceipt = receiptBackups.get(provider);
          if (!priorReceipt) throw new Error(`selective proof receipt '${provider}' disappeared`);
          // A task-only amendment leaves the contract as it was: a receipt
          // already bound to it needs no rebind, and one that is not is rerun.
          if (nextFingerprint === priorContractFingerprint) {
            if (priorReceipt.contractFingerprint !== nextFingerprint)
              compiled.invalidation.proofRecovery = proofRecovery = demoteSelectivePreservation(
                proofRecovery, provider, "RECEIPT_STALE_FOR_UNCHANGED_CONTRACT");
            continue;
          }
          const rebound = rebindSelectiveProofReceipt({
            receipt: priorReceipt,
            provider,
            plan: proofRecovery,
            fromContractFingerprint: priorContractFingerprint,
            toContractFingerprint: nextFingerprint,
            reboundAt: now()
          });
          writeJson(receiptPath(id, provider), rebound);
          if (receiptValidity(id, provider).validity !== "valid")
            throw new Error(`selective proof receipt '${provider}' failed post-rebind validation`);
          const audit = {
            version: 1,
            kind: "semantic-amendment-receipt-rebind",
            changeId: id,
            provider,
            recordedAt: rebound.contractRebind.reboundAt,
            contract: proofRecovery.contract,
            decision: proofRecovery.decisions.find((row) => row.provider === provider),
            priorReceiptDigest: stableHash(priorReceipt),
            reboundReceiptDigest: stableHash(rebound)
          };
          const auditDirectory = join(root, ".foundation", "evidence", id, "receipt-rebinds");
          mkdirSync(auditDirectory, { recursive: true });
          const providerKey = createHash("sha256").update(provider).digest("hex").slice(0, 12);
          const auditPath = join(auditDirectory,
            `${currentContractRevision}-${providerKey}-${stableHash(audit).slice(0, 12)}.json`);
          writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, {
            encoding: "utf8", flag: "wx"
          });
          rebindAuditPaths.push(auditPath);
          rebindAudits.push({
            provider,
            path: relative(root, auditPath).replaceAll("\\", "/"),
            digest: stableHash(audit)
          });
        }
      }
      const nextState = loadRuntime(id);
      if (compiled.investigationAgreement) nextState.investigationAgreement = compiled.investigationAgreement;
      nextState.revision = Number(nextState.revision || 0) + 1;
      nextState.contractRevision = Number(nextState.contractRevision || 0) + 1;
      nextState.executionRevision = Number(nextState.executionRevision || 0) + 1;
      // The amended packet lives only in the isolated workspace until Land.
      // Its identity and a snapshot are kept so later gates recognise it as
      // the agreement, whatever bookkeeping moves the revision afterwards.
      const amendedWorkspace = nextState.workspace?.path &&
        pathInside(nextState.workspace.path, basePath) ? nextState.workspace.path : null;
      const amendedPacket = amendedWorkspace
        ? snapshotAmendedPacket(root, amendedWorkspace, id, nextState.contractRevision)
        : { identity: packetIdentity(basePath) };
      nextState.amendments = [...(nextState.amendments || []), amendmentHistoryRow({
        revision: nextState.contractRevision, amendedPacket, amendment, compiled, invalidation,
        proofRecovery, rebindAudits, intakeEffectiveness: completedAmendmentIntakeEffectiveness,
        appliedAt: now()
      })];
      const amendmentDelta = {
        added: compiled.addedRequirementKeys,
        revised: compiled.revisedRequirementKeys,
        removed: compiled.removedRequirementKeys
      };
      const requirementDelta = Object.values(amendmentDelta).some((keys) => keys.length);
      // Merge the amendment's risk signals before carrying consent: approval
      // lanes are routed from them, and a new signal can require a new lane.
      const amendedSignals = riskSignalValues([
        ...(priorState.riskSignals || []), ...(amendment.riskSignals || [])]);
      if (amendedSignals.length) nextState.riskSignals = amendedSignals;
      if (!carrySpecApproval(priorState, nextState, id, amendmentDelta,
        `semantic-amendment: ${String(amendment.reason || "Agreement expanded during Build")}`) &&
          (requirementDelta || nextState.pendingApprovalDelta))
        recordApprovalDelta(nextState, amendmentDelta);
      if (nextState.requirementFingerprints) {
        const fingerprints = { ...nextState.requirementFingerprints,
          ...draftRequirementFingerprints({
            requirements: [...(amendment.addRequirements || []),
              ...(amendment.reviseRequirements || [])],
            evidence: amendment.evidence
          }) };
        for (const key of compiled.removedRequirementKeys) delete fingerprints[key];
        nextState.requirementFingerprints = fingerprints;
      }
      // Prove judges per bound file only through this binding, so an amendment
      // that adds a scenario or a test path must update it.
      if (priorState.scenarioTestBinding?.rows)
        nextState.scenarioTestBinding = bindingRecord(amendedScenarioTestBinding(
          priorState.scenarioTestBinding.rows, {
            draft: compiled.bindingDraft, testMap: amendment.testMap,
            ledgerTasks: taskBlocks(compiled.tasksContent).map(taskMetadata),
            retiredClaimIds: [...compiled.removedClaimIds, ...compiled.changedClaimIds]
          }));
      // A proven candidate is still amendable until Land begins. Re-enter
      // Build so advance dispatches added tasks and re-finalizes this revision;
      // the prior proof and Land grant cannot authorize the amended packet.
      if (priorState.status === "proven")
        transitionLifecycleState(nextState, "building", "proven-agreement-amended");
      saveRuntime(nextState);
      // A prior proof-advance checkpoint describes the old contract. Even when
      // every executable receipt is preserved, the coordinator must re-enter
      // Prove and finalize the amended packet instead of accepting that stale
      // READY projection as if it covered the new revision.
      rmSync(proofAdvancePath, { force: true });
      rmSync(priorPath, { recursive: true, force: true });
    } catch (error) {
      if (installed && existsSync(basePath))
        rmSync(basePath, { recursive: true, force: true });
      if (existsSync(priorPath)) renameSync(priorPath, basePath);
      for (const [provider, receipt] of receiptBackups)
        writeJson(receiptPath(id, provider), receipt);
      for (const path of rebindAuditPaths) rmSync(path, { force: true });
      if (priorProofAdvance !== null) {
        mkdirSync(dirname(proofAdvancePath), { recursive: true });
        writeFileSync(proofAdvancePath, priorProofAdvance);
      }
      if (installed) saveRuntime(priorState);
      fail(`${error?.message || error}; semantic amendment rolled back`);
    } finally {
      rmSync(transactionRoot, { recursive: true, force: true });
    }
    if (options.consumeAmendment) {
      try { rmSync(source); }
      catch (error) {
        console.error(`WARNING: amendment succeeded but could not remove '${
          relative(root, source)}': ${error.message}`);
      }
    }
    try { rmSync(amendmentStatePath, { force: true }); }
    catch (error) {
      console.error(`WARNING: amendment succeeded but could not remove semantic intake state: ${
        error.message}`);
    }
    const amended = loadRuntime(id);
    const gate = decisionGateNotice(id);
    try { recordPrototypeSync(id); } catch { /* advisory */ }
    console.log(amendedReport(id, amended, compiled, gate));
    return compiled;
  }

  function amendChange(id, amendmentPath, options = {}) {
    const state = loadRuntime(id);
    const observedRevision = amendmentRevision(state);
    return withAmendmentLock(id, observedRevision,
      () => amendChangeUnlocked(id, amendmentPath, options, state, observedRevision));
  }

  return {
    templateDir,
    instantiate,
    loadDraft,
    materializeDraft,
    createChange,
    rapidStartTemplate,
    amendmentTemplate: semanticAmendmentTemplate,
    inspectDraft,
    inspectAmendment,
    startAtomic,
    inspectRevision,
    reviseChange,
    amendChange,
    resolveChange,
    openQuestionsDecision
  };
}
