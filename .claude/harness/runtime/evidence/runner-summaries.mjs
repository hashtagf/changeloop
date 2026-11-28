import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Test counts from the default output of runners outside JavaScript, and from
// JUnit XML. Prove reads these only after its own parsers (JSON, go -json,
// TAP, node spec, shell assertions, vitest/jest/unittest) found nothing, so a
// runner that already counts keeps its result. Only exact summary shapes
// count; anything else stays uncounted, never a pass.

const strip = (value) => String(value || "").replace(/\x1b\[[0-9;]*m/g, "").replace(/\r/g, "");
const integer = (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
};
const lastMatch = (text, pattern) => [...text.matchAll(pattern)].at(-1) || null;
const result = (format, totalTests, failed, skipped = 0, criticalCases = []) =>
  [totalTests, failed, skipped].every((value) => value !== null) && failed + skipped <= totalTests
    ? { totalTests, passed: totalTests - failed - skipped, failed, skipped, format, criticalCases }
    : null;

// `===== 1 failed, 5 passed, 2 skipped in 0.12s =====`, or `-q`'s bare line.
function pytest(text) {
  const match = lastMatch(text,
    /^=*\s*((?:\d+ (?:passed|failed|errors?|skipped|xfailed|xpassed|deselected|warnings?)(?:, )?)+) in [\d.]+s\b.*$/gm);
  if (!match) return null;
  const count = (label) => integer(match[1].match(new RegExp(`(\\d+) ${label}\\b`))?.[1] ?? 0);
  const failed = count("failed") + count("errors?");
  const skipped = count("skipped") + count("xfailed");
  return result("pytest-summary", count("passed") + count("xpassed") + failed + skipped, failed, skipped);
}

// One `test result:` line per crate and doctest run; all of them add up.
function cargo(text) {
  const rows = [...text.matchAll(/^test result: (?:ok|FAILED)\. (\d+) passed; (\d+) failed; (\d+) ignored\b/gm)];
  if (!rows.length) return null;
  const sum = (index) => rows.reduce((total, row) => total + Number(row[index]), 0);
  return result("cargo-summary", sum(1) + sum(2) + sum(3), sum(2), sum(3));
}

// Surefire prints one line per class (with `Time elapsed`) and one total.
function maven(text) {
  const match = lastMatch(text,
    /^\[?(?:INFO|ERROR|WARNING)?\]?\s*Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)\s*$/gm);
  if (!match) return null;
  const failed = integer(match[2]) + integer(match[3]);
  return result("surefire-summary", integer(match[1]), failed, integer(match[4]));
}

// `OK (5 tests, 10 assertions)`, or after failures
// `Tests: 5, Assertions: 9, Failures: 1, Errors: 0, Skipped: 1.`
function phpunit(text) {
  const ok = lastMatch(text, /^OK \((\d+) tests?, \d+ assertions?\)\s*$/gm);
  const totals = lastMatch(text, /^Tests: (\d+), Assertions: \d+((?:, [A-Za-z]+: \d+)*)\.?\s*$/gm);
  if (totals) {
    const count = (label) => integer(totals[2].match(new RegExp(`${label}: (\\d+)`))?.[1] ?? 0);
    return result("phpunit-summary", integer(totals[1]), count("Failures") + count("Errors"),
      count("Skipped") + count("Incomplete"));
  }
  return ok ? result("phpunit-summary", integer(ok[1]), 0) : null;
}

// One line per test project, summed; newer SDKs also print `Test summary:`.
function dotnet(text) {
  const summary = lastMatch(text,
    /^Test summary: total: (\d+), failed: (\d+), succeeded: \d+, skipped: (\d+)/gim);
  if (summary) return result("dotnet-summary", integer(summary[1]), integer(summary[2]), integer(summary[3]));
  const rows = [...text.matchAll(
    /^\s*(?:Passed|Failed)!\s+-\s+Failed:\s+(\d+), Passed:\s+(\d+), Skipped:\s+(\d+), Total:\s+(\d+)/gm)];
  if (!rows.length) return null;
  const sum = (index) => rows.reduce((total, row) => total + Number(row[index]), 0);
  return result("dotnet-summary", sum(4), sum(1), sum(3));
}

// `00:01 +4 ~1 -1: Some tests failed.` / `00:01 +5: All tests passed!`
function dart(text) {
  const match = lastMatch(text,
    /^\d+:\d+ \+(\d+)(?: ~(\d+))?(?: -(\d+))?: (?:All tests passed!|Some tests failed\.)\s*$/gm);
  if (!match) return null;
  const failed = integer(match[3] ?? 0);
  const skipped = integer(match[2] ?? 0);
  return result("dart-summary", integer(match[1]) + skipped + failed, failed, skipped);
}

// XCTest's overall line (the last), plus swift-testing's run summary.
function swift(text) {
  const xctest = lastMatch(text,
    /^\s*Executed (\d+) tests?, with (?:(\d+) tests? skipped and )?(\d+) failures? \(\d+ unexpected\)/gm);
  const testing = lastMatch(text, /Test run with (\d+) tests? (passed|failed)\b(?:.*?with (\d+) issues?)?/gm);
  if (!xctest && !testing) return null;
  const total = (xctest ? integer(xctest[1]) : 0) + (testing ? integer(testing[1]) : 0);
  const failed = (xctest ? integer(xctest[3]) : 0) +
    (testing?.[2] === "failed" ? Math.min(integer(testing[3] ?? 1), integer(testing[1])) : 0);
  return result("swift-summary", total, failed, xctest ? integer(xctest[2] ?? 0) : 0);
}

// ExUnit: `1 doctest, 5 tests, 0 failures, 1 excluded` (excluded did not run).
function exunit(text) {
  const match = lastMatch(text,
    /^(?:(\d+) doctests?, )?(?:(\d+) properties, )?(\d+) tests?, (\d+) failures?(?:, (\d+) skipped)?/gm);
  if (!match) return null;
  const total = integer(match[1] ?? 0) + integer(match[2] ?? 0) + integer(match[3]);
  return result("exunit-summary", total, integer(match[4]), integer(match[5] ?? 0));
}

// RSpec: `5 examples, 1 failure, 2 pending`.
function rspec(text) {
  const match = lastMatch(text, /^(\d+) examples?, (\d+) failures?(?:, (\d+) pending)?\s*$/gm);
  return match ? result("rspec-summary", integer(match[1]), integer(match[2]), integer(match[3] ?? 0)) : null;
}

// Minitest: `5 runs, 9 assertions, 0 failures, 0 errors, 1 skips`.
function minitest(text) {
  const match = lastMatch(text, /^(\d+) runs, \d+ assertions, (\d+) failures, (\d+) errors, (\d+) skips\s*$/gm);
  return match ? result("minitest-summary", integer(match[1]), integer(match[2]) + integer(match[3]),
    integer(match[4])) : null;
}

// `go test -v`: one `--- PASS|FAIL|SKIP` per test and subtest, as -json
// counts them. A package line must be present, and a package that fails
// without a failing test (a build error) counts as one failure.
function goVerbose(text) {
  const packages = [...text.matchAll(/^(ok|FAIL)\s+\S+(?:\s|$)/gm)];
  if (!packages.length) return null;
  const rows = [...text.matchAll(/^\s*--- (PASS|FAIL|SKIP): (\S+)/gm)];
  const count = (status) => rows.filter((row) => row[1] === status).length;
  const failedPackage = packages.some((row) => row[1] === "FAIL");
  if (!rows.length && !failedPackage) return null;
  const failed = Math.max(count("FAIL"), failedPackage ? 1 : 0);
  return result("go-test-verbose", Math.max(rows.length, failed), failed, count("SKIP"),
    rows.map((row) => ({ id: row[2], status: row[1].toLowerCase() })));
}

const RUNNERS = Object.freeze([pytest, cargo, maven, phpunit, dotnet, dart, swift, exunit, rspec, minitest, goVerbose]);

export function parseLanguageRunnerSummary(value) {
  const text = strip(value);
  if (!text.trim()) return null;
  for (const parse of RUNNERS) {
    const parsed = parse(text);
    if (parsed) return parsed;
  }
  return null;
}

const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
// An XML count is digits only: "", " ", "1e2", "0x10", and "4.0" are not counts.
const xmlCount = (value) => /^\d+$/.test(String(value)) ? integer(value) : null;

// Outermost `testsuite` elements only: a nested suite's tests are already in
// its parent's total (PHPUnit nests a suite per class inside one per file).
function outerSuites(text) {
  const outer = [];
  let depth = 0;
  for (const match of text.matchAll(/<(\/?)testsuite(?=[\s>/])([^>]*?)(\/?)>/g)) {
    if (match[1]) { depth = Math.max(0, depth - 1); continue; }
    if (depth === 0) outer.push(match[0]);
    if (!match[3]) depth += 1;
  }
  return outer;
}

// JUnit XML: the `testsuites` totals when every one carries them, else the
// sum over outermost `testsuite` elements. Several concatenated reports (a
// report directory) add up. Attributes that are not counts make the report uncounted.
export function parseJUnitXmlOutput(value) {
  const text = String(value || "");
  if (!/<testsuites?[\s>]/.test(text)) return null;
  const suites = [...text.matchAll(/<testsuites(\s[^>]*)?>/g)].map((match) => match[0]);
  const counted = suites.length && suites.every((tag) => attribute(tag, "tests") !== undefined)
    ? suites : outerSuites(text);
  if (!counted.length) return null;
  let total = 0;
  let failed = 0;
  let skipped = 0;
  for (const tag of counted) {
    const tests = xmlCount(attribute(tag, "tests"));
    const failures = xmlCount(attribute(tag, "failures") ?? 0);
    const errors = xmlCount(attribute(tag, "errors") ?? 0);
    const skips = xmlCount(attribute(tag, "skipped") ?? attribute(tag, "disabled") ?? 0);
    if ([tests, failures, errors, skips].includes(null)) return null;
    total += tests;
    failed += failures + errors;
    skipped += skips;
  }
  const criticalCases = [...text.matchAll(/<testcase(\s[^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)]
    .map((match) => {
      const name = attribute(match[1], "name");
      const owner = attribute(match[1], "classname");
      const body = match[3] || "";
      return name ? {
        id: owner ? `${owner}.${name}` : name,
        status: /<(?:failure|error)[\s>/]/.test(body) ? "fail" : /<skipped[\s>/]/.test(body) ? "skip" : "pass"
      } : null;
    }).filter(Boolean);
  return result("junit-xml", total, failed, skipped, criticalCases);
}

// A configured report directory (target/surefire-reports, build/test-results/test):
// its `.xml` files written by this run, concatenated. Older files are another
// run's output and are never read. Null when none is fresh.
export function freshReportDirectoryContent(path, startedMs) {
  let names = [];
  try { names = readdirSync(path).filter((name) => name.toLowerCase().endsWith(".xml")).sort(); }
  catch { return null; }
  const fresh = names.map((name) => join(path, name)).filter((file) => {
    try { return statSync(file).isFile() && statSync(file).mtimeMs >= startedMs - 1000; }
    catch { return false; }
  });
  return fresh.length ? fresh.map((file) => readFileSync(file, "utf8")).join("\n") : null;
}

// A configured report path: a file is fresh when this run wrote it (stale
// when older); a directory reads the XML files this run wrote as `content`.
export function configuredReportState(path, startedMs) {
  let stat = null;
  try { stat = path ? statSync(path) : null; } catch { stat = null; }
  if (!stat) return { fresh: false, stale: false };
  if (stat.isDirectory()) {
    const content = freshReportDirectoryContent(path, startedMs);
    return { fresh: content !== null, stale: false, content };
  }
  const fresh = stat.mtimeMs >= startedMs - 1000;
  return { fresh, stale: !fresh };
}

/** The counted result of a JUnit report or a runner summary, or null. */
export function parseLanguageTestOutput(value) {
  return parseJUnitXmlOutput(value) || parseLanguageRunnerSummary(value);
}
