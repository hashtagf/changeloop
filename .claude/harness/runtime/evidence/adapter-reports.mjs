// Recording what test-discovery and Playwright adapters report: the project's
// package scripts, infrastructure failures, Playwright attachments, output
// status, and observation.
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { aggregateEvidenceStatus, evidenceResultValue, parseExecutedTestEvidence } from "./evidence-results.mjs";
import { enforceCriticalCases, discoveryCountRepair } from "./adapter-results.mjs";

export function createAdapterReports({
  ROOT, numericReportValue, playwrightReportSummary, providerCapability, providerClaims,
  providerConfig, recordReceipt, requiredProviders
}) {
  function workspacePackageScripts(cwd) {
    try {
      const scripts = JSON.parse(readFileSync(join(cwd || ROOT, "package.json"), "utf8")).scripts;
      return scripts && typeof scripts === "object" ? scripts : null;
    } catch { return null; }
  }

  function adapterInfrastructureFailed(result, readinessMissed) {
    return Boolean(result.timedOut || result.error || readinessMissed);
  }

  function recordTestDiscoveryAdapter(id, provider, config, execution, evidenceRow,
    baseFlags, readinessMissed) {
    const { result } = execution;
    const testProvider = provider;
    const discoveryProvider = config.discoveryProvider || "discovery";
    const discoveryConfig = providerConfig(id, discoveryProvider) || config;
    const testBaseStatus = adapterInfrastructureFailed(result, readinessMissed)
      ? "error" : result.status !== 0 ? "fail" : "pass";
    const testStatus = enforceCriticalCases(testBaseStatus, evidenceRow.critical);
    recordReceipt(id, testProvider, testStatus, {
      ...baseFlags, claims: providerClaims(id, testProvider, config).join(","),
      observed: `${baseFlags.observed}; critical cases ${
        evidenceRow.critical.observations.length
          ? evidenceRow.critical.observations.map((row) =>
            `${row.id}=${row.status}`).join(", ") : "not declared"}`,
      criticalCases: evidenceRow.critical.observations
    }, { executed: true });
    const discovered = numericReportValue(evidenceRow.report, [
      "numTotalTests", "totalTests", "tests", "testCount", "expected"
    ]);
    const minimum = Number(config.minimum || 1);
    const infrastructureFailed = adapterInfrastructureFailed(result, readinessMissed);
    // Rapid lane only: a clean exit plus a line only an executed test prints
    // proves minimum 1, recorded as exit-code measurement with no count.
    const executedEvidence = discovered === null && !infrastructureFailed &&
      result.status === 0 && minimum === 1 && execution.state?.schema === "foundation-rapid"
      ? parseExecutedTestEvidence(`${result.stdout || ""}\n${result.stderr || ""}`) : null;
    const countMeasurement = executedEvidence ? "exit-code" : discovered === null ? null : "count";
    const discoveryStatus = infrastructureFailed
      ? "error" : executedEvidence ? "pass" : discovered === null ? "inconclusive"
        : discovered >= minimum ? "pass" : "fail";
    recordReceipt(id, discoveryProvider, discoveryStatus, {
      ...baseFlags, config: discoveryConfig,
      claims: providerClaims(id, discoveryProvider, discoveryConfig).join(","),
      discovered, minimum, countMeasurement,
      observed: executedEvidence
        ? `test count unavailable; exit 0 with executed-test marker ${
          executedEvidence.marker} ('${executedEvidence.line}'); rapid lane accepts minimum 1` :
        discovered === null
        ? `structured test count unavailable: provider '${testProvider}' output had no JSON, TAP, ` +
          `node spec, or runner summary; ${discoveryCountRepair(
            config.command, workspacePackageScripts(execution.cwd))}` :
        `${discovered} discovered; minimum ${minimum}`
    }, { executed: true });
    return evidenceResultValue({
      provider,
      status: aggregateEvidenceStatus([testStatus, discoveryStatus]),
      observations: [
        ...evidenceRow.critical.observations.map((row) => ({
          kind: "critical-case", ...row
        })),
        { kind: "discovery", provider: discoveryProvider, status: discoveryStatus,
          discovered, minimum, countMeasurement }
      ]
    });
  }

  function playwrightAttachments(summary, cwd, artifacts) {
    for (const attachment of summary?.attachments || []) {
      const path = isAbsolute(attachment) ? attachment : resolve(cwd, attachment);
      if (existsSync(path))
        artifacts.push({
          path: relative(ROOT, path), type: "playwright-attachment", required: false
        });
    }
  }

  function playwrightOutputStatus(result, summary, missingClaims, critical, readinessMissed) {
    const base = adapterInfrastructureFailed(result, readinessMissed) ? "error" :
      result.status !== 0 || (summary?.failed || 0) > 0 ? "fail" :
        !summary || !Number.isInteger(summary.tests) ||
          summary.tests - summary.skipped - (summary.inconclusive || 0) <= 0 ||
          summary.inconclusive > 0 || missingClaims.length ? "inconclusive" : "pass";
    return enforceCriticalCases(base, critical);
  }

  function playwrightObservation(summary, requiredClaims, missingClaims) {
    if (!summary) return "Playwright JSON report unavailable";
    return `${summary.tests} tests; ${summary.failed} failed; ${summary.skipped} skipped; ` +
      `${summary.inconclusive || 0} inconclusive; ` +
      `covered claims ${requiredClaims.length - missingClaims.length}/${requiredClaims.length}; ` +
      `observed annotations ${summary.claims.length}` +
      (missingClaims.length ? `; missing ${missingClaims.join(",")}` : "") +
      (summary.inconclusive > 0 || summary.tests === summary.skipped
        ? "; repair the project JSON reporter/test selection and rerun this provider" : "") +
      (summary.skippedClaims.length
        ? `; claimed only by skipped tests ${summary.skippedClaims.join(",")}` : "");
  }

  function recordPlaywrightAdapter(id, provider, config, execution, evidenceRow,
    baseFlags, readinessMissed) {
    const summary = evidenceRow.report
      ? playwrightReportSummary(evidenceRow.report) : null;
    playwrightAttachments(summary, execution.cwd, evidenceRow.artifacts);
    const outputs = [...new Set([provider, ...(config.outputs || [])])]
      .filter((output) => requiredProviders(id).includes(output));
    const outputResults = [];
    for (const output of outputs) {
      const requiredClaims = providerClaims(id, output, config);
      const missingClaims = summary
        ? requiredClaims.filter((claim) => !summary.claims.includes(claim))
        : requiredClaims;
      const status = playwrightOutputStatus(
        execution.result, summary, missingClaims, evidenceRow.critical, readinessMissed);
      outputResults.push({ output, status, missingClaims });
      const outputCapability = providerCapability(output, providerConfig(id, output));
      recordReceipt(id, output, status, {
        ...baseFlags, claims: requiredClaims.join(","),
        "input-mode": outputCapability === "browser"
          ? config.inputMode || "browser-automation" : config.inputMode || null,
        "foreground-required": config.foregroundRequired ? "yes" : "no",
        "foreground-available": config.foregroundAvailable ? "yes" : "no",
        observed: playwrightObservation(summary, requiredClaims, missingClaims),
        criticalCases: evidenceRow.critical.observations
      }, { executed: true });
    }
    return evidenceResultValue({
      provider,
      status: aggregateEvidenceStatus(outputResults.map((row) => row.status)),
      observations: outputResults.map((row) => ({
        kind: "output", provider: row.output, status: row.status,
        missingClaims: row.missingClaims
      }))
    });
  }

  return { adapterInfrastructureFailed, recordTestDiscoveryAdapter, recordPlaywrightAdapter };
}
