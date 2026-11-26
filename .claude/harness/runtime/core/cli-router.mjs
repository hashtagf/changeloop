import { LIFECYCLE_PHASES } from "./lifecycle-phase.mjs";
import { evidenceRoutes } from "./cli-routes-evidence.mjs";
export async function routeRuntimeCommand(command, values, api) {
  const {
    parseFlags,
    parseStrictCommandFlags,
    fail,
    createChange,
    inspectInvestigation,
    investigationRecordTemplate,
    rapidStartTemplate,
    amendmentTemplate,
    inspectDraft,
    startAtomic,
    inspectAmendment,
    amendChange,
    amendTaskVerify = null,
    inspectRevision,
    reviseChange,
    resolveChange,
    approvalQuestionAction = null,
    recordTargetRestore,
    undoLand = null,
    abandonChange,
    waiveGate,
    showChanges,
    showCurrent,
    showProviders,
    showRepositories,
    foundationPolicy,
    showAgentPlan,
    showAgentDispatch,
    showAgentTask,
    acquireAgentLease,
    releaseAgentLease,
    prepareClaudeTelemetry,
    recordPhaseContext,
    showPacket,
    showMetrics,
    showAdvance,
    showFeedback,
    showOutcomes,
    showLessons,
    showFeatures,
    showProductProgress,
    measureProduct,
    showPackage,
    showPreview,
    showSpecReview,
    showSpecDrift,
    execObserved,
    checkpointBudget,
    continueBudget,
    doctor,
    validate,
    showTraceabilityAudit,
    relevantHash,
    providerWorkspaceHash,
    landCheck,
    grantLand,
    advanceLand,
    recoverLand,
    showLandPlan,
    resumeLand,
    showDeliveryAdvance,
    createAttestationChallenge,
    showSandboxInspection,
    createSandbox,
    syncSandbox,
    applySandbox,
    archive,
    recordEvent,
    syncClaudeTelemetry,
    importTelemetry,
    importHostExecution,
    usage,
    describeCommand,
    runtimeApiVersion,
    version,
    showQualityDiscovery,
    initializeQuality,
    qualityDoctor,
    runQuality,
    showQualityReport,
    updateQualityBaseline,
    showQualityDebt,
    showQualityReadiness
  } = api;
  const die = fail;
  // A step that runs before an `advance --through` envelope keeps its human
  // report off stdout, so that call's stdout is the JSON envelope alone on the
  // first run as on every later one. Refusals still exit through `fail`.
  const beforeEnvelope = (through, operation) => {
    if (!through) return operation();
    const priorLog = console.log;
    console.log = () => {};
    try { return operation(); }
    finally { console.log = priorLog; }
  };
  // The user's approval answer can be recorded in the same call that applies
  // the agreement it approves: start, revise, or amend, then approve, then
  // optionally continue with --through. Nothing is approved when the agreement
  // call stopped at an intake action.
  const sameCallApproval = (command, flags) => {
    if (!flags["approve-spec"]) {
      const stray = ["decision-ref", "through"].filter((flag) => flags[flag] !== undefined);
      // Agents that guessed `--through` alone spent a round finding the
      // approval flags; the refusal names the one call that works when the
      // user approved, and never approves on its own.
      if (stray.length) die(`${command} --${stray.join(", --")} requires --approve-spec; ` +
        `when the user approved the spec, rerun as \`cloop ${command} <same arguments> ` +
        "--approve-spec --decision-ref <ref> --through build|proven|archived`, otherwise " +
        "drop those flags and ask for approval");
      return null;
    }
    const decisionRef = String(flags["decision-ref"] || "").trim();
    if (!decisionRef)
      die(`${command} --approve-spec requires --decision-ref <ref> naming the user's approval`);
    if (flags.through !== undefined && !["build", "proven", "archived"].includes(flags.through))
      die(`${command} --through must be build|proven|archived`);
    return { decisionRef, through: flags.through || null };
  };
  const intakeStopped = (result) => Boolean(result && typeof result === "object" &&
    typeof result.action === "string" && result.intakeState);
  const recordSameCallApproval = async (id, approval) => {
    const ask = approvalQuestionAction?.(id, approval.through);
    if (ask) {
      console.log(JSON.stringify(ask));
      return;
    }
    resolveChange(id, { "approve-spec": true, "decision-ref": approval.decisionRef });
    if (approval.through) await showAdvance(id, { through: approval.through });
  };
  const handlers = {
    "investigate": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "investigate", {
        boolean: ["template"]
      });
      if (flags.template) {
        if (rest.length) die("investigate --template takes no record path");
        console.log(JSON.stringify(investigationRecordTemplate(), null, 2));
        return;
      }
      if (rest.length !== 1) die("investigate requires exactly one investigation JSON record");
      inspectInvestigation(rest[0]);
    },
    "new": async () => {
      const {
        flags,
        rest
      } = parseFlags(values);
      if (!rest.length) die("new requires an intent");
      createChange(rest.join(" "), flags);
    },
    "start": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "start", {
        boolean: ["template", "inspect", "consume-draft", "approve-spec"],
        value: ["decision-ref", "through"]
      });
      const approval = sameCallApproval("start", flags);
      if (flags.template) {
        if (rest.length) die("start --template takes no draft path");
        if (flags.inspect || flags["consume-draft"] || approval)
          die("start --template cannot be combined with --inspect, --consume-draft, or --approve-spec");
        // Compact: the agent reads it once and carries it in context for the
        // rest of the run, and indentation alone was a third of its size.
        console.log(JSON.stringify(rapidStartTemplate()));
      } else {
        if (rest.length !== 1) die("start requires exactly one draft JSON path");
        if (flags.inspect) {
          if (flags["consume-draft"] || approval)
            die("start --inspect cannot be combined with --consume-draft or --approve-spec");
          inspectDraft(rest[0]);
        } else {
          const started = startAtomic(rest[0], { consumeDraft: flags["consume-draft"] });
          if (approval && typeof started === "string")
            await recordSameCallApproval(started, approval);
        }
      }
    },
    "resolve": async () => {
      // Strict: the lenient parser silently dropped a misspelled acceptance
      // flag, so `validate` kept failing with the identical message and the
      // typo was invisible.
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "change resolve", {
        boolean: ["review", "acceptance-required", "acceptance-not-required", "reopen-grounding", "ci-not-required", "approve-spec", "continue-review", "accept-target-edits"],
        value: ["impact", "coupling", "security", "size", "ambiguity", "surface", "acceptance-reason", "acceptance-claims", "decision-ref", "reopen-reason", "role"]
      });
      if (rest.length !== 1) die("change resolve requires exactly one change id");
      resolveChange(rest[0], flags);
    },
    "amend": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "change amend", {
        boolean: ["template", "inspect", "consume-amendment", "approve-spec", "reopen"],
        value: ["task", "verify", "reason", "decision-ref", "through"]
      });
      const approval = sameCallApproval("change amend", flags);
      // The verify-only correction an agent makes directly: no amendment JSON,
      // same transaction, the spec approval carried. --reopen unticks a
      // completed task so the corrected command must pass again.
      if (flags.task !== undefined || flags.verify !== undefined || flags.reason !== undefined ||
          flags.reopen) {
        if (flags.template || flags.inspect || flags["consume-amendment"] || approval)
          die("change amend --task/--verify cannot be combined with --template, --inspect, --consume-amendment, or --approve-spec");
        if (rest.length !== 1 || !String(flags.task || "").trim() ||
            !String(flags.verify || "").trim())
          die("change amend requires <change> --task <task-key|task-id> --verify <command>");
        if (!amendTaskVerify) die("change amend --task/--verify is unavailable in this runtime");
        amendTaskVerify(rest[0], {
          task: flags.task, verify: flags.verify, reason: flags.reason,
          ...(flags.reopen ? { reopen: true } : {})
        });
        return;
      }
      if (flags.template) {
        if (rest.length) die("change amend --template takes no change or amendment path");
        if (flags.inspect || flags["consume-amendment"] || approval)
          die("change amend --template cannot be combined with --inspect, --consume-amendment, or --approve-spec");
        console.log(JSON.stringify(amendmentTemplate()));
        return;
      }
      if (rest.length !== 2)
        die("change amend requires <change> <amendment.json>");
      if (flags.inspect) {
        if (flags["consume-amendment"] || approval)
          die("change amend --inspect cannot be combined with --consume-amendment or --approve-spec");
        inspectAmendment(rest[0], rest[1]);
        return;
      }
      const amended = amendChange(rest[0], rest[1], {
        consumeAmendment: flags["consume-amendment"]
      });
      if (approval && !intakeStopped(amended)) await recordSameCallApproval(rest[0], approval);
    },
    "revise": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "change revise", {
        boolean: ["inspect", "consume-draft", "approve-spec", "merge"],
        value: ["decision-ref", "through"]
      });
      const approval = sameCallApproval("change revise", flags);
      if (rest.length !== 2)
        die("change revise requires <change> <draft.json>");
      // --merge reads the file as a partial draft over the compiled one.
      const merge = flags.merge ? { merge: true } : {};
      if (flags.inspect) {
        if (flags["consume-draft"] || approval)
          die("change revise --inspect cannot be combined with --consume-draft or --approve-spec");
        inspectRevision(rest[0], rest[1], ...(flags.merge ? [merge] : []));
        return;
      }
      const revised = reviseChange(rest[0], rest[1], {
        consumeDraft: flags["consume-draft"], ...merge
      });
      if (approval && !intakeStopped(revised)) await recordSameCallApproval(rest[0], approval);
    },
    "abandon": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "change abandon", {
        value: ["reason", "decision-ref", "applied"]
      });
      if (rest.length !== 1) die("change abandon requires exactly one change id");
      abandonChange(rest[0], flags);
    },
    "waive": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "change waive", {
        boolean: ["revoke"],
        value: ["capability", "reason", "decision-ref"]
      });
      if (rest.length !== 1) die("change waive requires exactly one change id");
      waiveGate(rest[0], flags);
    },
    "describe": async () => {
      describeCommand(values.find(value => !value.startsWith("-")) || null, {
        json: values.includes("--json")
      });
    },
    "changes": async () => {
      showChanges();
    },
    "current": async () => {
      showCurrent();
    },
    "providers": async () => {
      showProviders();
    },
    "repos": async () => {
      showRepositories(values[0] || null);
    },
    "models": async () => {
      console.log(JSON.stringify(foundationPolicy().models, null, 2));
    },
    "quality-discover": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "quality discover", { value: ["change", "repo"] });
      if (rest.length) die(`unexpected quality discover argument(s): ${rest.join(", ")}`);
      showQualityDiscovery(flags);
    },
    "quality-init": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "quality init", {
        boolean: ["write", "force"], value: ["change", "ci", "repo"]
      });
      if (rest.length) die(`unexpected quality init argument(s): ${rest.join(", ")}`);
      initializeQuality(flags);
    },
    "quality-doctor": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "quality doctor", {
        boolean: ["enforce"], value: ["change"]
      });
      if (rest.length) die(`unexpected quality doctor argument(s): ${rest.join(", ")}`);
      qualityDoctor(flags);
    },
    "quality-run": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "quality run", {
        boolean: ["enforce", "full"],
        value: ["change", "repo", "capability", "shard-index", "shard-count"]
      });
      if (rest.length) die(`unexpected quality run argument(s): ${rest.join(", ")}`);
      try {
        await runQuality({ ...flags, repository: flags.repo });
      } catch (error) {
        if (!error.foundationBlocked) throw error;
        // The complete report has already been printed. A forced exit here
        // drops buffered pipe output (often at 64 KiB), destroying evidence.
        console.error(`BLOCKED: ${error.message}`);
        process.exitCode = error.exitCode || 1;
      }
    },
    "quality-report": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "quality report");
      if (Object.keys(flags).length || rest.length) die("quality report takes no arguments");
      showQualityReport();
    },
    "quality-baseline": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "quality baseline", {
        boolean: ["write"], value: ["repo", "capability", "decision-ref", "reason"]
      });
      if (rest.length) die(`unexpected quality baseline argument(s): ${rest.join(", ")}`);
      updateQualityBaseline({ ...flags, repository: flags.repo });
    },
    "quality-readiness": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "quality readiness", { boolean: ["pretty"] });
      if (rest.length) die("quality readiness takes no positional arguments");
      showQualityReadiness(flags);
    },
    "quality-debt": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "quality debt");
      if (Object.keys(flags).length || rest.length) die("quality debt takes no arguments");
      showQualityDebt();
    },
    "agent-plan": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "agents plan", {
        boolean: ["full", "pretty"],
        value: ["group"]
      });
      showAgentPlan(rest[0], flags);
    },
    "agent-dispatch": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "agents dispatch", {
        boolean: ["pretty"]
      });
      if (rest.length !== 1) die("agents dispatch requires exactly one change id");
      showAgentDispatch(rest[0], flags);
    },
    "agent-task": async () => {
      const {
        flags,
        rest
      } = parseFlags(values);
      showAgentTask(rest[0], rest[1], flags);
    },
    "agent-acquire": async () => {
      // Only `--owner`. Takeover belongs to `release`, which frees the resource
      // so the next acquire can win it fairly; `acquire` reads nothing but the
      // owner. This spec was copied from `release` and accepted `--force` and
      // `--decision-ref` in silence, so a caller reaching for a takeover here
      // got a plain contended acquire and an exit code that looked deliberate.
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "agents acquire", {
        value: ["owner"]
      });
      acquireAgentLease(rest[0], rest[1], flags);
    },
    "agent-release": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "agents release", {
        boolean: ["force"],
        value: ["owner", "decision-ref", "lease-id"]
      });
      releaseAgentLease(rest[0], rest[1], flags);
    },
    "packet": async () => {
      const {
        flags,
        rest
      } = parseFlags(values);
      if (flags.resume && (flags.phase || flags.task || flags.repo))
        die("packet --resume cannot be combined with phase, task or repo");
      if (flags.phase && !["change", "build", "prove", "review", "land"].includes(flags.phase)) die("packet --phase must be change|build|prove|review|land");
      if (flags.phase && flags.phase !== "review") {
        prepareClaudeTelemetry(rest[0], flags.phase);
        recordPhaseContext(rest[0], flags.phase);
      }
      if (flags.task && !flags.phase && !flags.repo) showAgentTask(rest[0], flags.task, { ...flags, allowCompleted: true });else showPacket(rest[0], flags);
    },
    "metrics": async () => {
      showMetrics(values[0]);
    },
    "feedback": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "feedback", {
        boolean: ["pretty", "diagnostics"]
      });
      if (rest.length !== 1) die("feedback requires exactly one change id");
      showFeedback(rest[0], flags);
    },
    "outcomes": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "outcomes", {
        boolean: ["pretty"]
      });
      if (rest.length) die("outcomes takes no change id; it summarizes every archived change");
      showOutcomes(flags);
    },
    "lessons": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "lessons", {
        boolean: ["pretty"], value: ["min-changes"]
      });
      if (rest.length) die("lessons takes no change id; it groups codes across changes");
      showLessons(flags);
    },
    "features": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "features", {
        boolean: ["pretty", "strict"], value: ["change"]
      });
      if (rest.length) die("features takes no positional arguments; use --change <id>");
      showFeatures(flags);
    },
    "product-status": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "product status", {
        boolean: ["pretty", "strict"], value: ["document"]
      });
      if (rest.length) die("product status takes no positional arguments; use --document <path>");
      showProductProgress(flags);
    },
    "product-measure": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "product measure", {
        boolean: ["pretty"], value: ["value", "source", "at", "unit", "note", "document"]
      });
      if (rest.length !== 1) die("product measure requires exactly one success metric id (KPI-nn)");
      measureProduct(rest[0], flags);
    },
    "package": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "package", { boolean: ["pretty"] });
      if (rest.length !== 1) die("package requires exactly one change id");
      showPackage(rest[0], flags);
    },
    "preview": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "preview", {
        boolean: ["pretty"], value: ["provider", "decision-ref"]
      });
      if (rest.length !== 1) die("preview requires exactly one change id");
      showPreview(rest[0], flags);
    },
    "spec-review": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "spec-review", { boolean: ["pretty"] });
      if (rest.length !== 1) die("spec-review requires exactly one change id");
      showSpecReview(rest[0], flags);
    },
    "spec-drift": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "spec-drift", {
        boolean: ["pretty", "review"], value: ["capability"]
      });
      if (rest.length) die("spec-drift takes no positional arguments; use --capability <name>[,<name>]");
      showSpecDrift(flags);
    },
    "advance": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "advance", {
        boolean: ["pretty", "inspect", "approve-spec", "undo-land"],
        value: ["host-result", "through", "decision", "decision-fingerprint", "decision-ref", "reason",
          "restore-target", "recover-apply", "role"]
      });
      if (rest.length !== 1) die("advance requires exactly one change id");
      if (flags.role !== undefined && !flags["approve-spec"]) die("advance --role applies only to --approve-spec");
      // Land's interrupted-apply route: settle the journaled apply under the
      // user's decision, then resume the same lifecycle route. The internal
      // `land recover` primitive is never the agent's command.
      if (flags["recover-apply"] !== undefined) {
        const extra = Object.keys(flags).filter((flag) =>
          !["recover-apply", "decision-ref", "through", "pretty"].includes(flag));
        if (extra.length)
          die(`advance --recover-apply combines only with --through and --decision-ref; drop --${extra.join(", --")}`);
        if (flags.through && flags.through !== "archived")
          die("advance --recover-apply applies only to Land; use --through archived");
        const resolution = String(flags["recover-apply"]);
        if (!["settle", "keep-current", "restore-backup"].includes(resolution))
          die("advance --recover-apply takes settle|keep-current|restore-backup");
        beforeEnvelope(flags.through, () => recoverLand(rest[0], {
          "decision-ref": flags["decision-ref"],
          ...(resolution === "settle" ? {} : { resolution }) }));
        if (!flags.through) return;
        delete flags["recover-apply"];
        delete flags["decision-ref"];
      }
      // Undo of an archived Land whose target diff is still uncommitted: the
      // harness restores the pre-Land bytes from the Land journal and retires
      // the change, or refuses without writing when the target moved on.
      if (flags["undo-land"]) {
        const extra = Object.keys(flags).filter((flag) =>
          !["undo-land", "decision-ref", "pretty"].includes(flag));
        if (extra.length)
          die(`advance --undo-land combines only with --decision-ref; drop --${extra.join(", --")}`);
        if (!undoLand) die("advance --undo-land is unavailable in this runtime");
        undoLand(rest[0], flags["decision-ref"]);
        return;
      }
      // Land's target-conflict route: record which target files Land restores
      // to the sandbox base, then resume the same lifecycle route.
      if (flags["restore-target"] !== undefined) {
        const extra = Object.keys(flags).filter((flag) =>
          !["restore-target", "decision-ref", "through", "pretty"].includes(flag));
        if (extra.length)
          die(`advance --restore-target combines only with --through and --decision-ref; drop --${extra.join(", --")}`);
        if (flags.through && flags.through !== "archived")
          die("advance --restore-target applies only to Land; use --through archived");
        const restore = recordTargetRestore(rest[0], flags["restore-target"], flags["decision-ref"]);
        if (!flags.through) {
          console.log(`TARGET RESTORE RECORDED ${rest[0]}\n  paths: ${restore.paths.join(", ")}` +
            `\n  next: cloop advance ${rest[0]} --through archived`);
          return;
        }
        delete flags["restore-target"];
        delete flags["decision-ref"];
      }
      // Alias of `change resolve <change> --approve-spec --decision-ref <ref>`
      // so the agent's normal path needs only `change start` and `advance`.
      // With --through, the same call records the approval and continues:
      // approving and starting Build is one step, not two commands.
      if (flags["approve-spec"]) {
        const extra = Object.keys(flags).filter((flag) =>
          !["approve-spec", "decision-ref", "through", "role"].includes(flag));
        if (extra.length)
          die(`advance --approve-spec combines only with --decision-ref and --through (and --role for an approval lane); drop --${extra.join(", --")}`);
        if (!flags["decision-ref"])
          die(`advance --approve-spec requires --decision-ref <ref> naming the user's approval`);
        if (flags.through && !["build", "proven", "archived"].includes(flags.through))
          die("advance --through must be build|proven|archived");
        const ask = approvalQuestionAction?.(rest[0], flags.through || null);
        if (ask) {
          console.log(JSON.stringify(ask, null, flags.pretty ? 2 : 0));
          return;
        }
        beforeEnvelope(flags.through, () => resolveChange(rest[0], {
          "approve-spec": true, "decision-ref": flags["decision-ref"],
          ...(flags.role !== undefined ? { role: flags.role } : {}) }));
        if (!flags.through) return;
        delete flags["approve-spec"];
        delete flags["decision-ref"];
        delete flags.role;
      }
      if (flags.inspect && (flags.through || flags["host-result"] || flags.decision ||
          flags["decision-fingerprint"] || flags["decision-ref"] || flags.reason))
        die(`advance --inspect is read-only and cannot be combined with --through, --host-result, or decision flags; ` +
          `run 'cloop advance ${rest[0]} --inspect' alone, or drop --inspect to execute`);
      if (!flags.decision && (flags["decision-fingerprint"] || flags["decision-ref"] || flags.reason))
        die("advance decision metadata requires --decision");
      if (flags.through && !["build", "proven", "archived"].includes(flags.through))
        die("advance --through must be build|proven|archived");
      if (flags["host-result"])
        importHostExecution(rest[0], flags["host-result"]);
      await showAdvance(rest[0], flags);
    },
    "exec": async () => {
      // Everything after `--` belongs to the external command, including its
      // own flags, so the separator is honored before any flag parsing.
      const separator = values.indexOf("--");
      const own = separator === -1 ? values : values.slice(0, separator);
      const commandArgs = separator === -1 ? [] : values.slice(separator + 1);
      const {
        flags,
        rest
      } = parseStrictCommandFlags(own, "exec", {
        value: ["phase", "repo", "repository", "task"]
      });
      if (!rest.length) die("exec requires a change id");
      // `--repo` matches `packet`; `--repository` is accepted as its spelled-out form.
      if (flags.repo !== undefined && flags.repository !== undefined)
        die("exec accepts one of --repo and --repository");
      const repository = flags.repo ?? flags.repository;
      if (repository !== undefined && !String(repository).trim())
        die("exec --repo requires a repository id");
      if (flags.task !== undefined && !String(flags.task).trim())
        die("exec --task requires a task id");
      // The registry advertises this as an enum but nothing checked it, so
      // `--phase buidl` wrote a `buidl` bucket straight into `metrics.phases`
      // and the typo looked like a phase.
      if (flags.phase !== undefined && !LIFECYCLE_PHASES.includes(flags.phase)) die(`exec --phase must be ${LIFECYCLE_PHASES.join("|")}`);
      process.exitCode = await execObserved(rest[0], commandArgs, {
        phase: flags.phase,
        repository: repository ?? null,
        task: flags.task ?? null
      });
    },
    "budget-continue": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "budget continue", {
        value: ["reason", "run", "decision-ref"]
      });
      if (rest.length !== 1) die("budget continue requires exactly one change id");
      continueBudget(rest[0], flags);
    },
    "budget-checkpoint": async () => {
      const { rest } = parseStrictCommandFlags(values, "budget checkpoint", {});
      if (rest.length !== 1) die("budget checkpoint requires exactly one change id");
      checkpointBudget(rest[0]);
    },
    "doctor": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "doctor", {
        boolean: ["require-archive", "unattended", "json"],
        value: ["stage", "change", "attestation"]
      });
      if (rest.length) die(`unexpected doctor argument(s): ${rest.join(", ")}`);
      doctor(flags);
    },
    "validate": async () => {
      validate(values[0]);
    },
    "audit-change": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "change audit", {
        boolean: ["json"]
      });
      if (rest.length !== 1) die("change audit requires exactly one change id");
      showTraceabilityAudit(rest[0], flags);
    },
    "hash": async () => {
      console.log(values[1] ? providerWorkspaceHash(values[0], values[1]) : relevantHash(values[0]));
    },
    ...evidenceRoutes({ values, die }, api),
    "land-check": async () => {
      // The same pre-mutation preflight Land runs, read-only.
      landCheck(values[0], { preflight: "inspect" });
    },
    "land-advance": async () => {
      // Compatibility alias for `advance <id> --through archived`. It grants
      // nothing up front: a pre-issued grant would let advance skip straight
      // to Land, so the alias takes the same proof-required route.
      if (showAdvance) {
        await showAdvance(values[0], { through: "archived" });
        return;
      }
      if (grantLand) grantLand(values[0]);
      await advanceLand(values[0]);
    },
    "land-recover": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "land recover", {
        value: ["decision-ref", "resolution"]
      });
      recoverLand(rest[0], flags);
    },
    "land-plan": async () => {
      showLandPlan(values[0]);
    },
    "land-resume": async () => {
      resumeLand(values[0]);
    },
    "delivery-advance": async () => {
      const { flags, rest } = parseStrictCommandFlags(values, "deliver advance");
      if (Object.keys(flags).length || rest.length !== 1)
        die("deliver advance requires exactly one change id");
      await showDeliveryAdvance(rest[0]);
    },
    "sandbox": async () => {
      if (values[0] === "challenge") {
        const {
          flags,
          rest
        } = parseStrictCommandFlags(values.slice(1), "sandbox challenge");
        if (Object.keys(flags).length || rest.length !== 1) die("sandbox challenge requires exactly one change id");
        createAttestationChallenge(rest[0]);
      } else if (values[0] === "inspect") {
        const {
          flags,
          rest
        } = parseStrictCommandFlags(values.slice(1), "sandbox inspect", {
          boolean: ["json", "unattended"],
          value: ["attestation"]
        });
        if (rest.length !== 1) die("sandbox inspect requires exactly one change id");
        showSandboxInspection(rest[0], flags);
      } else if (values[0] === "create") {
        const {
          flags,
          rest
        } = parseStrictCommandFlags(values.slice(1), "sandbox create", {
          boolean: ["all", "unattended"],
          value: ["attestation"]
        });
        if (rest.length !== 1) die("sandbox create requires exactly one change id");
        createSandbox(rest[0], flags);
      } else if (values[0] === "sync") {
        const {
          flags,
          rest
        } = parseStrictCommandFlags(values.slice(1), "sandbox sync", {
          value: ["resolve"]
        });
        if (rest.length !== 1) die("sandbox sync requires exactly one change id");
        syncSandbox(rest[0], flags);
      } else if (values[0] === "apply") {
        // Strict, like every other authority command: `controlPlane` is an
        // internal argument that defeats the multi-repository guard, so it
        // stays unparseable. `--refresh` is the sanctioned recovery for a
        // target that legitimately moved after apply.
        const {
          flags,
          rest
        } = parseStrictCommandFlags(values.slice(1), "sandbox apply", {
          boolean: ["refresh"]
        });
        if (rest.length !== 1) die("sandbox apply requires exactly one change id");
        if (grantLand) grantLand(rest[0]);
        applySandbox(rest[0], flags);
      } else die("sandbox requires challenge|inspect|create|sync|apply <change>");
    },
    "archive": async () => {
      if (grantLand) grantLand(values[0]);
      archive(values[0]);
    },
    "event": async () => {
      const {
        flags,
        rest
      } = parseFlags(values);
      recordEvent(rest[0], flags);
    },
    "telemetry-sync": async () => {
      syncClaudeTelemetry(values[0], {
        source: values[1] || null
      });
    },
    "telemetry-import": async () => {
      importTelemetry(values[0], values.slice(1));
    },
    "host-execution-import": async () => {
      if (values.length !== 2) die("telemetry host-import requires <change> <result.json>");
      importHostExecution(values[0], values[1]);
    },
    "api-version": async () => {
      console.log(runtimeApiVersion);
    },
    "version": async () => {
      console.log(version);
    }
  };
  const handler = handlers[command];
  if (!handler) {
    usage();
    if (command) process.exit(1);
    return;
  }
  await handler();
}
