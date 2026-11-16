import { promises as fs, constants } from "node:fs";
import { resolve, relative, join, basename, dirname, isAbsolute, sep } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";

const exec = promisify(execFile);
export const problem = (status, message) => Object.assign(new Error(message), { status });
const blocked = /(^|\/)(\.git|\.ssh|\.gnupg|auth\.json|\.env(?:\..*)?|.*\.(?:pem|key|p12))($|\/)/i;
const digest = data => createHash("sha256").update(data).digest("hex");
export async function git(cwd, args) {
  try { return (await exec("git", ["-C", cwd, ...args], { timeout: 20000, maxBuffer: 2 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } })).stdout; }
  catch (e) { throw problem(409, String(e.stderr || e.message).slice(0, 1500)); }
}
export async function describe(cwd) {
  try {
    const root = (await git(cwd, ["rev-parse", "--show-toplevel"])).trim();
    const common = (await git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"])).trim();
    const branch=(await git(root,['branch','--show-current'])).trim() || '(detached)';
    return { cwd, root, projectRoot: dirname(common), project: basename(dirname(common)), worktree: basename(root), branch, git: true };
  } catch { return { cwd, root: cwd, projectRoot: cwd, project: basename(cwd), worktree: basename(cwd), git: false }; }
}
export async function safePath(root, input = ".", writing = false) {
  if (typeof input !== "string" || input.includes("\0") || isAbsolute(input) || blocked.test(input)) throw problem(403, "This path is unavailable in the file browser.");
  const base = await fs.realpath(root), target = resolve(base, input);
  const inside = p => p === base || p.startsWith(base + sep);
  if (!inside(target)) throw problem(403, "Path is outside this worktree.");
  const real = await fs.realpath(writing ? dirname(target) : target);
  if (!inside(real) || blocked.test(relative(base, real))) throw problem(403, "Symlink leaves this worktree.");
  // Writes never follow a final symlink.
  if (writing) { try { if ((await fs.lstat(target)).isSymbolicLink()) throw problem(403, "Cannot write through a symlink."); } catch(e) { if (e.code !== "ENOENT") throw e; } }
  return target;
}
export async function workspace(root, action, data: any = {}) {
  if(action === 'download') {
    const path = await safePath(root,data.path), stat=await fs.stat(path);
    if(!stat.isFile() || stat.size > 20*1024*1024) throw problem(413,'Download limit is 20 MB.');
    return {binary:await fs.readFile(path),name:basename(path)};
  }
  if (action === "tree") {
    const path = data.path || ".", dir = await safePath(root, path);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return { path, entries: entries.filter(e => !blocked.test(e.name) && !["node_modules", ".DS_Store"].includes(e.name))
      .slice(0, 1000).map(e => ({ name: e.name, path: path === "." ? e.name : path + "/" + e.name, directory: e.isDirectory(), symlink: e.isSymbolicLink() }))
      .sort((a,b) => Number(b.directory)-Number(a.directory) || a.name.localeCompare(b.name)), truncated: entries.length > 1000 };
  }
  if (action === "file") {
    const path = await safePath(root, data.path), stat = await fs.stat(path);
    if (!stat.isFile() || stat.size > 2 * 1024 * 1024) throw problem(413, "Preview supports files up to 2 MB.");
    const content = await fs.readFile(path);
    const imageTypes = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp" };
    const type = imageTypes[/\.[^.]+$/.exec(path)?.[0].toLowerCase()];
    if (type) return { path: data.path, image: { mimeType: type, data: content.toString("base64") }, hash: digest(content) };
    if (content.includes(0)) throw problem(415, "Binary file. Attach it to chat or open it locally.");
    return { path: data.path, text: content.toString("utf8"), hash: digest(content) };
  }
  if (action === "save") {
    if (typeof data.text !== "string" || Buffer.byteLength(data.text) > 2 * 1024 * 1024) throw problem(413, "Text file limit is 2 MB.");
    const path = await safePath(root, data.path, true);
    const handle = await fs.open(path, constants.O_RDWR | constants.O_NOFOLLOW);
    try {
      const previous = await handle.readFile();
      if (digest(previous) !== data.hash) throw problem(409, "File changed on disk. Reopen it before saving.");
      const bytes=Buffer.from(data.text);await handle.write(bytes,0,bytes.length,0);await handle.truncate(bytes.length);
    } finally { await handle.close(); }
    return { hash: digest(data.text), saved: true };
  }
  if (action === "git") {
    const [status, branch, branches, log, worktrees] = await Promise.all([
      git(root, ["status", "--porcelain=v1", "-z"]), git(root, ["branch", "--show-current"]),
      git(root, ["branch", "--format=%(refname:short)"]), git(root, ["log", "-8", "--format=%h %s"]).catch(()=>''),
      git(root, ["worktree", "list", "--porcelain"])
    ]);
    const changes = [], parts = status.split("\0");
    for (let i=0;i<parts.length;i++) {
      if (!parts[i]) continue;
      const item: any = { status: parts[i].slice(0,2), path: parts[i].slice(3) };
      if (/[RC]/.test(item.status)) item.from = parts[++i];
      changes.push(item);
    }
    return { branch: branch.trim() || "(detached)", branches: branches.trim().split("\n").filter(Boolean), changes,
      log: log.trim().split("\n").filter(Boolean), worktrees: worktrees.trim().split("\n\n").filter(Boolean).map(block => {
        const rows = block.split("\n"); return { path: rows.find(r=>r.startsWith("worktree "))?.slice(9),
          branch: rows.find(r=>r.startsWith("branch "))?.slice(7).replace("refs/heads/", "") || "(detached)", locked: rows.includes("locked") };
      }) };
  }
  if (action === "diff") {
    if (data.path) await safePath(root, data.path);
    return { text: await git(root, ["diff", ...((data.staged === true || data.staged === 'true') ? ["--cached"] : []), "--no-ext-diff", "--no-color", "--", ...(data.path ? [data.path] : [])]) };
  }
  if (action === "stage" || action === "unstage") {
    if (!Array.isArray(data.paths) || !data.paths.length || data.paths.length > 500) throw problem(400, "Select files.");
    for (const path of data.paths) {
      // Deleted paths have no realpath; validate parent and confinement.
      await safePath(root, path, true);
    }
    await git(root, action === "stage" ? ["add", "--", ...data.paths] : ["reset", "HEAD", "--", ...data.paths]);
    return { ok: true };
  }
  if (action === "commit") {
    if (typeof data.message !== "string" || !data.message.trim() || data.message.length > 4000) throw problem(400, "Enter a commit message.");
    return { text: await git(root, ["commit", "-m", data.message]) };
  }
  if (action === "switch") {
    if (typeof data.branch !== "string" || data.branch.startsWith("-")) throw problem(400, "Choose a branch.");
    await git(root, ["switch", ...(data.create ? ["-c"] : []), data.branch]); return { ok: true };
  }
  if (action === "worktree-add") {
    if (typeof data.branch !== "string" || !/^[\w][\w./-]{0,100}$/.test(data.branch) || data.branch.includes("..")) throw problem(400, "Enter a valid branch name.");
    await git(root, ["check-ref-format", "--branch", data.branch]);
    const target = join(dirname(root), basename(root) + "-" + data.branch.replaceAll("/", "-"));
    await git(root, ["worktree", "add", "-b", data.branch, target]); return { path: await fs.realpath(target) };
  }
  if (action === "worktree-remove") {
    const list = await workspace(root, "git");
    const candidate = list.worktrees.find(w => w.path === data.path);
    if (!candidate || candidate.path === root || candidate.locked || candidate.path === list.worktrees[0]?.path) throw problem(409, "Cannot remove the primary, current, or locked worktree.");
    await git(root, ["worktree", "remove", candidate.path]); return { ok: true };
  }
  throw problem(404, "Unknown workspace action.");
}
