// CLI routes for proof, evidence, authority, receipts, and handoffs. Each
// handler parses its flags and calls the runtime the composition root passed
// in `api`.

export function evidenceRoutes({
  values, die
}, api) {
  const {
    parseFlags,
    parseStrictCommandFlags,
    proofPlan,
    proofReadiness,
    proofAdvance,
    proofRun,
    proofCollect,
    proofPreflight,
    proofExecute,
    proofAudit,
    proofFinalize,
    showEvidenceDetection,
    initializeEvidence,
    showEvidenceDoctor,
    recordVerifiedCi,
    requestAuthority,
    dispatchAuthority,
    runAuthorityReviewer,
    abortAuthority,
    resetInfrastructureAuthority,
    extendReviewAuthority,
    resetBaseMoveAuthority,
    showAuthorityStatus,
    recordAuthority,
    recordReceipt,
    runProvider,
    showHandoffStatus,
    showHandoffPacket,
    recordHandoff
  } = api;
  return {
    "proof-plan": async () => {
      proofPlan(values[0]);
    },
    "proof-readiness": async () => {
      proofReadiness(values[0]);
    },
    "proof-advance": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "proof advance", {
        boolean: ["retry-indeterminate"],
        value: ["decision-ref"]
      });
      if (rest.length !== 1) die("proof advance requires exactly one change id");
      await proofAdvance(rest[0], flags);
    },
    "proof-run": async () => {
      await proofRun(values[0]);
    },
    "proof-collect": async () => {
      await proofCollect(values[0]);
    },
    "proof-preflight": async () => {
      proofPreflight(values[0]);
    },
    "proof-execute": async () => {
      await proofExecute(values[0]);
    },
    "proof-audit": async () => {
      const audit = proofAudit(values[0]);
      if (!audit.valid) die(`proof audit failed: ${audit.reason}`);
    },
    "evidence-detect": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "evidence detect");
      if (Object.keys(flags).length || rest.length !== 1) die("evidence detect requires exactly one change id");
      showEvidenceDetection(rest[0]);
    },
    "evidence-init": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "evidence init", {
        boolean: ["write"]
      });
      if (rest.length !== 1) die("evidence init requires exactly one change id");
      initializeEvidence(rest[0], flags);
    },
    "evidence-doctor": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "evidence doctor");
      if (Object.keys(flags).length || rest.length !== 1) die("evidence doctor requires exactly one change id");
      showEvidenceDoctor(rest[0]);
    },
    "evidence-verify-ci": async () => {
      if (values.length !== 3) die("evidence verify-ci requires <change> <provider> <signed.json>");
      await recordVerifiedCi(values[0], values[1], values[2]);
    },
    "authority-request": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority request", {
        value: ["type", "repo"]
      });
      if (rest.length !== 1) die("authority request requires exactly one change id");
      await requestAuthority(rest[0], flags);
    },
    "authority-dispatch": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority dispatch", {
        value: ["request", "scope", "base-attempt", "reviewer-type", "reviewer-identity", "reviewer-provider-family", "reviewer-model-family", "reviewer-model", "reviewer-session"]
      });
      if (rest.length !== 1) die("authority dispatch requires exactly one change id");
      await dispatchAuthority(rest[0], flags);
    },
    "authority-run": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority run", {
        value: ["request", "reviewer", "subject-actor", "subject-session", "subject-provider-family", "subject-model-family", "subject-model", "main-session-identity", "main-session-id", "main-session-provider-family", "main-session-model-family", "main-session-model"]
      });
      if (rest.length !== 1) die("authority run requires exactly one change id");
      await runAuthorityReviewer(rest[0], flags);
    },
    "authority-abort": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority abort", {
        value: ["request", "reason"]
      });
      if (rest.length !== 1) die("authority abort requires exactly one change id");
      await abortAuthority(rest[0], flags);
    },
    "authority-status": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority status", {
        value: ["request"],
        boolean: ["template"]
      });
      if (rest.length !== 1) die("authority status requires exactly one change id");
      await showAuthorityStatus(rest[0], flags);
    },
    "authority-reset-infra": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority reset-infra", {
        value: ["decision-ref", "reviewer"]
      });
      if (rest.length !== 1) die("authority reset-infra requires exactly one change id");
      await resetInfrastructureAuthority(rest[0], flags);
    },
    "authority-extend-review": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority extend-review", {
        value: ["decision-ref"]
      });
      if (rest.length !== 1) die("authority extend-review requires exactly one change id");
      await extendReviewAuthority(rest[0], flags);
    },
    "authority-reset-base-move": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority reset-base-move", {
        value: ["decision-ref"]
      });
      if (rest.length !== 1) die("authority reset-base-move requires exactly one change id");
      await resetBaseMoveAuthority(rest[0], flags);
    },
    "authority-record": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "authority record", {
        value: ["request", "response"]
      });
      if (rest.length !== 1) die("authority record requires exactly one change id");
      await recordAuthority(rest[0], flags);
    },
    "receipt": async () => {
      const [id, provider, status, ...tail] = values;
      const {
        flags
      } = parseFlags(tail);
      await recordReceipt(id, provider, status, flags);
    },
    "run-provider": async () => {
      await runProvider(values[0], values[1], values.slice(2));
    },
    "prove": async () => {
      await proofFinalize(values[0]);
    },
    "handoff-status": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "handoff status");
      if (Object.keys(flags).length || rest.length !== 1) die("handoff status requires exactly one change id");
      showHandoffStatus(rest[0]);
    },
    "handoff-list": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "handoff list", {
        boolean: ["open", "json"],
        value: ["owner", "environment"]
      });
      if (rest.length) die("handoff list takes no change id");
      showHandoffStatus(null, { ...flags, list: true });
    },
    "handoff-packet": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "handoff packet", {
        value: ["id"]
      });
      if (rest.length !== 1) die("handoff packet requires exactly one change id");
      showHandoffPacket(rest[0], flags);
    },
    "handoff-record": async () => {
      const {
        flags,
        rest
      } = parseStrictCommandFlags(values, "handoff record", {
        value: ["id", "status", "actor", "reference", "evidence", "reason"]
      });
      if (rest.length !== 1) die("handoff record requires exactly one change id");
      recordHandoff(rest[0], flags);
    }
  };
}
