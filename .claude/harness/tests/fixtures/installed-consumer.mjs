// One installed consumer per test process, copied for every fixture.
//
// Fixtures that only need "an empty project with Change Loop installed" used to
// run install.sh for every test (4-6s each, far more on a loaded runner). The
// installer suites still run install.sh for real; this helper is only for
// tests whose subject is the harness after installation.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

// A host session exports its project, identity, phase, and guardrail mode into
// agent shells. A suite run alone (or as a Build task check) would otherwise
// point install.sh and every fixture command at the caller's project, which the
// runtime refuses. Same list as .claude/tests/lib/assert.sh; run-all clears them too.
export const HOST_SESSION_VARIABLES = Object.freeze([
  "CLAUDE_PROJECT_DIR", "CLAUDE_FOUNDATION_PROJECT",
  "FOUNDATION_HOST", "FOUNDATION_HOST_COMMAND", "FOUNDATION_HOST_ARGUMENTS",
  "FOUNDATION_SESSION_ID", "FOUNDATION_MAIN_IDENTITY", "FOUNDATION_GUARDRAIL_MODE",
  "FOUNDATION_MODEL_ID", "FOUNDATION_MAIN_PROVIDER_FAMILY",
  "FOUNDATION_CLAUDE_SESSION_ID", "FOUNDATION_CLAUDE_TRANSCRIPT_PATH",
  "FOUNDATION_ACTIVE_PHASE", "FOUNDATION_WORKSPACE_ROOT", "FOUNDATION_ALLOWED_PATHS_JSON"
]);
for (const name of HOST_SESSION_VARIABLES) delete process.env[name];
const templates = new Map();
let cacheRoot = null;

function templateFor(sourceRoot, git) {
  const key = `${sourceRoot}\0${git ? "git" : "plain"}`;
  if (templates.has(key)) return templates.get(key);
  if (!cacheRoot) {
    cacheRoot = mkdtempSync(join(tmpdir(), "foundation-installed-template-"));
    process.once("exit", () => rmSync(cacheRoot, { recursive: true, force: true }));
  }
  const template = join(cacheRoot, `t${templates.size}`);
  mkdirSync(template, { recursive: true });
  const run = (command, args, cwd) => execFileSync(command, args, {
    cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]
  });
  if (git) run("git", ["init", "-q"], template);
  run("bash", [join(sourceRoot, "install.sh"), template, "--source", sourceRoot, "--yes"],
    sourceRoot);
  templates.set(key, template);
  return template;
}

// Produces exactly what `git init -q` (when `git`) followed by
// `install.sh <project> --source <sourceRoot> --yes` produces in an empty
// directory: the installed files, the staged index, and the CLI shim (which
// points at the source checkout, identical for every copy).
export function installConsumer(project, { sourceRoot = SOURCE_ROOT, git = true } = {}) {
  if (existsSync(project) && readdirSync(project).length)
    throw new Error(`installConsumer needs an empty project directory: ${project}`);
  cpSync(templateFor(sourceRoot, git), project, { recursive: true });
}
