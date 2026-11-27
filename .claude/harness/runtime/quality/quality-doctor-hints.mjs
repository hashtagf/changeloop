// Advice `quality doctor` adds about a provider's command. Both are hints, not
// failures: the project owns its commands.
//
// A command lane (kind command, no protocol) is judged by its exit code, so a
// command that swallows its failure (`|| true`) passes whatever happens. A
// builtin lane or one with a protocol is judged by the output it parses and
// may ignore the exit code on purpose (eslint exits 1 on findings).
const SWALLOW = /\|\|\s*(?:true|:)(?=\s|;|\)|}|$)|;\s*exit\s+0\b/;
// A lane that runs in one directory: `cd backend && ...`, `make -C backend`,
// `npm --prefix web`, `pnpm --dir web` or `-C web`, `go test ./services/x/...`,
// `gradle -p app`, `cargo test --manifest-path tools/x/Cargo.toml`.
const DIR = "([A-Za-z0-9_][A-Za-z0-9_./-]*?)";
const DIRECTORY_FORMS = [
  new RegExp(`\\bmake\\s+(?:\\S+\\s+)*?-C\\s*${DIR}\\/?(?=\\s|$)`),
  new RegExp(`\\b(?:npm|pnpm|yarn)\\s+(?:\\S+\\s+)*?(?:--prefix|--dir|--cwd|-C)[ =]${DIR}\\/?(?=\\s|$)`),
  new RegExp(`\\bgradlew?\\s+(?:\\S+\\s+)*?-p\\s*${DIR}\\/?(?=\\s|$)`),
  new RegExp(`--manifest-path[ =]${DIR}\\/Cargo\\.toml(?=\\s|$)`)
];
const CD = new RegExp(`^\\s*cd\\s+${DIR}\\/?\\s*$`);
const GO = /\bgo\s+(?:test|vet|build)\b/;
const GO_PACKAGE = new RegExp(`(?:^|\\s)\\.\\/${DIR}\\/\\.\\.\\.(?=\\s|$)`, "g");

function inside(directory) {
  const value = directory?.replace(/^\.\//, "").replace(/\/$/, "");
  return value && value !== "." && value !== ".." && !value.startsWith("../") ? value : null;
}

/** Every directory a command names, or [] when it runs across the repository. */
export function commandDirectories(command) {
  const text = Array.isArray(command)
    ? (command[0] === "sh" && command[1] === "-c" ? String(command.at(-1)) : command.join(" ")) : "";
  const segments = text.split(/&&|\|\||;/);
  // `cd backend && go test ./...`: everything after runs in backend.
  const cd = inside(segments[0]?.match(CD)?.[1]);
  if (cd) return [cd];
  const found = new Set();
  for (const segment of segments) {
    if (GO.test(segment)) {
      if (/(?:^|\s)\.\/\.\.\.(?=\s|$)/.test(segment)) return [];
      for (const match of segment.matchAll(GO_PACKAGE)) if (inside(match[1])) found.add(inside(match[1]));
    }
    for (const form of DIRECTORY_FORMS) if (inside(segment.match(form)?.[1])) found.add(inside(segment.match(form)[1]));
  }
  return [...found];
}

/** The one directory a command runs in, or null. */
export function commandDirectory(command) {
  const directories = commandDirectories(command);
  return directories.length === 1 ? directories[0] : null;
}

function commandText(provider) {
  return Array.isArray(provider?.command) ? provider.command.join(" ") : "";
}

export function providerCommandHints(repository, capability, provider) {
  const hints = [];
  const text = commandText(provider);
  if (!text) return hints;
  if (provider.kind === "command" && !provider.protocol && SWALLOW.test(text))
    hints.push({ level: "warning", code: "provider-swallows-failure", repository, capability,
      message: `the ${capability} lane is judged by its exit code, but its command swallows failure ` +
        "(|| true, || :, or ; exit 0), so it always passes; remove that part so a failure fails the lane" });
  const paths = commandDirectories(provider.command).map((directory) => `${directory}/**`);
  if (!provider.paths && !provider.cwd && paths.length)
    hints.push({ level: "info", code: "provider-paths-suggested", repository, capability, paths,
      message: `the ${capability} lane runs only in ${paths.map((path) => path.slice(0, -2)).join(", ")}; ` +
        `declare "paths": ${JSON.stringify(paths)} so a change that touches nothing there does not wait for it` });
  return hints;
}
