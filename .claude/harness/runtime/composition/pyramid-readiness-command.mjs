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
import { guideReadiness } from "../quality/guide-readiness.mjs";
import { typeCheckExemption } from "../quality/quality-discovery.mjs";
import { verifyFacts } from "../quality/verify-readiness.mjs";
import { knownTestFileCount } from "../quality/test-gap-discovery.mjs";
import { discoverRepositoryQuality } from "../quality/quality-discovery.mjs";

// Criteria that do not apply to a repository, by capability.
function exemptions(path) {
  const typeCheck = attempt(() => typeCheckExemption(path));
  return typeCheck ? { "type-check": typeCheck } : {};
}
import {
  readProjectFeatureMap, validateProjectFeatureMap
} from "../workflow/validation/project-feature-map.mjs";

const PENDING_LESSONS = new Set(["open", "prose-only"]);

// A test-file count only for a language whose test files are recognised.
function testFilesOf(path) {
  const { profiles } = discoverRepositoryQuality({ id: "readiness", path, relativePath: "." });
  return knownTestFileCount(path, profiles);
}

function attempt(read) {
  try { return read(); } catch { return undefined; }
}

// Layers a single repository owns; prose and review stay project-wide.
const REPOSITORY_LAYERS = ["codebase", "static", "verification"];

export function createPyramidReadinessCommand({ root, laneStates, lessonsValue, outcomesValue,
  repositoryCatalog = () => null, changeStates = () => [], log = console.log }) {
  function readinessFacts(quality = attempt(laneStates) || null, uiFacts = undefined) {
    const map = attempt(() => readProjectFeatureMap(root));
    const lessons = attempt(() => lessonsValue())?.lessons;
    const registry = attempt(() => ruleRegistrySummary(root));
    const changes = attempt(() => outcomesValue())?.changes;
    return {
      notApplicable: exemptions(root),
      // Without a quality config every lane routes to one onboarding pass.
      configured: existsSync(join(root, "quality", "foundation-quality.json")),
      lanes: quality?.lanes || {},
      findings: quality?.findings || {},
      statuses: quality?.statuses || {},
      histories: quality?.histories || {},
      // Counted only where there is no test lane: the readiness row names "no tests".
      testFiles: quality?.lanes?.test ? null : attempt(() => testFilesOf(root)) ?? null,
      verify: attempt(() => verifyFacts(root)),
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
      ui: uiFacts || attempt(() => uiReadinessFacts(root)),
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
  // UI rows read the repository's own files: design tokens, accessibility
  // lint, rendered checks, and DESIGN.md live in the repository, not the root.
  function repositoryRows(facts, quality, catalog) {
    const paths = new Map((catalog?.repositories || []).map((row) => [row.id, row]));
    return Object.entries(quality?.repositories || {}).map(([id, own]) => {
      const repository = paths.get(id);
      const ui = !repository ? undefined : repository.type === "root" ? { perRepository: true }
        : attempt(() => uiReadinessFacts(repository.path));
      // The feature map is project-wide; a repository row judges its lanes and UI.
      const value = pyramidReadiness({ ...facts, featureMap: undefined, ui, configured: true,
        notApplicable: repository && repository.type !== "root" ? exemptions(repository.path) : facts.notApplicable,
        lanes: own.lanes, findings: own.findings, statuses: own.statuses, histories: own.histories || {},
        testFiles: own.lanes?.test || !repository ? null : attempt(() => testFilesOf(repository.path)) ?? null,
        verify: repository && repository.type !== "root" ? attempt(() => verifyFacts(repository.path)) : facts.verify });
      return { id, onboardedAt: own.onboardedAt || null,
        layers: value.layers.filter((layer) => REPOSITORY_LAYERS.includes(layer.layer))
          .map(({ layer, percent, met, measured }) => ({ layer, percent, met, measured })),
        ui: value.criteria.filter((row) => row.id.startsWith("ui-") && row.status !== "not-applicable")
          .map(({ id: criterion, label, status, next }) => ({ id: criterion, label, status, next: next || null })),
        // The repository's own AGENTS.md/CLAUDE.md and REVIEW.md, not the root's.
        guides: !repository || repository.type === "root" ? []
          : (attempt(() => guideReadiness(repository.path)) || []).filter((row) => row.level !== "ok")
            .map(({ id: guide, detail, next }) => ({ id: guide, detail, next })) };
    });
  }

  function onboarding(quality, catalog) {
    const repositories = catalog?.repositories || [];
    if (repositories.filter((repository) => repository.type !== "root").length < 1) return null;
    return { unlisted: quality?.unlisted || null, ...onboardingCandidates({ repositories,
      onboarded: new Set(Object.keys(quality?.repositories || {})),
      changed: changesPerRepository(attempt(changeStates) || []) }) };
  }

  function readinessValue() {
    const quality = attempt(laneStates) || null;
    const catalog = attempt(repositoryCatalog);
    const plan = onboarding(quality, catalog);
    // A control root of several repositories is not one UI: skip its scan.
    const facts = readinessFacts(quality, plan ? { perRepository: true } : undefined);
    const value = pyramidReadiness(facts);
    return plan ? { ...value, onboarding: plan, repositories: repositoryRows(facts, quality, catalog) } : value;
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
