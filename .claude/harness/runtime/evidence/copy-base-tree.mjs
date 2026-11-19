// The base tree of an isolated copy (a project without Git): the sandbox with
// each changed product file put back to its base bytes, and each product file
// the change added removed. Tests, fixtures, and manifests stay as the sandbox
// has them, exactly as the Git path lays them over `git archive <base>`. Base
// bytes come from the copy-base store or from the project file while it still
// hashes to its baseline row; a product file whose base cannot be proven makes
// the tree unavailable (no verdict), never a guess. `storedBytes` is the
// copy-base store reader ({ root, baseline, path } → bytes | null | undefined),
// injected by composition.
import { createHash } from "node:crypto";
import {
  cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync,
  symlinkSync, writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";

const SKIPPED = new Set([".git", ".foundation", "node_modules", ".venv", "venv"]);
const DEPENDENCY_DIRECTORIES = ["node_modules", ".venv", "venv"];
const ROW = /^file:(regular|executable):([a-f0-9]{64})$/;

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function identity(path) {
  const stats = lstatSync(path, { throwIfNoEntry: false });
  if (!stats?.isFile()) return stats ? "non-file" : null;
  return `file:${stats.mode & 0o111 ? "executable" : "regular"}:${sha256(readFileSync(path))}`;
}

function sandboxFiles(workspace) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (SKIPPED.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else out.push(relative(workspace, path).replaceAll("\\", "/"));
    }
  };
  walk(workspace);
  return out;
}

// Every path whose sandbox identity differs from the baseline, including
// baseline paths the sandbox deleted.
export function copyChangedPaths(workspace, baseline) {
  const current = new Map(sandboxFiles(workspace).map((path) => [path, identity(join(workspace, path))]));
  const paths = new Set([...current.keys(), ...Object.keys(baseline || {})]);
  return [...paths].filter((path) => !/^(?:\.foundation|openspec\/changes)\//.test(path) &&
    (baseline?.[path] ?? null) !== (current.get(path) ?? null)).sort();
}

// The identity the cache keys on, in place of a Git base head.
export function copyBaseIdentity(baseline, productPaths) {
  return `copy:${sha256(JSON.stringify(productPaths.map((path) => [path, baseline?.[path] ?? null])))}`;
}

function baseBytes(root, baseline, path, storedBytes) {
  const stored = storedBytes?.({ root, baseline, path });
  if (stored) return stored;
  const row = ROW.exec(String(baseline?.[path] ?? ""));
  const live = join(root, path);
  if (!row || !existsSync(live)) return undefined;
  const bytes = readFileSync(live);
  return sha256(bytes) === row[2] ? bytes : undefined;
}

export function buildCopyScratch(root, workspace, baseline, productPaths, storedBytes = null) {
  const scratch = mkdtempSync(join(tmpdir(), "foundation-discrimination-"));
  const tree = join(scratch, "base");
  cpSync(workspace, tree, { recursive: true, verbatimSymlinks: true,
    filter: (source) => !SKIPPED.has(relative(workspace, source).split(/[\\/]/)[0]) || source === workspace });
  for (const path of productPaths) {
    const target = join(tree, path);
    if (!Object.hasOwn(baseline || {}, path)) { rmSync(target, { recursive: true, force: true }); continue; }
    const bytes = baseBytes(root, baseline, path, storedBytes);
    if (bytes === undefined) {
      rmSync(scratch, { recursive: true, force: true });
      return null;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  }
  for (const name of DEPENDENCY_DIRECTORIES) {
    const source = join(workspace, name);
    if (existsSync(source) && !existsSync(join(tree, name))) symlinkSync(source, join(tree, name));
  }
  return { scratch, tree };
}
