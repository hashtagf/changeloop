// Runtime factories have one production caller, the composition root, which
// always supplies their collaborators. A missing one is a wiring error: fail at
// construction with its name instead of guarding an impossible state later.
export function requireDeps(factory, deps) {
  const missing = Object.keys(deps).filter((name) => deps[name] == null);
  if (missing.length)
    throw new Error(`${factory}: missing required dependenc${missing.length === 1 ? "y" : "ies"} ${missing.join(", ")}`);
}
