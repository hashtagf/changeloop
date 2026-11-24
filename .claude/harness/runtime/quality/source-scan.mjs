// The project source files a built-in findings adapter scans: include and
// exclude globs over a bounded walk that skips dependencies, build output,
// and installed agent tooling (Change Loop itself lives under .claude/).
// A directory with its own `.git` is another repository (a sibling in a
// multi-repository root, or a submodule): it has its own lanes, so the scan
// stops there instead of counting its files twice.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { pathMatches } from "./quality-evaluator.mjs";

export const SOURCE_EXTENSIONS = Object.freeze([".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".mts", ".cts"]);
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "vendor", "dist", "build", "coverage", ".foundation", ".claude"]);
const MAXIMUM_FILES = 20000;

export const nestedRepository = (directory) => existsSync(join(directory, ".git"));

// Paths the repository's .gitignore excludes (build output such as .nuxt/ or
// .next/, local caches): generated code is not the project's to judge. Empty
// outside a Git repository, so a copy sandbox scans as before.
export function gitIgnored(root) {
  const result = spawnSync("git", ["ls-files", "--others", "--ignored", "--exclude-standard", "--directory", "-z"],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) return () => false;
  const entries = result.stdout.split("\0").filter(Boolean);
  const directories = entries.filter((path) => path.endsWith("/"));
  const files = new Set(entries.filter((path) => !path.endsWith("/")));
  return (path, directory = false) => {
    const probe = directory ? `${path}/` : path;
    return files.has(path) || directories.some((prefix) => probe.startsWith(prefix));
  };
}

export const slash = (path) => String(path || "").replaceAll("\\", "/").replace(/^\.\//, "");

export function sourceFiles(root, provider, defaultExtensions = SOURCE_EXTENSIONS) {
  const include = provider.include?.length ? provider.include : ["**/*"];
  const exclude = provider.exclude || [];
  const extensions = provider.extensions?.length ? provider.extensions : defaultExtensions;
  const files = [];
  const ignored = gitIgnored(root);
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (files.length >= MAXIMUM_FILES) throw new Error(`source scan exceeded ${MAXIMUM_FILES} files; narrow include`);
      if (entry.isDirectory()) {
        const child = join(directory, entry.name);
        if (!SKIP_DIRECTORIES.has(entry.name) && !nestedRepository(child) &&
            !ignored(slash(relative(root, child)), true)) walk(child);
      } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
        const path = slash(relative(root, join(directory, entry.name)));
        if (pathMatches(path, include) && !pathMatches(path, exclude) && !ignored(path)) files.push(path);
      }
    }
  };
  walk(root);
  return files.sort();
}

export function lineCount(text) {
  if (!text.length) return 0;
  const breaks = text.split("\n").length - 1;
  return text.endsWith("\n") ? breaks : breaks + 1;
}
