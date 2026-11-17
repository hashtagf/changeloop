import { EXAMPLE_TYPES } from "./scratch-fields.mjs";
import { OUTLINE } from "../validation/outline-contract.mjs";

// The smallest draft the compiler accepts: omit `version` and it infers keys,
// capability, operation, scenario names, covers, and rapid defaults. Optional
// `decisions[{key, choice, reason?}]` records defaults the agent chose
// without asking; the template leaves it out so it is never copied verbatim.
export function minimalSemanticDraftTemplate() {
  return {
    intent: "Describe one observable outcome",
    requirements: [{
      description: "The system SHALL provide the observable behavior",
      scenarios: [{ when: "One triggering input or event", then: "One observable result" }]
    }],
    tasks: [{
      outcome: "Implement and verify the bounded outcome",
      verify: "npm test",
      paths: ["src/**", "test/**"]
    }]
  };
}

// The minimal v5 folder the template leads with: typed fields with a declared
// work type in change.json, and the reason as proposal.md prose. The v4
// minimal JSON above stays valid for existing drafts.
export function minimalDraftFolderTemplate() {
  const { intent, requirements, tasks } = minimalSemanticDraftTemplate();
  return {
    "change.json": { version: 5, language: "en", intent, workType: ["feature"], requirements, tasks },
    "proposal.md": "## Why\n\nSay in 1-3 plain sentences what changes, who benefits, and why.\n"
  };
}

export function semanticDraftTemplate() {
  return {
    version: 4,
    intent: "Describe one observable outcome",
    why: "Say in 1-3 plain sentences what changes, who benefits, and why",
    userStories: [{
      priority: "P1", asA: "a named user", iWant: "the observable outcome",
      soThat: "the benefit", covers: ["observable-outcome"]
    }],
    successCriteria: ["State how the result is judged, with a measurable threshold"],
    successMeasure: "Optional one line: the number or observable that shows it worked",
    // The first four lines are required at medium or high; undo and who are optional.
    scratch: {
      get: "Required for impact medium or high: what the approver gets, in one plain line",
      asIs: "Required for impact medium or high: how it works today, with a count when known",
      toBe: "Required for impact medium or high: how it works after the change",
      ifFail: "Required for impact medium or high: what the user sees when it fails and how it recovers",
      undo: "Optional: how to undo this change if it is approved and turns out wrong",
      who: "Optional: who is affected, in plain words"
    },
    examples: [{
      type: "examples", title: "Optional: concrete examples with real values",
      rules: [{ rule: "One rule in plain words", rows: [
        { name: "Main case", kind: "success", when: "One real input", then: "The exact result" }] }]
    }],
    impact: "low",
    coupling: "isolated",
    workType: ["feature"],
    userFlow: {
      purpose: "The user's path through the change, including the error path",
      // Quote a label that holds ( ) or ", e.g. A["mean(values)"].
      source: "flowchart LR\n  A[\"User acts\"] --> B{\"Valid?\"}\n  B -->|yes| C[\"Result shown\"]\n" +
        "  B -->|no| D[\"Error shown\"]"
    },
    requirements: [{
      key: "observable-outcome",
      capability: "change",
      operation: "added",
      description: "The system SHALL provide the observable behavior",
      outcome: "Describe the observable result",
      scenarios: [{
        name: "Short scenario title",
        kind: "success",
        given: "The precondition or state before the trigger",
        when: "One triggering input or event",
        then: "One observable result",
        and: ["Another result of the same case, if any"]
      }, {
        name: "One way it fails",
        kind: "failure",
        when: "The failing input or event",
        then: "What the user sees",
        recovery: "How the user or system recovers"
      }]
    }],
    tasks: [{
      key: "implement-outcome",
      outcome: "Implement and verify the bounded outcome",
      covers: ["observable-outcome"],
      paths: ["src/**", "test/**"],
      verify: "npm test"
    }],
    evidence: {
      "observable-outcome": { capabilities: ["test"] }
    },
    discovery: {
      // Rows only for what the draft cannot state: affected actor, desired,
      // success, failure, and verification coverage derive from userStories,
      // requirements, scenario kinds, and tasks with evidence.
      coverage: [
        { dimension: "current-behavior", status: "needs-investigation" },
        { dimension: "input-boundary", status: "needs-user-decision" },
        { dimension: "compatibility", status: "needs-investigation" },
        { dimension: "non-goals", status: "needs-user-decision" }
      ],
      decisions: []
    },
    // Shapes only: copy the block for the work type you have into the draft
    // top level. The compiler ignores this key, and the rows hold no
    // placeholder text, so a copied row compiles once its facts are true.
    workTypeExamples: workTypeExamples(),
    draftFolderV5: draftFolderV5()
  };
}

// Writing limits for a reader-sized draft; `change start --template` shows
// them beside the minimal draft so the first draft needs no length repair.
export const MINIMAL_DRAFT_WRITING = Object.freeze({
  intent: "One line of at most 70 characters naming the observable outcome",
  why: "At most 3 plain sentences: what changes, who benefits, and why now",
  decisions: "One decision per entry: one choice and its reason, never a list of choices",
  scope: "Scope items (changes, nonGoals) are short phrases, not paragraphs",
  language: "Write in the user's language; keep field names, keys, and SHALL/WHEN/THEN in English",
  sections: "Fill only the sections your work type needs (workTypeExamples); leave the rest out",
  scratch: "Required when impact is medium or high, optional for low: scratch.get, asIs, toBe, ifFail are one plain line each " +
    "(at most 240 characters) for an approver who does not read code; put counts in asIs when known; " +
    "scratch.undo and scratch.who are optional lines for how to undo it and who is affected",
  scenarios: "Write one scenario per rule, limit, endpoint, or error that the request or its referenced documents state, " +
    "not one per heading; add each rule's failure and boundary cases (empty, minimum, maximum, wrong type, unauthorized). " +
    "Every scenario becomes a test, so a thin spec yields thin tests",
  examples: "Optional typed examples with real values from the request, code, or data, never invented: " +
    `each { type, title, why?, postBuild?, capability? } where type is one of ${EXAMPLE_TYPES.join(", ")}`,
  limits: Object.freeze({ intentMaxCharacters: 70, whyMaxSentences: 3 })
});

const USER_FLOW_EXAMPLE = Object.freeze({
  purpose: "The user's path through the change, including the error path",
  source: "flowchart LR\n  A[\"User searches\"] --> B{\"Results?\"}\n  B -->|yes| C[\"List shown\"]\n" +
    "  B -->|no| D[\"Empty state shown\"]"
});

// One block per work type with exactly the sections that type requires
// (and releaseNote when users or consumers see the change). Bugfix variants
// add the detail their kind of fix owes.
function workTypeExamples() {
  const userFlow = () => structuredClone(USER_FLOW_EXAMPLE);
  return {
    use: "Copy the block for each of your work types to the draft top level; every key " +
      "in a block is required for that type and nothing else is",
    feature: { userFlow: userFlow(), releaseNote: "Search now filters by tag." },
    bugfix: {
      bugfix: {
        reproduction: "Open a board with 0 cards; the page crashes",
        rootCause: "The empty list is read as undefined",
        regression: "A test renders an empty board"
      }
    },
    "bugfix-security": {
      bugfix: {
        variant: "security",
        reproduction: "Request another user's invoice by id; it is returned",
        rootCause: "The handler skips the owner check",
        regression: "A test requests a foreign invoice and gets 404",
        disclosure: {
          class: "IDOR", affectedVersions: "<2.4.1", exploitability: "Signed-in user only",
          owner: "security", embargo: "Until 2.4.1 ships", advisory: "GHSA pending",
          backports: ["release/2.3"]
        }
      }
    },
    "bugfix-hotfix": {
      bugfix: {
        variant: "hotfix",
        reproduction: "Checkout returns 500 for carts over 50 items",
        rootCause: "The price batch exceeds the gateway limit",
        regression: "A test checks out a 60-item cart",
        incident: { link: "INC-212", mitigation: "Flag off", minimumScope: "Batch price calls",
          followUp: "Full fix change" },
        backport: ["release/2.3", "release/2.4"]
      }
    },
    refactor: {
      refactor: {
        invariants: ["Every public export keeps its signature and result"],
        characterization: "Snapshot tests of the current outputs pass before and after"
      },
      componentMap: [{ component: "Parser", responsibility: "Turns text into an AST",
        files: ["src/parser.ts"] }]
    },
    api: {
      apiContracts: [{
        method: "POST", path: "/api/cards", auth: "Signed-in user",
        request: { title: "string" }, response: { id: "string", title: "string" },
        errors: [{ status: 400, when: "Title is empty" }]
      }],
      boundaries: [{
        from: "api", to: "billing", mode: "sync", why: "Price at checkout", timeout: "2s",
        retry: "none", consistency: "strong", owner: "payments"
      }],
      releaseNote: "POST /api/cards creates a card."
    },
    library: {
      libraryContract: {
        exports: [{ symbol: "parse", signature: "parse(text: string): Ast" }],
        semver: "minor", changelog: "Adds parse"
      },
      releaseNote: "The library exports parse()."
    },
    ui: {
      userFlow: userFlow(),
      uiStates: [{
        screen: "Board",
        states: [{ state: "loading", shows: "Skeleton cards" },
          { state: "empty", shows: "Add your first card" },
          { state: "error", shows: "Could not load cards, with Retry" },
          { state: "success", shows: "Cards by column" }],
        accessibility: "Columns are lists; cards are reachable by keyboard"
      }],
      componentMap: [{
        component: "Board", responsibility: "Lays out columns and cards",
        files: ["src/components/Board.tsx"]
      }],
      releaseNote: "The board shows cards by column."
    },
    data: {
      dataModel: [{ entity: "Card", fields: ["id", "title", "createdAt"],
        migration: "Add table cards", rollback: "Drop table cards" }]
    },
    migration: {
      migrationPlan: {
        from: "v1 jobs", to: "queue service", seam: "JobPort",
        parity: { check: "Same results", tolerance: "0" },
        cutover: "7 days parity", rollbackWindow: "14 days", decommission: "T009"
      },
      rollout: {
        strategy: "Flag queue-jobs at 10%, then 100%", rollback: "Turn the flag off",
        deployOrder: ["queue", "api"], rollbackProof: "Flag-off test runs the v1 path"
      }
    },
    async: {
      jobContract: [{ key: "sync-invoices", states: ["queued", "done", "failed"],
        retry: "3x backoff", timeout: "30s", idempotency: "Invoice id" }],
      diagrams: [{ key: "sync-flow", type: "mermaid", purpose: "Job states with the failure path",
        source: "stateDiagram-v2\n  [*] --> queued\n  queued --> done\n  queued --> failed\n" +
          "  failed --> queued: retry" }]
    },
    integration: {
      // relatesTo names your requirement; it needs a success and a failure scenario.
      integrations: [{
        key: "stripe-charges", kind: "external-api",
        documentation: { source: "https://docs.stripe.com/api", version: "2024-06-20" },
        concerns: ["authentication", "timeout", "retry", "idempotency"],
        relatesTo: ["observable-outcome"]
      }]
    },
    config: {
      configContract: [{ key: "CARD_LIMIT", default: "100", validation: "Integer from 1 to 1000" }]
    },
    performance: {
      nfr: [{ key: "search-latency", characteristic: "time behaviour", stimulus: "100 rps search",
        response: "Results returned", measure: "p95 < 200ms" }],
      performanceAnalysis: {
        baseline: { value: "p95 480ms", method: "k6 5 runs" }, hypothesis: "N+1 query",
        target: "p95 < 200ms"
      }
    },
    dependency: {
      dependencyChange: [{
        package: "express", from: "4.19.2", to: "4.21.0", breaking: "None in changelog",
        cves: "Fixes CVE-2024-43796", rollbackPin: "4.19.2",
        provenance: "npm provenance attested", sbom: "sbom.cdx.json regenerated"
      }]
    },
    deprecation: {
      deprecationPlan: {
        what: "GET /v1/items", replacement: "GET /v2/items", warning: "Deprecation header",
        removalCondition: "Usage zero for 30 days"
      },
      releaseNote: "GET /v1/items is deprecated; use GET /v2/items."
    },
    infra: {
      infraPlan: {
        planDiff: "+1 aws_sqs_queue", environments: ["staging", "prod"], costDelta: "+$4/month",
        blastRadius: "Jobs only"
      },
      rollout: {
        strategy: "Apply staging, then prod", rollback: "Apply the previous plan",
        deployOrder: ["staging", "prod"], rollbackProof: "Previous plan re-applied in staging"
      }
    },
    observability: {
      observability: {
        rows: [{ failure: "Queue backlog", signal: "queue_depth", sli: "age < 60s", slo: "99%",
          alert: "age > 300s for 10m", runbook: "docs/runbooks/queue.md", owner: "platform" }]
      }
    },
    privacy: {
      privacyAssessment: {
        data: [{ field: "email", class: "personal" }], purpose: "Login",
        retention: "Account life + 30 days"
      },
      threatModel: {
        assets: ["User emails"], trustBoundaries: ["Browser to API"],
        threats: [{ key: "t1", stride: "information disclosure",
          threat: "Export leaks another tenant", likelihood: "low", impact: "high",
          control: "Tenant filter", residual: "low" }]
      }
    },
    experiment: {
      experimentDesign: {
        hypothesis: "One-step checkout lifts conversion", primaryMetric: "Checkout conversion",
        allocation: "50/50 by user", decisionRule: "Ship if +1% at 95%",
        guardrails: ["Error rate"], stopRules: ["Stop if errors double"]
      },
      rollout: {
        strategy: "Experiment flag at 50%", rollback: "Stop the experiment; control stays live",
        rollbackProof: "Flag-off test runs the control path"
      }
    },
    "client-release": {
      releasePlan: {
        minimumVersion: "5.2", stagedRollout: ["1%", "10%", "100%"],
        crashGate: "crash-free >= 99.5%"
      },
      releaseNote: "Version 5.3 adds offline drafts."
    },
    ml: {
      modelCard: {
        intendedUse: "Summarize tickets", model: { provider: "anthropic", version: "pinned id" },
        fallback: "Show the raw ticket",
        evaluation: { set: "200 labelled tickets", thresholds: [{ metric: "accuracy", threshold: ">= 0.9" }] }
      }
    },
    "data-fix": {
      dataFix: {
        scope: "1,204 rows in refunds", snapshot: "Table copy refunds_bak",
        dryRun: "Count and diff on staging", rerunSafe: "Yes, keyed by id",
        rollback: "Restore from refunds_bak"
      }
    },
    security: {
      threatModel: {
        assets: ["User sessions"], trustBoundaries: ["Browser to API"],
        threats: [{ key: "t1", stride: "spoofing", threat: "Stolen token reused", likelihood: "medium",
          impact: "high", control: "8 hour expiry", residual: "low" }]
      },
      hardening: {
        weakness: "Sessions never expire", control: "8 hour expiry",
        verification: "Test with an expired token"
      }
    },
    cicd: {
      pipelinePlan: {
        changes: "Add a deploy job", permissions: "id-token write, no secrets",
        blastRadius: "Staging deploys only", rollback: "Revert the workflow file"
      }
    }
  };
}

// The v5 draft layout: typed fields in change.json, prose under outline
// headings in proposal.md and design.md. The harness writes derived sections.
function draftFolderV5() {
  return {
    layout: "A folder .foundation/drafts/<id>/ with change.json (typed fields, version 5), " +
      "proposal.md, and design.md; start it with cloop change start " +
      ".foundation/drafts/<id>",
    headings: "Use only '## ' headings from the outline, in outline order, in English or Thai. " +
      "Never write a heading the harness derives (Change, Capabilities, Acceptance traceability, " +
      "Definition of done, Work type, File map, Test map); no TODO, TBD, or empty section",
    proposalHeadings: outlineAuthorHeadings("proposal"),
    designHeadings: outlineAuthorHeadings("design"),
    example: {
      "change.json": {
        version: 5, language: "en", intent: "Filter search results by tag",
        requirements: [{
          description: "The system SHALL return only results with the chosen tag",
          scenarios: [{ when: "A user filters by tag 'red'", then: "Only red results are listed" }]
        }],
        tasks: [{ outcome: "Filter search by tag", verify: "npm test", paths: ["src/search/**", "test/search/**"] }]
      },
      "proposal.md": "## Why\n\nUsers with many results cannot find tagged items.\n\n" +
        "## Scope\n\n- Tag filter on search\n",
      "design.md": "## Current state\n\nSearch matches titles only.\n\n" +
        "## Decisions\n\n- Filter in the query, not in the client.\n"
    }
  };
}

function outlineAuthorHeadings(document) {
  return OUTLINE[document].filter((row) => row.owner === "author")
    .map((row) => `${row.heading.en} | ${row.heading.th}`);
}
