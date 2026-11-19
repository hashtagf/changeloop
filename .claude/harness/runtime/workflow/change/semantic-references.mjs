// The files and scenarios a semantic draft refers to: local references must
// be regular files inside the project, and draft scenarios are normalized
// before the agreement is compiled.
import { readFileSync, realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { prototypeSelectionIssues } from "../prototype/prototype-binding.mjs";
import { productHandoffCoverage, productHandoffShapeIssues } from "../validation/product-handoff.mjs";

export function createSemanticReferences({
  fail, pathInside, root
}) {
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
    const handoffIssues = productHandoffShapeIssues(draft.productHandoff);
    issues.push(...handoffIssues);
    for (const field of ["prd", "uxui"])
      if (!handoffIssues.length && typeof draft.productHandoff?.[field] === "string" && draft.productHandoff[field].trim())
        referencedPaths.push([`productHandoff.${field}`, draft.productHandoff[field]]);
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
    if (draft.productHandoff && !handoffIssues.length && !issues.some((issue) => issue.includes("productHandoff.")))
      issues.push(...handoffCoverageIssues(draft));
    const requirementKeys = draft._requirementKeys?.length ? draft._requirementKeys
      : (draft.claims || []).map((claim) => claim?.requirementKey).filter(Boolean);
    issues.push(...prototypeSelectionIssues(draft.prototypeSelection, requirementKeys, draft.execution?.providers));
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

  // Every in-scope PRD and uxui.md item must land in the change or be
  // excluded with a reason; the coverage is kept for the proposal.
  function handoffCoverageIssues(draft) {
    const read = (field) => typeof draft.productHandoff[field] === "string" && draft.productHandoff[field].trim()
      ? readFileSync(resolve(root, draft.productHandoff[field]), "utf8") : null;
    const coverage = productHandoffCoverage(draft, draft.productHandoff, { prdText: read("prd"), uxuiText: read("uxui") });
    const documents = ["prd", "uxui"].map((field) => draft.productHandoff[field]).filter(Boolean).map((path) => `\`${path}\``).join(", ");
    Object.defineProperty(draft, "_productHandoffCoverage", { value: { ...coverage, documents }, enumerable: false, configurable: true });
    return coverage.issues;
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

  return { semanticReferenceIssues, validateSemanticReferences, normalizedDraftScenarios };
}
