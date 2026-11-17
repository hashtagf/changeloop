

export function failValidationLayer(fail, name, issues) {
  if (issues.length)
    fail(`${name} validation failed:\n  - ${issues.join("\n  - ")}`);
}

export function semanticInvariantIdentityIssues(row, label, invariantIds) {
  const issues = [];
  const id = String(row?.id || "").trim();
  if (!/^INV-[A-Z0-9][A-Z0-9-]*$/i.test(id))
    issues.push(`${label}.id must match INV-<stable-id>`);
  if (invariantIds.has(id.toUpperCase()))
    issues.push(`${label}.id '${id}' is duplicated`);
  invariantIds.add(id.toUpperCase());
  if (!String(row?.statement || "").trim())
    issues.push(`${label}.statement is required`);
  return issues;
}

export function semanticInvariantCollectionIssues(row, label) {
  const issues = [];
  for (const field of ["decisionIds", "claimIds", "specScenarios"])
    if (!Array.isArray(row?.[field]) || row[field].length === 0)
      issues.push(`${label}.${field} must be a non-empty array`);
  return issues;
}

export function semanticInvariantReferenceIssues(row, label, context) {
  const issues = [];
  for (const decisionId of row?.decisionIds || [])
    if (!context.decisionIds.has(decisionId))
      issues.push(`${label} references unknown decision '${decisionId}'`);
  for (const claimId of row?.claimIds || []) {
    context.boundClaims.add(claimId);
    if (!context.claims.has(claimId))
      issues.push(`${label} references unknown claim '${claimId}'`);
  }
  for (const scenario of row?.specScenarios || [])
    if (!context.scenarioNames.has(String(scenario).toLowerCase()))
      issues.push(`${label} references unknown spec scenario '${scenario}'`);
  return issues;
}

export function compatibilityInvariantBindingIssues(claims, boundClaims) {
  return [...claims.values()]
    .filter((claim) => (claim.capabilities || []).some((capability) =>
      ["compatibility", "cross-repo-contract"].includes(capability)))
    .filter((claim) => !boundClaims.has(claim.id))
    .map((claim) =>
      `compatibility claim '${claim.id}' requires a semantic invariant binding; ` +
      "add {id, statement, decisionIds:[...], claimIds:[...], specScenarios:[...]} " +
      "to grounding.yaml semanticInvariants");
}

export function semanticInvariantIssues(invariants, contract, decisionIds,
  specScenarios, { required = false } = {}) {
  const rows = Array.isArray(invariants) ? invariants : [];
  if (required && !Array.isArray(invariants))
    return ["grounding.yaml semanticInvariants must be an array"];
  const claims = new Map((contract?.claims || []).map((claim) => [claim.id, claim]));
  const context = {
    claims,
    decisionIds,
    scenarioNames: new Set([...specScenarios].map((name) => name.toLowerCase())),
    invariantIds: new Set(),
    boundClaims: new Set()
  };
  const issues = [];
  for (const [index, row] of rows.entries()) {
    const label = `semanticInvariants[${index}]`;
    issues.push(...semanticInvariantIdentityIssues(row, label, context.invariantIds));
    issues.push(...semanticInvariantCollectionIssues(row, label));
    issues.push(...semanticInvariantReferenceIssues(row, label, context));
  }
  issues.push(...compatibilityInvariantBindingIssues(claims, context.boundClaims));
  return issues;
}
