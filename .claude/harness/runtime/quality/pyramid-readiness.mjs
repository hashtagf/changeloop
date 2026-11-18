// Pyramid readiness: how far a codebase is from the poteto pyramid, layer by
// layer, from facts the caller collects. Change Loop measures its own
// repository and every installed project with these same criteria, so the
// principle travels with the tool.
//
// Each findings lane is judged twice: does it ratchet (growth is stopped),
// and is it clear (the existing debt is gone).
//
//   1 codebase      the code itself resists misuse: sizes, nesting, copies, boundaries, a feature map
//   2 static        tools catch the rest: lint, types, stopgap comments
//   3 verification  behavior is proven: tests, coverage, mutation
//   4 prose         guidance is the last resort: recurring lessons and guide rules have checks
//   5 review        people see what the layers above missed, that stays rare, and each escape becomes a regression
//
// A criterion is met, unmet (with the next step that meets it), or unmeasured
// (no fact yet). A layer's percent counts only measured criteria; nothing
// unmeasured is ever scored as zero or as a pass.

export const READINESS_PROTOCOL = "foundation-pyramid-readiness-v1";
export const LAYERS = Object.freeze(["codebase", "static", "verification", "prose", "review"]);
// Outcome targets for the review layer; three archived changes before judging.
export const REVIEW_TARGETS = Object.freeze({ minimumChanges: 3, firstProofPassRate: 0.7, escapedDefectRate: 0.1 });

const LANE_NEXT = {
  "no-lane": (capability) => `add a '${capability}' lane to quality/foundation-quality.json ` +
    "(cloop quality discover shows the providers it found; cloop quality init --write creates a missing file)",
  "not-run": (capability) => `cloop quality run --capability ${capability}`,
  "no-baseline": (capability) =>
    `cloop quality baseline --write --capability ${capability} --decision-ref <ref> --reason <why>`,
  incompatible: (capability) =>
    `cloop quality baseline --write --capability ${capability} --decision-ref <ref> --reason <why>`
};

// A quality lane is met only while it ratchets: configured, run, and compared
// against a compatible baseline.
function lane(id, layer, label, capability, alternatives = []) {
  return {
    id, layer, label,
    evaluate: ({ lanes = {} }) => {
      const state = [capability, ...alternatives].map((name) => lanes[name]).find((value) => value === "ratcheting")
        || lanes[capability] || "no-lane";
      if (state === "ratcheting") return { status: "met", detail: `${capability} ratchets against its baseline` };
      return { status: "unmet", detail: `${capability}: ${state}`, next: (LANE_NEXT[state] || LANE_NEXT["no-lane"])(capability) };
    }
  };
}

// A ratchet stops growth; this asks whether the existing debt is gone. Unmet
// while the lane's latest result still carries findings, unmeasured before it runs.
function clear(id, layer, label, capability) {
  return {
    id, layer, label,
    evaluate: ({ findings = {} }) => {
      const count = findings[capability];
      if (count === undefined || count === null) return { status: "unmeasured", detail: `${capability} has no result` };
      return count === 0 ? { status: "met", detail: `no ${capability} findings` }
        : { status: "unmet", detail: `${count} ${capability} finding(s) remain`,
          next: "shrink them through ordinary changes (cloop quality debt lists each), then lower the baseline" };
    }
  };
}

// A UI criterion applies only to a project with a user interface; without one
// it is not applicable, which is neither measured nor listed.
function uiOutsideScope(facts) {
  if (facts === undefined || facts === null) return { status: "unmeasured", detail: "UI surface not read" };
  return facts.present ? null : { status: "not-applicable", detail: "no user interface" };
}

function ui(id, layer, label, field, next) {
  return {
    id, layer, label,
    evaluate: ({ ui: facts }) => uiOutsideScope(facts) || (facts[field] ? { status: "met", detail: `${facts[field]}` }
      : { status: "unmet", detail: `UI (${facts.framework || `${facts.uiFiles} UI file(s)`}) without it`, next })
  };
}

const TOKENS_NEXT = "define colors, type, and spacing once (a tokens file, CSS custom properties, or the Tailwind " +
  "config) and reference them; skill ux-ui-principles drafts DESIGN.md and tokens from the code";

// Tokens are met only when colors actually go through them: a token source
// alone, with colors still written inline beside it, is not.
function tokensVerdict(facts) {
  const { source, rawColors = 0, rawColorFiles = [] } = facts.tokens || {};
  if (!source) return { status: "unmet", detail: "no design-token source", next: TOKENS_NEXT };
  if (rawColors === 0) return { status: "met", detail: `${source}; no color written outside a token` };
  return { status: "unmet", detail: `${rawColors} color literal(s) outside token definitions: ${
    rawColorFiles.slice(0, 3).map((row) => `${row.path} ${row.count}`).join(", ")}`,
  next: "move each color into a named token (one per role, near-duplicates merged with the owner's approval) " +
    "and reference it with var(); skill ux-ui-principles extracts the palette from the code" };
}

function rate(numerator, denominator) {
  return denominator ? numerator / denominator : null;
}

/** @typedef {{ status: string, detail: string, next?: string }} Verdict */
/** @type {ReadonlyArray<{ id: string, layer: string, label: string, evaluate: (facts: any) => Verdict }>} */
export const CRITERIA = Object.freeze([
  lane("file-size", "codebase", "No file grows past the size ceiling", "file-size"),
  clear("file-size-clear", "codebase", "No file is over the size ceiling", "file-size"),
  lane("nesting-depth", "codebase", "No file nests deeper than its baseline", "nesting-depth"),
  clear("nesting-depth-clear", "codebase", "No file nests past the depth limit", "nesting-depth"),
  lane("duplication", "codebase", "No new copied blocks", "duplication"),
  clear("duplication-clear", "codebase", "No copied blocks remain", "duplication"),
  lane("module-boundaries", "codebase", "Modules import only what they may", "module-boundaries"),
  clear("module-boundaries-clear", "codebase", "No boundary violations remain", "module-boundaries"),
  {
    id: "feature-map", layer: "codebase", label: "Features map to the code behind them",
    evaluate: ({ featureMap }) => featureMap === undefined ? { status: "unmeasured", detail: "feature map not read" }
      : featureMap?.features > 0 && !featureMap.issues
        ? { status: "met", detail: `${featureMap.features} feature(s)` }
        : { status: "unmet", detail: featureMap ? `${featureMap.features} feature(s), ${featureMap.issues || 0} issue(s)` : "no feature map",
          next: "onboard the project (skill: onboard) to draft openspec/feature-map.json, then cloop features --strict" }
  },
  { id: "ui-tokens", layer: "codebase", label: "UI colors come from design tokens",
    evaluate: ({ ui: facts }) => uiOutsideScope(facts) || tokensVerdict(facts) },
  lane("lint", "static", "Lint findings ratchet", "lint"),
  clear("lint-clear", "static", "No lint findings remain", "lint"),
  lane("type-check", "static", "Type findings ratchet", "type-check"),
  clear("type-check-clear", "static", "No type findings remain", "type-check"),
  lane("workaround-comments", "static", "Stopgap comments ratchet", "workaround-comments"),
  clear("workaround-comments-clear", "static", "No stopgap comments remain", "workaround-comments"),
  ui("ui-a11y-lint", "static", "An accessibility lint covers the UI", "a11yLint",
    "add the framework's accessibility lint (eslint-plugin-jsx-a11y, eslint-plugin-vuejs-accessibility, " +
    "svelte-check, @angular-eslint template rules, or Biome) to the lint lane"),
  {
    id: "tests", layer: "verification", label: "A test lane proves behavior",
    evaluate: (/** @type {{ lanes?: Record<string, string> }} */ { lanes = {} }) => lanes.test && lanes.test !== "no-lane"
      ? { status: "met", detail: `test lane ${lanes.test}` }
      : { status: "unmet", detail: "no test lane", next: LANE_NEXT["no-lane"]("test") }
  },
  lane("coverage", "verification", "Coverage or CRAP ratchets", "crap", ["coverage"]),
  lane("mutation", "verification", "Mutation testing ratchets", "automated-mutation"),
  ui("ui-rendered", "verification", "The UI is checked rendered in a browser", "rendered",
    "add a browser check that saves screenshots (Playwright, or a 'screenshot' script); prototype-bound " +
    "changes feed those screenshots to the visual check"),
  ui("ui-accessibility", "verification", "Accessibility is checked on the rendered UI", "a11yCheck",
    "add an accessibility check on rendered pages (@axe-core/playwright, jest-axe, or pa11y) as a " +
    "'test:accessibility' script; Prove runs it as the accessibility provider"),
  {
    id: "lessons", layer: "prose", label: "Every recurring lesson has a check or a recorded judgment",
    evaluate: ({ lessons }) => !lessons ? { status: "unmeasured", detail: "lessons not read" }
      : lessons.pending === 0 ? { status: "met", detail: `${lessons.recurring} recurring lesson(s), none prose-only` }
        : { status: "unmet", detail: `${lessons.pending} of ${lessons.recurring} recurring lesson(s) without a check`,
          next: "cloop lessons --pretty; adopt each check from its adoption draft through /change" }
  },
  {
    id: "guide-rules", layer: "prose", label: "Every agent-guide rule names its check or why none can exist",
    evaluate: ({ rules }) => !rules
      ? { status: "unmet", detail: "no quality/rule-enforcement.json",
        next: "list each rule from CLAUDE.md/AGENTS.md in quality/rule-enforcement.json with the check that enforces it" }
      : rules.issues > 0 ? { status: "unmet", detail: `${rules.issues} registry issue(s)`,
        next: "fix the rows quality/rule-enforcement.json reports (stale quote, missing check file)" }
        : rules.unregistered > 0 ? { status: "unmet",
          detail: `${rules.unregistered} rule sentence(s) in CLAUDE.md/AGENTS.md have no registry row`,
          next: "add a quality/rule-enforcement.json row for each listed sentence (cloop quality readiness --pretty lists them)" }
        : rules.prose === 0 ? { status: "met", detail: `${rules.registered} rule(s), none prose-only` }
          : { status: "unmet", detail: `${rules.prose} of ${rules.registered} rule(s) are prose only`,
            next: "enforce each prose-only rule with a test, lint rule, or type, or record judgment: <why>" }
  },
  ui("ui-design-doc", "prose", "UI rules live in one DESIGN.md", "design",
    "write DESIGN.md (direction, tokens, components, states) so agents follow one source; skill " +
    "ux-ui-principles can extract it from the code"),
  {
    id: "incident-regressions", layer: "review", label: "Every closed incident names a regression test that exists",
    evaluate: ({ incidents }) => incidents === undefined || incidents === null
      ? { status: "unmeasured", detail: "no openspec/incidents records" }
      : incidents.closed === 0 ? { status: "unmeasured", detail: `${incidents.total} incident(s), none closed` }
        : incidents.missing.length === 0
          ? { status: "met", detail: `${incidents.closed} closed incident(s), each with a regression` }
          : { status: "unmet", detail: `${incidents.missing.length} closed incident(s) without an existing regression: ${incidents.missing.slice(0, 3).join(", ")}`,
            next: "name the test that fails without the fix in each incident's Regression row (a path in backticks)" }
  },
  {
    id: "first-proof-pass", layer: "review", label: "Most changes pass proof on the first run",
    evaluate: ({ outcomes }) => {
      if (!outcomes || outcomes.measured < REVIEW_TARGETS.minimumChanges)
        return { status: "unmeasured", detail: `${outcomes?.measured || 0} measured archived change(s); need ${REVIEW_TARGETS.minimumChanges}` };
      const value = rate(outcomes.firstProofPasses, outcomes.measured);
      return value >= REVIEW_TARGETS.firstProofPassRate
        ? { status: "met", detail: `${Math.round(value * 100)}% first-proof pass` }
        : { status: "unmet", detail: `${Math.round(value * 100)}% first-proof pass (target ${REVIEW_TARGETS.firstProofPassRate * 100}%)`,
          next: "cloop lessons --pretty: move the recurring review and blocker codes into checks" };
    }
  },
  {
    id: "escaped-defects", layer: "review", label: "Few defects escape to a later fix",
    evaluate: ({ outcomes }) => {
      if (!outcomes || outcomes.archived < REVIEW_TARGETS.minimumChanges)
        return { status: "unmeasured", detail: `${outcomes?.archived || 0} archived change(s); need ${REVIEW_TARGETS.minimumChanges}` };
      const value = rate(outcomes.escapedDefects, outcomes.archived);
      return value <= REVIEW_TARGETS.escapedDefectRate
        ? { status: "met", detail: `${outcomes.escapedDefects} escaped defect(s) in ${outcomes.archived} change(s)` }
        : { status: "unmet", detail: `${outcomes.escapedDefects} escaped defect(s) in ${outcomes.archived} change(s)`,
          next: "for each change declared in fixes, add the regression at the lowest layer that would have caught it" };
    }
  }
]);

/**
 * @param {{ lanes?: Record<string, string>, findings?: Record<string, number>, featureMap?: { features: number, issues?: number } | null,
 *   lessons?: { recurring: number, pending: number } | null,
 *   rules?: { registered: number, prose: number, issues?: number, unregistered?: number } | null,
 *   incidents?: { total: number, closed: number, missing: string[] } | null,
 *   outcomes?: { archived: number, measured: number, firstProofPasses: number, escapedDefects: number } | null,
 *   ui?: { present: boolean, framework?: string | null, uiFiles?: number } & Record<string, any> | null }} facts
 */
export function pyramidReadiness(facts = {}) {
  const criteria = CRITERIA.map(({ id, layer, label, evaluate }) => ({ id, layer, label, ...evaluate(facts) }));
  const layers = LAYERS.map((layer) => {
    const rows = criteria.filter((row) => row.layer === layer && row.status !== "not-applicable");
    const met = rows.filter((row) => row.status === "met").length;
    const measured = rows.filter((row) => row.status !== "unmeasured").length;
    return { layer, met, measured, total: rows.length,
      percent: measured ? Math.round(met / measured * 100) : null,
      next: rows.find((row) => row.status === "unmet")?.next || null };
  });
  // The weakest measured layer, top of the pyramid first: the cheapest place to invest next.
  const focus = layers.find((layer) => layer.percent !== null && layer.percent < 100) || null;
  return { protocol: READINESS_PROTOCOL, layers, criteria, focus: focus && { layer: focus.layer, next: focus.next } };
}

export function readinessText(value) {
  const lines = ["Pyramid readiness (measured criteria met per layer):"];
  value.layers.forEach((layer, index) => lines.push(`  ${index + 1} ${layer.layer.padEnd(12)} ${
    layer.percent === null ? "unmeasured" : `${String(layer.percent).padStart(3)}%`}  (${layer.met}/${layer.measured} measured, ${layer.total} total)`));
  for (const row of value.criteria.filter((row) => !["met", "not-applicable"].includes(row.status)))
    lines.push(`  - [${row.layer}] ${row.label}: ${row.status}, ${row.detail}${row.next ? `\n      next: ${row.next}` : ""}`);
  if (value.focus) lines.push(`Focus: ${value.focus.layer}; ${value.focus.next}`);
  return lines.join("\n");
}
