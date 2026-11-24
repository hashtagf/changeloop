// `quality readiness`: an installed project's pyramid readiness from the facts
// its own state already holds — quality lanes and their baselines, the
// feature map, recurring lessons, the rule registry, and archived outcomes.
// Read-only; the criteria live in quality/pyramid-readiness.mjs, shared with
// Change Loop's own repository scorecard.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pyramidReadiness, readinessText } from "../quality/pyramid-readiness.mjs";
import { ruleRegistrySummary } from "../quality/rule-registry.mjs";
import { incidentSummary } from "../quality/incident-records.mjs";
import { uiReadinessFacts } from "../quality/ui-readiness.mjs";
import { changesPerRepository, onboardingCandidates } from "../quality/onboarding-candidates.mjs";
import {
  readProjectFeatureMap, validateProjectFeatureMap
} from "../workflow/validation/project-feature-map.mjs";

const PENDING_LESSONS = new Set(["open", "prose-only"]);

function attempt(read) {
  try { return read(); } catch { return undefined; }
}

// Layers a single repository owns; prose and review stay project-wide.
const REPOSITORY_LAYERS = ["codebase", "static", "verification"];

export function createPyramidReadinessCommand({ root, laneStates, lessonsValue, outcomesValue,
  repositoryCatalog = () => null, changeStates = () => [], log = console.log }) {
  function readinessFacts(quality = attempt(laneStates) || null) {
    const map = attempt(() => readProjectFeatureMap(root));
    const lessons = attempt(() => lessonsValue())?.lessons;
    const registry = attempt(() => ruleRegistrySummary(root));
    const changes = attempt(() => outcomesValue())?.changes;
    return {
      // Without a quality config every lane routes to one onboarding pass.
      configured: existsSync(join(root, "quality", "foundation-quality.json")),
      lanes: quality?.lanes || {},
      findings: quality?.findings || {},
      statuses: quality?.statuses || {},
      featureMap: map === undefined ? undefined : map && {
        features: Array.isArray(map.features) ? map.features.length : 0,
        issues: validateProjectFeatureMap(map, { exists: (path) => existsSync(join(root, path)) }).length
      },
      lessons: Array.isArray(lessons) ? {
        recurring: lessons.length,
        pending: lessons.filter((lesson) => PENDING_LESSONS.has(lesson.status)).length
      } : null,
      rules: registry === undefined ? undefined : registry && {
        registered: registry.rules, prose: registry.proseOnly.length, issues: registry.registryIssues.length,
        unregistered: registry.unregistered.length
      },
      incidents: attempt(() => incidentSummary(root)),
      ui: attempt(() => uiReadinessFacts(root)),
      outcomes: Array.isArray(changes) ? {
        archived: changes.length,
        measured: changes.filter((change) => change.firstProofPass !== null).length,
        firstProofPasses: changes.filter((change) => change.firstProofPass === true).length,
        escapedDefects: changes.reduce((total, change) => total + (change.escapedDefects || 0), 0)
      } : null
    };
  }

  // A multi-repository topology onboards one repository at a time: each
  // onboarded repository gets its own code layers, and the rest are ranked
  // so the agent can propose the next few for the user to pick.
  function repositoryRows(facts, quality) {
    return Object.entries(quality?.repositories || {}).map(([id, own]) => {
      // Feature map and UI rows are project-wide; a repository row judges its lanes.
      const value = pyramidReadiness({ ...facts, featureMap: undefined, ui: undefined, configured: true,
        lanes: own.lanes, findings: own.findings, statuses: own.statuses });
      return { id, onboardedAt: own.onboardedAt || null,
        layers: value.layers.filter((layer) => REPOSITORY_LAYERS.includes(layer.layer))
          .map(({ layer, percent, met, measured }) => ({ layer, percent, met, measured })) };
    });
  }

  function onboarding(quality) {
    const catalog = attempt(repositoryCatalog);
    const repositories = catalog?.repositories || [];
    if (repositories.filter((repository) => repository.type !== "root").length < 1) return null;
    return { unlisted: quality?.unlisted || null, ...onboardingCandidates({ repositories,
      onboarded: new Set(Object.keys(quality?.repositories || {})),
      changed: changesPerRepository(attempt(changeStates) || []) }) };
  }

  function readinessValue() {
    const quality = attempt(laneStates) || null;
    const facts = readinessFacts(quality);
    const value = pyramidReadiness(facts);
    const plan = onboarding(quality);
    return plan ? { ...value, onboarding: plan, repositories: repositoryRows(facts, quality) } : value;
  }

  function showReadiness(flags = {}) {
    const value = readinessValue();
    log(flags.pretty ? readinessText(value) : JSON.stringify(value, null, 2));
    return value;
  }

  // One `doctor` setup row: each layer's percent and the next step for the
  // weakest measured layer, top of the pyramid first. Never an error.
  function readinessRow() {
    const value = readinessValue();
    const detail = value.layers.map((layer, index) =>
      `${index + 1} ${layer.layer} ${layer.percent === null ? "unmeasured" : `${layer.percent}%`}`).join(", ") +
      (value.onboarding ? `; onboarded ${value.onboarding.onboarded}/${value.onboarding.total} repositories` : "");
    return value.focus
      ? { id: "pyramid", level: "info", detail, next: value.focus.next }
      : { id: "pyramid", level: "ok", detail, next: null };
  }

  return { readinessValue, showReadiness, readinessRow };
}
