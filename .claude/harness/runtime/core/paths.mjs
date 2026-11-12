// Path containment shared by the runtime and the hooks. Comparison is lexical:
// callers that need physical containment canonicalize both sides first.
import { realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

// `rel` is a path.relative() result: "" is the root itself, while ".." and
// "../x" escape it. A child named "..x" stays inside.
export function relativeInside(rel) {
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

export function pathInside(parent, candidate) {
  return relativeInside(relative(parent, candidate));
}

// The physical path when it resolves, otherwise the absolute logical path.
export function canonical(path) {
  try { return realpathSync(path); } catch { return resolve(path); }
}
