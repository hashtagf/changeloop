// A selected prototype becomes part of the approved agreement: the file is
// copied into the packet, so the approval identity (which hashes every packet
// byte) binds it, and a binding record names the requirements, claims, and
// tasks it constrains. Build reads the copy; Prove compares against it.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { unique } from "../../core/values.mjs";
import { providerCapability } from "../../evidence/provider-catalog.mjs";
import { relativeInside } from "../../core/paths.mjs";

export const PROTOTYPE_DIR = "prototype";
export const PROTOTYPE_BINDING = `${PROTOTYPE_DIR}/binding.json`;
export const PROTOTYPE_MODES = Object.freeze(["strict", "advisory"]);

const text = (value) => typeof value === "string" && value.trim() ? value.trim() : "";

export function prototypeMode(selection) {
  return text(selection?.mode) || "strict";
}

export function prototypeCovers(selection) {
  return Array.isArray(selection?.covers) ? unique(selection.covers.map(text).filter(Boolean)) : [];
}

// Prototype elements the agreement does not adopt ("BETA banner: legal forbids
// it"). The visual reviewer never asks for them and treats their presence in
// the real UI as a blocker, so a forbidden element is decided by the approved
// agreement, not by a reviewer's severity guess.
export function prototypeExcludes(selection) {
  return Array.isArray(selection?.excludes) ? unique(selection.excludes.map(text).filter(Boolean)) : [];
}

// Shape, link, and wiring issues. Existence and containment of the reference
// are checked with the other referenced files. `providers` are the draft's
// execution providers.
export function prototypeSelectionIssues(selection, requirementKeys = [], providers = {}) {
  if (selection === undefined) return [];
  const issues = [];
  if (selection?.mode !== undefined && !PROTOTYPE_MODES.includes(selection.mode))
    issues.push(`semantic draft prototypeSelection.mode must be ${PROTOTYPE_MODES.join("|")}`);
  if (selection?.covers !== undefined && (!Array.isArray(selection.covers) ||
      selection.covers.some((value) => !text(value))))
    issues.push("semantic draft prototypeSelection.covers must be an array of requirement keys");
  else {
    const known = new Set(requirementKeys);
    const unknown = prototypeCovers(selection).filter((key) => !known.has(key));
    if (unknown.length)
      issues.push(`semantic draft prototypeSelection.covers names unknown requirement keys: ${unknown.join(", ")}`);
  }
  if (selection?.excludes !== undefined && (!Array.isArray(selection.excludes) ||
      selection.excludes.some((value) => !text(value))))
    issues.push("semantic draft prototypeSelection.excludes must be an array of prototype elements " +
      "the agreement does not adopt, each with its reason");
  issues.push(...prototypeWiringIssues(selection, providers));
  return issues;
}

// The wiring a strict binding owes, as one copyable snippet: the project's
// screenshot command feeds the harness-owned visual reviewer.
export const VISUAL_WIRING_EXAMPLE = Object.freeze({
  browser: { adapter: "command", command: ["node", "scripts/screenshot.mjs"], capability: "browser",
    inputMode: "browser-automation" },
  visual: { capability: "visual", screenshots: ["test-results/**"], dependsOn: ["browser"] }
});

// A strict binding makes `visual` required, and the reviewer sees only the
// screenshots a project provider writes. Without that wiring the change could
// not prove itself, so the draft says so at Change instead of at Prove.
export function prototypeWiringIssues(selection, providers = {}) {
  if (!selection || !text(selection.reference) || prototypeMode(selection) !== "strict") return [];
  const entries = Object.entries(providers && typeof providers === "object" ? providers : {});
  const visual = entries.filter(([name, config]) => providerCapability(name, config) === "visual");
  const fed = visual.some(([, config]) => Array.isArray(config?.screenshots) &&
    config.screenshots.some((value) => text(value)) &&
    (config.command || (Array.isArray(config.dependsOn) && config.dependsOn.length &&
      config.dependsOn.every((name) => entries.some(([other]) => other === name)))));
  if (fed) return [];
  return ["semantic draft prototypeSelection is strict, so the change must screenshot the bound screens: " +
    "add to execution.providers a screenshot provider and the visual provider that depends on it, for example " +
    `${JSON.stringify(VISUAL_WIRING_EXAMPLE)} (use the project's own command that saves PNGs), ` +
    "or set prototypeSelection.mode 'advisory' when the prototype is only a guide"];
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function containedFile(root, reference) {
  const refused = () =>
    new Error("prototypeSelection.reference must be an existing regular file inside the project");
  let canonical;
  let project;
  try {
    project = realpathSync(root);
    canonical = realpathSync(isAbsolute(reference) ? reference : resolve(root, reference));
  } catch { throw refused(); }
  const rel = relative(project, canonical);
  if (!rel || !relativeInside(rel) || !statSync(canonical).isFile()) throw refused();
  return canonical;
}

// Copies the reference into <packet>/prototype/ and writes the binding record.
// Without a selection, any earlier copy is removed so a revision that drops
// the prototype leaves no stale binding.
export function materializePrototype({ root, basePath, selection, claims = [], tasks = [] }) {
  const dir = join(basePath, PROTOTYPE_DIR);
  if (!selection || !text(selection.reference)) {
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    return null;
  }
  const source = containedFile(root, selection.reference);
  const name = basename(source) === "binding.json" ? "prototype-binding.json" : basename(source);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const target = join(dir, name);
  copyFileSync(source, target);
  const requirements = prototypeCovers(selection);
  const wanted = new Set(requirements);
  const bound = claims.filter((claim) => wanted.has(text(claim?.requirementKey)));
  const claimIds = unique(bound.map((claim) => claim.id)).sort();
  // What the reviewer must hold the screens to besides the picture: the
  // approved scenario of every bound claim.
  const agreement = claimIds.map((id) => {
    const claim = bound.find((row) => row.id === id);
    return { claim: id, requirement: text(claim?.requirementKey), scenario: text(claim?.scenario) };
  }).filter((row) => row.scenario);
  const excludes = prototypeExcludes(selection);
  const claimSet = new Set(claimIds);
  const taskIds = unique(tasks.filter((task) => (task?.claims || []).some((id) => claimSet.has(id)))
    .map((task) => task.id)).sort();
  const binding = {
    version: 1,
    file: `${PROTOTYPE_DIR}/${name}`,
    source: relative(realpathSync(root), source).split("\\").join("/"),
    sha256: sha256(target),
    mode: prototypeMode(selection),
    requirements,
    claims: claimIds,
    tasks: taskIds,
    ...(agreement.length ? { agreement } : {}),
    ...(excludes.length ? { excludes } : {})
  };
  writeFileSync(join(basePath, PROTOTYPE_BINDING), `${JSON.stringify(binding, null, 2)}\n`);
  return binding;
}

// The binding of a compiled packet, or null. A copy whose bytes no longer match
// the recorded digest is reported, never silently trusted.
export function readPrototypeBinding(basePath) {
  const path = join(basePath, PROTOTYPE_BINDING);
  if (!existsSync(path)) return null;
  let binding;
  try { binding = JSON.parse(readFileSync(path, "utf8")); }
  catch { return null; }
  if (!binding || binding.version !== 1 || !text(binding.file)) return null;
  const file = join(basePath, binding.file);
  const present = existsSync(file);
  return {
    ...binding,
    path: file,
    present,
    intact: present && sha256(file) === binding.sha256
  };
}
