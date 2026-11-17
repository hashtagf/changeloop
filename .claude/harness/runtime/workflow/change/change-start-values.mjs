import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { foundationChangeStores, retiredChangeStores } from "./retired-change-stores.mjs";
import { isSemanticVersion } from "../validation/draft-version.mjs";
import { riskSignalDimensions } from "../validation/semantic-intake.mjs";
import { inferPathSignals } from "../../contracts/scratch-router.mjs";
import { groundingFromQuality } from "../validation/quality-fields.mjs";
import { declaredDraftRisk } from "../validation/draft-risk.mjs";

// Open questions travel with the approval packet, so the user answers them
// in the same exchange instead of after an approval is refused.
export function openQuestionLines(questions) {
  return questions.length
    ? `  open questions (ask with the approval):\n${questions.map((question) =>
      `    - ${question}`).join("\n")}\n`
    : "";
}

// The draft a packet was compiled from, bound to the contract revision it
// produced: an amendment or grounding reopen afterwards changes the
// agreement without it, so a partial revision would silently drop that.
export function compiledDraftSource(state, draft) {
  return { contractRevision: Number(state.contractRevision || 0), draft: declaredDraftRisk(draft) };
}

// Marks a start whose re-inspected intake is not DONE (see completedDraftIntake).
export const INCOMPLETE_INTAKE = Symbol("incomplete-intake");

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
