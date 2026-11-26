import { basename } from "node:path";

// `node --test` waits for every open handle before it exits. A test that
// passes but leaves a server or a keep-alive connection open (a paid
// project-tracker-api run used fetch against its own server) kept Build and
// Prove waiting until the ten-minute cap, twice. NODE_OPTIONS refuses
// --test-force-exit, so the harness adds it to the argv it runs itself.
const FLAG = "--test-force-exit";
const NODE = /^node(?:\.exe)?$/;
const SHELL_NODE_TEST = /(^|&&|\|\||;|\()(\s*)node(\s+)--test(?=\s|\)|$)/g;

export function forceExitLine(line) {
  const text = String(line);
  return text.includes(FLAG) ? text : text.replace(SHELL_NODE_TEST, `$1$2node$3--test ${FLAG}`);
}

/** The same command, with --test-force-exit for a `node --test` run. */
export function forceExitCommand(command, args = []) {
  if (NODE.test(basename(String(command || ""))) && args.includes("--test") && !args.includes(FLAG)) {
    const at = args.indexOf("--test") + 1;
    return { command, args: [...args.slice(0, at), FLAG, ...args.slice(at)] };
  }
  if (command === "sh" && args[0] === "-c" && args.length === 2)
    return { command, args: ["-c", forceExitLine(args[1])] };
  return { command, args };
}
