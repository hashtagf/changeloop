import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const guides = [
  "README.md", "README.th.md", "AGENTS.md", "CLAUDE.md", "CONTRIBUTING.md",
  ".claude/tests/README.md", "docs/reports/README.md", "docs/documentation-ownership.md",
  "docs/shipping-boundary.md", "docs/repository-map.md"
];
const withoutFences = body => body.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, "");

test("first-run guides stay within their documented reading budgets", () => {
  const policy = read("docs/documentation-ownership.md");
  // Read the budgets from their canonical policy, rather than maintaining a
  // second configuration that can silently disagree with the instructions.
  const readmeLimit = Number(policy.match(/root README at \*\*(\d+) lines or fewer\*\*/)?.[1]);
  const quickstartLimit = Number(policy.match(/website quickstart\n\s*at \*\*(\d+) lines or fewer\*\*/)?.[1]);
  assert.ok(readmeLimit > 0 && quickstartLimit > 0, "reading budgets must be explicit");
  for (const [file, limit] of [
    ["README.md", readmeLimit], ["README.th.md", readmeLimit],
    ["website/docs/src/content/docs/quickstart.md", quickstartLimit],
    ["website/docs/src/content/docs/th/quickstart.md", quickstartLimit]
  ]) {
    const lines = read(file).split(/\r?\n/).filter(line =>
      line.trim() && !/^\s*<a id="[^"]+"><\/a>\s*$/.test(line));
    assert.ok(lines.length <= limit,
      `${file}: ${lines.length}/${limit} lines; move detail to its canonical reference`);
  }
});

test("every website documentation page has an English and Thai counterpart", () => {
  const base = resolve(root, "website/docs/src/content/docs");
  const files = readdirSync(base, { recursive: true })
    .filter(file => /\.mdx?$/.test(file)).map(file => file.replaceAll("\\", "/"));
  assert.ok(files.length > 0);
  const en = files.filter(file => !file.startsWith("th/")).sort();
  const th = files.filter(file => file.startsWith("th/")).map(file => file.slice(3)).sort();
  assert.deepEqual(th, en, "all pages, including pages outside the sidebar, need both locales");
});

function anchors(body) {
  const ids = new Set([...body.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const counts = new Map();
  for (const [, heading] of withoutFences(body).matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const slug = heading.trim().toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}_\-\s]/gu, "").replace(/\s/g, "-");
    const count = counts.get(slug) || 0;
    counts.set(slug, count + 1);
    ids.add(count ? `${slug}-${count}` : slug);
  }
  return ids;
}

test("entry-guide local links resolve after documentation moves", () => {
  for (const file of guides) {
    for (const [, href] of withoutFences(read(file)).matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) continue;
      const [path, fragment] = href.split("#");
      const target = path ? resolve(root, dirname(file), decodeURIComponent(path)) : resolve(root, file);
      assert.ok(existsSync(target), `${file}: missing target ${href}`);
      if (fragment && statSync(target).isFile() && /\.mdx?$/.test(target)) {
        assert.ok(anchors(readFileSync(target, "utf8")).has(decodeURIComponent(fragment)),
          `${file}: missing section ${href}`);
      }
    }
  }
});

test("agent and contributor entrypoints reach the canonical documentation policy", () => {
  for (const file of ["AGENTS.md", "CONTRIBUTING.md"]) {
    assert.ok(read(file).includes("docs/documentation-ownership.md"), file);
  }
});

test("all website pages declare a matching reader category in both languages", () => {
  const base = "website/docs/src/content/docs/";
  const files = readdirSync(resolve(root, base), { recursive: true })
    .filter(file => /\.mdx?$/.test(file)).map(file => file.replaceAll("\\", "/"));
  const allowed = new Set(["users", "project-maintainers", "agents-integrators"]);
  const audience = body => [...body.matchAll(/<!-- docs-audience: ([a-z-]+) -->/g)]
    .map(match => match[1]);
  for (const file of files) {
    const body = read(base + file);
    const roles = audience(body);
    assert.equal(roles.length, 1, `${file}: declare exactly one reader category`);
    assert.ok(allowed.has(roles[0]), `${file}: unknown audience ${roles[0]}`);
    assert.ok(body.includes(file.startsWith("th/") ? "**ผู้อ่าน:**" : "**Audience:**"),
      `${file}: the reader must see the classification`);
    if (!file.startsWith("th/")) {
      assert.deepEqual(audience(read(base + "th/" + file)), roles, `${file}: locale audience drift`);
    }
  }
});

test("the ownership reference covers the actual installer-managed surface", () => {
  const managedBlock = read("install.sh").match(/^MANAGED=\(\n([\s\S]*?)^\)/m)?.[1];
  assert.ok(managedBlock, "installer ownership must be inspectable");
  const managed = [...managedBlock.matchAll(/"([^"]+)"/g)].map(match => match[1]);
  const reference = read(".claude/harness/README.md");
  const row = reference.split("\n").find(line => line.startsWith("| Installed product |"));
  assert.ok(row, "ownership needs a distinct installed-product category");
  const documented = [...row.split("|")[2].matchAll(/`([^`]+)`/g)].map(match => match[1]);
  assert.deepEqual(documented.sort(), managed.sort(), "ownership table must match MANAGED exactly");
  const projectRow = reference.split("\n").find(line =>
    line.startsWith("| Project instructions and host settings |"));
  for (const file of ["CLAUDE.md", "AGENTS.md", ".claude/settings.json"]) {
    assert.ok(projectRow?.includes(`\`${file}\``), `${file}: must remain project-owned`);
    assert.equal(managed.includes(file), false, `${file}: must not be overwritten wholesale`);
  }
});

test("live artifact guides do not treat runtime storage as disposable or uniformly generated", () => {
  for (const file of [
    "website/docs/src/content/docs/artifacts.md",
    "website/docs/src/content/docs/th/artifacts.md",
    ".foundation/README.md"
  ]) {
    const body = read(file);
    assert.doesNotMatch(body, /safe to delete between changes|ลบทิ้งระหว่าง change ได้อย่างปลอดภัย/);
    assert.doesNotMatch(body, /Everything under `\.foundation\/` is generated/);
    for (const input of ["drafts/", "policy.json"]) assert.ok(body.includes(input), `${file}: ${input}`);
    assert.ok(body.includes("file-ownership-and-writers"), `${file}: canonical ownership link`);
  }
});

// WORKFLOW.md keeps the lifecycle overview and cross-cutting rules; each phase's
// full contract lives in one installed file, and the old phase anchors still
// open a heading in WORKFLOW.md that links on.
test("each lifecycle phase has one linked contract file and every link into them resolves", () => {
  const phases = ["investigate", "change", "build", "prove", "land", "deliver"];
  const lifecycle = phases.map(phase => `.claude/harness/lifecycle/${phase}.md`);
  const workflow = read("WORKFLOW.md");
  for (const path of lifecycle) {
    assert.ok(existsSync(resolve(root, path)), `${path} exists`);
    assert.ok(workflow.includes(`](${path})`), `WORKFLOW.md links ${path}`);
  }
  for (const anchor of ["land-change", "deliver-change-optional", "blocking-policy", "investigate-problem"])
    assert.ok(anchors(workflow).has(anchor), `WORKFLOW.md#${anchor} still resolves`);
  // Every tracked Markdown document whose link targets WORKFLOW.md or a
  // lifecycle file, plus every local link inside those files. Archived
  // changes and dated reports are historical records and keep their links.
  // Tracked and untracked-but-not-ignored files: Land leaves new documents
  // uncommitted, and Prove runs this test on that tree.
  const listed = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "*.md"],
    { cwd: root, encoding: "utf8" });
  assert.equal(listed.status, 0, "git ls-files");
  const documents = [...new Set([...listed.stdout.split("\0"), "WORKFLOW.md", ...lifecycle])].filter(file => file && existsSync(resolve(root, file)) &&
    !/^(?:openspec\/changes\/archive\/|docs\/reports\/|docs\/changelog-history\.md$|CHANGELOG\.md$|\.claude\/tests\/bench\/tasks\/)/.test(file));
  const targets = new Set(["WORKFLOW.md", ...lifecycle].map(file => resolve(root, file)));
  const own = new Set(["WORKFLOW.md", ...lifecycle]);
  const broken = [];
  for (const file of documents) {
    for (const [, link] of withoutFences(read(file)).matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      // The website links the canonical files on GitHub; check those against
      // the repository root like local links.
      const github = link.match(/^https:\/\/github\.com\/hashtagf\/changeloop\/blob\/main\/(.+)$/);
      const href = github ? github[1] : link;
      if (!github && (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//"))) continue;
      const [rawPath, rawAnchor] = href.split("#");
      const path = decodeURIComponent(rawPath);
      const resolved = github ? resolve(root, path)
        : path ? resolve(root, dirname(file), path) : resolve(root, file);
      if (!own.has(file) && !targets.has(resolved)) continue;
      // A link that leaves the repository only resolves by accident (for
      // example from a sandbox nested inside another checkout).
      if (!resolved.startsWith(`${root}/`) || !existsSync(resolved)) {
        broken.push(`${file}: ${link}`); continue;
      }
      const anchor = rawAnchor && decodeURIComponent(rawAnchor);
      if (anchor && resolved.endsWith(".md") && !anchors(readFileSync(resolved, "utf8")).has(anchor))
        broken.push(`${file}: ${link}`);
    }
  }
  assert.deepEqual(broken, [], "links into the lifecycle contract must resolve");
});
