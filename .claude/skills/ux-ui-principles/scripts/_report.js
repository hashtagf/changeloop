/*
 * --json report shared by the Node checkers (render/fold/admin/flow/script_check). Standard library only.
 *
 *   A.parse(argv, { file: __filename, report: 'fold_check', … })   accepts --json and calls start()
 *   R.target(t)  R.add(level, rule, message, where, details)  R.artifact('screenshots', file)  R.set(key, value)
 *
 * Without --json every call here is a no-op and the text output is untouched. With --json, console.log goes
 * to stderr and, when the process exits (any path: done, usage error, NOT RUN, navigation ERROR), exactly one
 * JSON document is written to stdout; the exit code is unchanged:
 *   {"script", "target", "result": PASS|FAIL|WARN|ERROR|NOT RUN, "exit", ["error"], "findings": [{"level":
 *    fail|flag|warn|note|pass, "rule", "message", "where", ["details"]}], "artifacts": {…}, …script summary}
 * result follows the exit code: 0 PASS (WARN when a warn finding exists), 1 FAIL (ERROR when the run itself
 * failed, e.g. a page that could not load), 2 ERROR, 3 NOT RUN.
 */
const fs = require('fs');

let cur = null;
const on = () => !!(cur && cur.json);

function start(script, json) {
  cur = { script, json, target: null, findings: [], artifacts: {}, summary: {}, error: null };
  if (!json) return;
  console.log = (...a) => console.error(...a);
  console.info = console.log;
  process.on('exit', (code) => emit(code));
}

function target(t) { if (on()) cur.target = t; }
function add(level, rule, message, where, details) {
  if (!on()) return;
  const f = { level, rule, message, where: where === undefined ? null : where };
  if (details !== undefined) f.details = details;
  cur.findings.push(f);
}
function artifact(key, file) { if (on()) (cur.artifacts[key] = cur.artifacts[key] || []).push(file); }
function setArtifact(key, value) { if (on()) cur.artifacts[key] = value; }
function set(key, value) { if (on()) cur.summary[key] = value; }
function error(msg) { if (on() && !cur.error) cur.error = String(msg); }

function writeAll(s) {
  const b = Buffer.from(s);
  for (let off = 0; off < b.length;) {
    try { off += fs.writeSync(1, b, off); } catch (e) { if (e.code !== 'EAGAIN') throw e; }
  }
}

function emit(code) {
  const result = code === 0 ? (cur.findings.some((f) => f.level === 'warn') ? 'WARN' : 'PASS')
    : code === 1 ? (cur.error ? 'ERROR' : 'FAIL') : code === 3 ? 'NOT RUN' : 'ERROR';
  const doc = { script: cur.script, target: cur.target, result, exit: code };
  if (cur.error) doc.error = cur.error;
  Object.assign(doc, { findings: cur.findings, artifacts: cur.artifacts }, cur.summary);
  writeAll(JSON.stringify(doc, null, 2) + '\n');
}

module.exports = { start, on, target, add, artifact, setArtifact, set, error };
