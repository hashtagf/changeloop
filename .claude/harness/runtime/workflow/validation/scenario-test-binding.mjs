// Every scenario of behavior-changing work names the test file that proves it.
// A task verify that exits 0 proves no particular scenario, and Prove judges
// test discrimination per bound file, so the binding is made at compile time
// and stored with the change. A scenario binds through a testMap row naming
// it (its name, key, or claim id) with a file, or through a test path in a
// task that covers its requirement.
import { lightKind } from "./dev-document.mjs";

export const SCENARIO_TEST_BINDING_VERSION = 1;

const text = (value) => typeof value === "string" ? value.trim() : "";
const rows = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const same = (left, right) => Boolean(text(left)) && text(left).toLowerCase() === text(right).toLowerCase();

const testPaths = (paths) => rows(paths).map(text).filter((path) => path && lightKind(path) === "test");

function rawScenarios(requirement) {
  if (Array.isArray(requirement?.scenarios)) return requirement.scenarios;
  return requirement?.scenario !== undefined ? [requirement.scenario] : [];
}

function scenarioIsRegression(raw) {
  return Boolean(raw && typeof raw === "object" && (raw.regression === true || text(raw.regressionOf)));
}

function testMapFiles(testMap, names) {
  return rows(testMap).filter((row) => text(row?.file) &&
    names.some((name) => same(row?.scenario, name))).map((row) => text(row.file));
}

/**
 * Binding rows for a compiled draft: one per claim of an added or modified
 * requirement, { claimId, requirementKey, scenario, regression, files }.
 */
export function scenarioTestBinding(draft) {
  const keys = rows(draft?._requirementKeys);
  const out = [];
  rows(draft?.specs).forEach((spec, index) => {
    if (text(spec?.operation).toLowerCase() === "removed") return;
    const key = keys[index];
    const raw = rows(draft?.requirements)[index] || {};
    const claims = rows(draft?.claims).filter((claim) => claim?.requirementKey === key);
    rows(spec?.scenarios).forEach((scenario, position) => {
      const claim = claims.find((row) => same(row?.scenario, scenario?.name)) || claims[position];
      const authored = rawScenarios(raw).find((entry) =>
        same(entry?.name, scenario?.name) || same(entry?.key, scenario?.key)) || rawScenarios(raw)[position];
      const names = [scenario?.name, scenario?.key, authored?.key, claim?.id].filter(Boolean);
      const taskFiles = rows(draft?.tasks).filter((task) => claim && rows(task?.claims).includes(claim.id))
        .flatMap((task) => testPaths(task.paths));
      out.push({
        claimId: claim?.id || null,
        requirementKey: key,
        scenario: text(scenario?.name),
        regression: scenarioIsRegression(authored),
        files: unique([...testMapFiles(draft?.testMap, names), ...taskFiles])
      });
    });
  });
  return out;
}

/** EDIT issues: scenarios of behavior-changing work without a bound test file. */
export function scenarioBindingIssues(binding, { behaviorChanging }) {
  if (!behaviorChanging) return [];
  return rows(binding).filter((row) => !row.files.length).map((row) =>
    `scenario '${row.scenario}' of requirement '${row.requirementKey}' has no test file; ` +
    `add a testMap row { scenario: "${row.claimId || row.scenario}", file: "<test file>" } ` +
    "or a test path to the paths of the task that covers this requirement");
}

/**
 * The same check for a Build-time amendment's added requirements, before
 * their claim ids exist. Binding comes from the amendment's testMap or the
 * test paths of added or updated tasks that cover the requirement.
 */
export function amendmentScenarioBindingIssues(amendment, { behaviorChanging }) {
  if (!behaviorChanging) return [];
  const tasks = [...rows(amendment?.addTasks), ...rows(amendment?.updateTasks)];
  const issues = [];
  for (const requirement of rows(amendment?.addRequirements)) {
    const key = text(requirement?.key);
    const taskFiles = tasks.filter((task) => rows(task?.covers).map(text).includes(key))
      .flatMap((task) => testPaths(task.paths));
    for (const scenario of rawScenarios(requirement)) {
      const name = text(scenario?.name) || text(scenario?.when) || text(scenario?.scenario);
      const names = [name, scenario?.key, key && scenario?.key ? `${key}-${scenario.key}` : ""].filter(Boolean);
      if (taskFiles.length || testMapFiles(amendment?.testMap, names).length) continue;
      issues.push(`amendment scenario '${name}' of requirement '${key}' has no test file; ` +
        "add a testMap row { scenario, file } to the amendment or a test path to the paths " +
        "of the added task that covers this requirement");
    }
  }
  return issues;
}

/**
 * The binding after a Build-time amendment. Rows for retired or revised claims
 * are replaced by rows compiled from the amendment's requirements, the
 * amendment's testMap, and the amended ledger's tasks (their [paths:] and
 * [claims:]); every remaining row also gains test paths a task that carries
 * its claim now declares. `ledgerTasks` rows are { claims, paths }.
 */
export function amendedScenarioTestBinding(prior, { draft, testMap, ledgerTasks, retiredClaimIds = [] }) {
  const retired = new Set(rows(retiredClaimIds));
  const replaced = scenarioTestBinding({ ...draft, testMap: [...rows(draft?.testMap), ...rows(testMap)],
    tasks: rows(ledgerTasks) });
  const replacedIds = new Set(replaced.map((row) => row.claimId).filter(Boolean));
  const kept = rows(prior).filter((row) => !retired.has(row.claimId) && !replacedIds.has(row.claimId));
  return [...kept, ...replaced].map((row) => ({
    ...row,
    files: unique([...row.files, ...rows(ledgerTasks)
      .filter((task) => row.claimId && rows(task?.claims).includes(row.claimId))
      .flatMap((task) => testPaths(task.paths))])
  }));
}

/** The persisted form kept on the change's runtime state. */
export function bindingRecord(binding) {
  return { version: SCENARIO_TEST_BINDING_VERSION, rows: rows(binding) };
}
