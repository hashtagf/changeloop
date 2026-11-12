import {
  existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

function insideSandboxCopy(path) {
  const segments = path.split(sep);
  return segments.some((segment, index) => segment === ".foundation" &&
    ["sandboxes", "repository-sandboxes"].includes(segments[index + 1]));
}

// The project that owns a path: a sandbox copy belongs to the project whose
// .foundation/ holds it.
function owningTree(path) {
  const segments = path.split(sep);
  const index = segments.findIndex((segment, at) => segment === ".foundation" &&
    ["sandboxes", "repository-sandboxes"].includes(segments[at + 1]));
  return index === -1 ? path : segments.slice(0, index).join(sep) || sep;
}

function inside(parent, candidate) {
  const rel = relative(parent, candidate);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

// CLAUDE_FOUNDATION_PROJECT is a host-session export (the Pi adapter sets it
// for every agent shell), so it leaks into commands run in other projects such
// as test fixtures. Honor it only when the caller's cwd or this runtime lives
// in the pinned project's tree; otherwise refuse rather than change another
// repository than the one the command runs in.
function findRoot({ start, pinned, harness, fail, warn }) {
  if (pinned) {
    const root = walkRoot({ start, pinned, fail, warn });
    const tree = owningTree(canonicalPath(root));
    const anchors = [start, harness].filter(Boolean).map(canonicalPath);
    if (anchors.some((anchor) => inside(tree, anchor))) return root;
    fail(`CLAUDE_FOUNDATION_PROJECT pins ${root}, but this command runs in ` +
      `${canonicalPath(start)}${harness ? ` with the runtime at ${canonicalPath(harness)}` : ""}; ` +
      `refusing to change a different project. Unset CLAUDE_FOUNDATION_PROJECT ` +
      `or run the command from the pinned project`);
  }
  return walkRoot({ start, pinned, fail, warn });
}

function walkRoot({ start, pinned, fail, warn }) {
  let cursor = resolve(pinned || start);
  for (;;) {
    if (existsSync(join(cursor, "openspec", "config.yaml")) &&
        existsSync(join(cursor, ".claude", "harness", "foundation.mjs"))) {
      if (pinned || !insideSandboxCopy(cursor)) return cursor;
      warn(`claude-foundation: control-plane state resolves at the project root; ` +
        `provider commands still execute in the registered change sandbox (found sandbox copy at ${cursor})`);
    }
    const parent = dirname(cursor);
    if (parent === cursor) fail("not inside a Foundation project");
    cursor = parent;
  }
}

function canonicalPath(path) {
  const absolute = resolve(path);
  return existsSync(absolute) ? realpathSync(absolute) : absolute;
}

export function createBootstrap({ start, pinned, harness = null, fail, failRoot = fail, warn = console.error }) {
  const root = canonicalPath(findRoot({ start, pinned, harness, fail: failRoot, warn }));
  const paths = {
    runtime: join(root, ".foundation", "runtime"),
    receipts: join(root, ".foundation", "receipts"),
    logs: join(root, ".foundation", "logs"),
    evidenceVault: join(root, ".foundation", "evidence"),
    snapshots: join(root, ".foundation", "snapshots"),
    transactions: join(root, ".foundation", "transactions"),
    plans: join(root, ".foundation", "plans"),
    leases: join(root, ".foundation", "leases"),
    prototypes: join(root, ".foundation", "prototypes"),
    packages: join(root, ".foundation", "packages"),
    previews: join(root, ".foundation", "previews"),
    attestations: join(root, ".foundation", "attestations"),
    authority: join(root, ".foundation", "authority"),
    reviews: join(root, ".foundation", "reviews"),
    handoffs: join(root, ".foundation", "handoffs"),
    instructionManifests: join(root, ".foundation", "instruction-manifests"),
    recovery: join(root, ".foundation", "recovery"),
    deliveries: join(root, ".foundation", "deliveries"),
    changes: join(root, "openspec", "changes")
  };
  for (const name of [
    "runtime", "receipts", "logs", "evidenceVault", "snapshots", "transactions",
    "plans", "leases", "attestations", "authority", "handoffs",
    "instructionManifests", "changes"
  ]) mkdirSync(paths[name], { recursive: true });

  function readJson(path, fallback = null) {
    try { return JSON.parse(readFileSync(path, "utf8")); }
    catch (error) {
      if (fallback !== null) return fallback;
      fail(`invalid JSON: ${relative(root, path)} (${error.message})`);
    }
  }

  function readJsonOrNull(path) {
    try { return JSON.parse(readFileSync(path, "utf8")); }
    catch { return null; }
  }

  function writeJson(path, value) {
    mkdirSync(dirname(path), { recursive: true });
    const temporary = `${path}.tmp-${process.pid}`;
    writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
    try {
      renameSync(temporary, path);
    } finally {
      if (existsSync(temporary)) rmSync(temporary);
    }
  }

  function pathInside(parent, candidate) {
    const rel = relative(resolve(parent), resolve(candidate));
    return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
  }

  return {
    root, paths, readJson, readJsonOrNull, writeJson, canonicalPath, pathInside,
    now: () => new Date().toISOString()
  };
}
