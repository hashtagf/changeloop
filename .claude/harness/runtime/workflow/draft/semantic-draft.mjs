import { investigationCoverageIssues } from "../validation/investigation-coverage.mjs";
import { parseSpecDocument } from "../../contracts/change-artifacts.mjs";
import { normalizeDiscovery, semanticIntakeIssues } from "../validation/semantic-intake.mjs";
import { designBlueprintIssues } from "../validation/design-blueprints.mjs";
import { scratchFieldIssues, scratchRequiredIssues } from "./scratch-fields.mjs";
import { undoIssues } from "../transaction/undo-plan.mjs";
import { enforcesIssues } from "../../contracts/lesson-enforcement.mjs";
import { readerGuideIssues } from "../validation/reader-guide.mjs";
import {
  devDocumentIssues, devDocumentShapeIssues, inferWorkTypes
} from "../validation/dev-document.mjs";
import { riskDerivationSummary } from "../validation/draft-risk.mjs";
import { isSemanticVersion } from "../validation/draft-version.mjs";
import { unique } from "../../core/values.mjs";
import {
  comparableLabel, placeholderIssue, rawScenarioEntries, stringList, text, textList
} from "./semantic-draft-text.mjs";
import {
  deriveRepositoryTaskDependencies, derivedExecution, normalizeTasks,
  unknownTaskFieldWarnings
} from "./semantic-draft-tasks.mjs";
import { rejectedAlternatives, decisionMetadataIssues, applyDecisionRationale, SETTLED_REASON } from "./semantic-draft-decisions.mjs";

const OPERATIONS = new Set(["added", "modified", "removed"]);

// Readability limits for v4 requirement statements. A statement longer than
// this is almost always several requirements or scenario detail in one clause.
const STATEMENT_MAX_WORDS = 60;
const STATEMENT_MAX_CHARACTERS = 400;
const STATEMENT_MAX_SEMICOLONS = 2;
// Matches the slug limit, so a disambiguated claim ID is no longer than a derived one.
const CLAIM_ID_MAX_LENGTH = 64;

function semanticScenarios(requirement) {
  const source = Array.isArray(requirement.scenarios)
    ? requirement.scenarios
    : requirement.scenario !== undefined ? [requirement.scenario] : [];
  return source.map((entry, index) => {
    const object = typeof entry === "string" ? { scenario: entry } : entry || {};
    const fallbackName = text(object.scenario) || text(object.when) ||
      `${text(requirement.key) || "scenario"}-${index + 1}`;
    const given = textList(object.given);
    const and = textList(object.and);
    return {
      key: text(object.key) || fallbackName,
      name: text(object.name) || fallbackName,
      ...(given.length ? { given } : {}),
      when: text(object.when) || text(object.scenario),
      then: text(object.then) || text(object.outcome) || text(requirement.outcome),
      ...(and.length ? { and } : {}),
      ...(text(object.kind) ? { kind: text(object.kind).toLowerCase() } : {}),
      ...(object.access !== undefined && object.access !== null ? { access: object.access } : {}),
      // A hotfix names the incident a scenario guards against recurring.
      ...(text(object.regressionOf) ? { regressionOf: text(object.regressionOf) } : {})
    };
  });
}

// A v4 scenario reads as one titled case: a short name distinct from WHEN,
// preconditions in GIVEN, one trigger, and one outcome plus optional AND lines.
// A modified or amendment-revised requirement may name an existing scenario
// by its title alone, so only a new scenario must carry its own name.
function readableScenarioIssues(requirement, operation, label, issues) {
  for (const [index, entry] of rawScenarioEntries(requirement).entries()) {
    const scenario = typeof entry === "string" ? { when: entry } : entry || {};
    const at = `${label}.scenarios[${index}]`;
    const name = text(scenario.name);
    const when = text(scenario.when) || text(scenario.scenario);
    if (!name && operation !== "modified" && !requirement?._revision)
      issues.push(`${at}.name is required: give the scenario a short title; without one the heading repeats WHEN`);
    else if (name && comparableLabel(name) === comparableLabel(when))
      issues.push(`${at}.name repeats WHEN; use a short title and keep the trigger in 'when'`);
    else if (name && name.length > 80)
      issues.push(`${at}.name is longer than 80 characters; shorten it to a title`);
    /** @type {Array<[string, string[]]>} */ const fields = [
      ["given", textList(scenario.given)], ["when", [when]],
      ["then", [text(scenario.then) || text(scenario.outcome)]], ["and", textList(scenario.and)]
    ];
    for (const [field, values] of fields)
      if (values.some((value) => value.includes(";")))
        issues.push(`${at}.${field} joins several cases with ';'; split them into separate ` +
          "scenarios, put preconditions in 'given', and extra outcomes in 'and'");
  }
}

function lowerFirst(value) {
  return value.replace(/^([A-Z])(?=[a-z])/, (letter) => letter.toLowerCase());
}

// The statement never glues an English stem onto a whole sentence: an
// explicit description wins, an outcome that already states
// SHALL/MUST is used as written, an English result clause becomes "The system
// SHALL ensure that <outcome>", an English verb phrase follows "The system
// SHALL", and any other language must supply the statement itself.
function requirementStatement(requirement, outcome, operation, label, issues) {
  const description = text(requirement?.description);
  let statement = description;
  if (!statement && outcome) {
    if (/\b(?:SHALL|MUST)\b/.test(outcome)) statement = outcome;
    else if (/[^\x00-\x7F]/.test(outcome))
      issues.push(`${label}.description is required: write the full statement in the ` +
        "document language and keep the SHALL marker");
    else {
      // A result clause ("The card appears", "a board renders") takes "ensure
      // that"; a verb phrase ("record one payment") follows SHALL directly.
      const body = outcome.replace(/[.]$/, "");
      statement = /^(?:[A-Z]|(?:a|an|the|each|every|no|all|any|its|their|this|these|those)\b)/
        .test(body)
        ? `The system SHALL ensure that ${lowerFirst(body)}.`
        : `The system SHALL ${body}.`;
    }
  }
  if (!statement || operation === "removed") return statement;
  if (!/\b(?:SHALL|MUST)\b/.test(statement))
    issues.push(`${label}.description must state the requirement with SHALL or MUST`);
  const words = statement.split(/\s+/).filter(Boolean).length;
  const semicolons = (statement.match(/;/g) || []).length;
  if (words > STATEMENT_MAX_WORDS || statement.length > STATEMENT_MAX_CHARACTERS ||
      semicolons > STATEMENT_MAX_SEMICOLONS)
    issues.push(`${label} statement is too long (${words} words, ${statement.length} characters, ` +
      `${semicolons} ';'); split it into separate requirements, move cases into scenarios, ` +
      "or list constraints in 'details'");
  return statement;
}

function canonicalScenarioDetails(body) {
  const scenarios = [];
  let current = null;
  for (const line of String(body || "").split("\n")) {
    const heading = line.match(/^####\s+Scenario:\s*(.+?)\s*$/i);
    if (heading) {
      current = { key: heading[1], name: heading[1], when: "", then: "" };
      scenarios.push(current);
      continue;
    }
    if (!current) continue;
    const given = line.match(/^\s*-\s*\*\*GIVEN\*\*\s+(.+?)\s*$/i);
    const when = line.match(/^\s*-\s*\*\*WHEN\*\*\s+(.+?)\s*$/i);
    const then = line.match(/^\s*-\s*\*\*THEN\*\*\s+(.+?)\s*$/i);
    const and = line.match(/^\s*-\s*\*\*AND\*\*\s+(.+?)\s*$/i);
    if (given) current.given = [...(current.given || []), given[1]];
    if (when) current.when = when[1];
    if (then) current.then = then[1];
    if (and) current.and = [...(current.and || []), and[1]];
  }
  return scenarios;
}

function mergeCanonicalScenarios(requirement, canonicalText, label, issues) {
  if (!canonicalText) {
    issues.push(`${label} is modified but canonical specification is unavailable`);
    return semanticScenarios(requirement);
  }
  const name = text(requirement?.requirement || requirement?.title) || text(requirement?.key);
  const current = parseSpecDocument(canonicalText).find((row) =>
    row.name.toLowerCase() === name.toLowerCase());
  if (!current) {
    // Naming the choices saves the round an agent spent reading the spec.
    const names = parseSpecDocument(canonicalText).map((row) => row.name);
    issues.push(`${label} cannot find canonical requirement '${name}' to modify` +
      (names.length ? `; set requirement to one of: ${names.join(", ")}` : ""));
    return semanticScenarios(requirement);
  }
  const canonical = canonicalScenarioDetails(current.body);
  const supplied = semanticScenarios(requirement);
  const suppliedByName = new Map(supplied.map((scenario) =>
    [scenario.name.toLowerCase(), scenario]));
  const merged = canonical.map((scenario) =>
    suppliedByName.get(scenario.name.toLowerCase()) || scenario);
  for (const scenario of supplied) {
    if (!canonical.some((row) => row.name.toLowerCase() === scenario.name.toLowerCase()))
      merged.push(scenario);
  }
  return merged;
}

function evidenceEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return new Map();
  return new Map(Object.entries(value));
}

function requiredIntegrationCapabilities(integration) {
  const concerns = new Set(stringList(integration.concerns).map((value) => value.toLowerCase()));
  const capabilities = ["integration"];
  if ([...concerns].some((value) =>
    /auth|credential|signature|webhook|secret|permission|ยืนยันตัวตน|ข้อมูลรับรอง|ลายเซ็น|เว็บฮุก|ความลับ|รหัสลับ|สิทธิ์/u
      .test(value)))
    capabilities.push("security-static");
  if ([...concerns].some((value) =>
    /retry|timeout|rate.limit|partial|degrad|recover/.test(value)))
    capabilities.push("resilience");
  if ([...concerns].some((value) =>
    /compat|version|schema|public.contract/.test(value)))
    capabilities.push("compatibility");
  return capabilities;
}

function securityTriggerList(source) {
  return [
    ...stringList(source?.securityTriggers),
    ...(Array.isArray(source?.integrations) ? source.integrations : [])
      .filter((integration) =>
        requiredIntegrationCapabilities(integration || {}).includes("security-static"))
      .map(() => "external-integration-authentication")
  ].filter((trigger) => trigger.toLowerCase() !== "none");
}

// Mirrors the rapid-lane test in change-lifecycle atomicStartPreflight.
export function semanticRapidCandidate(source) {
  return (text(source?.impact) || "low") === "low" &&
    (text(source?.coupling) || "isolated") === "isolated" &&
    !securityTriggerList(source).length && !source?.reviewRequired &&
    !source?.acceptance?.required;
}

// Omitted evidence capabilities default to the plain check in either lane. Only
// a declared security trigger keeps the choice with the author: which security
// capability proves the boundary is a judgment the compiler must not make.
export function semanticEvidenceDefaultable(source) {
  return !securityTriggerList(source).length;
}

// A benchmark provider compares head with base over alternating runs; fewer
// than three runs per side gives no usable median. Omitted values take the
// runtime defaults (5 runs, 10% regression).
const BENCHMARK_MIN_RUNS = 3;

function benchmarkProviderIssues(execution) {
  const providers = execution?.providers;
  if (!providers || typeof providers !== "object" || Array.isArray(providers)) return [];
  const issues = [];
  for (const [name, provider] of Object.entries(providers)) {
    if (text(provider?.adapter) !== "benchmark") continue;
    const label = `semantic draft execution.providers.${name}`;
    if (provider.runs !== undefined &&
        (!Number.isInteger(provider.runs) || provider.runs < BENCHMARK_MIN_RUNS))
      issues.push(`${label}.runs must be at least ${BENCHMARK_MIN_RUNS} (an integer; default 5)`);
    if (provider.maxRegressionPercent !== undefined &&
        (typeof provider.maxRegressionPercent !== "number" ||
          !Number.isFinite(provider.maxRegressionPercent) || provider.maxRegressionPercent < 0))
      issues.push(`${label}.maxRegressionPercent must be a number of at least 0 (default 10)`);
  }
  return issues;
}

function semanticDraftIssues(source, { defaultTestEvidence = false, requireScratch = false, requireUndo = false } = {}) {
  const issues = [];
  if (!isSemanticVersion(source?.version))
    issues.push([1, 2, 3].includes(source?.version)
      ? `draft version ${source.version} is no longer supported; author a v5 draft folder ` +
        "(cloop change start --template) or a v4 JSON draft"
      : "semantic draft version must be 4 or 5");
  if (!text(source?.intent)) issues.push("semantic draft requires non-empty 'intent'");
  if (!Array.isArray(source?.requirements) || source.requirements.length === 0)
    issues.push("semantic draft requires a non-empty 'requirements' array");
  if (!Array.isArray(source?.tasks) || source.tasks.length === 0)
    issues.push("semantic draft requires a non-empty 'tasks' array");
  if (!(defaultTestEvidence && source?.evidence === undefined) &&
      (!source?.evidence || typeof source.evidence !== "object" || Array.isArray(source.evidence)))
    issues.push("semantic draft requires an 'evidence' object keyed by requirement key");
  if (source?.integrations !== undefined && !Array.isArray(source.integrations))
    issues.push("semantic draft integrations must be an array");
  if (source?.capabilityOverviews !== undefined && !Array.isArray(source.capabilityOverviews))
    issues.push("semantic draft capabilityOverviews must be an array of { capability, title, overview } or an object keyed by capability");
  if (source?.language !== undefined &&
      !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(text(source.language)))
    issues.push("semantic draft language must be a BCP 47 tag such as 'en' or 'th'");
  issues.push(...scratchFieldIssues(source));
  // Only a draft being started or revised owes the approval summary; an
  // amendment synthesizes a draft and a started change keeps the one it had.
  if (requireScratch) issues.push(...scratchRequiredIssues(source));
  // The same drafts owe a way to undo a High or Critical change (or a plain "none: why").
  if (requireUndo) issues.push(...undoIssues(source));
  if (source?.successMeasure !== undefined &&
      (typeof source.successMeasure !== "string" || !text(source.successMeasure) ||
        text(source.successMeasure).length > 240 || /\r?\n/.test(text(source.successMeasure))))
    issues.push("semantic draft successMeasure must be one line of at most 240 characters " +
      "(how you will know it worked, with a number or observable); omit it when unknown");
  if (source?.diagrams !== undefined && !Array.isArray(source.diagrams))
    issues.push("semantic draft diagrams must be an array");
  if (source?.decisions !== undefined && !Array.isArray(source.decisions))
    issues.push("semantic draft decisions must be an array");
  if (source?.risks !== undefined && !Array.isArray(source.risks))
    issues.push("semantic draft risks must be an array");
  if (source?.repositories !== undefined && !Array.isArray(source.repositories))
    issues.push("semantic draft repositories must be an array");
  if (source?.externalOperations !== undefined && !Array.isArray(source.externalOperations))
    issues.push("semantic draft externalOperations must be an array");
  if (source?.constraints !== undefined && (!Array.isArray(source.constraints) ||
      source.constraints.some((value) => !text(value))))
    issues.push("semantic draft constraints must be an array of non-empty strings");
  if (source?.fixes !== undefined && (!Array.isArray(source.fixes) ||
      source.fixes.some((value) => !text(value))))
    issues.push("semantic draft fixes must be an array of archived change ids");
  issues.push(...enforcesIssues(source));
  issues.push(...benchmarkProviderIssues(source?.execution));
  if (source?.prototypeSelection !== undefined) {
    if (!text(source.prototypeSelection?.reference))
      issues.push("semantic draft prototypeSelection.reference is required");
    if (!text(source.prototypeSelection?.selected))
      issues.push("semantic draft prototypeSelection.selected is required");
  }
  placeholderIssue(source?.intent, "semantic draft intent", issues);
  for (const [index, decision] of (source?.decisions || []).entries()) {
    if (!text(decision?.key)) issues.push(`semantic draft decisions[${index}].key is required`);
    if (!text(decision?.choice)) issues.push(`semantic draft decisions[${index}].choice is required`);
    if (!text(decision?.reason || decision?.why) && rejectedAlternatives(decision).length)
      issues.push(`semantic draft decisions[${index}].reason is required`);
    if (text(decision?.decidedBy) && !["user", "agent"].includes(text(decision.decidedBy).toLowerCase()))
      issues.push(`semantic draft decisions[${index}].decidedBy must be user|agent`);
    issues.push(...decisionMetadataIssues(decision, `semantic draft decisions[${index}]`));
  }
  const choices = new Map();
  for (const decision of source?.decisions || []) {
    const key = text(decision?.key);
    const choice = text(decision?.choice);
    if (!key) continue;
    if (choices.has(key) && choices.get(key) !== choice)
      issues.push(`semantic draft has contradictory decisions for '${key}'`);
    else if (choices.has(key)) issues.push(`semantic draft decision key '${key}' is duplicated`);
    choices.set(key, choice);
  }
  issues.push(...designBlueprintIssues(source));
  issues.push(...devDocumentShapeIssues(source));
  issues.push(...devDocumentIssues(source, {
    standard: !semanticRapidCandidate(source), lane: riskDerivationSummary(source)
  }));
  issues.push(...semanticIntakeIssues(source));
  return issues;
}

// Docs or chore work has no behavior for a test runner to count: its verify
// command (a grep, a link check) is proven by its exit code, so an omitted
// capability list means "static-analysis", never test discovery.
const STATIC_EVIDENCE_WORK = new Set(["docs", "chore"]);
export function defaultEvidenceCapability(source) {
  const types = inferWorkTypes(source || {});
  return types.length && types.every((type) => STATIC_EVIDENCE_WORK.has(type))
    ? "static-analysis" : "test";
}

function normalizeRequirements(source, slugify, issues, {
  loadCanonicalSpec = null, defaultTestEvidence = false, defaultedEvidence = [],
  reservedClaimIds = []
} = {}) {
  const evidence = evidenceEntries(source.evidence);
  const defaultCapability = defaultTestEvidence ? defaultEvidenceCapability(source) : "test";
  const requirements = [];
  const requirementKeys = new Set();
  const pendingClaims = [];
  let capabilityChoiceReported = false;
  const knownRequirementKeys = new Set((source.requirements || []).map((row) => text(row?.key)));
  for (const evidenceKey of evidence.keys())
    if (!knownRequirementKeys.has(evidenceKey))
      issues.push(`semantic draft evidence references unknown requirement '${evidenceKey}'`);

  for (const [index, requirement] of (source.requirements || []).entries()) {
    const label = `semantic draft requirements[${index}]`;
    const key = text(requirement?.key);
    if (!key) issues.push(`${label}.key is required`);
    else if (requirementKeys.has(key)) issues.push(`${label}.key '${key}' is duplicated`);
    requirementKeys.add(key);
    const capability = text(requirement?.capability);
    if (!capability && Array.isArray(source._capabilityChoices)) {
      // One repair for the whole minimal draft, naming the real choices.
      if (!capabilityChoiceReported)
        issues.push("semantic draft 'capability' is required: no existing capability " +
          "matched this draft confidently; set 'capability' on each requirement to one " +
          `of: ${source._capabilityChoices.join(", ")} (or name a new capability)`);
      capabilityChoiceReported = true;
    } else if (!capability) issues.push(`${label}.capability is required`);
    const operation = text(requirement?.operation || "added").toLowerCase();
    if (!OPERATIONS.has(operation))
      issues.push(`${label}.operation must be added|modified|removed`);
    const outcome = text(requirement?.outcome);
    if (!outcome && operation !== "removed") issues.push(`${label}.outcome is required`);
    const scenarios = operation === "modified"
      ? mergeCanonicalScenarios(requirement,
        loadCanonicalSpec ? loadCanonicalSpec(capability) : null, label, issues)
      : semanticScenarios(requirement);
    if (!scenarios.length && operation !== "removed")
      issues.push(`${label}.scenario or .scenarios is required`);
    if (isSemanticVersion(source.version)) readableScenarioIssues(requirement, operation, label, issues);
    const statement = requirementStatement(
      requirement, outcome, operation, label, issues);
    const details = textList(requirement?.details);
    for (const [scenarioIndex, scenario] of scenarios.entries()) {
      for (const field of ["name", "when", "then"])
        if (!scenario[field]) issues.push(`${label}.scenarios[${scenarioIndex}].${field} is required`);
    }
    if (operation === "removed" && !text(requirement?.migration))
      issues.push(`${label}.migration is required for removed requirements`);
    placeholderIssue(key, `${label}.key`, issues);
    placeholderIssue(capability, `${label}.capability`, issues);
    placeholderIssue(outcome, `${label}.outcome`, issues);

    const evidenceValue = evidence.get(key);
    const capabilities = unique([
      ...stringList(evidenceValue?.capabilities),
      ...stringList(requirement?.capabilities)
    ]);
    // A draft proves every requirement with its covering tasks' verify commands,
    // so an omitted capability list means exactly that: "test", or
    // "static-analysis" for docs/chore work. The proposal records the default.
    if (defaultTestEvidence && !capabilities.length &&
        evidenceValue?.capabilities === undefined && requirement?.capabilities === undefined) {
      capabilities.push(defaultCapability);
      defaultedEvidence.push(key);
    } else if (!evidenceValue && !requirement?.capabilities) {
      const derived = riskDerivationSummary(source);
      issues.push(`${label} requires evidence['${key}'].capabilities ` +
        "(a draft with security triggers must name them, e.g. [\"test\", \"security-static\"]; " +
        "without triggers an omitted list defaults to [\"test\"], or [\"static-analysis\"] " +
        "for docs/chore work" + (derived ? `; ${derived}` : "") + ")");
    }
    if (!capabilities.length)
      issues.push(`${label} requires at least one evidence capability`);

    const repositories = unique(stringList(requirement?.repositories));
    if (repositories.length > 1 && !capabilities.includes("cross-repo-contract"))
      capabilities.push("cross-repo-contract");
    const explicitKeys = new Set(rawScenarioEntries(requirement)
      .map((entry) => text(entry?.key)).filter(Boolean));
    const scenarioClaims = scenarios.map((scenario, scenarioIndex) => {
      // A title in a non-Latin script slugifies to nothing; its position keeps
      // the claim id stable instead.
      const rawSuffix = String(scenario.key || "");
      const suffix = /[a-z0-9]/i.test(rawSuffix) ? rawSuffix : String(scenarioIndex + 1);
      const id = slugify(scenarios.length === 1 ? key : `${key}-${suffix}`);
      if (!id) issues.push(`${label} cannot derive a stable claim ID`);
      // Only an explicit scenario key is an author-chosen claim suffix; IDs
      // from requirement keys and titles are slugged and truncated, so the
      // compiler owns their collisions.
      const explicit = scenarios.length > 1 && explicitKeys.has(scenario.key);
      pendingClaims.push({ label, explicit });
      return {
        id,
        requirementKey: key,
        scenario: scenario.name,
        impact: text(evidenceValue?.impact || requirement?.impact || source.impact || "low"),
        capabilities,
        ...(repositories.length ? { repositories } : {})
      };
    });
    requirements.push({
      key,
      claimIds: scenarioClaims.map((claim) => claim.id),
      claims: scenarioClaims,
      spec: {
        name: capability,
        operation,
        requirement: text(requirement?.requirement || requirement?.title) || key,
        description: statement,
        ...(details.length ? { details } : {}),
        scenarios,
        ...(operation === "removed" ? { migration: text(requirement.migration) } : {})
      }
    });
  }
  assignClaimIds(requirements, pendingClaims, reservedClaimIds, issues);
  return { requirements, requirementKeys };
}

// Claim IDs are compiler-owned. Author-chosen IDs (and IDs an active change
// already owns) keep their value; a derived ID that collides, e.g. two long
// scenario titles that share their first 64 slug characters, takes the first
// free numeric suffix in draft order, so recompiling the same draft yields the
// same IDs. Only two author-chosen scenario keys that collide are an error.
function assignClaimIds(requirements, pending, reservedClaimIds, issues) {
  const claims = requirements.flatMap((row) => row.claims);
  const explicit = new Set();
  claims.forEach((claim, index) => {
    if (!claim.id || !pending[index].explicit) return;
    if (explicit.has(claim.id))
      issues.push(`${pending[index].label} derives duplicate claim ID '${claim.id}'`);
    explicit.add(claim.id);
  });
  // Callers own collisions between author-chosen and reserved IDs.
  const taken = new Set([...reservedClaimIds, ...explicit]);
  claims.forEach((claim, index) => {
    if (!claim.id || pending[index].explicit) return;
    let id = claim.id;
    for (let counter = 2; taken.has(id); counter += 1) {
      const suffix = `-${counter}`;
      id = `${claim.id.slice(0, CLAIM_ID_MAX_LENGTH - suffix.length).replace(/-+$/, "")}${suffix}`;
    }
    claim.id = id;
    taken.add(id);
  });
  for (const row of requirements) row.claimIds = row.claims.map((claim) => claim.id);
}

// ---- Minimal v4 draft -------------------------------------------------------
// A draft without `version` whose shape is unambiguously the minimal v4 form
// (intent + requirements[{description, scenarios[{when, then}]}] +
// tasks[{outcome, verify, paths}]) is expanded here, before intake, into an
// ordinary v4 draft. Explicit drafts (any `version`) are never touched.

// Authors naturally key overviews by capability:
// `{ "<capability>": { title, overview } }` or `{ "<capability>": "overview" }`.
// Normalize that map to the canonical array; any other shape stays as given so
// validation reports it.
export function capabilityOverviewList(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.entries(value).map(([capability, entry]) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? { ...entry, capability: text(entry.capability) || capability }
      : { capability, overview: entry });
}

// A capability overview gives its spec file a human title and a short
// orientation paragraph above the requirement deltas.
function applyCapabilityOverviews(source, requirements, slugify, issues) {
  if (!Array.isArray(source.capabilityOverviews)) return;
  const seen = new Set();
  for (const [index, entry] of source.capabilityOverviews.entries()) {
    const label = `semantic draft capabilityOverviews[${index}]`;
    const capability = slugify(text(entry?.capability));
    const specs = requirements.map((row) => row.spec)
      .filter((spec) => text(entry?.capability) && slugify(spec.name) === capability);
    if (!text(entry?.capability)) issues.push(`${label}.capability is required`);
    else if (!specs.length)
      issues.push(`${label}.capability '${entry.capability}' matches no requirement capability`);
    else if (seen.has(capability))
      issues.push(`${label}.capability '${entry.capability}' is duplicated`);
    seen.add(capability);
    if (!text(entry?.overview)) issues.push(`${label}.overview is required`);
    placeholderIssue(entry?.title, `${label}.title`, issues);
    placeholderIssue(entry?.overview, `${label}.overview`, issues);
    for (const spec of specs) {
      if (text(entry?.title)) spec.title = text(entry.title);
      if (text(entry?.overview)) spec.overview = text(entry.overview);
    }
  }
}

// OpenSpec 1.7 carries a delta's `## Purpose` into a brand-new living spec
// (and ignores it for an existing one), so every capability gets the Purpose
// its delta would state if it is new: the capability overview when one is
// given, else the intent as one sentence, followed by the requirement titles
// when that sentence alone is shorter than OpenSpec's strict minimum.
const PURPOSE_MIN_LENGTH = 50;
const PURPOSE_TITLES = 3;

export function derivedCapabilityPurpose(intent, titles = []) {
  const sentence = text(intent).replace(/\s+/g, " ").replace(/[\s.;:,!?]+$/u, "")
    .replace(/^\p{Ll}/u, (letter) => letter.toUpperCase());
  const base = sentence ? `${sentence}.` : "";
  if (base.length >= PURPOSE_MIN_LENGTH) return base;
  const list = unique(titles.map(text).filter(Boolean)).slice(0, PURPOSE_TITLES).join("; ");
  return [base, list ? `Requirements: ${list}.` : ""].filter(Boolean).join(" ");
}

function applyCapabilityPurposes(source, requirements, slugify) {
  const groups = new Map();
  for (const { spec } of requirements) {
    const capability = slugify(text(spec.name));
    groups.set(capability, [...(groups.get(capability) || []), spec]);
  }
  for (const specs of groups.values()) {
    const purpose = text(specs.find((spec) => text(spec.overview))?.overview) ||
      derivedCapabilityPurpose(source.intent, specs.map((spec) => spec.requirement));
    for (const spec of specs) if (purpose) spec.purpose = purpose;
  }
}

function applyIntegrationRequirements(source, requirements, requirementKeys, issues) {
  const byKey = new Map(requirements.map((row) => [row.key, row]));
  for (const [index, integration] of (source.integrations || []).entries()) {
    const label = `semantic draft integrations[${index}]`;
    if (!text(integration?.key)) issues.push(`${label}.key is required`);
    if (!text(integration?.kind)) issues.push(`${label}.kind is required`);
    if (!text(integration?.documentation?.source))
      issues.push(`${label}.documentation.source is required`);
    if (!text(integration?.documentation?.version))
      issues.push(`${label}.documentation.version is required`);
    if (!Array.isArray(integration?.concerns) || !stringList(integration.concerns).length)
      issues.push(`${label}.concerns must name the integration risks to cover`);
    const relatesTo = stringList(integration?.relatesTo);
    if (!relatesTo.length) issues.push(`${label}.relatesTo must name at least one requirement`);
    const unknown = relatesTo.filter((key) => !requirementKeys.has(key));
    if (unknown.length) issues.push(`${label}.relatesTo references unknown requirement(s): ${unknown.join(", ")}`);
    const relatedScenarios = relatesTo.flatMap((key) => byKey.get(key)?.spec?.scenarios || []);
    for (const scenarioKind of ["success", "failure"])
      if (!relatedScenarios.some((scenario) => scenario.kind === scenarioKind))
        issues.push(`${label} requires a related scenario with kind '${scenarioKind}'`);
    const capabilities = requiredIntegrationCapabilities(integration);
    for (const key of relatesTo) {
      const requirement = byKey.get(key);
      if (!requirement) continue;
      for (const claim of requirement.claims)
        claim.capabilities = unique([...claim.capabilities, ...capabilities]);
    }
  }
}

export function normalizeSemanticDraft(input, slugify, options = {}) {
  const source = input?.capabilityOverviews === undefined ? input
    : { ...input, capabilityOverviews: capabilityOverviewList(input.capabilityOverviews) };
  const defaultTestEvidence = Boolean(options.defaultRapidEvidence) &&
    semanticEvidenceDefaultable(source);
  const defaultedEvidence = [];
  const issues = [...semanticDraftIssues(source, { defaultTestEvidence, requireScratch: Boolean(options.requireScratch), requireUndo: Boolean(options.requireUndo) }),
    ...investigationCoverageIssues(source)];
  const { requirements, requirementKeys } = normalizeRequirements(
    source, slugify, issues, { ...options, defaultTestEvidence, defaultedEvidence });
  applyIntegrationRequirements(source, requirements, requirementKeys, issues);
  applyCapabilityOverviews(source, requirements, slugify, issues);
  applyCapabilityPurposes(source, requirements, slugify);
  applyDecisionRationale(source, requirements, issues);
  let tasks = normalizeTasks(source, requirements, requirementKeys, issues);
  // Cross-repository order is derived only when a repository binding exists.
  if (Array.isArray(options.repositories) || Array.isArray(source.repositories)) {
    const ordered = deriveRepositoryTaskDependencies(tasks, {
      repositories: options.repositories, selection: source.repositories
    });
    tasks = ordered.tasks;
    issues.push(...ordered.issues.map((issue) => `semantic draft ${issue}`));
  }
  issues.push(...readerGuideIssues(source, requirementKeys));
  const claims = requirements.flatMap((row) => row.claims);
  const acceptance = source.acceptance || { required: false, reason: null, claimIds: [] };
  const acceptanceRequirements = stringList(acceptance.requirements);
  const acceptanceClaimIds = acceptanceRequirements.flatMap((key) => {
    const row = requirements.find((requirement) => requirement.key === key);
    if (!row) issues.push(`semantic draft acceptance references unknown requirement '${key}'`);
    return row?.claimIds || [];
  });
  const securityTriggers = unique([
    ...stringList(source.securityTriggers),
    ...(source.integrations || []).flatMap((integration) =>
      requiredIntegrationCapabilities(integration).includes("security-static")
        ? ["external-integration-authentication"] : [])
  ]);
  const draft = {
    ...source,
    _semanticVersion: source.version,
    _derivedExecution: !source.execution,
    ...(defaultedEvidence.length ? { _defaultedEvidence: defaultedEvidence } : {}),
    // No stated reason stays empty: repeating the intent under "Why" says
    // nothing the title does not.
    why: text(source.why),
    currentState: text(source.currentState) || "none",
    compatibility: text(source.compatibility) || "none",
    changes: stringList(source.changes).length
      ? stringList(source.changes)
      : unique((source.requirements || []).map(whatChanges).filter(Boolean)),
    nonGoals: stringList(source.nonGoals),
    ...(Array.isArray(source.constraints) ? { constraints: stringList(source.constraints) } : {}),
    ...(Array.isArray(source.fixes) ? { fixes: unique(stringList(source.fixes)) } : {}),
    ...(Array.isArray(source.enforces) ? { enforces: unique(stringList(source.enforces)) } : {}),
    decisions: Array.isArray(source.decisions)
      ? source.decisions.map((decision) =>
        text(decision?.reason || decision?.why) ? decision : { ...decision, why: SETTLED_REASON })
      : [],
    risks: Array.isArray(source.risks) ? source.risks : [],
    domainLanguage: Array.isArray(source.domainLanguage) ? source.domainLanguage : [],
    impact: text(source.impact) || "low",
    coupling: text(source.coupling) || "isolated",
    securityTriggers,
    acceptance: {
      required: Boolean(acceptance.required),
      reason: acceptance.required ? text(acceptance.reason) : null,
      claimIds: unique([
        ...stringList(acceptance.claimIds),
        ...acceptanceClaimIds
      ])
    },
    tasks,
    claims,
    specs: requirements.map((row) => row.spec),
    _requirementKeys: requirements.map((row) => row.key),
    execution: derivedExecution(source, claims, tasks),
    externalOperations: Array.isArray(source.externalOperations)
      ? source.externalOperations : undefined,
    repositories: Array.isArray(source.repositories) ? source.repositories : undefined
  };
  if (isSemanticVersion(source.version)) draft.discovery = normalizeDiscovery(source);
  return { draft, issues, warnings: unknownTaskFieldWarnings(source) };
}

// "What changes" names the behavior a requirement adds, not one example of
// it: an authored outcome, else the requirement heading, else its statement.
// An outcome copied from the first scenario ("it returns 6") is an example.
function whatChanges(row) {
  const outcome = text(row?.outcome);
  const first = rawScenarioEntries(row || {}).find((scenario) =>
    text(scenario?.then) || text(scenario?.outcome));
  if (outcome && outcome !== (text(first?.then) || text(first?.outcome))) return outcome;
  const heading = text(row?.requirement || row?.title);
  if (heading && heading !== text(row?.key)) return heading;
  const statement = text(row?.description).replace(/^.*?\b(?:SHALL|MUST)\b\s*/, "")
    .replace(/[\s.]+$/u, "");
  return statement ? statement.replace(/^\p{Ll}/u, (letter) => letter.toUpperCase()) : outcome;
}

// One renderer for start, revise, and amendments. Structural keywords stay
// English so OpenSpec parses them; everything between them is document prose.
export function renderScenarioMarkdown(scenario) {
  return [
    `#### Scenario: ${scenario.name}`, "",
    ...(text(scenario.regressionOf)
      ? [`Regression of: ${text(scenario.regressionOf)}`, ""] : []),
    ...textList(scenario.given).map((value) => `- **GIVEN** ${value}`),
    `- **WHEN** ${scenario.when}`,
    `- **THEN** ${scenario.then}`,
    ...textList(scenario.and).map((value) => `- **AND** ${value}`)
  ].join("\n");
}

export function renderRequirementMarkdown(spec, scenarios = spec.scenarios || []) {
  const details = textList(spec.details).map((value) => `- ${value}`).join("\n");
  const migration = String(spec.operation || "added").toLowerCase() === "removed"
    ? `\n\n**Migration:** ${spec.migration}` : "";
  const rendered = scenarios.map(renderScenarioMarkdown).join("\n\n");
  const rationale = textList(spec.rationale).join("\n");
  return `### Requirement: ${spec.requirement}\n\n${spec.description}` +
    (rationale ? `\n\n${rationale}` : "") + (details ? `\n\n${details}` : "") + migration + (rendered ? `\n\n${rendered}` : "");
}

// A delta for a capability with no living spec yet states its Purpose, which
// OpenSpec archive writes into the new spec (the overview is that Purpose).
export function renderSpecHeading(spec, { newCapability = false } = {}) {
  const title = text(spec?.title) || text(spec?.name);
  if (newCapability && text(spec?.purpose))
    return `# ${title}\n\n## Purpose\n\n${text(spec.purpose)}`;
  return `# ${title}` + (text(spec?.overview) ? `\n\n${text(spec.overview)}` : "");
}
