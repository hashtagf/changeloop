// Pure Markdown rendering for change packets: proposal, design, tasks, specs
// and the approval-page line. No lifecycle state; change-lifecycle.mjs re-exports
// every symbol so existing importers are unchanged.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderSpecHeading } from "./semantic-draft.mjs";
import { agentDecision, authoredDecisionReason } from "./semantic-draft-decisions.mjs";
import { isSemanticVersion } from "../validation/draft-version.mjs";
import { assembleReviewPolicy, collectReviewSignals } from "../../evidence/review-policy.mjs";
import { classifyReviewRisk } from "../../evidence/review-routing.mjs";
import { reviewModelClass } from "../../evidence/review-diff.mjs";
import { PROTOTYPE_DIR, prototypeCovers, prototypeExcludes, prototypeMode } from "../prototype/prototype-binding.mjs";
import {
  DESIGN_FIELDS, draftHasBlueprints, draftWorkTypes, renderDesignBlueprints, renderFailureMatrixBody,
  renderFileMapBody, renderJobContractBody, renderTestMapBody, renderUiStatesBody, renderWorkType
} from "../validation/design-blueprints.mjs";
import {
  derivedByHarness, derivedFailureMatrix, derivedFileMap, derivedTestMap, docsOnlyDraft, inferWorkTypes,
  renderComponentMap, renderFileTree, renderUserFlow
} from "../validation/dev-document.mjs";
import {
  renderDefinitionOfDone, renderPacketHeader, renderScope, renderTraceability, reviewTier
} from "../validation/packet-overview.mjs";
import { OUTLINE, outlineRow, outlineSections, sectionHeading } from "../validation/outline-contract.mjs";
import { PROCESS_FIELDS } from "../validation/process-fields.mjs";
import { riskLabel } from "../validation/draft-risk.mjs";
import {
  fileMapWithTasks, intakeDecisions, capabilityTable, discoveryAppendixBody, investigationAppendixBody,
  renderOpenQuestions, renderSuccessCriteria, renderUserStories
} from "../validation/reader-guide.mjs";
import { renderProductHandoff } from "../validation/product-handoff.mjs";

const decisionTextList = (value) => (Array.isArray(value) ? value : [value])
  .map((item) => String(item ?? "").trim()).filter(Boolean);
const decisionText = (value) => decisionTextList(value ?? []).join("; ");

// An option is a plain string or { option, reason?, pros?, cons? }; either
// way it reads as one line of text, never "[object Object]".
export function renderDecisionOption(option) {
  if (option === null || option === undefined) return "";
  if (typeof option !== "object") return String(option).trim();
  const name = String(option.option ?? option.name ?? "").trim();
  const pros = decisionTextList(option.pros);
  const cons = decisionTextList(option.cons);
  const detail = [
    String(option.reason ?? option.why ?? "").trim(),
    pros.length ? `pros: ${pros.join(", ")}` : "",
    cons.length ? `cons: ${cons.join(", ")}` : ""
  ].filter(Boolean).join("; ");
  return name && detail ? `${name}: ${detail}` : name || detail;
}

function renderRejectedOptions(decision) {
  const listed = decision.rejected ?? decision.alternatives;
  const options = (Array.isArray(decision.options) ? decision.options : [])
    .filter((option) => option && typeof option === "object" ? option.chosen !== true : true);
  if (!Array.isArray(listed) && !options.length)
    return listed && typeof listed === "object" ? renderDecisionOption(listed) : listed;
  const rows = [...(Array.isArray(listed) ? listed : listed ? [listed] : []), ...options];
  const texts = rows.map(renderDecisionOption)
    .filter((value) => value && value !== decision.choice && !/^none$/i.test(value));
  return [...new Set(texts)].join(rows.some((row) => row && typeof row === "object") ? "; " : ", ");
}

export function proposedDecision(decision) {
  return String(decision?.status || "").trim().toLowerCase() === "proposed";
}

export function renderDraftDecisions(decisions) {
  if (!Array.isArray(decisions))
    throw new Error("standard start draft requires decisions to be an array; use [] when no durable decision qualifies");
  if (!decisions.length) return "`none`";
  const optional = (label, value) => value && !/^none$/i.test(String(value))
    ? `\n  - **${label}:** ${value}` : "";
  return decisions.map((decision, index) => {
    const decisionId = decision.id || `DEC-${String(index + 1).padStart(3, "0")}`;
    const rejected = renderRejectedOptions(decision);
    const drivers = decisionTextList(decision.drivers ?? []);
    const context = [
      decision.context || decision.question || "",
      drivers.length ? `Drivers: ${drivers.join(", ")}.` : ""
    ].filter(Boolean).join(" ");
    const consequences = [
      decision.consequences || "Not stated in the draft",
      decision.confirmation ? `Confirmation: ${decision.confirmation}` : ""
    ].filter(Boolean).join(" ");
    return `- **Decision ID:** ${decisionId}\n` +
      `  - **Status:** ${decision.status || "accepted"}` +
      optional("Context", context) +
      `\n  - **Decision:** ${decision.choice}\n  - **Why:** ${decision.why || decision.reason}\n` +
      `  - **Rejected:** ${rejected || "none"}\n` +
      `  - **Consequences:** ${consequences}` +
      optional("Decided by", decision.decidedBy) +
      optional("Decision ref", decision.decisionRef) +
      optional("Supersedes", decision.supersedes) +
      optional("Superseded by", decision.supersededBy);
  }).join("\n");
}

export function draftBullets(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

// A rapid packet has no design.md, so the decisions it records (normally the
// defaults the agent chose without asking) are listed in the proposal.
export function renderRapidDecisions(decisions = []) {
  const rows = (Array.isArray(decisions) ? decisions : [])
    .filter((decision) => !proposedDecision(decision))
    .filter((decision) => String(decision?.key || "").trim() && String(decision?.choice || "").trim())
    .map((decision) => {
      const reason = authoredDecisionReason(decision);
      const by = String(decision.decidedBy || "").trim().toLowerCase() || "agent";
      return `- **${decision.key}:** ${decision.choice}` + (reason ? ` — ${reason}` : "") +
        ` (decided by ${by})`;
    });
  return rows.length ? `## Decisions\n\n${rows.join("\n")}` : "";
}

// A proposed decision is not yet agreed: the proposal lists it with the
// options on the table so the user ratifies or changes it before approval.
export function renderProposedDecisions(decisions = [], language = "") {
  const thai = /^th\b/i.test(String(language || ""));
  const rows = (Array.isArray(decisions) ? decisions : [])
    .filter((decision) => proposedDecision(decision) && String(decision?.choice || "").trim())
    .map((decision) => {
      const reason = authoredDecisionReason(decision);
      const options = (Array.isArray(decision.options) ? decision.options : [])
        .map(renderDecisionOption).filter(Boolean);
      // Every authored part of a proposed decision is shown: it has no other
      // home until it is accepted and moves to design.md.
      const drivers = decisionTextList(decision.drivers ?? []);
      const details = [
        drivers.length ? `${thai ? "ปัจจัย" : "Drivers"}: ${drivers.join(", ")}` : "",
        meaningful(decisionText(decision.consequences))
          ? `${thai ? "ผลที่ตามมา" : "Consequences"}: ${decisionText(decision.consequences)}` : "",
        meaningful(decisionText(decision.confirmation))
          ? `${thai ? "ยืนยันโดย" : "Confirmation"}: ${decisionText(decision.confirmation)}` : ""
      ].filter(Boolean);
      return `- **${decision.key || decision.id}:** ${decision.choice}` + (reason ? ` — ${reason}` : "") +
        (options.length ? ` (options: ${options.join("; ")})` : "") +
        (details.length ? `. ${details.join(". ")}` : "");
    });
  if (!rows.length) return "";
  const heading = /^th\b/i.test(String(language || "")) ? "เรื่องที่ต้องให้ผู้ใช้ตัดสิน" : "Decisions to ratify";
  return `## ${heading}\n\n${rows.join("\n")}`;
}

// A standard draft the agent left without a reason, failure matrix, or evidence
// capabilities still compiles; this appendix tells the reader what the harness
// filled in rather than what the author wrote.
function derivedNotesBody(draft, rapid) {
  const notes = derivedByHarness(draft, { standard: !rapid });
  return notes.length ? draftBullets(notes) : "";
}

// A renderer that returns its own "## " heading supplies only the body; the
// outline row supplies the localized heading.
function sectionBody(markdown) {
  return String(markdown || "").replace(/^## [^\n]*\n+/, "").trim();
}

function proposalImpact(draft, state, rapid) {
  const triggers = (draft.securityTriggers || []).filter(Boolean);
  const fixes = (draft.fixes || []).length ? [`- **Fixes:** ${draft.fixes.join(", ")}`] : [];
  return [
    `- **Impact:** ${riskLabel(draft, "impact") || state.impact || "medium"}`,
    `- **Coupling:** ${riskLabel(draft, "coupling") || state.coupling || "coupled"}`,
    // A rapid change states only what departs from its defaults (code
    // surface, no security trigger); the standard lane keeps the statement.
    ...(rapid && !(draft.surfaces || []).some((surface) => surface !== "code") ? [] :
      [`- **Affected surfaces:** ${(draft.surfaces || ["code"]).join(", ")}`]),
    ...(rapid && !triggers.length ? [] :
      [`- **Security triggers:** ${triggers.length ? triggers.join(", ") : "none detected"}`]),
    ...(rapid && docsOnlyDraft(draft)
      ? ["- **Specs:** none; docs-only work modifies no living spec"] : []),
    ...fixes
  ].join("\n");
}

function provenanceBody(value) {
  if (!value || typeof value !== "object") return String(value ?? "").trim();
  return Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== "")
    .map(([key, entry]) => `- **${key}:** ${typeof entry === "object" ? JSON.stringify(entry) : entry}`).join("\n");
}

function amendmentsBody(value) {
  return (Array.isArray(value) ? value : []).map((row) => typeof row === "string" ? `- ${row}` :
    `- ${[row?.at || row?.date, row?.reason || row?.summary].filter(Boolean).join(": ")}`)
    .filter((line) => line !== "- ").join("\n");
}

// A v5 draft's authored prose for one author-owned outline row, exactly as
// written: only the blank lines separating it from its heading and from the
// next section are dropped. Derived and machine rows never take prose.
function authoredProse(draft, document, row) {
  if (row.owner !== "author") return "";
  const body = draft?.prose?.[document]?.[row.key];
  if (typeof body !== "string") return "";
  return body.replace(/^(?:[ \t]*\r?\n)+/, "").replace(/(?:\r?\n[ \t]*)+$/, "");
}

// The outline rows a document renders, in outline order: those whose
// condition holds plus any author row the v5 prose fills.
function outlineRowsWithProse(document, draft, context) {
  const included = new Set(outlineSections(document, draft, context).map((row) => row.key));
  return OUTLINE[document].filter((row) => included.has(row.key) || authoredProse(draft, document, row));
}

// Reading order comes from the outline contract: decisions a reader makes
// (summary, why, stories, success, scope, impact, open decisions, process
// records) come first, then acceptance and Definition of done, and only then
// the appendices. Each fact has one home: tasks and their checks live in
// tasks.md (the acceptance table links to them), the folder tree sits in
// design.md's file map, and a rapid packet, which has no design.md, keeps its
// decisions and compact dev document here. A row with nothing to say is
// omitted, and archive-only rows never render before Land. `context` carries
// harness-derived facts the draft does not hold: the review route label
// (policy) and repositories the change does not select.
export function renderDraftProposal(draft, state, context = {}) {
  const title = draft.title || state.intent;
  const language = draft.language;
  const rapid = state?.schema === "foundation-rapid";
  // A rapid change has no design.md, so its compact dev document (flow,
  // components, descriptive sections the agent wrote, failures) lives here.
  // Authoring them never moves the change off rapid.
  const compact = rapid && isSemanticVersion(draft._semanticVersion);
  const compactPlan = () => [
    renderUserFlow(draft), renderComponentMap(draft), renderDesignBlueprints({
      workType: draft.workType, bugfix: draft.bugfix, refactor: draft.refactor, configContract: draft.configContract,
      failureMatrix: derivedFailureMatrix(draft),
      fileMap: fileMapWithTasks(draft.fileMap, draft.tasks), testMap: draft.testMap
    })].filter(Boolean);
  const fieldRender = (key) => PROCESS_FIELDS[key].render(draft[key], { language });
  const bodies = {
    summary: () => String(draft.summary || "").trim(),
    why: () => String(draft.why || "").trim(),
    userStories: () => renderUserStories(draft, language),
    successCriteria: () => renderSuccessCriteria(draft),
    scope: () => sectionBody(renderScope(draft, context)),
    capabilities: () => capabilityTable(draft),
    impact: () => proposalImpact(draft, state, rapid),
    decisionsToRatify: () => [sectionBody(renderProposedDecisions(draft.decisions, language)),
      renderOpenQuestions(draft)].filter(Boolean).join("\n"),
    decisionLog: () => fieldRender("decisionLog"),
    communication: () => [fieldRender("communication"),
      (() => {
        const note = fieldRender("releaseNote");
        return note ? `### Release note\n\n${note}` : "";
      })()].filter(Boolean).join("\n\n"),
    demo: () => fieldRender("demo"),
    acceptance: () => sectionBody(renderTraceability(draft)),
    productHandoff: () => renderProductHandoff(draft._productHandoffCoverage, { language }),
    definitionOfDone: () => sectionBody(renderDefinitionOfDone(draft, context)),
    investigation: () => investigationAppendixBody(draft, title),
    discovery: () => discoveryAppendixBody(draft, language),
    derived: () => derivedNotesBody(draft, rapid),
    provenance: () => provenanceBody(draft.provenance),
    amendments: () => amendmentsBody(draft.amendments ?? context.amendments)
  };
  // Content the outline places right after a row: authored Constraints and
  // Non-goals close Scope (their headings are what Land and PR readers find),
  // the rapid compact dev document follows them, and a rapid packet's
  // decisions follow Impact.
  const after = {
    scope: () => [
      (draft.constraints || []).length ? `## Constraints\n\n${draftBullets(draft.constraints)}` : "",
      (draft.nonGoals || []).length ? `## Non-goals\n\n${draftBullets(draft.nonGoals)}` : "",
      ...(compact ? compactPlan() : [])],
    impact: () => [rapid ? renderRapidDecisions(draft.decisions) : ""]
  };
  const sections = [];
  for (const row of outlineRowsWithProse("proposal", draft, { language, archived: false })) {
    if (row.archiveOnly || row.key === "header") continue;
    const body = [authoredProse(draft, "proposal", row), bodies[row.key]?.() || ""]
      .filter(Boolean).join("\n\n");
    if (body) sections.push(`## ${sectionHeading(row, language)}\n\n${body}`);
    sections.push(...(after[row.key]?.() || []).filter(Boolean));
  }
  const header = renderPacketHeader(draft, state, context);
  return [`# Change: ${title}`, header, ...sections].filter(Boolean).join("\n\n") + "\n";
}

// Keeps the harness-owned facts of a proposal current when resolve changes
// them: impact, coupling, the lane (a rapid change upgraded to standard), and
// the review line of the definition of done. Authored text is never touched,
// and a proposal in an older layout (no such lines) is returned unchanged.
export function synchronizeProposalClassification(proposal, state, context = {}) {
  let next = String(proposal || "");
  if (state.upgradedFrom === "foundation-rapid")
    next = next.replace(/(\*\*Lane:\*\* )rapid \([^\n]*\)/,
      "$1standard (upgraded from rapid at resolve; see Impact)");
  if (context.reviewLabel) {
    next = next.replace(/^(- Review: ).*$/m, (line, prefix) => `${prefix}${context.reviewLabel}.`);
    // The header names the tier of the same route.
    next = next.replace(/^(- \*\*Review:\*\* )[^·\n]*?(?=( · |$))/m,
      (line, prefix) => `${prefix}${reviewTier(context.reviewLabel)}`);
  }
  for (const [label, value] of [
    ["Impact", state.impact], ["Coupling", state.coupling]
  ]) {
    if (!value) continue;
    const pattern = new RegExp(
      `^(\\s*-\\s*\\*\\*${label}:\\*\\*\\s*)(.*)$`, "im");
    // A derived value keeps its "(derived: ...)" reason while it still holds.
    next = next.replace(pattern, (line, prefix, current) =>
      current === value || current.startsWith(`${value} (derived: `) ? line : `${prefix}${value}`);
  }
  return next;
}

export function draftDomainRows(domainLanguage = []) {
  return domainLanguage.length
    ? domainLanguage.map((term) =>
      `| ${term.term} | ${term.meaning} | ${term.avoid} |`).join("\n")
    : "| `none` | This change introduces no project-specific term. | `none` |";
}

function meaningful(value) {
  const normalized = String(value ?? "").trim();
  return normalized && !/^`?none`?[.]?$/i.test(normalized) ? normalized : "";
}

// The open questions of a compiled proposal: the plain bullets of its
// "Decisions to ratify and open questions" section (proposed decisions are
// the bold-keyed bullets beside them).
export function proposalOpenQuestions(proposal) {
  const row = outlineRow("proposal", "decisionsToRatify");
  const headings = [row.heading.en, row.heading.th].map((heading) =>
    heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const section = String(proposal || "")
    .match(new RegExp(`^## (?:${headings})\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1] || "";
  return [...section.matchAll(/^- (?!\*\*)(.+?)\s*$/gm)].map((match) => match[1]);
}

// Rows whose English heading is a parser marker: packetWorkTypes reads
// "## Work type" (and the refactor/bugfix headings), durableDecisionSection
// reads "## Decisions". They keep that heading in every packet language.
const DESIGN_MARKER_ROWS = new Set(["workType", "decisions", "bugfix", "refactor"]);

function designLanguage(draft) {
  return /^th\b/i.test(String(draft?.language || "")) ? "th" : "en";
}

function designText(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return renderDecisionOption(value) ||
    Object.values(value).map((item) => String(item ?? "").trim()).filter(Boolean).join(" — ");
  return String(value).trim();
}

function mermaidBlock(value) {
  const source = typeof value === "string" ? value : value?.source;
  if (!String(source || "").trim()) return "";
  const purpose = typeof value === "object" ? designText(value?.purpose) : "";
  return `${purpose ? `${purpose}\n\n` : ""}\`\`\`mermaid\n${String(source).trim()}\n\`\`\``;
}

function designDiagrams(diagrams) {
  return (Array.isArray(diagrams) ? diagrams : []).map((diagram) => {
    const title = diagram.title || diagram.key;
    if (diagram.type === "mermaid" && diagram.source)
      return `### ${title}\n\n${diagram.purpose || ""}\n\n\`\`\`mermaid\n${diagram.source}\n\`\`\``;
    const target = diagram.path || diagram.source;
    return `### ${title}\n\n${diagram.purpose || ""}\n\n[Diagram source](${target})`;
  }).join("\n\n");
}

function joinParts(...parts) {
  return parts.map((part) => String(part || "").trim()).filter(Boolean).join("\n\n");
}

// design.md follows the outline contract: each row renders once, under its
// localized heading, from its typed field module or the derived renderer, so
// no fact is written twice. Empty rows are omitted rather than rendered as
// `none` placeholders. Open questions live only in the proposal; proposed
// decisions wait for the user there too, so design.md records only accepted
// or superseded decisions.
export function renderDraftDesign(draft) {
  const language = designLanguage(draft);
  const field = (key) => {
    const value = draft[key];
    if (value === undefined || value === null) return "";
    try { return DESIGN_FIELDS[key].render(value, { language }); }
    catch { return ""; }
  };
  const declared = draftWorkTypes(draft);
  const inferred = declared.length ? [] : inferWorkTypes(draft);
  const decisions = [...(draft.decisions || []), ...intakeDecisions(draft)]
    .filter((decision) => !proposedDecision(decision));
  const risks = (draft.risks || []).filter((risk) => meaningful(risk?.risk))
    .map((risk) => `| ${risk.risk} | ${risk.mitigation} | ${risk.owner} |`).join("\n");
  const assumptions = (Array.isArray(draft.assumptions) ? draft.assumptions : [draft.assumptions])
    .map(designText).filter(Boolean);
  const authoredFileMap = Array.isArray(draft.fileMap) && draft.fileMap.length > 0;
  const componentMap = sectionBody(renderComponentMap(draft));
  const domain = field("domain");
  const prototype = draft.prototypeSelection;
  const bodies = {
    overview: () => meaningful(designText(draft.overview)),
    currentState: () => meaningful(draft.currentState),
    domainLanguage: () => (draft.domainLanguage || []).length
      ? `| Canonical term | Meaning | Avoid |\n|---|---|---|\n${draftDomainRows(draft.domainLanguage)}` : "",
    assumptions: () => assumptions.map((row) => `- ${row}`).join("\n"),
    workType: () => sectionBody(renderWorkType(declared, inferred)),
    architecture: () => joinParts(mermaidBlock(draft.diagram), field("boundaries")),
    tenancy: () => field("tenancy"),
    userFlow: () => sectionBody(renderUserFlow(draft)),
    runtime: () => designDiagrams(draft.diagrams),
    domainModel: () => joinParts(domain,
      componentMap && domain ? `### ${language === "th" ? "แผนที่ component" : "Component map"}\n\n${componentMap}`
        : componentMap),
    apiContracts: () => Array.isArray(draft.apiContracts) ? field("apiContracts") : "",
    eventContracts: () => joinParts(field("eventContracts"), renderJobContractBody(draft.jobContract)),
    dataModel: () => field("dataModel"),
    uiContract: () => joinParts(field("ui"), renderUiStatesBody(draft.uiStates)),
    configContract: () => field("configContract"),
    integrations: () => field("integrations"),
    decisions: () => decisions.length ? renderDraftDecisions(decisions) : "",
    observability: () => joinParts(field("observability"), field("trackingPlan")),
    rollout: () => joinParts(meaningful(draft.compatibility), field("rollout")),
    risks: () => risks ? `| Risk | Mitigation | Evidence owner |\n|---|---|---|\n${risks}` : "",
    fileMap: () => renderFileMapBody(authoredFileMap ? fileMapWithTasks(draft.fileMap, draft.tasks)
      : derivedFileMap(draft), { derived: !authoredFileMap, fileTree: renderFileTree(draft) }),
    prototype: () => {
      if (!prototype) return "";
      const name = String(prototype.reference || "").split(/[\\/]/).pop();
      const copy = `${PROTOTYPE_DIR}/${name === "binding.json" ? "prototype-binding.json" : name}`;
      const covers = prototypeCovers(prototype);
      const excludes = prototypeExcludes(prototype);
      return `- **Selected:** ${prototype.selected}\n- **Reference:** [${copy}](${copy}) ` +
        `(copied from \`${prototype.reference}\`)\n` +
        `- **Mode:** ${prototypeMode(prototype)}\n` +
        (covers.length ? `- **Requirements:** ${covers.map((key) => `\`${key}\``).join(", ")}\n` : "") +
        `- **Reason:** ${prototype.reason || "Recorded in the selection reference"}` +
        (excludes.length ? `\n- **Not adopted from the prototype:**\n${excludes.map((row) => `  - ${row}`).join("\n")}` : "");
    }
  };
  const context = { workTypes: declared.length ? declared : inferred, language };
  const sections = [];
  // Derived rows count as supplied: settled intake answers are decisions, and
  // failure and test maps read from scenarios and task checks.
  const failureMatrix = derivedFailureMatrix(draft);
  const testMap = derivedTestMap(draft);
  bodies.failureMatrix = () => renderFailureMatrixBody(failureMatrix);
  bodies.testMap = () => renderTestMapBody(testMap);
  for (const row of outlineRowsWithProse("design", { ...draft, decisions, failureMatrix, testMap }, context)) {
    const render = bodies[row.key] || (DESIGN_FIELDS[row.key] ? () => field(row.key) : null);
    const body = [authoredProse(draft, "design", row), render ? String(render() || "").trim() : ""]
      .filter(Boolean).join("\n\n");
    if (!body) continue;
    const heading = DESIGN_MARKER_ROWS.has(row.key) ? row.heading.en : sectionHeading(row, language);
    sections.push(`## ${heading}\n\n${body}`);
  }
  return `# Design\n\n${sections.join("\n\n")}\n`;
}

// The review route a change will take, in words that cannot be misread.
// Review routes by risk tier: every change but a quiet low-tier rapid change
// gets an AI review, so the tier and the model class of its first pass are
// named instead.
export function reviewRouteLabel({
  lowRiskModel = "fast", modelByTier = undefined,
  state = /** @type {Record<string, any>} */ ({}), claims = [], grounding = null
} = {}) {
  const rows = (Array.isArray(claims) ? claims : []).filter((claim) =>
    claim && typeof claim === "object" && Array.isArray(claim.capabilities));
  let signals;
  try { signals = collectReviewSignals(state, { claims: rows }, [], grounding); }
  catch { signals = null; }
  if (!signals) return "risk-tiered AI review (tier set at validation)";
  const riskRoute = classifyReviewRisk({
    state, claims: rows, capabilities: signals.capabilities, grounding,
    requiredTriggers: signals.requiredTriggers
  });
  const { tier } = riskRoute;
  const assembled = assembleReviewPolicy({ state, signals, riskRoute, policy: {} });
  if (!assembled.required)
    return "not required (rapid lane, low tier: deterministic evidence only)";
  const model = reviewModelClass({
    tier, triggers: assembled.triggers,
    declaredReview: Boolean(state.reviewRequired) && !state.reviewKeywordOnly,
    settings: { lowRiskModel, modelByTier }
  });
  return `risk-tiered AI review (${tier} tier, ${model} model)`;
}

// Legacy v1/v2 drafts always declare decisions and keep their rapid lane; a
// semantic draft that authored design content must not lose it to rapid.
export function semanticDraftKeepsDesign(draft, rapid) {
  // Authored content only: a declared work type alone is not design content,
  // and neither is a default the agent recorded without asking. Purely
  // descriptive dev-document sections render compactly in a rapid proposal,
  // so they never move a low-risk change to standard; risk still does.
  return Boolean(rapid) && isSemanticVersion(draft?._semanticVersion) &&
    draftNeedsDesign({
      ...draft, workType: [],
      ...Object.fromEntries(RAPID_DESCRIPTIVE_SECTIONS.map((key) => [key, undefined])),
      decisions: (draft.decisions || []).filter((decision) => !agentDecision(decision))
    });
}

// Dev-document sections that describe the change rather than decide it.
const RAPID_DESCRIPTIVE_SECTIONS = Object.freeze([
  "fileMap", "failureMatrix", "testMap", "componentMap", "userFlow", "configContract", "refactor",
  "bugfix"
]);

export function draftNeedsDesign(draft) {
  return Boolean(
    draft.design || draftHasBlueprints(draft) || draft.prototypeSelection || (draft.diagrams || []).length ||
    (draft.integrations || []).length || (draft.decisions || []).length ||
    intakeDecisions(draft).length || draft.diagram ||
    (draft.assumptions || []).length || (draft.openQuestions || []).length ||
    (draft.risks || []).length ||
    (draft.compatibility && String(draft.compatibility).toLowerCase() !== "none") ||
    (draft.specs || []).some((spec) =>
      String(spec.operation || "added").toLowerCase() === "removed")
  );
}

export function renderDraftTask(task, index) {
  const taskId = task.id || `T${String(index + 1).padStart(3, "0")}`;
  const metadata = [
    task.semanticKey ? `[key:${task.semanticKey}]` : "",
    task.repository ? `[repo:${task.repository}]` : "",
    task.kind ? `[kind:${task.kind}]` : "",
    task.requestedModel || task.model
      ? `[model:${task.requestedModel || task.model}]` : "",
    task.paths?.length ? `[paths:${task.paths.join(",")}]` : "",
    task.dependsOn?.length ? `[depends:${task.dependsOn.join(",")}]` : "",
    task.resources?.length ? `[resources:${task.resources.join(",")}]` : "",
    task.claims?.length ? `[claims:${task.claims.join(",")}]` : "",
    task.inputSchema ? `[input-schema:${task.inputSchema}]` : "",
    task.outputSchema ? `[output-schema:${task.outputSchema}]` : ""
  ].filter(Boolean).join(" ");
  return `- [ ] **${taskId}** ${task.outcome} ${metadata} — verify: \`${task.verify}\``;
}

// Shown by `change start --template` only when the project declares
// repositories besides the control root (nested or trusted siblings): a draft
// that omits the binding compiles every task into root, where their code is
// not built. A read repository is listed with its mode; it owns no edits.
export function repositoryDraftGuidance(repositories = []) {
  const declared = (Array.isArray(repositories) ? repositories : [])
    .filter((row) => row?.id && row.id !== "root" && row.relativePath &&
      row.relativePath !== "." && row.relativePath !== "..");
  if (!declared.length) return {};
  const first = declared.find((row) => row.mode !== "read") || declared[0];
  return {
    minimalDraftRepositories: "This project declares repositories besides root. A task " +
      "whose files live in one names it in 'repository', writes 'paths' and 'verify' " +
      "relative to that repository's root (verify runs there; no cd into it), and the " +
      "draft lists every repository its tasks use in 'repositories' (add root when a task " +
      "edits root files). Omit both for root-only work.",
    declaredRepositories: declared.map((row) => ({ id: row.id, path: row.relativePath,
      ...(row.mode === "read" ? { mode: "read" } : {}) })),
    repositoryExample: {
      repositories: [{ id: first.id, mode: "write" }],
      tasks: [{
        outcome: "Implement and verify the bounded outcome",
        repository: first.id, paths: ["src/**"], verify: "npm test"
      }]
    }
  };
}

export function renderDraftTasks(tasks) {
  return `# Tasks\n\n> This is the sole implementation ledger.\n\n` +
    tasks.map(renderDraftTask).join("\n") + "\n";
}

// A draft without an id is named from its intent; an intent that slugs to
// fewer than three words (a Thai intent slugs to "change") is named from its
// first capability and requirement key so the id stays meaningful.
export function draftChangeId(draft, slugify) {
  if (draft?.id) return slugify(String(draft.id));
  const fromIntent = slugify(String(draft?.intent || ""));
  if (fromIntent.split("-").filter(Boolean).length >= 3) return fromIntent;
  const spec = Array.isArray(draft?.specs) ? draft.specs[0] : null;
  const key = draft?._requirementKeys?.[0] || draft?.claims?.[0]?.requirementKey ||
    spec?.requirement;
  if (!spec?.name || !key) return fromIntent;
  return slugify(`${spec.name}-${key}`);
}

export function groupDraftSpecs(specs, slugify) {
  const grouped = new Map();
  for (const spec of specs) {
    const capability = slugify(spec.name);
    grouped.set(capability, [...(grouped.get(capability) || []), spec]);
  }
  return grouped;
}

export function renderDraftSpecDocument(specs, renderRequirement, { newCapability = false } = {}) {
  const operationOrder = ["added", "modified", "removed"];
  const sections = operationOrder.flatMap((operation) => {
    const requirements = specs.filter((spec) =>
      String(spec.operation || "added").toLowerCase() === operation);
    if (!requirements.length) return [];
    return [`## ${operation.toUpperCase()} Requirements\n\n` +
      requirements.map(renderRequirement).join("\n\n")];
  });
  const lead = specs.find((spec) => spec.title || spec.overview) || specs[0];
  return `${renderSpecHeading(lead, { newCapability })}` +
    `\n\n${sections.join("\n\n")}\n`;
}

// `capabilityExists` reports whether openspec/specs already holds the
// capability; only a new capability's delta states a Purpose.
export function materializeDraftSpecs({
  basePath, specs, slugify, renderRequirement, capabilityExists = (..._args) => true,
  remove = rmSync, makeDirectory = mkdirSync, write = writeFileSync
}) {
  remove(join(basePath, "specs"), { recursive: true, force: true });
  for (const [capability, capabilitySpecs] of groupDraftSpecs(specs, slugify)) {
    const specDir = join(basePath, "specs", capability);
    makeDirectory(specDir, { recursive: true });
    write(join(specDir, "spec.md"),
      renderDraftSpecDocument(capabilitySpecs, renderRequirement,
        { newCapability: !capabilityExists(capability) }));
  }
}

// The approval page is a file the prototype skill writes, never the harness.
// The line names it in the draft's language, or, with no page yet, gives the
// summary as text so the user can still approve from the packet.
export function approvalPackageLine(link) {
  const name = link?.language === "th" ? "หน้าอนุมัติ" : "approval page";
  if (link?.path) return `  ${name}: ${link.path}\n` + (link.warnings || []).map((line) => `  warning: ${line}\n`).join("");
  if (link?.missing)
    return `  ${name}: none yet; the prototype skill writes it (summary below)\n` +
      (link.summary || []).map((line) => `    ${line}\n`).join("");
  if (link?.error) return `  warning: ${name} not checked (${link.error}); review the packet\n`;
  return "";
}
