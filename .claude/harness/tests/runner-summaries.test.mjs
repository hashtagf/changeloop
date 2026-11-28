import assert from "node:assert/strict";
import { mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { parseRunnerSummaryOutput } from "../runtime/evidence/evidence-results.mjs";
import {
  freshReportDirectoryContent, parseJUnitXmlOutput, parseLanguageRunnerSummary, parseLanguageTestOutput
} from "../runtime/evidence/runner-summaries.mjs";

const counts = (value) => value && { total: value.totalTests, failed: value.failed, format: value.format };

test("pytest's summary counts passed, failed, and skipped tests", () => {
  assert.deepEqual(counts(parseLanguageRunnerSummary(
    "tests/test_a.py ..F\n===== 1 failed, 5 passed, 2 skipped in 0.12s =====\n")),
  { total: 8, failed: 1, format: "pytest-summary" });
  assert.deepEqual(counts(parseLanguageRunnerSummary("6 passed in 0.03s\n")),
    { total: 6, failed: 0, format: "pytest-summary" });
});

test("cargo adds every crate's test result line", () => {
  const output = "test result: ok. 3 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out; finished in 0.00s\n" +
    "   Doc-tests calc\n" +
    "test result: ok. 3 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out; finished in 0.01s\n";
  assert.deepEqual(counts(parseLanguageRunnerSummary(output)), { total: 8, failed: 0, format: "cargo-summary" });
});

test("Maven counts the total line, not the per-class lines", () => {
  const output = "[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.05 s - in a.ATest\n" +
    "[ERROR] Tests run: 4, Failures: 1, Errors: 1, Skipped: 0, Time elapsed: 0.1 s <<< FAILURE! - in a.BTest\n" +
    "[INFO] Results:\n[ERROR] Tests run: 7, Failures: 1, Errors: 1, Skipped: 0\n";
  assert.deepEqual(counts(parseLanguageRunnerSummary(output)), { total: 7, failed: 2, format: "surefire-summary" });
});

test("PHPUnit counts its OK line and its failure totals", () => {
  assert.deepEqual(counts(parseLanguageRunnerSummary("OK (5 tests, 10 assertions)\n")),
    { total: 5, failed: 0, format: "phpunit-summary" });
  assert.deepEqual(counts(parseLanguageRunnerSummary(
    "FAILURES!\nTests: 5, Assertions: 9, Failures: 1, Errors: 1, Skipped: 1.\n")),
  { total: 5, failed: 2, format: "phpunit-summary" });
});

test("dotnet adds each test project's line, or reads its test summary", () => {
  const output = "Passed!  - Failed:     0, Passed:     5, Skipped:     0, Total:     5, Duration: 3 ms - A.Tests.dll\n" +
    "Failed!  - Failed:     1, Passed:     2, Skipped:     1, Total:     4, Duration: 9 ms - B.Tests.dll\n";
  assert.deepEqual(counts(parseLanguageRunnerSummary(output)), { total: 9, failed: 1, format: "dotnet-summary" });
  assert.deepEqual(counts(parseLanguageRunnerSummary("Test summary: total: 5, failed: 0, succeeded: 5, skipped: 0, duration: 1.2s\n")),
    { total: 5, failed: 0, format: "dotnet-summary" });
});

test("Dart and Flutter count passed, skipped, and failed tests", () => {
  assert.deepEqual(counts(parseLanguageRunnerSummary("00:01 +3: a\n00:01 +4 -1: Some tests failed.\n")),
    { total: 5, failed: 1, format: "dart-summary" });
  assert.deepEqual(counts(parseLanguageRunnerSummary("00:02 +5 ~1: All tests passed!\n")),
    { total: 6, failed: 0, format: "dart-summary" });
});

test("Swift counts XCTest's overall line and swift-testing's run", () => {
  const output = "Executed 2 tests, with 0 failures (0 unexpected) in 0.001 seconds\n" +
    "Executed 6 tests, with 0 failures (0 unexpected) in 0.01 (0.02) seconds\n";
  assert.deepEqual(counts(parseLanguageRunnerSummary(output)), { total: 6, failed: 0, format: "swift-summary" });
  assert.deepEqual(counts(parseLanguageRunnerSummary("✘ Test run with 4 tests failed after 0.01 seconds with 1 issue.\n")),
    { total: 4, failed: 1, format: "swift-summary" });
});

test("ExUnit, RSpec, and Minitest count their summaries", () => {
  assert.deepEqual(counts(parseLanguageRunnerSummary("Finished in 0.03 seconds\n1 doctest, 5 tests, 0 failures\n")),
    { total: 6, failed: 0, format: "exunit-summary" });
  assert.deepEqual(counts(parseLanguageRunnerSummary("5 examples, 1 failure\n")),
    { total: 5, failed: 1, format: "rspec-summary" });
  assert.deepEqual(counts(parseLanguageRunnerSummary("5 runs, 9 assertions, 0 failures, 0 errors, 1 skips\n")),
    { total: 5, failed: 0, format: "minitest-summary" });
});

test("go test -v counts each test line and a failing package", () => {
  const output = "=== RUN   TestA\n--- PASS: TestA (0.00s)\n--- PASS: TestB (0.00s)\n--- FAIL: TestC (0.00s)\nFAIL\nFAIL\texample.com/calc\t0.01s\n";
  const parsed = parseLanguageRunnerSummary(output);
  assert.deepEqual(counts(parsed), { total: 3, failed: 1, format: "go-test-verbose" });
  assert.deepEqual(parsed.criticalCases.map((row) => row.status), ["pass", "pass", "fail"]);
  assert.deepEqual(counts(parseLanguageRunnerSummary("--- PASS: TestA (0.00s)\nok  \texample.com/calc\t0.01s\n")),
    { total: 1, failed: 0, format: "go-test-verbose" });
});

test("a Go build error counts as a failure, never a pass", () => {
  const parsed = parseLanguageRunnerSummary("# example.com/calc\n./calc.go:3:1: syntax error\nFAIL\texample.com/calc [build failed]\n");
  assert.equal(parsed.failed, 1);
  assert.equal(parsed.passed, 0);
});

test("output without a summary is not counted", () => {
  for (const output of ["BUILD SUCCESSFUL in 3s\n", "", "ok  \texample.com/calc\t(cached)\n", "all good\n"])
    assert.equal(parseLanguageTestOutput(output), null, JSON.stringify(output));
});

test("Prove's own parsers still win: a vitest footer is read before a pytest-shaped line", () => {
  const output = " Tests  5 passed (5)\n3 passed in 0.10s\n";
  // The adapter tries parseRunnerSummaryOutput first and this module only when it found nothing.
  assert.equal(parseRunnerSummaryOutput(output).format, "vitest-summary");
  assert.equal(parseRunnerSummaryOutput(output).totalTests, 5);
});

test("JUnit XML reads testsuites totals and testcase outcomes", () => {
  const xml = '<?xml version="1.0"?>\n<testsuites tests="4" failures="1" errors="0" skipped="1">\n' +
    '<testsuite name="a" tests="4" failures="1" errors="0" skipped="1">\n' +
    '<testcase classname="a.Calc" name="adds"/>\n<testcase classname="a.Calc" name="subtracts"><failure message="x"/></testcase>\n' +
    '<testcase classname="a.Calc" name="later"><skipped/></testcase>\n<testcase classname="a.Calc" name="divides"></testcase>\n' +
    "</testsuite>\n</testsuites>\n";
  const parsed = parseJUnitXmlOutput(xml);
  assert.deepEqual(counts(parsed), { total: 4, failed: 1, format: "junit-xml" });
  assert.equal(parsed.passed, 2);
  assert.deepEqual(parsed.criticalCases, [
    { id: "a.Calc.adds", status: "pass" }, { id: "a.Calc.subtracts", status: "fail" },
    { id: "a.Calc.later", status: "skip" }, { id: "a.Calc.divides", status: "pass" }]);
});

test("JUnit XML that is not counted is rejected", () => {
  assert.equal(parseJUnitXmlOutput('<testsuite name="a" tests="many"></testsuite>'), null);
  assert.equal(parseJUnitXmlOutput('<testsuite name="a" tests="2" failures="3"></testsuite>'), null);
  assert.equal(parseJUnitXmlOutput("<report/>"), null);
  for (const tests of ["", " ", "1e2", "0x10", "4.0", "-1"])
    assert.equal(parseJUnitXmlOutput(`<testsuite name="a" tests="${tests}"></testsuite>`), null, tests);
});

test("nested JUnit suites count once, through their outermost suite", () => {
  // PHPUnit: no totals on testsuites, a file suite holding a class suite.
  const xml = '<testsuites>\n<testsuite name="all" tests="3" failures="1" errors="0">\n' +
    '<testsuite name="CalcTest" tests="3" failures="1" errors="0">\n<testcase name="a"/>\n' +
    '<testsuite name="CalcTest::b" tests="2" failures="1" errors="0"><testcase name="b1"/></testsuite>\n' +
    "</testsuite>\n</testsuite>\n" +
    '<testsuite name="other" tests="2" failures="0" errors="0"/>\n</testsuites>\n';
  assert.deepEqual(counts(parseJUnitXmlOutput(xml)), { total: 5, failed: 1, format: "junit-xml" });
});

test("a report directory adds the XML files this run wrote and ignores older ones", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "junit-dir-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const started = Date.now();
  writeFileSync(join(dir, "TEST-A.xml"), '<testsuite name="A" tests="3" failures="0" errors="0" skipped="0"></testsuite>');
  writeFileSync(join(dir, "TEST-B.xml"), '<testsuite name="B" tests="2" failures="1" errors="0" skipped="0"></testsuite>');
  writeFileSync(join(dir, "notes.txt"), "not a report");
  const content = freshReportDirectoryContent(dir, started);
  assert.deepEqual(counts(parseLanguageTestOutput(content)), { total: 5, failed: 1, format: "junit-xml" });
  const old = (started - 60000) / 1000;
  utimesSync(join(dir, "TEST-A.xml"), old, old);
  utimesSync(join(dir, "TEST-B.xml"), old, old);
  assert.equal(freshReportDirectoryContent(dir, started), null);
  assert.equal(freshReportDirectoryContent(join(dir, "missing"), started), null);
});
