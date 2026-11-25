// Every scenario must be provable where it is placed. A scenario whose
// covering tasks all live in one repository can only be proved by tests in
// that repository; when it describes another repository working for real, the
// agent can only fake that collaborator or import across repositories, and
// the review then sends the work back. The harness reads the draft once:
// - clear: the scenario names another declared repository AND says the real
//   thing runs (real, wired, end-to-end, integration, ...) -> a draft issue;
// - unclear: it names another repository without that, or describes a real
//   external system (database, HTTP, queue, browser, restart, concurrency)
//   for a single-repository task -> a design warning the agent decides on.
// A task in a repository that contains the other (the root, a superproject)
// can reach it, so nothing is reported there.
const REAL = /\b(real|actual|wired|production|end[- ]to[- ]end|e2e|integration|integrated|together)\b/i;
const EXTERNAL = /\b(database|postgres|mysql|sqlite|mongo\w*|redis|http server|real http|api server|queue|kafka|sqs|rabbitmq|browser|restart(?:s|ed)?|concurren\w*|two (?:servers|processes|instances))\b/i;

const text = (value) => typeof value === "string" ? value.trim() : "";
const list = (value) => Array.isArray(value) ? value.map(text).filter(Boolean)
  : text(value) ? [text(value)] : [];

function scenarioText(scenario) {
  if (!scenario || typeof scenario !== "object") return text(scenario);
  return ["name", "given", "when", "then", "outcome"].map((field) => text(scenario[field])).join(" ");
}

function scenariosOf(requirement) {
  return Array.isArray(requirement?.scenarios) ? requirement.scenarios
    : requirement?.scenario !== undefined ? [requirement.scenario] : [];
}

function contains(outer, inner) {
  if (outer === ".") return true;
  return inner === outer || inner.startsWith(`${outer}/`);
}

// `issues`, when given, receives the draft issues too (the draft compiler's list).
export function scenarioPlacement(source, { repositories = [] } = {}, issues = []) {
  const warnings = [];
  const catalog = new Map((Array.isArray(repositories) ? repositories : [])
    .filter((row) => text(row?.id) && text(row.id) !== "root")
    .map((row) => [text(row.id), text(row.path).replace(/^\.\/|\/$/g, "") || text(row.id)]));
  if (!catalog.size) return { issues, warnings };
  const pathOf = (id) => id === "root" ? "." : catalog.get(id) ?? null;
  const tasks = Array.isArray(source?.tasks) ? source.tasks : [];
  for (const [index, requirement] of (Array.isArray(source?.requirements) ? source.requirements : []).entries()) {
    const key = text(requirement?.key);
    if (!key) continue;
    const covering = tasks.filter((task) =>
      [...list(task?.covers), ...list(task?.requirement), ...list(task?.requirements)].includes(key));
    if (!covering.length) continue;
    const homes = [...new Set(covering.map((task) => text(task?.repository) || "root"))];
    if (homes.length !== 1) continue;
    const home = homes[0];
    const homePath = pathOf(home);
    if (homePath === null || homePath === ".") continue;
    for (const [scenarioIndex, scenario] of scenariosOf(requirement).entries()) {
      const body = scenarioText(scenario);
      const name = text(scenario?.name) || `scenarios[${scenarioIndex}]`;
      const others = [...catalog.keys()].filter((id) => id !== home &&
        !contains(homePath, pathOf(id)) && new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(body));
      const label = `requirements[${index}] '${key}' scenario '${name}'`;
      if (others.length && REAL.test(body)) {
        issues.push(`semantic draft ${label} needs the real ${others.join(", ")} but only ` +
          `repository '${home}' covers it; a test there can only fake ${others.length > 1 ? "them" : "it"} ` +
          "or import another repository. Cover it with a task where the repositories are composed " +
          "(the root, with the repositories it needs), or reword it to this repository's side of the contract");
      } else if (others.length) {
        warnings.push(`${label} names ${others.join(", ")} but only repository '${home}' covers it; ` +
          "test this repository's side only, or move it to a task where the repositories are composed");
      } else if (EXTERNAL.test(body)) {
        warnings.push(`${label} describes ${body.match(EXTERNAL)[0]}; prove it with a test that runs ` +
          "it for real (declare the integration) rather than a fake in a unit test");
      }
    }
  }
  return { issues, warnings };
}
