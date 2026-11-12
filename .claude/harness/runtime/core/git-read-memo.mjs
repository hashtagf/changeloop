// Per-process memo for the read-only Git listings the surface code asks for
// over and over within one command.
//
// One `advance --through proven` asked `git status --porcelain=v1 -z
// --untracked-files=all` about the same workspace ~15 times and `git ls-files
// -s -z` ~10 times; those spawns were ~60% of the command's wall time. Nothing
// had changed between most of them: the snapshot, the changed surface, the
// readiness check and the Land preflight each asked again.
//
// Correctness beats the saved spawn. A remembered listing is only as good as
// the knowledge that nothing could have changed it, so instead of trusting
// every call site to invalidate after it writes, this module observes the
// process's own mutations at the boundary they all cross:
//
// - every mutating `node:fs` call (sync, callback, and promise forms) forgets
//   the listings of every workspace the written path lies in or contains, and
//   every listing when the path touches a `.git` directory;
// - every child process other than a known read-only Git query forgets every
//   listing — a provider, formatter, or `git apply` may write anywhere — and an
//   asynchronous child (or fs call) disables the memo until it settles;
// - `Atomics.wait` (the runtime's blocking wait while another process holds a
//   lock) forgets every listing, because that process may have written;
// - `clearSnapshotCache`, the runtime's existing "the workspace may have
//   changed" signal, forgets every listing.
//
// Writes under `<workspace>/.foundation/` keep that workspace's listings while
// its `.foundation/.gitignore` is the installed ignore-all allow-list: Git never
// reports those paths, and the runtime saves its own state there constantly.
//
// Out of scope by construction: another process editing the workspace while
// this one runs without waiting on it. That read would race the edit anyway.
import fs from "node:fs";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { promisify } from "node:util";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";

// Exact argument lists that may be remembered. Anything else runs every time.
const MEMOIZED_QUERIES = new Set([
  ["status", "--porcelain=v1", "-z", "--untracked-files=all"],
  ["status", "--porcelain", "-z", "--untracked-files=all"],
  ["ls-files", "-s", "-z"],
  ["rev-parse", "HEAD"]
].map((args) => args.join("\0")));

// Git subcommands that never write the worktree, index content, or refs. A
// child process running one of them invalidates nothing.
const READ_ONLY_GIT = new Set([
  "status", "ls-files", "rev-parse", "show", "diff", "cat-file", "merge-base",
  "ls-tree", "log", "rev-list", "check-ignore", "for-each-ref", "var", "version"
]);

const original = {
  realpath: fs.realpathSync.native,
  readFileSync: fs.readFileSync
};
const entries = new Map();
let inflight = 0;
const stats = { hits: 0, misses: 0, invalidations: 0 };

function realOrResolved(path) {
  const absolute = resolve(String(path));
  try { return original.realpath(absolute); } catch {}
  // A path about to be created: resolve its nearest existing parent.
  const tail = [basename(absolute)];
  let parent = dirname(absolute);
  while (parent !== dirname(parent)) {
    try { return resolve(original.realpath(parent), ...[...tail].reverse()); }
    catch { tail.push(basename(parent)); parent = dirname(parent); }
  }
  return absolute;
}

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function foundationIgnored(cwd) {
  // The installed `.foundation/.gitignore`: `*`, then only the two managed
  // files re-included. Anything else (absent, edited) earns no exemption.
  try {
    const rules = original.readFileSync(resolve(cwd, ".foundation", ".gitignore"), "utf8")
      .split(/\r?\n/).map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    return rules[0] === "*" && rules.slice(1).every((rule) =>
      rule === "!.gitignore" || rule === "!README.md");
  } catch { return false; }
}

function pathText(path) {
  if (path instanceof URL) return path.pathname;
  if (Buffer.isBuffer(path)) return path.toString();
  return path;
}

// `path` omitted (or not a path): forget everything.
export function invalidateGitReads(path = null) {
  if (!entries.size) return;
  stats.invalidations += 1;
  forget(path);
}

function forget(path) {
  const text = pathText(path);
  if (typeof text !== "string") { entries.clear(); return; }
  let target;
  try { target = realOrResolved(text); } catch { entries.clear(); return; }
  if (target.split(sep).includes(".git")) { entries.clear(); return; }
  for (const [key, entry] of entries) {
    if (inside(target, entry.cwd)) { entries.delete(key); continue; }
    if (!inside(entry.cwd, target)) continue;
    const rel = relative(entry.cwd, target).split(sep).join("/");
    if (entry.foundationIgnored && rel.startsWith(".foundation/") &&
        rel !== ".foundation/.gitignore") continue;
    entries.delete(key);
  }
}

// `run` performs the query. Its result is remembered only for an allowlisted
// argument list and only while no asynchronous mutation is in flight.
export function memoizedGitRead(args, cwd, run) {
  const query = args.join("\0");
  if (!MEMOIZED_QUERIES.has(query) || inflight > 0) return run();
  let canonical;
  try { canonical = original.realpath(resolve(cwd)); } catch { return run(); }
  const key = `${canonical}\0${query}`;
  const cached = entries.get(key);
  if (cached) {
    stats.hits += 1;
    return { ...cached.result };
  }
  stats.misses += 1;
  const result = run();
  if (result && !result.error && result.signal === null && inflight === 0)
    entries.set(key, {
      cwd: canonical, foundationIgnored: foundationIgnored(canonical), result: { ...result }
    });
  return result;
}

export function gitReadMemoStats() {
  return { ...stats, entries: entries.size, inflight };
}

// --- mutation observer -----------------------------------------------------

// [name, indexes of the path arguments it writes].
const SYNC_PATH_MUTATORS = [
  ["writeFileSync", [0]], ["appendFileSync", [0]], ["renameSync", [0, 1]],
  ["rmSync", [0]], ["unlinkSync", [0]], ["mkdirSync", [0]], ["cpSync", [1]],
  ["copyFileSync", [1]], ["symlinkSync", [1]], ["linkSync", [1]],
  ["chmodSync", [0]], ["lchmodSync", [0]], ["chownSync", [0]], ["lchownSync", [0]],
  ["utimesSync", [0]], ["lutimesSync", [0]], ["truncateSync", [0]],
  ["rmdirSync", [0]], ["mkdtempSync", [0]]
];
const SYNC_FD_MUTATORS = ["writeSync", "writevSync", "ftruncateSync", "fchmodSync",
  "fchownSync", "futimesSync"];
const ASYNC_MUTATORS = ["writeFile", "appendFile", "rename", "rm", "unlink", "mkdir", "cp",
  "copyFile", "symlink", "link", "chmod", "lchmod", "chown", "lchown", "utimes", "lutimes",
  "truncate", "rmdir", "mkdtemp", "write", "writev", "ftruncate", "fchmod", "fchown",
  "futimes", "open"];

const writableFds = new Map();
const READ_FLAGS = new Set([undefined, null, "r", "rs", "sr", fs.constants.O_RDONLY]);

// A path, or a descriptor: one this process opened for writing names its path;
// stdout/stderr are not workspace files; any other descriptor may be anything.
function invalidateWritten(target) {
  if (typeof target !== "number") return invalidateGitReads(target ?? null);
  if (writableFds.has(target)) return invalidateGitReads(writableFds.get(target));
  if (target !== 1 && target !== 2) invalidateGitReads();
}

function beginAsync() { inflight += 1; invalidateGitReads(); }
function endAsync() { inflight = Math.max(0, inflight - 1); invalidateGitReads(); }

function once(fn) {
  let done = false;
  return () => { if (!done) { done = true; fn(); } };
}

function wrapAsync(target, name) {
  const fn = target?.[name];
  if (typeof fn !== "function") return;
  target[name] = function observedAsync(...args) {
    beginAsync();
    const end = once(endAsync);
    const last = args.length - 1;
    if (typeof args[last] === "function") {
      const callback = args[last];
      args[last] = function observedCallback(...results) {
        end();
        return callback.apply(this, results);
      };
    }
    let value;
    try { value = fn.apply(this, args); }
    catch (error) { end(); throw error; }
    if (value && typeof value.then === "function") value.then(end, end);
    else if (typeof args[last] !== "function") end();
    return value;
  };
  keepPromisified(target[name], fn);
}

// `util.promisify(exec)` resolves `{ stdout, stderr }` through a custom
// implementation that closes over the original; observe that one too.
function keepPromisified(wrapper, fn) {
  const custom = fn[promisify.custom];
  if (typeof custom !== "function") return;
  wrapper[promisify.custom] = function observedPromisified(...args) {
    beginAsync();
    const end = once(endAsync);
    let value;
    try { value = custom.apply(this, args); }
    catch (error) { end(); throw error; }
    value.then(end, end);
    return value;
  };
}

function gitIsReadOnly(command, args) {
  if (basename(String(command)) !== "git" || !Array.isArray(args)) return false;
  if (args.some((arg) => String(arg).startsWith("--output"))) return false;
  if (READ_ONLY_GIT.has(args[0])) return true;
  // A dry run of a patch, and a merge printed to stdout, write nothing.
  if (args[0] === "apply") return args.includes("--check") &&
    !args.some((arg) => ["--index", "--cached", "--3way", "-3"].includes(arg));
  return args[0] === "merge-file" && (args.includes("-p") || args.includes("--stdout"));
}

function install() {
  if (globalThis.__foundationGitReadMemoInstalled) return;
  globalThis.__foundationGitReadMemoInstalled = true;

  for (const [name, indexes] of SYNC_PATH_MUTATORS) {
    const fn = fs[name];
    if (typeof fn !== "function") continue;
    fs[name] = function observedSync(...args) {
      for (const index of indexes) invalidateWritten(args[index]);
      return fn.apply(this, args);
    };
  }
  const openSync = fs.openSync;
  fs.openSync = function observedOpenSync(path, flags, ...rest) {
    const writes = !READ_FLAGS.has(flags);
    if (writes) invalidateGitReads(path);
    const fd = openSync.call(this, path, flags, ...rest);
    if (writes) writableFds.set(fd, path);
    return fd;
  };
  const closeSync = fs.closeSync;
  fs.closeSync = function observedCloseSync(fd, ...rest) {
    writableFds.delete(fd);
    return closeSync.call(this, fd, ...rest);
  };
  for (const name of SYNC_FD_MUTATORS) {
    const fn = fs[name];
    if (typeof fn !== "function") continue;
    fs[name] = function observedFdSync(fd, ...rest) {
      invalidateWritten(fd);
      return fn.call(this, fd, ...rest);
    };
  }
  for (const name of ASYNC_MUTATORS) wrapAsync(fs, name);
  for (const name of ASYNC_MUTATORS.filter((name) => name !== "open"))
    wrapAsync(fs.promises, name);
  // A FileHandle opened for writing writes until it closes.
  const openHandle = fs.promises.open;
  fs.promises.open = async function observedOpen(path, flags, ...rest) {
    if (READ_FLAGS.has(flags)) return openHandle.call(this, path, flags, ...rest);
    beginAsync();
    const end = once(endAsync);
    try {
      const handle = await openHandle.call(this, path, flags, ...rest);
      handle.once("close", end);
      return handle;
    } catch (error) { end(); throw error; }
  };
  const createWriteStream = fs.createWriteStream;
  fs.createWriteStream = function observedWriteStream(...args) {
    beginAsync();
    const end = once(endAsync);
    let stream;
    try { stream = createWriteStream.apply(this, args); }
    catch (error) { end(); throw error; }
    stream.once("close", end);
    stream.once("error", end);
    return stream;
  };

  for (const name of ["spawnSync", "execFileSync"]) {
    const fn = childProcess[name];
    childProcess[name] = function observedChildSync(command, args, ...rest) {
      if (gitIsReadOnly(command, args)) return fn.call(this, command, args, ...rest);
      invalidateGitReads();
      try { return fn.call(this, command, args, ...rest); }
      finally { invalidateGitReads(); }
    };
  }
  const execSync = childProcess.execSync;
  childProcess.execSync = function observedExecSync(...args) {
    invalidateGitReads();
    try { return execSync.apply(this, args); }
    finally { invalidateGitReads(); }
  };
  for (const name of ["spawn", "execFile", "exec", "fork"]) {
    const fn = childProcess[name];
    childProcess[name] = function observedChild(...args) {
      if (name !== "exec" && gitIsReadOnly(args[0], args[1])) return fn.apply(this, args);
      beginAsync();
      const end = once(endAsync);
      let child;
      try { child = fn.apply(this, args); }
      catch (error) { end(); throw error; }
      child.once("exit", end);
      child.once("error", end);
      return child;
    };
    keepPromisified(childProcess[name], fn);
  }

  const wait = Atomics.wait;
  Atomics.wait = function observedWait(...args) {
    try { return wait.apply(this, args); }
    finally { invalidateGitReads(); }
  };

  // Named `node:fs` / `node:child_process` imports are live bindings to these
  // exports; this makes every module see the observed functions.
  syncBuiltinESMExports();
}

install();
