import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { acquireProcessLock } from "../../core/process-lock.mjs";
import { requireDeps } from "../../core/required-deps.mjs";
import { projectResource } from '../../core/project-installation.mjs';
import { loadDraftFolder } from "../draft/draft-folder.mjs";
import { normalizeSemanticDraft, renderRequirementMarkdown } from "../draft/semantic-draft.mjs";
import { expandMinimalSemanticDraft } from "../draft/semantic-draft-minimal.mjs";
import { unknownTaskFieldWarnings } from "../draft/semantic-draft-tasks.mjs";
import { isSemanticVersion } from "../validation/draft-version.mjs";
import { semanticIntakeAction, semanticIntakeIssues } from "../validation/semantic-intake.mjs";
import { prototypeSelectionIssues } from "../prototype/prototype-binding.mjs";
import { inspectSemanticSources } from "../validation/semantic-source-inventory.mjs";
import {
  PROJECT_LESSONS_PATH, inspectRepositoryIntelligence, repositoryIntelligenceRequired,
  skippedRepositoryIntelligence
} from "../validation/repository-intelligence.mjs";
import {
  planSemanticIntakeDepth,
  semanticIntakeEffectivenessSnapshot,
  semanticQuestionQualityFindings
} from "../validation/semantic-intake-intelligence.mjs";
import { reduceSemanticIntakeState, semanticDraftDigest } from "../draft/semantic-intake-state.mjs";
import { semanticAmendmentTemplate } from "../draft/amendment-tasks.mjs";
import { validateInvestigationBinding } from "../investigation/investigation-runtime.mjs";
import {
  designBlueprintWarnings, verifyCountAdvisories
} from "../validation/design-blueprints.mjs";
import { complianceAction, complianceEnabledFromConfig } from "../validation/process-fields.mjs";
import { withDerivedRisk } from "../validation/draft-risk.mjs";
import {
  priorChangeResidue, retiredDraftIssue, settleAbandonedReviewResidue
} from "./change-start-values.mjs";
import { createChangeMaterializer } from "./change-materialize.mjs";
import { createChangeResolution } from "./change-resolution.mjs";
import { createChangeRevision } from "./change-revision.mjs";
import { createChangeStart } from "./change-start.mjs";
import { createChangeAmendment } from "./change-amendment.mjs";
// Moved to change-start-values.mjs; re-exported so importers are unchanged.
export {
  apiContractErrorIssues, atomicStartPreflight, documentSectionInvalidation,
  draftRequirementFingerprints, initialChangeState, materializeChangeTemplates,
  mergeApprovalDelta, pathRiskNoteLine, priorChangeResidue, requirementDelta,
  requirementFingerprints, retiredDraftIssue, riskSignalValues, scratchNoteLine,
  sectionsOnlyAmendment, settleAbandonedReviewResidue, v5QualityGrounding
} from "./change-start-values.mjs";
// Moved to amendment-record.mjs; re-exported so importers are unchanged.
export { formatApprovalDelta, formatInvalidatedWaivers, invalidatedWaivers } from "./amendment-record.mjs";
// Packet rendering moved to draft-packet-render.mjs; re-exported so importers are unchanged.
export {
  approvalPackageLine, draftBullets, draftChangeId, draftDomainRows, draftNeedsDesign, groupDraftSpecs,
  materializeDraftSpecs, proposalOpenQuestions, proposedDecision, renderDecisionOption, renderDraftDecisions,
  renderDraftDesign, renderDraftProposal, renderDraftSpecDocument, renderDraftTask, renderDraftTasks,
  renderProposedDecisions, renderRapidDecisions, repositoryDraftGuidance, reviewRouteLabel,
  semanticDraftKeepsDesign, synchronizeProposalClassification
} from "../draft/draft-packet-render.mjs";

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
  // A Git root sees a declared nested repository as a gitlink or, when it
  // ignores the folder, not at all; its files join the scan the same way.
  function repositoryGitPaths(source = {}, seeds = []) {
    const rootPaths = gitVisiblePaths(root);
    if (rootPaths) {
      const nested = declaredRepositoryGitPaths(source);
      if (!nested.includedPaths.length) return rootPaths;
      return {
        trackedPaths: [...new Set([...rootPaths.trackedPaths, ...nested.trackedPaths])],
        includedPaths: [...new Set([...rootPaths.includedPaths, ...nested.includedPaths])]
      };
    }
    const { trackedPaths, includedPaths } = declaredRepositoryGitPaths(source);
    if (!includedPaths.length) return { includedPaths: null, trackedPaths: [] };
    for (const seed of [...seeds, ...lessonsSourcePaths()])
      if (existsSync(join(root, seed))) includedPaths.push(seed);
    return { trackedPaths, includedPaths: [...new Set(includedPaths)] };
  }

  // The Git-visible files of each declared repository (narrowed to the
  // draft's selection), prefixed with its path below the root.
  function declaredRepositoryGitPaths(source = {}) {
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
    return { trackedPaths, includedPaths };
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

  // Set while atomic start or revise runs its create/resolve steps, which
  // print their own single `next` at the end.
  // Shared by resolve, start, and revise: set while an atomic step prints its own next line.
  const atomicStep = { output: false };

  function approvalPacketRootFor(state, id) {
    return state.workspace?.path &&
      existsSync(join(state.workspace.path, "openspec", "changes", id))
      ? state.workspace.path : root;
  }

  // Commands live in focused modules by phase (change-materialize, -resolution,
  // -start, -revision, -amendment); this factory owns shared helpers and wiring.
  const {
    createChange, designWarningLines, materializeDraft, materializeStandardArtifacts,
    packetFileLines, rapidStartTemplate
  } = createChangeMaterializer({
    assertChangeAvailable, bindClaudeSession, canonicalSpecText, changePath,
    declaredRepositories, fail, gitHead, initialBudget, instantiate, loadRuntime, now,
    preexistingDirty, readJson, renderDraftRequirement, root, saveRuntime,
    setOperationChangeId, slugify, templateDir, workflowPolicy, writeJson
  });

  const {
    designOpenQuestions, openQuestionsDecision, resolveChange
  } = createChangeResolution({
    approvalLanes, atomicStep, changePath, fail, loadRuntime,
    materializeStandardArtifacts, now, preexistingDirty, root, saveRuntime,
    securityTerms, validate, workflowPolicy, approvalPacketRootFor
  });

  const {
    completedDraftIntake, persistFixes, persistRiskSignals, preflightDraft, startAtomic,
    startDraftChecks
  } = createChangeStart({
    approvalPackageLink, assertChangeAvailable, atomicStep, bindClaudeSession,
    complianceGate, createChange, declaredRepositories, designOpenQuestions,
    designWarningLines, domainLanguageIssues, fail, git, inspectDraft,
    intelligenceUsable, lessonsSourcePaths, loadDraft, loadRuntime, materializeDraft,
    measureStage, packetFileLines, recordPrototypeSync, repositoryIntelligence,
    resolveChange, rollbackStart, root, saveRuntime, semanticIntakeStatePath,
    semanticSourceInspection, slugify, startDraftSource, startResume, trapFailures,
    validate, workflowPolicy
  });

  const {
    carrySpecApproval, inspectRevision, recordApprovalDelta, reviseChange
  } = createChangeRevision({
    amendmentRevision, approvalLanes, approvalPacketRootFor, assertAmendmentRevision, atomicStep,
    bindClaudeSession, changePath, completedDraftIntake, createChange,
    designOpenQuestions, designWarningLines, draftSource, fail,
    inspectSemanticIntakeSource, loadRuntime, materializeDraft, minimalDraftContext, now,
    packetFileLines, pathInside, persistFixes, persistRiskSignals, preflightDraft,
    readJson, recordPrototypeSync, resolveChange, root, saveRuntime,
    semanticIntakeStatePath, setOperationChangeId, slugify, trapFailures, validate,
    withAmendmentLock
  });

  const {
    amendChange, inspectAmendment
  } = createChangeAmendment({
    activeChangePath, amendmentRevision, assertAmendmentRevision, carrySpecApproval,
    changeRepositoryRows, changeRepositorySelection, claimsForProvider,
    contractFingerprint, decisionGateNotice, declaredRepositories, fail, git,
    inspectSemanticIntakeSource, intelligenceUsable, lessonsSourcePaths, loadRuntime,
    now, pathInside, providerConfig, readJson, receiptPath, receiptValidity,
    recordApprovalDelta, recordPrototypeSync, repositoryIntelligence, requiredProviders,
    root, saveRuntime, selectiveBinding, semanticIntakeStatePath,
    semanticSourceInspection, slugify, stableHash, validate, withAmendmentLock,
    writeJson
  });

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
