#!/usr/bin/env node
// Skill contract check: every skill under .claude/skills states its trigger,
// inputs, action, outputs, handoff, and who is responsible (AI does, human
// does, human decides) in a contract.json beside SKILL.md. Skills without one
// are listed in a baseline that may only shrink.
//
//   node scripts/lint/skill-contracts.mjs              check
//   node scripts/lint/skill-contracts.mjs --tighten    drop skills that now have a contract
//
// Repository-only; consumer skills are not checked.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
export const REPO_ROOT = resolve(HERE, "../..");
export const DEFAULT_BASELINE = "quality/baselines/skill-contracts-v1.json";
export const SKILLS_DIR = ".claude/skills";
export const COMMANDS_DIR = ".claude/commands";
export const OUTPUT_KINDS = [
  "agreement", "code", "evidence", "report", "decision-request", "document", "state", "git"
];
// Outputs with consequences a person must own.
export const HUMAN_OWNED_KINDS = new Set(["agreement", "git"]);
const TARGET = /^(?:skill|command):[a-z0-9][a-z0-9-]*$/;

const nonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const stringArray = (value) => Array.isArray(value) && value.every(nonEmptyString);

export function listSkills(root = REPO_ROOT) {
  const dir = join(root, SKILLS_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
}

function targetExists(root, target) {
  if (target === "user") return true;
  const [kind, name] = target.split(":");
  if (kind === "skill") return existsSync(join(root, SKILLS_DIR, name, "SKILL.md"));
  return existsSync(join(root, COMMANDS_DIR, `${name}.md`));
}

// Returns findings [{ skill, path, message }] for one parsed contract.
export function validateContract(skill, contract, root = REPO_ROOT) {
  const findings = [];
  const add = (path, message) => findings.push({ skill, path, message });
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    add("", "contract must be a JSON object");
    return findings;
  }
  if (contract.version !== 1) add("version", "must be 1");
  if (contract.skill !== skill)
    add("skill", `must equal the folder name '${skill}' (found '${contract.skill}')`);
  if (!nonEmptyString(contract.trigger)) add("trigger", "must be a non-empty string naming when the skill starts");
  if (!nonEmptyString(contract.action)) add("action", "must be a non-empty string naming what the skill does");
  if (!stringArray(contract.inputs) || contract.inputs.length === 0)
    add("inputs", "must be a non-empty array of strings naming what the skill reads");

  const kinds = new Set();
  if (!Array.isArray(contract.outputs) || contract.outputs.length === 0) {
    add("outputs", "must be a non-empty array of { kind, description }");
  } else {
    contract.outputs.forEach((output, index) => {
      if (!OUTPUT_KINDS.includes(output?.kind))
        add(`outputs[${index}].kind`, `must be one of ${OUTPUT_KINDS.join(", ")}`);
      else kinds.add(output.kind);
      if (!nonEmptyString(output?.description)) add(`outputs[${index}].description`, "must be a non-empty string");
    });
  }

  const targets = [];
  if (!Array.isArray(contract.handoff)) {
    add("handoff", "must be an array of { to, when } (empty when the skill ends the flow)");
  } else {
    contract.handoff.forEach((handoff, index) => {
      const to = handoff?.to;
      if (typeof to !== "string" || (to !== "user" && !TARGET.test(to)))
        add(`handoff[${index}].to`, "must be skill:<name>, command:<name>, or user");
      else if (!targetExists(root, to))
        add(`handoff[${index}].to`, `'${to}' does not exist in this repository`);
      else targets.push(to);
      if (!nonEmptyString(handoff?.when)) add(`handoff[${index}].when`, "must be a non-empty string");
    });
  }

  const duty = contract.responsibility;
  if (!duty || typeof duty !== "object") {
    add("responsibility", "must be { aiDoes, humanDoes, humanDecides }");
    return findings;
  }
  for (const key of ["aiDoes", "humanDoes", "humanDecides"])
    if (!stringArray(duty[key])) add(`responsibility.${key}`, "must be an array of strings");
  if (stringArray(duty.aiDoes) && duty.aiDoes.length === 0)
    add("responsibility.aiDoes", "must name at least one thing the AI does");
  const decides = stringArray(duty.humanDecides) ? duty.humanDecides.length : 0;
  const does = stringArray(duty.humanDoes) ? duty.humanDoes.length : 0;
  for (const kind of kinds)
    if (HUMAN_OWNED_KINDS.has(kind) && decides === 0)
      add("responsibility.humanDecides",
        `an '${kind}' output needs a named human decision; accountability stays with a person`);
  if (targets.includes("user") && decides + does === 0)
    add("responsibility", "a handoff to the user must say what the person does or decides");
  return findings;
}

export function collect(root = REPO_ROOT) {
  const findings = [];
  const missing = [];
  for (const skill of listSkills(root)) {
    const path = join(root, SKILLS_DIR, skill, "contract.json");
    if (!existsSync(path)) {
      missing.push(skill);
      continue;
    }
    let contract;
    try {
      contract = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      findings.push({ skill, path: "contract.json", message: `is not valid JSON (${error.message})` });
      continue;
    }
    findings.push(...validateContract(skill, contract, root));
  }
  return { findings, missing };
}

export function loadBaseline(path) {
  if (!existsSync(path)) throw new Error(`skill contract baseline is missing: ${path}`);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`skill contract baseline is not valid JSON: ${path} (${error.message})`);
  }
  if (!parsed || parsed.version !== 1 || !stringArray(parsed.withoutContract))
    throw new Error(`skill contract baseline has the wrong shape: ${path}`);
  return parsed;
}

export function compare(baseline, missing) {
  const allowed = new Set(baseline.withoutContract);
  const current = new Set(missing);
  return {
    unlisted: missing.filter((skill) => !allowed.has(skill)),
    stale: baseline.withoutContract.filter((skill) => !current.has(skill))
  };
}

export function tighten(baseline, missing) {
  const current = new Set(missing);
  return { ...baseline, withoutContract: baseline.withoutContract.filter((skill) => current.has(skill)) };
}

function parseArgs(argv) {
  const options = { tighten: false, root: REPO_ROOT, baseline: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--tighten") options.tighten = true;
    else if (arg === "--root") options.root = resolve(argv[++index]);
    else if (arg === "--baseline") options.baseline = argv[++index];
    else throw new Error(`unknown argument: ${arg}`);
  }
  options.baseline = resolve(options.root, options.baseline || DEFAULT_BASELINE);
  return options;
}

export function main(argv = process.argv.slice(2), out = console) {
  let options;
  let baseline;
  try {
    options = parseArgs(argv);
    baseline = loadBaseline(options.baseline);
  } catch (error) {
    out.error(error.message);
    return 2;
  }
  const { findings, missing } = collect(options.root);
  const { unlisted, stale } = compare(baseline, missing);
  if (options.tighten && stale.length) {
    writeFileSync(options.baseline, `${JSON.stringify(tighten(baseline, missing), null, 2)}\n`);
    out.log(`skill contracts: removed ${stale.length} skill(s) from the baseline`);
  }
  let status = 0;
  if (findings.length) {
    out.error(`skill contracts: ${findings.length} invalid field(s)`);
    for (const finding of findings)
      out.error(`  ${finding.skill}/contract.json ${finding.path}: ${finding.message}`);
    status = 1;
  }
  if (unlisted.length) {
    out.error(`skill contracts: ${unlisted.length} skill(s) without contract.json`);
    for (const skill of unlisted)
      out.error(`  ${skill}: add ${SKILLS_DIR}/${skill}/contract.json stating trigger, inputs, ` +
        "action, outputs, handoff, and responsibility");
    status = 1;
  }
  if (stale.length && !options.tighten) {
    out.error(`skill contracts: ${stale.length} baseline skill(s) now have a contract or no longer exist. ` +
      "Run `node scripts/lint/skill-contracts.mjs --tighten` and commit the baseline.");
    for (const skill of stale) out.error(`  ${skill}`);
    status = 1;
  }
  if (status === 0)
    out.log(`skill contracts: ${listSkills(options.root).length - missing.length} contract(s) valid, ` +
      `${missing.length} skill(s) in the baseline`);
  return status;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = main();
