// The project source files a built-in findings adapter scans: include and
// exclude globs over a bounded walk that skips dependencies, build output,
// and installed agent tooling (Change Loop itself lives under .claude/).
import { readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { pathMatches } from "./quality-evaluator.mjs";

export const SOURCE_EXTENSIONS = Object.freeze([".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".mts", ".cts"]);
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "vendor", "dist", "build", "coverage", ".foundation", ".claude"]);
const MAXIMUM_FILES = 20000;

export const slash = (path) => String(path || "").replaceAll("\\", "/").replace(/^\.\//, "");

export function sourceFiles(root, provider, defaultExtensions = SOURCE_EXTENSIONS) {
  const include = provider.include?.length ? provider.include : ["**/*"];
  const exclude = provider.exclude || [];
  const extensions = provider.extensions?.length ? provider.extensions : defaultExtensions;
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (files.length >= MAXIMUM_FILES) throw new Error(`source scan exceeded ${MAXIMUM_FILES} files; narrow include`);
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) walk(join(directory, entry.name));
      } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
        const path = slash(relative(root, join(directory, entry.name)));
        if (pathMatches(path, include) && !pathMatches(path, exclude)) files.push(path);
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
