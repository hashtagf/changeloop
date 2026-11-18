// The review policy a change's evidence contract carries: the signals that
// force or diversify review, the rapid-lane exemption, and the fingerprinted
// policy a receipt binds.
import { reviewSemanticText, securityRiskSignals, thaiRiskPattern } from "./review-routing.mjs";
import { reviewCoveredProviders } from "./provider-catalog.mjs";

const THAI_REQUIRED_SEMANTICS =
  thaiRiskPattern("concurrency", "money", "migration", "irreversible");

const THAI_CRITICAL_SEMANTICS = thaiRiskPattern("money", "migration", "irreversible");

// Named once and read by both `reviewPolicy` and the change-time forecast. The
// forecast has to answer "will this need a reviewer?" from the same lists, but
// `contractFingerprint` hashes `reviewPolicy`'s returned object — so the answer
// is shared as a constant rather than by widening that return value, which
// would re-fingerprint every in-flight change and invalidate evidence nobody
// asked to re-earn.
export const REVIEW_FORCING_CAPABILITIES = Object.freeze([
  "review", "security-static", "data-migration", "compatibility",
  "cross-repo-contract", "state-identity"
]);

export const REVIEW_DIVERSITY_CAPABILITIES = Object.freeze([
  "security-static", "data-migration", "compatibility"
]);

export function collectReviewSignals(state, contract, configuredCapabilities = [],
  grounding = null, workTypeOnly = new Set()) {
  const capabilities = new Set([
    ...(state.evidenceCapabilities || []),
    ...contract.claims.flatMap((claim) => claim.capabilities || []),
    ...configuredCapabilities
  ].filter((capability) => !workTypeOnly.has(capability)));
  // Keyword-only intent never forces diversity or a higher tier; see
  // reviewSemanticText. Review itself stays required for such changes through
  // state.reviewRequired set by resolve.
  const semantic = reviewSemanticText({ state, claims: contract.claims, grounding });
  const requiredTriggers = [];
  const diversityTriggers = [];
  const riskClaims = contract.claims.filter((claim) => claim.impact !== "low");
  if (riskClaims.some((claim) => claim.capabilities.some((capability) =>
    !workTypeOnly.has(capability) && REVIEW_FORCING_CAPABILITIES.includes(capability))))
    requiredTriggers.push("risk-capability");
  if (riskClaims.some((claim) => (claim.repositories || []).length > 1))
    requiredTriggers.push("multi-repository-claim");
  // A specialist capability wired only to the test command is covered by
  // review instead of by a re-run, so review is required and names it; the
  // capability itself sets the tier (security-static and the contract/data
  // capabilities are high, resilience at least medium).
  for (const row of reviewCoveredProviders(contract.providers))
    requiredTriggers.push(`covered-by-review:${row.capability}`);
  // An access-control or financial risk signal declares a high-risk boundary:
  // review is required under every review policy, named by the signal itself.
  requiredTriggers.push(...securityRiskSignals(state, "high"));
  if (/\b(concurren|race|deadlock|money|payment|billing|financial|migration|irreversible)\w*\b/.test(semantic) ||
      THAI_REQUIRED_SEMANTICS.test(semantic))
    requiredTriggers.push("risk-semantics");
  if ((state.securityTriggers || []).length ||
      REVIEW_DIVERSITY_CAPABILITIES.some((value) => capabilities.has(value)))
    diversityTriggers.push("critical-capability");
  if (/\b(money|payment|billing|financial|migration|irreversible)\b/.test(semantic) ||
      THAI_CRITICAL_SEMANTICS.test(semantic))
    diversityTriggers.push("critical-semantics");
  return { capabilities, requiredTriggers, diversityTriggers };
}

// Risk-tiered review reviews every change except a low-tier rapid-lane change
// that nothing asks to review: no declared or keyword review, no required or
// diversity trigger, no review capability. Its proof is the project's
// deterministic evidence alone. Anything inferred from the built diff that
// raises the tier (security-static, contract or data capabilities) restores
// review, because the tier is recomputed at every Prove.
export function rapidEvidenceOnly({ state = /** @type {Record<string, any>} */ ({}), signals, riskRoute, signalled }) {
  return state.schema === "foundation-rapid" && riskRoute?.tier === "low" &&
    !signalled && !(signals?.diversityTriggers || []).length;
}

// The contract fingerprint keeps the review-policy shape it had before the
// rapid exemption existed (risk-tiered was always `required: true`), so
// upgrading never re-fingerprints an in-flight change. The exemption is a pure
// function of fingerprinted inputs and is enforced live by requiredProviders.
// Budget the user grants to finish review (`grantedAiWaveCap` from
// `authority extend-review`) is authority, not agreement: it never moves the
// fingerprint that receipts, plans, and review closure bind to.
export function fingerprintedReviewPolicy(policy) {
  if (!policy || typeof policy !== "object") return policy;
  const { grantedAiWaveCap: _grant, ...agreement } = policy;
  return agreement.tier && agreement.required === false
    ? { ...agreement, required: true } : agreement;
}

export function assembleReviewPolicy({
  state, signals, riskRoute, policy
}) {
  const { capabilities, requiredTriggers, diversityTriggers } = signals;
  const triggers = [...new Set([...requiredTriggers, ...diversityTriggers])].sort();
  // A project with one model available cannot satisfy diversity with a second
  // provider, so the only remaining path is a person — on every critical
  // change, forever. `review.diversity: "single-model"` in foundation.json
  // trades that for a same-family reviewer, and says so: the waiver is a
  // trigger of its own, so it travels into the review packet and the receipt
  // instead of quietly disappearing.
  //
  // `review.independence: "self"` is the same trade for the other property,
  // for a project driven from a single session: a fresh session is free only
  // when there is a second one to open. It applies at every impact, because
  // the changes that force review are exactly the ones that would otherwise
  // be understated to get past it — and it relaxes nothing else, so a
  // critical self-review still has to satisfy diversity on its own terms.
  //
  // contractFingerprint hashes this whole object, so a project that never
  // opts in must keep producing the byte-identical shape it produced before
  // either waiver existed — otherwise upgrading Foundation would
  // re-fingerprint every in-flight change and invalidate evidence nobody
  // asked to re-earn. Hence each key appears only when its waiver is in force.
  const singleModel = policy.diversity === "single-model";
  const diversityRequired = diversityTriggers.length > 0 ||
    riskRoute.tier === "high";
  const waived = singleModel && diversityRequired;
  if (waived) triggers.push("diversity-waived-single-model");
  const selfReview = policy.independence === "self";
  if (selfReview) triggers.push("independence-waived-self-review");
  const signalled = Boolean(state.reviewRequired || requiredTriggers.length ||
    capabilities.has("review"));
  return {
    required: !rapidEvidenceOnly({ state, signals, riskRoute, signalled }),
    tier: riskRoute.tier,
    route: riskRoute.route,
    maxAiAttempts: riskRoute.maxAiAttempts,
    requiresHumanFinal: riskRoute.requiresHumanFinal,
    independence: selfReview ? "self" : "required",
    diversity: diversityRequired && !singleModel ? "required" : "preferred",
    ...(waived ? { diversityWaived: true } : {}),
    ...(selfReview ? { independenceWaived: true } : {}),
    triggers: [...new Set([...triggers, ...riskRoute.triggers])].sort()
  };
}
