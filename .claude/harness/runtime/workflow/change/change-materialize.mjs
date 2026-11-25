import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { DRAFT_FOLDER_VERSION } from "../draft/draft-folder.mjs";
import {
  MINIMAL_DRAFT_WRITING, minimalDraftFolderTemplate, semanticDraftTemplate
} from "../draft/semantic-draft-templates.mjs";
import { unknownTaskFieldWarnings } from "../draft/semantic-draft-tasks.mjs";
import { isRecordedSemanticVersion, isSemanticVersion } from "../validation/draft-version.mjs";
import { FIXES_DIMENSIONS, riskSignalDimensions } from "../validation/semantic-intake.mjs";
import { materializePrototype } from "../prototype/prototype-binding.mjs";
import { handoffRecordFor, writeHandoffRecord } from "../validation/handoff-binding.mjs";
import { designBlueprintWarnings, verifyCountAdvisories } from "../validation/design-blueprints.mjs";
import { docsOnlyDraft, withNewPaths } from "../validation/dev-document.mjs";
import { readerGuideWarnings } from "../validation/reader-guide.mjs";
import { plainLanguageWarnings } from "../validation/plain-language.mjs";
import { completenessWarnings } from "../validation/completeness-checklist.mjs";
import {
  draftNeedsDesign, materializeDraftSpecs, renderDraftDesign, renderDraftProposal,
  renderDraftTasks, repositoryDraftGuidance, reviewRouteLabel
} from "../draft/draft-packet-render.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import {
  initialChangeState, materializeChangeTemplates, v5QualityGrounding
} from "./change-start-values.mjs";

export function createChangeMaterializer(ctx) {
  const {
    assertChangeAvailable, bindClaudeSession, canonicalSpecText, changePath,
    declaredRepositories, fail, gitHead, initialBudget, instantiate, loadRuntime, now,
    preexistingDirty, readJson, renderDraftRequirement, root, saveRuntime,
    setOperationChangeId, slugify, templateDir, workflowPolicy, writeJson
  } = ctx;

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
    semantic = bestEffort(() => isRecordedSemanticVersion(loadRuntime(id)?.semanticDraftVersion), semantic);
    if (!files.some((file) => file.includes("/specs/")))
      lines.push(semantic
        ? "  specs: none (docs-only change; it modifies no living spec)\n"
        : "  specs: none (legacy rapid packet without delta specs)\n");
    // The task list, so the agent can start Build without opening tasks.md.
    bestEffort(() => {
      for (const line of readFileSync(join(base, "tasks.md"), "utf8").split("\n")) {
        const task = line.match(/^\s*-\s*\[[ xX]\]\s*\*{0,2}(T\d+)\*{0,2}\s*(.*)$/);
        if (!task) continue;
        // Drop the bracketed ledger metadata; keep the outcome and its verify.
        const summary = task[2].replace(/\s*\[[a-z-]+:[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
        lines.push(`  task: ${task[1]} ${summary.slice(0, 200)}\n`);
      }
    });
    return lines.join("");
  }

  // `source` is the authored draft: unknown task fields are gone after
  // normalization. Every schema prints them; they never block.
  function designWarningLines(draft, schema, source = draft) {
    if (!isSemanticVersion(draft._semanticVersion)) return "";
    const verify = verifyCountAdvisories(draft.tasks)
      .map((warning) => `  verify advisory: ${warning}\n`).join("") +
      unknownTaskFieldWarnings(source).map((warning) => `  task warning: ${warning}\n`).join("");
    // Every lane: a business reader opens every proposal, and the open
    // completeness questions are cheapest to answer before Build.
    const always = completenessWarnings(draft);
    if (schema !== "foundation-standard")
      return [...plainLanguageWarnings(draft, (key) => draft?.prose?.proposal?.[key] || ""), ...always]
        .map((warning) => `  design warning: ${warning}\n`).join("") + verify;
    return [...designBlueprintWarnings(draft), ...readerGuideWarnings(draft), ...always]
      .map((warning) => `  design warning: ${warning}\n`).join("") + verify;
  }

  // Summarize the repository selection and use the same review label as resolve.
  function proposalContext(draft, state) {
    const declared = declaredRepositories().map((row) => row.id);
    const used = new Set([
      ...(Array.isArray(draft.repositories) ? draft.repositories : [])
        .map((entry) => (typeof entry === "string" ? entry : entry?.id)),
      ...(draft.tasks || []).map((task) => task.repository || "root")
    ].filter(Boolean));
    const policy = workflowPolicy();
    return {
      selectedRepositories: declared.length ? [...used] : [],
      hasUnselectedRepositories: declared.some((repository) => !used.has(repository)),
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
    writeHandoffRecord(basePath, handoffRecordFor(root, draft, draft.productHandoff));
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
    hasSpecs = bestEffort(() => readdirSync(join(target, "specs"), { withFileTypes: true })
        .some((entry) => entry.isDirectory() && existsSync(join(target, "specs", entry.name, "spec.md"))), hasSpecs);
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

  return {
    createChange, designWarningLines, materializeDraft, materializeStandardArtifacts,
    packetFileLines, rapidStartTemplate
  };
}
