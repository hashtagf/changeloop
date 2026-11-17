import { NFR_CATEGORY_CAPABILITIES } from "../validation/quality-fields.mjs";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { taskMetadata } from "../../contracts/change-artifacts.mjs";
import {
  CRITICAL_CASE_ORACLES, GROUNDING_READ_ROLES, groundingInteractionRequirements,
  groundingMissingReadSourceRecovery, groundingPathRowShapeIssue,
  groundingTaskOverlapFindings, hasObservableSecurityControl,
  plannedGroundingPathEligible, plannedGroundingPathRecovery
} from "./grounding-scope.mjs";
import { failValidationLayer, semanticInvariantIssues } from "./semantic-invariants.mjs";

export function createGroundingValidation(ctx) {
  const {
    captureValidationGroup, evidence, fail, failCollectedValidation, fileDigest, now,
    pathInside, providerCapability, rawExecution, reviewPolicy, stableHash,
    validationRepositories, walk
  } = ctx;

  function readGroundingDocument(id, state, dir) {
    let value;
    try {
      value = JSON.parse(readFileSync(join(dir, "grounding.yaml"), "utf8"));
    } catch {
      fail(`${id}/grounding.yaml must be JSON-compatible YAML`);
    }
    if (![2, 3].includes(value.version))
      fail(`${id}/grounding.yaml requires version 2 or 3`);
    if (Number(state.groundingVersion || 1) >= 2 &&
        value.version !== Number(state.groundingVersion))
      fail(`${id}/grounding.yaml requires version ${state.groundingVersion} for this change`);
    const digest = stableHash(value);
    if (state.groundingDigest && state.groundingDigest !== digest)
      fail(`${id}/grounding.yaml changed after its decision batch was locked; ` +
        `use change resolve ${id} --reopen-grounding --decision-ref <ref> ` +
        "--reopen-reason <reason> for one batched revision, or retire and replace the change");
    return { value, digest, firstLock: !state.groundingDigest };
  }

  function validateGroundingDecision(id, decision) {
    const issues = [];
    if (decision.status !== "locked")
      issues.push(`${id}/grounding.yaml decisionBatch.status must be locked`);
    if (!["prd", "backlog", "user-batch", "recommended-default", "mixed"].includes(decision.source))
      issues.push(`${id}/grounding.yaml decisionBatch.source must be prd|backlog|user-batch|recommended-default|mixed`);
    if (!String(decision.reference || "").trim())
      issues.push(`${id}/grounding.yaml decisionBatch.reference is required`);
    if (!["single-batch", "no-material-questions"].includes(decision.mode))
      issues.push(`${id}/grounding.yaml decisionBatch.mode must be single-batch|no-material-questions`);
    if (!Number.isFinite(Date.parse(String(decision.lockedAt || ""))))
      issues.push(`${id}/grounding.yaml decisionBatch.lockedAt must be an ISO-8601 timestamp`);
    if (!Array.isArray(decision.decisions) || decision.decisions.length === 0)
      issues.push(`${id}/grounding.yaml decisionBatch.decisions must record every locked choice/default`);
    const ids = new Set();
    for (const [index, row] of (Array.isArray(decision.decisions) ? decision.decisions : []).entries()) {
      const label = `${id}/grounding.yaml decisionBatch.decisions[${index}]`;
      if (!["prd", "backlog", "user-batch", "recommended-default"].includes(row.source))
        issues.push(`${label}.source must be prd|backlog|user-batch|recommended-default`);
      for (const field of ["id", "question", "answer"])
        if (!String(row[field] || "").trim()) issues.push(`${label}.${field} is required`);
      if (ids.has(row.id)) issues.push(`${label}.id is duplicated`);
      ids.add(row.id);
    }
    failValidationLayer(fail, "grounding decision", issues);
    return ids;
  }

  function validateGroundingV3(id, value) {
    const issues = [];
    if (!Array.isArray(value.decisions) || value.decisions.length === 0)
      issues.push(`${id}/grounding.yaml decisions must contain each non-derived material decision`);
    const ids = new Set();
    for (const [index, decision] of (value.decisions || []).entries()) {
      const label = `${id}/grounding.yaml decisions[${index}]`;
      for (const field of ["id", "choice", "reason"])
        if (!String(decision?.[field] || "").trim()) issues.push(`${label}.${field} is required`);
      if (ids.has(decision?.id)) issues.push(`${label}.id is duplicated`);
      ids.add(decision?.id);
      if (decision?.derivedAt || decision?.digest || decision?.readSet || decision?.productionPath)
        issues.push(`${label} contains derived runtime data; grounding v3 stores decisions only`);
    }
    failValidationLayer(fail, "grounding v3 decision", issues);
  }

  function validateGroundingSemanticInvariants(id, state, dir, value, decisionIds) {
    if (!state.semanticInvariantsRequired) return;
    const specScenarios = new Set();
    walk(join(dir, "specs"), (path) => {
      if (!path.endsWith(".md")) return;
      const content = readFileSync(path, "utf8");
      for (const match of content.matchAll(/^#### Scenario:\s*(.+?)\s*$/gm))
        specScenarios.add(match[1].trim());
    });
    failValidationLayer(fail, "semantic invariant", semanticInvariantIssues(
      value.semanticInvariants, evidence(id, dir), decisionIds, specScenarios,
      { required: true }));
  }

  function validateConditionalGroundingSection(id, name, row, listName) {
    const label = `${id}/grounding.yaml ${name}`;
    if (!["applicable", "not-applicable"].includes(row?.status))
      fail(`${label}.status must be applicable|not-applicable`);
    if (!String(row?.sourceReason || "").trim())
      fail(`${label}.sourceReason is required even when the section is N/A`);
    if (!Array.isArray(row?.[listName])) fail(`${label}.${listName} must be an array`);
    if (row.status === "applicable" && row[listName].length === 0)
      fail(`${label}.${listName} must be non-empty when applicable`);
  }

  function groundingV2Context(id, state, dir, value) {
    const risk = value.risk || {};
    if (!["low", "medium", "high"].includes(risk.tier))
      fail(`${id}/grounding.yaml risk.tier must be low|medium|high`);
    if (!Array.isArray(risk.classes) || risk.classes.length === 0 ||
        risk.classes.some((entry) => !String(entry || "").trim()))
      fail(`${id}/grounding.yaml risk.classes must be a non-empty string array`);
    if (!String(risk.rationale || "").trim())
      fail(`${id}/grounding.yaml risk.rationale is required`);
    const contract = evidence(id, dir);
    const routedTier = reviewPolicy(id, state, contract).tier;
    const rank = { low: 0, medium: 1, high: 2 };
    if (rank[risk.tier] < rank[routedTier])
      fail(`${id}/grounding.yaml risk.tier '${risk.tier}' understates the deterministic review tier '${routedTier}'`);
    validateConditionalGroundingSection(id, "productionEntry", value.productionEntry, "paths");
    validateConditionalGroundingSection(id, "realWire", value.realWire, "contracts");
    validateConditionalGroundingSection(
      id, "activationSemantics", value.activationSemantics, "activatedPaths");
    if (!Array.isArray(value.activationSemantics?.failureSemanticChanges))
      fail(`${id}/grounding.yaml activationSemantics.failureSemanticChanges must be an array`);
    validateConditionalGroundingSection(
      id, "serviceInteractions", value.serviceInteractions, "rows");
    validateConditionalGroundingSection(id, "observability", value.observability, "rows");
    const capabilities = new Set(contract.claims
      .flatMap((claim) => claim.capabilities || []));
    const riskClasses = new Set(risk.classes
      .map((entry) => String(entry).toLowerCase()));
    const semantics = `${state.intent || ""} ${[...riskClasses].join(" ")}`.toLowerCase();
    const selected = validationRepositories(id, state, dir);
    const interactions = groundingInteractionRequirements({
      coupling: state.coupling, repositoryCount: selected.length,
      capabilities, semantics
    });
    const mandatoryService = interactions.service;
    const mandatoryWire = interactions.wire;
    const mandatoryActivation = [...riskClasses].some((entry) =>
      ["legacy", "activation", "cutover"].some((token) => entry.includes(token))) ||
      /\b(activat|cutover|enable existing|wire existing|turn on)\w*\b/.test(semantics);
    return {
      risk, contract, capabilities, riskClasses, semantics, selected,
      mandatoryService, mandatoryWire, mandatoryActivation
    };
  }

  function requiredNfrCategories(state, v2) {
    const required = new Set();
    const requireWhen = (category, capabilities) => {
      if (capabilities.some((capability) => v2.capabilities.has(capability)))
        required.add(category);
    };
    requireWhen("performance", ["performance"]);
    requireWhen("availability", ["resilience"]);
    requireWhen("securityPrivacy", ["security-static"]);
    requireWhen("accessibility", ["accessibility"]);
    requireWhen("operability", ["observability"]);
    requireWhen("compatibility", ["compatibility", "cross-repo-contract"]);
    requireWhen("recoverability", ["data-migration", "deployment"]);
    if ((state.securityTriggers || []).length) required.add("securityPrivacy");
    if (v2.mandatoryService)
      ["availability", "operability", "recoverability"].forEach((name) => required.add(name));
    if (v2.capabilities.has("data-migration"))
      ["compatibility", "recoverability"].forEach((name) => required.add(name));
    if (/\b(performance|latency|throughput)\b/.test(v2.semantics)) required.add("performance");
    if (/\b(capacity|scalability|scale)\b/.test(v2.semantics)) required.add("capacity");
    if (/\b(availability|uptime|reliability)\b/.test(v2.semantics)) required.add("availability");
    return required;
  }

  function applicableNfrClaimIssues(label, category, row, context) {
    const issues = [];
    const allowedCapabilities = NFR_CATEGORY_CAPABILITIES[category];
    const consequences = {
      resilience: "availability must also be applicable",
      "data-migration": "compatibility and recoverability must also be applicable",
      deployment: "recoverability must also be applicable"
    };
    const consequenceHint = allowedCapabilities
      .filter((capability) => consequences[capability])
      .map((capability) => `${capability} => ${consequences[capability]}`)
      .join("; ");
    for (const claimId of row.claimIds) {
      const claim = context.claimById.get(claimId);
      if (!claim) {
        issues.push(`${label} references unknown claim '${claimId}'`);
        continue;
      }
      if (!allowedCapabilities.some((capability) =>
        (claim.capabilities || []).includes(capability)))
        issues.push(`${label} claim '${claimId}' must declare one of: ${allowedCapabilities.join(", ")}${
          consequenceHint ? `; capability consequences: ${consequenceHint}` : ""}`);
      if (!context.taskClaimIds.has(claimId))
        issues.push(`${label} claim '${claimId}' has no implementation task owner`);
    }
    if (!allowedCapabilities.some((capability) =>
      context.configuredCapabilities.has(capability)))
      issues.push(`${label} has no configured capable evidence provider`);
    if (category === "securityPrivacy" && !row.claimIds.some((claimId) =>
      hasObservableSecurityControl(context.claimById.get(claimId))))
      issues.push(`${label} requires an observable negative-path or privacy-control claim; ` +
        `the claim scenario must name the outcome, such as rejected, refused, denied, ` +
        `blocked, sanitized, escaped, isolated, or redacted`);
    return issues;
  }

  function nfrCategoryIssues(id, category, row, context) {
    const issues = [];
    const label = `${id}/grounding.yaml nfrAssessment.${category}`;
    if (!row || !["applicable", "not-applicable"].includes(row.status)) {
      issues.push(`${label}.status must be applicable|not-applicable`);
      return issues;
    }
    if (!String(row.sourceReason || "").trim()) issues.push(`${label}.sourceReason is required`);
    if (!Array.isArray(row.claimIds)) {
      issues.push(`${label}.claimIds must be an array`);
      return issues;
    }
    if (context.required.has(category) && row.status !== "applicable")
      issues.push(`${label} is required by the declared risk or evidence capability`);
    if (row.status === "not-applicable") {
      if (row.claimIds.length) issues.push(`${label}.claimIds must be empty when not applicable`);
      return issues;
    }
    const target = String(row.target || "").trim();
    if (!target || /^none$/i.test(target)) issues.push(`${label}.target is required when applicable`);
    if (["performance", "capacity"].includes(category) && !/\d/.test(target))
      issues.push(`${label}.target must contain a measurable numeric threshold`);
    if (row.claimIds.length === 0)
      issues.push(`${label}.claimIds must be non-empty when applicable`);
    issues.push(...applicableNfrClaimIssues(label, category, row, context));
    return issues;
  }

  function validateNfrAssessment(id, state, value, parsedTasks, v2) {
    if (!state.nfrAssessmentRequired) return;
    const assessment = value.nfrAssessment;
    if (!assessment || typeof assessment !== "object" || Array.isArray(assessment))
      fail(`${id}/grounding.yaml nfrAssessment is required for this change`);
    const categoryNames = Object.keys(NFR_CATEGORY_CAPABILITIES);
    const unknown = Object.keys(assessment).filter((name) => !categoryNames.includes(name));
    const issues = unknown.length
      ? [`${id}/grounding.yaml nfrAssessment has unknown categories: ${unknown.join(", ")}`]
      : [];
    const context = {
      required: requiredNfrCategories(state, v2),
      claimById: new Map(v2.contract.claims.map((claim) => [claim.id, claim])),
      taskClaimIds: new Set(parsedTasks.map(taskMetadata)
        .filter((task) => ["implementation", "migration"].includes(task.kind))
        .flatMap((task) => task.claims)),
      configuredCapabilities: new Set(Object.entries(v2.contract.providers || {})
        .map(([provider, config]) => providerCapability(provider, config)).filter(Boolean))
    };
    for (const category of categoryNames)
      issues.push(...nfrCategoryIssues(id, category, assessment[category], context));
    failValidationLayer(fail, "NFR assessment", issues);
  }

  function validateRequiredV2Sections(id, value, v2) {
    if (value.productionEntry.status !== "applicable")
      fail(`${id}/grounding.yaml productionEntry cannot be N/A for an implementation claim`);
    if (v2.mandatoryWire && value.realWire.status !== "applicable")
      fail(`${id}/grounding.yaml realWire is required by the declared contract/integration risk`);
    if (v2.mandatoryActivation && value.activationSemantics.status !== "applicable")
      fail(`${id}/grounding.yaml activationSemantics is required when existing behavior is activated or cut over`);
    if (v2.mandatoryService && value.serviceInteractions.status !== "applicable")
      fail(`${id}/grounding.yaml serviceInteractions is required by the declared cross-service/queue surface`);
    if (v2.mandatoryService && value.observability.status !== "applicable")
      fail(`${id}/grounding.yaml observability is required for every declared service interaction`);
  }

  function validateGroundingSourceRows(id, value, selected, parsedTasks, firstLock) {
    const repositories = new Map(selected.map((repository) => [repository.id, repository]));
    const issues = [];
    const validateRows = (name, rows, allowedRoles) => {
      for (const [index, source] of rows.entries()) {
        const label = `${id}/grounding.yaml ${name}[${index}]`;
        const shapeIssue = groundingPathRowShapeIssue(label, source);
        if (shapeIssue) {
          issues.push(shapeIssue);
          continue;
        }
        const repository = repositories.get(source?.repository || "root");
        const sourcePath = String(source?.path || "");
        if (!repository) {
          issues.push(`${label} references an unselected repository`);
          continue;
        }
        if (!sourcePath || isAbsolute(sourcePath)) {
          issues.push(`${label}.path must be repository-relative`);
          continue;
        }
        const absolute = resolve(repository.workspacePath, sourcePath);
        const readSource = value.readSet.find((row) =>
          (row.repository || "root") === repository.id && row.path === sourcePath &&
          allowedRoles.includes(row.role));
        const planned = plannedGroundingPathEligible(readSource, existsSync(absolute),
          parsedTasks, firstLock);
        if (!pathInside(repository.workspacePath, absolute) ||
            (!existsSync(absolute) && !planned)) {
          const recovery = plannedGroundingPathRecovery(readSource, existsSync(absolute),
            parsedTasks, firstLock);
          issues.push(`${label}.path does not resolve inside repository '${repository.id}'` +
            (recovery ? `; ${recovery}` : ""));
        }
        if (!readSource) {
          const allowedRole = allowedRoles.includes("test-topology")
            ? "test-topology" : allowedRoles[0];
          const repositoryId = source.repository || "root";
          const newPathRecovery = !existsSync(absolute)
            ? `; ${groundingMissingReadSourceRecovery(sourcePath, repositoryId, allowedRole)}`
            : "";
          issues.push(`${label} must appear in readSet with role ${allowedRoles.join("|")}` +
            newPathRecovery);
        }
      }
    };
    validateRows("productionEntry.paths", value.productionEntry.paths,
      ["production-path", "runtime-path"]);
    validateRows("realWire.contracts", value.realWire.contracts,
      ["contract", "test-topology"]);
    validateRows("activationSemantics.activatedPaths",
      value.activationSemantics.activatedPaths, ["production-path", "runtime-path"]);
    failValidationLayer(fail, "grounding source", issues);
  }

  function requiredInteractionFields(row, fields, label) {
    const missing = fields.filter((field) => !String(row?.[field] || "").trim());
    return missing.length
      ? [`${label} requires non-empty fields: ${missing.join(", ")}`]
      : [];
  }

  function validateServiceInteractionRows(id, value) {
    const issues = [];
    const interactionIds = new Set();
    for (const [index, row] of (value.serviceInteractions?.rows || []).entries()) {
      const label = `${id}/grounding.yaml serviceInteractions.rows[${index}]`;
      issues.push(...requiredInteractionFields(row, [
        "id", "owner", "producer", "consumer", "contract", "delivery",
        "timeoutRetry", "idempotency", "ordering", "consistency", "rollout", "rollback"
      ], label));
      if (interactionIds.has(row.id)) issues.push(`${label}.id is duplicated`);
      interactionIds.add(row.id);
    }
    const observed = new Set();
    for (const [index, row] of (value.observability?.rows || []).entries()) {
      const label = `${id}/grounding.yaml observability.rows[${index}]`;
      issues.push(...requiredInteractionFields(row, [
        "interactionId", "correlation", "structuredEvents", "sli",
        "alert", "runbook", "operatorQuestion"
      ], label));
      if (row.interactionId !== "local" && !interactionIds.has(row.interactionId))
        issues.push(`${label}.interactionId does not reference a service interaction`);
      observed.add(row.interactionId);
    }
    if (value.serviceInteractions?.status === "applicable")
      for (const interactionId of interactionIds)
        if (!observed.has(interactionId))
          issues.push(`${id}/grounding.yaml observability must cover interaction '${interactionId}'`);
    failValidationLayer(fail, "service interaction", issues);
  }

  function validateGroundingCriticalCases(id, rows) {
    const issues = [];
    const criticalIds = new Set();
    for (const [index, row] of rows.entries()) {
      const label = `${id}/grounding.yaml criticalCases[${index}]`;
      if (!String(row?.id || "").trim() || criticalIds.has(row.id))
        issues.push(`${label}.id must be non-empty and unique`);
      if (!Array.isArray(row.claimIds) || row.claimIds.length === 0)
        issues.push(`${label}.claimIds must be non-empty`);
      if (!CRITICAL_CASE_ORACLES.includes(row.oracle))
        issues.push(`${label}.oracle must be one of: ${CRITICAL_CASE_ORACLES.join("|")}`);
      criticalIds.add(row.id);
    }
    return { criticalIds, issues };
  }

  function validateGroundingMutants(id, rows, criticalIds) {
    const issues = [];
    const mutantIds = new Set();
    for (const [index, row] of rows.entries()) {
      const label = `${id}/grounding.yaml mutants[${index}]`;
      if (!String(row?.id || "").trim() || mutantIds.has(row.id))
        issues.push(`${label}.id must be non-empty and unique`);
      if (!Array.isArray(row.claimIds) || row.claimIds.length === 0 ||
          !String(row.class || "").trim())
        issues.push(`${label} requires claimIds and class`);
      if (!criticalIds.has(row.killerCaseId))
        issues.push(`${label}.killerCaseId must name a critical case`);
      mutantIds.add(row.id);
    }
    return issues;
  }

  function validateCriticalCasesAndMutants(id, value) {
    if (!Array.isArray(value.criticalCases) || !Array.isArray(value.mutants))
      fail(`${id}/grounding.yaml criticalCases and mutants must be arrays`);
    const { criticalIds, issues } = validateGroundingCriticalCases(id, value.criticalCases);
    issues.push(...validateGroundingMutants(id, value.mutants, criticalIds));
    failValidationLayer(fail, "critical case and mutant", issues);
  }

  function validateGroundingReadSet(id, value, repositories, firstLock, parsedTasks) {
    const roles = new Set(GROUNDING_READ_ROLES);
    const issues = [];
    const immutableRoles = new Set([
      "requirement", "backlog", "architecture", "contract", "dependency-source", "history"
    ]);
    for (const [index, source] of value.readSet.entries()) {
      const label = `${id}/grounding.yaml readSet[${index}]`;
      const repository = repositories.get(source.repository || "root");
      if (!repository) {
        issues.push(`${label} references an unselected repository`);
        continue;
      }
      if (!roles.has(source.role))
        issues.push(`${label}.role must be one of: ${GROUNDING_READ_ROLES.join("|")}`);
      if (!["full", "targeted"].includes(source.mode))
        issues.push(`${label}.mode must be full|targeted`);
      const sourcePath = String(source.path || "");
      if (!sourcePath || isAbsolute(sourcePath)) {
        issues.push(`${label}.path must be repository-relative`);
        continue;
      }
      const absolute = resolve(repository.workspacePath, sourcePath);
      const pathExists = existsSync(absolute);
      const planned = plannedGroundingPathEligible(source, pathExists,
        parsedTasks, firstLock);
      const inside = pathInside(repository.workspacePath, absolute);
      if (!inside || (!pathExists && !planned)) {
        const recovery = plannedGroundingPathRecovery(source, pathExists,
          parsedTasks, firstLock);
        issues.push(`${label}.path does not resolve inside repository '${repository.id}'` +
          (recovery ? `; ${recovery}` : ""));
      }
      if (source.sha256 === "planned" && !planned)
        issues.push(`${label}.sha256 may be 'planned' only for a new implementation-owned ` +
          "production, runtime, test-topology, or dependency path");
      if (planned) continue;
      if (!inside || !pathExists) continue;
      if (!/^[a-f0-9]{64}$/i.test(String(source.sha256 || "")))
        issues.push(`${label}.sha256 must be a SHA-256 hex digest`);
      if ((firstLock || immutableRoles.has(source.role)) &&
          fileDigest(absolute) !== String(source.sha256).toLowerCase())
        issues.push(`${label}.sha256 does not match the baseline file. ` +
          `If '${sourcePath}' is intentionally edited by this change, its role ` +
          "must be production-path or runtime-path (immutable roles pin decision " +
          "sources); re-role the row and refresh its sha256. If the edit is " +
          "unintended drift, restore the file to its baseline.");
    }
    failValidationLayer(fail, "grounding readSet", issues);
  }

  function validateGroundingTaskOverlap(id, value, parsedTasks) {
    const overlap = groundingTaskOverlapFindings(value.readSet, parsedTasks);
    if (overlap.length)
      fail(`${id}/grounding.yaml immutable readSet overlaps implementation task paths:\n  - ${
        overlap.map((row) => `${row.taskId}: ${row.repository}/${row.path} ` +
          `(${row.role}) overlaps [paths:${row.taskPath}]`).join("\n  - ")
      }\nFiles the change will edit must use role production-path or runtime-path; keep immutable decision sources outside writable task scopes.`);
    if (!value.readSet.some((source) => ["requirement", "backlog"].includes(source.role)))
      fail(`${id}/grounding.yaml must read a requirement or backlog source`);
  }

  function validateGroundingReadRoles(id, state, contract, readSet) {
    const roles = new Set(readSet.map((source) => source.role));
    if (state.coupling === "coupled")
      for (const role of ["architecture", "contract", "composition-root"])
        if (!roles.has(role))
          fail(`${id}/grounding.yaml coupled work requires a ${role} readSet entry`);
    const capabilities = new Set(contract.claims.flatMap((claim) => claim.capabilities || []));
    if (["test", "integration", "live", "mutation", "browser"].some((capability) =>
      capabilities.has(capability)) && !roles.has("test-topology"))
      fail(`${id}/grounding.yaml test-backed claims require a test-topology readSet entry`);
    const securityWork = (state.securityTriggers || []).length > 0 ||
      ["security", "security-static"].some((capability) => capabilities.has(capability));
    if (securityWork && !roles.has("dependency-source"))
      fail(`${id}/grounding.yaml security work requires a dependency-source readSet entry`);
  }

  function groundingPathIssues(id, label, row, repositories, value, role,
    failureRequired, parsedTasks, firstLock) {
    const issues = [];
    const shapeIssue = groundingPathRowShapeIssue(label, row);
    if (shapeIssue) return [shapeIssue];
    const repository = repositories.get(row?.repository || "root");
    const sourcePath = String(row?.path || "");
    if (!repository) return [`${label} references an unselected repository`];
    if (!sourcePath || isAbsolute(sourcePath))
      return [`${label}.path must be repository-relative`];
    const absolute = resolve(repository.workspacePath, sourcePath);
    const includedSource = value.readSet.find((source) =>
      (source.repository || "root") === repository.id && source.path === sourcePath &&
      (!role || source.role === role));
    const planned = plannedGroundingPathEligible(includedSource, existsSync(absolute),
      parsedTasks, firstLock);
    if (!pathInside(repository.workspacePath, absolute) ||
        (!existsSync(absolute) && !planned)) {
      const recovery = plannedGroundingPathRecovery(includedSource, existsSync(absolute),
        parsedTasks, firstLock);
      issues.push(`${label}.path does not resolve inside repository '${repository.id}'` +
        (recovery ? `; ${recovery}` : ""));
    }
    if (failureRequired && !String(row?.failure || "").trim())
      issues.push(`${label}.failure is required`);
    if (!includedSource)
      issues.push(role
        ? `${label} must appear in readSet with role ${role} and a baseline digest`
        : `${label} must appear in readSet with a baseline digest`);
    return issues;
  }

  function groundingClaimEvidenceIssues(label, claim, evidenceClaim) {
    const issues = [];
    const classes = new Set([
      "static", "unit", "test", "integration", "live", "mutation", "security",
      "review", "acceptance", "browser", "deployment", "cross-repo-contract",
      "changed-quality"
    ]);
    if (!Array.isArray(claim.evidenceClass) || claim.evidenceClass.length === 0 ||
        claim.evidenceClass.some((entry) => !String(entry || "").trim()))
      return [`${label}.evidenceClass must be a non-empty string array`];
    const unsupported = claim.evidenceClass.filter((entry) => !classes.has(entry));
    if (unsupported.length)
      issues.push(`${label}.evidenceClass contains unsupported class(es): ${unsupported.join(", ")}; ` +
        `supported: ${[...classes].join("|")}`);
    if (!String(claim.testDoubleGap || "").trim())
      issues.push(`${label}.testDoubleGap must be none or describe the gap`);
    if (claim.testDoubleGap !== "none" &&
        !claim.evidenceClass.some((entry) => ["integration", "live"].includes(entry)))
      issues.push(`${label} declares a test-double gap without integration or live evidence`);
    const capabilities = new Set(evidenceClaim?.capabilities || []);
    const aliases = {
      static: ["static-analysis", "security-static"], unit: ["test"], test: ["test"],
      integration: ["integration"], live: ["live"], mutation: ["mutation"],
      security: ["security", "security-static"], review: ["review"],
      acceptance: ["acceptance"], browser: ["browser"], deployment: ["deployment"],
      "cross-repo-contract": ["compatibility", "integration"],
      "changed-quality": ["changed-quality"]
    };
    for (const evidenceClass of claim.evidenceClass)
      if (aliases[evidenceClass] &&
          !aliases[evidenceClass].some((capability) => capabilities.has(capability)))
        issues.push(`${label}.evidenceClass '${evidenceClass}' is not declared by evidence.yaml for claim '${claim.id}'`);
    if (evidenceClaim?.impact === "high" && !claim.evidenceClass.some((entry) =>
      ["integration", "live", "security", "review"].includes(entry)))
      issues.push(`${label} maps a high-impact claim only to low-fidelity evidence; ` +
        "add at least one of: integration|live|security|review");
    return issues;
  }

  function validateGroundingClaims(id, value, contract, repositories,
    parsedTasks, firstLock) {
    const issues = [];
    const claimIds = new Set(contract.claims.map((claim) => claim.id));
    if (!Array.isArray(value.claims) || value.claims.length !== claimIds.size)
      issues.push(`${id}/grounding.yaml must map every evidence claim exactly once`);
    const seen = new Set();
    for (const [index, claim] of (Array.isArray(value.claims) ? value.claims : []).entries()) {
      const label = `${id}/grounding.yaml claims[${index}]`;
      if (!claimIds.has(claim.id)) issues.push(`${label}.id references an unknown evidence claim`);
      if (seen.has(claim.id)) issues.push(`${label}.id is duplicated`);
      seen.add(claim.id);
      if (!Array.isArray(claim.productionPath) || claim.productionPath.length === 0)
        issues.push(`${label}.productionPath must be a non-empty array`);
      for (const [pathIndex, row] of (Array.isArray(claim.productionPath)
        ? claim.productionPath : []).entries())
        issues.push(...groundingPathIssues(id, `${label}.productionPath[${pathIndex}]`, row,
          repositories, value, "production-path", false, parsedTasks, firstLock));
      if (!Array.isArray(claim.failurePaths) || claim.failurePaths.length === 0)
        issues.push(`${label}.failurePaths must be a non-empty array`);
      for (const [pathIndex, row] of (Array.isArray(claim.failurePaths)
        ? claim.failurePaths : []).entries())
        issues.push(...groundingPathIssues(id, `${label}.failurePaths[${pathIndex}]`, row,
          repositories, value, null, true, parsedTasks, firstLock));
      const evidenceClaim = contract.claims.find((entry) => entry.id === claim.id);
      issues.push(...groundingClaimEvidenceIssues(label, claim, evidenceClaim));
    }
    failValidationLayer(fail, "grounding claim", issues);
    return claimIds;
  }

  function validateV2ClaimCoverage(id, value, contract, claimIds) {
    const rowClaimIds = (row) => Array.isArray(row?.claimIds) ? row.claimIds : [];
    const material = contract.claims.filter((claim) => claim.impact !== "low" &&
      (claim.capabilities || []).some((capability) =>
        ["test", "integration", "live", "browser"].includes(capability)));
    const criticalCoverage = new Set(value.criticalCases.flatMap(rowClaimIds));
    const uncovered = material.filter((claim) => !criticalCoverage.has(claim.id));
    if (uncovered.length)
      fail(`${id}/grounding.yaml material test claims ` +
        `${uncovered.map((claim) => `'${claim.id}'`).join(", ")} each require a ` +
        "stable criticalCases row shaped as {id, claimIds:[claim-id], " +
        `oracle:${CRITICAL_CASE_ORACLES.join("|")}}; when adding each row, also ` +
        "bind its id in execution.yaml provider.criticalCases before revalidating");
    for (const [index, row] of value.criticalCases.entries())
      for (const claimId of rowClaimIds(row))
        if (!claimIds.has(claimId))
          fail(`${id}/grounding.yaml criticalCases[${index}] references unknown claim '${claimId}'`);
    const mutationClaims = contract.claims.filter((claim) =>
      (claim.capabilities || []).includes("mutation"));
    const mutationCoverage = new Set(value.mutants.flatMap(rowClaimIds));
    for (const claim of mutationClaims)
      if (!mutationCoverage.has(claim.id))
        fail(`${id}/grounding.yaml mutation claim '${claim.id}' requires a named mutant and killer case`);
    for (const [index, row] of value.mutants.entries())
      for (const claimId of rowClaimIds(row))
        if (!claimIds.has(claimId))
          fail(`${id}/grounding.yaml mutants[${index}] references unknown claim '${claimId}'`);
  }

  function validateV2ExecutionBindings(id, dir, value) {
    const providers = Object.values(rawExecution(id, dir).providers || {});
    const configuredCases = new Set(providers.flatMap((provider) => provider.criticalCases || []));
    for (const row of value.criticalCases || [])
      if (!configuredCases.has(row.id))
        fail(`${id}/execution.yaml must bind critical case '${row.id}' in a provider.criticalCases list`);
    const mutationProviders = providers.filter((provider) =>
      provider.resultProtocol === "foundation-mutation-v2");
    const configuredMutants = new Set(mutationProviders
      .flatMap((provider) => provider.requiredMutants || []));
    for (const row of value.mutants || []) {
      if (!configuredMutants.has(row.id)) {
        fail(`${id}/execution.yaml must bind mutant '${row.id}' in a foundation-mutation-v2 provider.requiredMutants list`);
        continue;
      }
      const provider = mutationProviders.find((candidate) =>
        (candidate.requiredMutants || []).includes(row.id));
      if (provider?.mutantKillers?.[row.id] !== row.killerCaseId)
        fail(`${id}/execution.yaml mutantKillers.${row.id} must equal grounding killerCaseId '${row.killerCaseId}'`);
      if (!(provider?.criticalCases || []).includes(row.killerCaseId))
        fail(`${id}/execution.yaml mutation provider must require killer critical case '${row.killerCaseId}'`);
    }
  }

  function validateDerivedGroundingFacts(id, value) {
    if (!Array.isArray(value.derivedFacts || []))
      fail(`${id}/grounding.yaml derivedFacts must be an array`);
    for (const [index, fact] of (value.derivedFacts || []).entries())
      if (!String(fact.fact || "").trim() || !String(fact.command || "").trim())
        fail(`${id}/grounding.yaml derivedFacts[${index}] requires fact and command`);
  }

  function groundingValue(id, state, dir, parsedTasks = [], initialGroups = []) {
    // Cross-artifact diagnostics are supplied through initialGroups, but they
    // are not grounding-specific. Rapid/optional-grounding changes used to
    // return here and silently accept unknown task claims and other contract
    // errors. Preserve the short lane while still enforcing its packet.
    if (!state.groundingRequired) {
      failCollectedValidation(initialGroups);
      return null;
    }
    const grounding = readGroundingDocument(id, state, dir);
    const { value, digest: groundingDigest, firstLock } = grounding;
    if (value.version === 3) {
      const groups = initialGroups.filter((group) => group.issues?.length)
        .map((group) => ({ ...group, issues: [...group.issues] }));
      captureValidationGroup(groups, "grounding v3 decision",
        () => validateGroundingV3(id, value));
      failCollectedValidation(groups);
      return {
        value,
        digest: groundingDigest,
        firstLock,
        lockedAt: state.groundingLockedAt || now()
      };
    }
    const decision = value.decisionBatch || {};
    const groups = initialGroups.filter((group) => group.issues?.length)
      .map((group) => ({ ...group, issues: [...group.issues] }));
    const decisionIds = captureValidationGroup(groups, "grounding decision",
      () => validateGroundingDecision(id, decision)) || new Set();
    captureValidationGroup(groups, "semantic invariant",
      () => validateGroundingSemanticInvariants(id, state, dir, value, decisionIds));

    const readableReadSet = Array.isArray(value.readSet) && value.readSet.length > 0;
    if (!readableReadSet)
      groups.push({
        name: "grounding readSet",
        issues: [`${id}/grounding.yaml readSet must be non-empty`]
      });

    let v2 = null;
    if (value.version === 2) {
      v2 = captureValidationGroup(groups, "grounding risk and shape",
        () => groundingV2Context(id, state, dir, value));
      if (v2) {
        captureValidationGroup(groups, "NFR assessment",
          () => validateNfrAssessment(id, state, value, parsedTasks, v2));
        captureValidationGroup(groups, "required grounding sections",
          () => validateRequiredV2Sections(id, value, v2));
        if (readableReadSet)
          captureValidationGroup(groups, "grounding source",
            () => validateGroundingSourceRows(
              id, value, v2.selected, parsedTasks, firstLock));
        captureValidationGroup(groups, "service interaction",
          () => validateServiceInteractionRows(id, value));
        captureValidationGroup(groups, "critical case and mutant",
          () => validateCriticalCasesAndMutants(id, value));
      }
    }

    const repositories = new Map(validationRepositories(id, state, dir)
      .map((repository) => [repository.id, repository]));
    if (readableReadSet) {
      captureValidationGroup(groups, "grounding readSet",
        () => validateGroundingReadSet(id, value, repositories, firstLock, parsedTasks));
      captureValidationGroup(groups, "grounding task overlap",
        () => validateGroundingTaskOverlap(id, value, parsedTasks));
    }

    const contract = evidence(id, dir);
    let claimIds = new Set();
    if (readableReadSet) {
      captureValidationGroup(groups, "grounding read roles",
        () => validateGroundingReadRoles(id, state, contract, value.readSet));
      claimIds = captureValidationGroup(groups, "grounding claim",
        () => validateGroundingClaims(id, value, contract, repositories,
          parsedTasks, firstLock)) || new Set();
    }

    if (value.version === 2 && Array.isArray(value.criticalCases) &&
        Array.isArray(value.mutants)) {
      captureValidationGroup(groups, "critical case coverage",
        () => validateV2ClaimCoverage(id, value, contract, claimIds));
      captureValidationGroup(groups, "execution binding",
        () => validateV2ExecutionBindings(id, dir, value));
    }

    captureValidationGroup(groups, "derived grounding facts",
      () => validateDerivedGroundingFacts(id, value));
    failCollectedValidation(groups);
    return { value, digest: groundingDigest, firstLock, lockedAt: decision.lockedAt };
  }

  return {
    groundingValue
  };
}
