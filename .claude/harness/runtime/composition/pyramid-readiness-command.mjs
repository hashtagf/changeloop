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
import {
  readProjectFeatureMap, validateProjectFeatureMap
} from "../workflow/validation/project-feature-map.mjs";

const PENDING_LESSONS = new Set(["open", "prose-only"]);

function attempt(read) {
  try { return read(); } catch { return undefined; }
}

export function createPyramidReadinessCommand({ root, laneStates, lessonsValue, outcomesValue, log = console.log }) {
  function readinessFacts() {
    const quality = attempt(laneStates) || null;
    const map = attempt(() => readProjectFeatureMap(root));
    const lessons = attempt(() => lessonsValue())?.lessons;
    const registry = attempt(() => ruleRegistrySummary(root));
    const changes = attempt(() => outcomesValue())?.changes;
    return {
      lanes: quality?.lanes || {},
      findings: quality?.findings || {},
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

  function readinessValue() {
    return pyramidReadiness(readinessFacts());
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
      `${index + 1} ${layer.layer} ${layer.percent === null ? "unmeasured" : `${layer.percent}%`}`).join(", ");
    return value.focus
      ? { id: "pyramid", level: "info", detail, next: value.focus.next }
      : { id: "pyramid", level: "ok", detail, next: null };
  }

  return { readinessValue, showReadiness, readinessRow };
}
