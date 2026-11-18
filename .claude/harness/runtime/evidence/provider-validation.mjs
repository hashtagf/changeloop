// Validating a provider's configuration: readiness probes, signed CI, its
// capability-specific settings, and semantic-acceptance claims and sources.


export function createProviderValidation({
  INPUT_MODES, die
}) {
  function validateProviderReadiness(provider, config) {
    if (config.readiness === undefined) return;
    if (!config.readiness || typeof config.readiness !== "object" ||
        typeof config.readiness.url !== "string")
      die(`provider '${provider}' readiness requires a URL`);
    try { new URL(config.readiness.url); }
    catch { die(`provider '${provider}' readiness URL is invalid`); }
    if (config.readiness.expectStatus !== undefined &&
        (!Number.isInteger(Number(config.readiness.expectStatus)) ||
         Number(config.readiness.expectStatus) < 100 ||
         Number(config.readiness.expectStatus) > 599))
      die(`provider '${provider}' readiness expectStatus must be an HTTP status`);
    if (config.readiness.expectBody !== undefined &&
        typeof config.readiness.expectBody !== "string")
      die(`provider '${provider}' readiness expectBody must be a string`);
    if (config.readiness.expectHeader !== undefined &&
        (!config.readiness.expectHeader ||
         typeof config.readiness.expectHeader !== "object" ||
         Array.isArray(config.readiness.expectHeader)))
      die(`provider '${provider}' readiness expectHeader must be an object`);
  }

  function validateProviderCi(provider, config) {
    if (config.ci === undefined) return;
    if (config.adapter !== "external" || !config.ci || typeof config.ci !== "object" ||
        typeof config.ci.issuer !== "string" || !config.ci.issuer.trim() ||
        typeof config.ci.publicKey !== "string" || !config.ci.publicKey.includes("PUBLIC KEY"))
      die(`provider '${provider}' ci verification requires external adapter, issuer, and publicKey`);
  }

  function validateCapabilityConfiguration(provider, config, capability) {
    if (config.adapter === "playwright" && config.inputMode &&
        !INPUT_MODES.has(config.inputMode))
      die(`provider '${provider}' has invalid inputMode '${config.inputMode}'`);
    const defaultInputMode = config.adapter === "playwright" ? "browser-automation" : "";
    if (capability === "browser" && config.adapter !== "external" &&
        !INPUT_MODES.has(config.inputMode || defaultInputMode))
      die(`configured browser provider '${provider}' requires a valid inputMode ` +
        `(${[...INPUT_MODES].join(", ")}); set "inputMode" on providers.${provider} in the ` +
        "draft's execution (change.json or execution.yaml in the draft folder) or the " +
        "change's execution.yaml");
    if (capability === "mutation" && config.adapter !== "external" &&
        config.resultProtocol !== "foundation-mutation-v2" &&
        !["behavioral-kill", "test-failure"].includes(config.classification))
      die("configured mutation provider requires classification behavioral-kill|test-failure");
    if (capability === "review" && config.adapter !== "external")
      die("review capability requires an external provider");
    if (capability === "acceptance" && config.adapter !== "external")
      die("acceptance capability requires an external human provider");
    if (capability === "semantic-acceptance") {
      if (config.adapter !== "external")
        die("semantic-acceptance capability requires an external signed verdict provider");
      if (!config.semanticAcceptance ||
          typeof config.semanticAcceptance.issuer !== "string" ||
          !config.semanticAcceptance.issuer.trim() ||
          typeof config.semanticAcceptance.publicKey !== "string" ||
          !config.semanticAcceptance.publicKey.includes("PUBLIC KEY"))
        die(`provider '${provider}' semanticAcceptance requires issuer and publicKey`);
      if (!Array.isArray(config.acceptanceCases) || config.acceptanceCases.length === 0)
        die(`provider '${provider}' semantic-acceptance requires acceptanceCases`);
      const ids = new Set();
      for (const [index, row] of config.acceptanceCases.entries()) {
        if (!row || typeof row !== "object" ||
            !String(row.id || "").trim() || !String(row.claimId || "").trim() ||
            !String(row.partition || "").trim())
          die(`provider '${provider}' acceptanceCases[${index}] requires id, claimId, and partition`);
        if (ids.has(row.id))
          die(`provider '${provider}' acceptanceCases has duplicate id '${row.id}'`);
        if (Boolean(row.sourceProvider) !== Boolean(row.criticalCaseId))
          die(`provider '${provider}' acceptanceCases[${index}] must declare sourceProvider and criticalCaseId together`);
        if (row.requiresFailToPass !== undefined && typeof row.requiresFailToPass !== "boolean")
          die(`provider '${provider}' acceptanceCases[${index}].requiresFailToPass must be boolean`);
        ids.add(row.id);
      }
    }
    validateProviderCi(provider, config);
  }

  function validateSemanticAcceptanceClaims(provider, config, capability, claims) {
    if (capability !== "semantic-acceptance") return;
    const declared = new Set(claims.filter((claim) =>
      claim.capabilities.includes("semantic-acceptance")).map((claim) => claim.id));
    const unknown = config.acceptanceCases
      .map((row) => row.claimId).filter((claimId) => !declared.has(claimId));
    if (unknown.length)
      die(`provider '${provider}' acceptanceCases reference claim(s) without semantic-acceptance: ${
        [...new Set(unknown)].join(", ")}`);
  }

  function validateSemanticAcceptanceSources(provider, config, capability,
      configuredProviders) {
    if (capability !== "semantic-acceptance") return;
    for (const row of config.acceptanceCases) {
      if (!row.sourceProvider) continue;
      const source = configuredProviders[row.sourceProvider];
      if (!source || row.sourceProvider === provider)
        die(`provider '${provider}' acceptance case '${row.id}' has invalid sourceProvider '${row.sourceProvider}'`);
      if (!(source.criticalCases || []).includes(row.criticalCaseId))
        die(`provider '${provider}' acceptance case '${row.id}' source does not declare critical case '${row.criticalCaseId}'`);
    }
  }

  return {
    validateProviderReadiness, validateCapabilityConfiguration, validateSemanticAcceptanceClaims,
    validateSemanticAcceptanceSources
  };
}
