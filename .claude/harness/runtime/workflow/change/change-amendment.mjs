import { packetIdentity, snapshotAmendedPacket } from "../../core/user-decisions.mjs";
import { createHash } from "node:crypto";
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync,
  writeFileSync
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { transitionLifecycleState } from "../../core/lifecycle-reducer.mjs";
import { taskBlocks, taskMetadata } from "../../contracts/change-artifacts.mjs";
import { isRecordedSemanticVersion, isSemanticVersion } from "../validation/draft-version.mjs";
import { inspectSemanticSources } from "../validation/semantic-source-inventory.mjs";
import { planAmendmentInvalidation } from "../validation/amendment-invalidation.mjs";
import {
  planSelectiveProofRecovery, rebindSelectiveProofReceipt, demoteSelectivePreservation
} from "../validation/selective-proof-plan.mjs";
import { semanticIntakeResumeProjection } from "../draft/semantic-intake-state.mjs";
import {
  amendmentRepositoryOrderIssues, amendmentTaskRepositoryIssues,
  amendmentVerifyPathIssues, amendmentVerifyShapeIssues, compileSemanticAmendment,
  taskContractOnlyAmendment, writeSemanticAmendment
} from "../draft/semantic-amendment.mjs";
import {
  amendmentInvestigationSource, investigationCoverageIssues
} from "../validation/investigation-coverage.mjs";
import { behaviorChangingTypes } from "../validation/verify-shape.mjs";
import {
  amendedScenarioTestBinding, amendmentScenarioBindingIssues, bindingRecord
} from "../validation/scenario-test-binding.mjs";
import { changeWorkTypes } from "./task-change.mjs";
import { validateInvestigationBinding } from "../investigation/investigation-runtime.mjs";
import { renderDraftTask } from "../draft/draft-packet-render.mjs";
import {
  amendedReport, amendmentCoverageChanges, amendmentHistoryRow
} from "./amendment-record.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import {
  documentSectionInvalidation, draftRequirementFingerprints, riskSignalValues,
  sectionsOnlyAmendment
} from "./change-start-values.mjs";

export function createChangeAmendment(ctx) {
  const {
    activeChangePath, amendmentRevision, assertAmendmentRevision, carrySpecApproval,
    changeRepositoryRows, changeRepositorySelection, claimsForProvider,
    contractFingerprint, decisionGateNotice, declaredRepositories, fail, git,
    inspectSemanticIntakeSource, intelligenceUsable, lessonsSourcePaths, loadRuntime,
    now, pathInside, providerConfig, readJson, receiptPath, receiptValidity,
    recordApprovalDelta, recordPrototypeSync, repositoryIntelligence, requiredProviders,
    root, saveRuntime, selectiveBinding, semanticIntakeStatePath,
    semanticSourceInspection, slugify, stableHash, validate, withAmendmentLock,
    writeJson
  } = ctx;

  function amendmentIntakeSource(amendment) {
    return {
      version: 4,
      intent: String(amendment.reason || "Amend the active agreement"),
      impact: amendment.impact || "low",
      coupling: amendment.coupling || "isolated",
      size: amendment.size,
      changeSize: amendment.changeSize,
      requirements: [...(amendment.addRequirements || []),
        ...(amendment.reviseRequirements || [])],
      integrations: amendment.integrations || [],
      externalOperations: amendment.externalOperations || [],
      securityTriggers: amendment.securityTriggers || [],
      riskSignals: amendment.riskSignals || [],
      discovery: amendment.discovery
    };
  }

  function amendmentRepositoryIssues(id, state, amendment) {
    const changeDir = activeChangePath(id, state);
    const tasksPath = join(changeDir, "tasks.md");
    const tasksContent = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "";
    return [
      ...amendmentTaskRepositoryIssues(amendment, tasksContent, {
        repositories: declaredRepositories(),
        selection: changeRepositorySelection(changeDir),
        exists: existsSync
      }),
      // An added task's derived repository order must not close a cycle.
      ...amendmentRepositoryOrderIssues(amendment, tasksContent, {
        repositories: declaredRepositories(),
        selection: changeRepositoryRows(changeDir) || undefined
      })
    ];
  }

  function inspectAmendment(id, amendmentPath, options = {}) {
    const active = loadRuntime(id);
    if (!isSemanticVersion(active.semanticDraftVersion))
      fail(`change amend --inspect requires a semantic-draft v4 or v5 change; '${id}' is version ${
        active.semanticDraftVersion || "legacy"}${isRecordedSemanticVersion(active.semanticDraftVersion)
        ? `; a v3 change has no amendment intake: apply it directly with cloop change amend ${id} ${amendmentPath}`
        : ""}`);
    const path = resolve(root, amendmentPath);
    if (!pathInside(root, path) || !existsSync(path))
      fail("change amend requires a JSON file inside the project");
    const amendment = options.preparedSource || readJson(path);
    // Build creates files in the workspace, so a verify path is checked there.
    const workspaceRoot = active.workspace?.path && existsSync(active.workspace.path)
      ? active.workspace.path : root;
    const tasksPath = join(activeChangePath(id, active), "tasks.md");
    const tasksContent = existsSync(tasksPath) ? readFileSync(tasksPath, "utf8") : "";
    const workTypes = changeWorkTypes(activeChangePath(id, active));
    return inspectSemanticIntakeSource(amendmentIntakeSource(amendment), {
      statePath: semanticIntakeStatePath(amendmentPath, `amend:${id}`),
      resume: `cloop change amend ${id} ${amendmentPath} --inspect`,
      quiet: options.quiet,
      validateCompiledDraft: false,
      excludedSourcePath: relative(root, path).replaceAll("\\", "/"),
      standardLane: active.schema === "foundation-standard",
      extraIssues: [...amendmentVerifyPathIssues(amendment, tasksContent,
        { exists: (candidate) => existsSync(join(workspaceRoot, candidate)) ||
          existsSync(join(root, candidate)) }),
      ...amendmentVerifyShapeIssues(amendment, tasksContent, { workTypes }),
      ...amendmentScenarioBindingIssues(amendment,
        { behaviorChanging: behaviorChangingTypes(workTypes) }),
      ...amendmentRepositoryIssues(id, active, amendment),
      ...investigationCoverageIssues(amendmentInvestigationSource(
        active.investigationAgreement || active.draftSource?.draft, amendment)),
      ...(amendment.investigation ? validateInvestigationBinding({
        projectRoot: root, binding: amendment.investigation, git }) : [])]
    });
  }

  // Claims whose command evidence already passed and is still valid: the task
  // verify commands those receipts ran are finished work, not open drafts.
  function provenCommandClaimIds(id) {
    return [...new Set(requiredProviders(id).flatMap((provider) => {
      if (!["command", "test-discovery"].includes(providerConfig(id, provider)?.adapter)) return [];
      const path = receiptPath(id, provider);
      if (!existsSync(path)) return [];
      let receipt = null;
      try { receipt = readJson(path); } catch { return []; }
      if (receipt?.status !== "pass" || receiptValidity(id, provider).validity !== "valid") return [];
      return claimsForProvider(id, provider).map((claim) => claim.id);
    }))];
  }

  function amendChangeUnlocked(id, amendmentPath, options, state, expectedRevision) {
    if (!isRecordedSemanticVersion(state.semanticDraftVersion))
      fail(`change amend requires a semantic-draft change; '${id}' is not one`);
    if (["applied", "archived"].includes(state.status))
      fail(`change amend cannot rewrite an agreement in '${state.status}' status; start a successor change`);
    if (state.land?.status || state.workspace?.applied)
      fail("change amend cannot rewrite an agreement after Land has started; recover Land before starting a successor change");
    const source = resolve(root, amendmentPath);
    if (!pathInside(root, source) || !existsSync(source))
      fail("change amend requires a JSON file inside the project");
    const amendment = readJson(source);
    if (amendment.investigation) {
      const bindingIssues = validateInvestigationBinding({ projectRoot: root, binding: amendment.investigation, git });
      if (bindingIssues.length) fail(`investigation amendment binding failed:\n  - ${bindingIssues.join("\n  - ")}`);
    }
    const amendmentStatePath = semanticIntakeStatePath(amendmentPath, `amend:${id}`);
    let completedAmendmentIntakeEffectiveness = null;
    // A verify-only correction changes no requirement, so it has no semantic
    // intake to complete.
    // A sections-only amendment rewrites prose and no requirement either.
    const sectionsOnly = sectionsOnlyAmendment(amendment);
    if (isSemanticVersion(state.semanticDraftVersion) && !taskContractOnlyAmendment(amendment) &&
        !sectionsOnly) {
      const resume = `cloop change amend ${id} ${amendmentPath} --inspect`;
      let intakeState = null;
      if (existsSync(amendmentStatePath)) {
        try { intakeState = JSON.parse(readFileSync(amendmentStatePath, "utf8")); }
        catch { intakeState = null; }
      }
      const intakeSource = amendmentIntakeSource(amendment);
      const amendmentRelativePath = relative(root, source).replaceAll("\\", "/");
      const intelligence = repositoryIntelligence(intakeSource, [amendmentRelativePath],
        { standardLane: state.schema === "foundation-standard" });
      const sourceInspection = intelligenceUsable(intelligence)
        ? semanticSourceInspection(intakeSource, null, intelligence.selected)
        : inspectSemanticSources({ projectRoot: root, sourcePaths: lessonsSourcePaths() });
      const projection = semanticIntakeResumeProjection(intakeState, intakeSource, {
        resumeRoute: resume, sourceInventory: sourceInspection.inventory
      });
      if (!intelligenceUsable(intelligence) || sourceInspection.findings.length ||
          projection.status !== "current" || projection.action?.action !== "DONE") {
        // One call: inspect in place. DONE amends; any other action is printed
        // as `--inspect` would and the agreement is left untouched.
        const inspected = inspectAmendment(id, amendmentPath,
          { quiet: true, preparedSource: amendment });
        if (inspected.action !== "DONE") {
          console.log(JSON.stringify(inspected, null, 2));
          return inspected;
        }
        completedAmendmentIntakeEffectiveness = inspected.effectiveness || null;
      } else completedAmendmentIntakeEffectiveness = intakeState?.effectiveness || null;
    }
    const basePath = activeChangePath(id, state);
    // A task-contract amendment skips intake, so its repository binding is
    // checked here; an intake amendment was checked by its inspection.
    if (taskContractOnlyAmendment(amendment)) {
      const repositoryIssues = amendmentRepositoryIssues(id, state, amendment);
      if (repositoryIssues.length)
        fail(`semantic amendment validation failed:\n  - ${repositoryIssues.join("\n  - ")}`);
    }
    const contract = readJson(join(basePath, "evidence.yaml"));
    const tasksContent = readFileSync(join(basePath, "tasks.md"), "utf8");
    const compiled = compileSemanticAmendment({
      amendment, contract, tasksContent, slugify, renderTask: renderDraftTask,
      investigationSource: state.investigationAgreement || state.draftSource?.draft,
      semanticDraftVersion: state.semanticDraftVersion,
      provenClaimIds: (amendment?.updateTasks || []).some((task) =>
        task && ["verify", "paths", "dependsOn"].some((field) => Object.hasOwn(task, field))) ||
        (Array.isArray(amendment?.removeTasks) && amendment.removeTasks.length)
        ? provenCommandClaimIds(id) : [],
      retiredTaskIds: (state.amendments || []).flatMap((row) =>
        (row?.removedTasks || []).map((task) => task?.id).filter(Boolean)),
      repositories: declaredRepositories(),
      repositorySelection: changeRepositoryRows(basePath),
      loadCanonicalSpec: (capability) => {
        const path = join(root, "openspec", "specs", slugify(capability), "spec.md");
        return existsSync(path) ? readFileSync(path, "utf8") : null;
      }
    });
    if (compiled.issues.length)
      fail(`semantic amendment validation failed:\n  - ${compiled.issues.join("\n  - ")}`);
    const coverageChanges = amendmentCoverageChanges(compiled);
    const configuredProviderNames = requiredProviders(id);
    const providerEntries = new Map(Object.entries(compiled.providers || {}));
    for (const name of configuredProviderNames) {
      if (providerEntries.has(name)) continue;
      const config = providerConfig(id, name);
      if (config) providerEntries.set(name, config);
    }
    const providers = Object.fromEntries([...providerEntries].map(([name, config]) => [name, {
        capability: config.capability || name,
        ...(Array.isArray(config.claims) ? { claims: config.claims.filter((claim) =>
          !compiled.removedClaimIds.includes(claim)) } : {}),
        ...(Array.isArray(config.dependsOn) ? { dependsOn: config.dependsOn } : {})
      }]
    ));
    const invalidation = sectionsOnly ? documentSectionInvalidation(providers) : planAmendmentInvalidation({
      claims: compiled.claims,
      tasks: taskBlocks(compiled.tasksContent).map(taskMetadata),
      providers,
      coverageDelta: {
        addedClaimIds: compiled.addedClaimIds,
        changedClaimIds: compiled.changedClaimIds,
        removedClaimIds: compiled.removedClaimIds,
        coverageChanges
      },
      priorClaims: compiled.priorClaims
    });
    if (invalidation.status !== "READY")
      fail(`semantic amendment invalidation planning failed:\n  - ${
        invalidation.findings.map((finding) => `${finding.code}: ${finding.message}`).join("\n  - ")}`);
    compiled.invalidation = invalidation;

    const priorContractRevision = Number(state.contractRevision || 0);
    const priorContractFingerprint = contractFingerprint(id);
    const proofAdvancePath = join(root, ".foundation", "evidence", id, "proof-advance.json");
    const priorProofAdvance = existsSync(proofAdvancePath)
      ? readFileSync(proofAdvancePath, "utf8") : null;
    const receiptBackups = new Map();
    const receiptBindings = [];
    if (existsSync(dirname(receiptPath(id, "__provider__")))) {
      for (const provider of invalidation.proof.preserveReceipts) {
        const path = receiptPath(id, provider);
        if (!existsSync(path)) continue;
        const receipt = readJson(path);
        receiptBackups.set(provider, receipt);
        const binding = selectiveBinding(id, provider, priorContractRevision, receipt);
        if (binding) receiptBindings.push(binding);
      }
    }

    const transactionRoot = mkdtempSync(join(dirname(basePath), `.${id}-amend-`));
    const stagedPath = join(transactionRoot, "next");
    const priorPath = join(transactionRoot, "prior");
    cpSync(basePath, stagedPath, { recursive: true, errorOnExist: true });
    // The amendment history line carries the contract revision it produces.
    try {
      writeSemanticAmendment(stagedPath, compiled, slugify,
        { schema: state.schema, revision: priorContractRevision + 1 });
    }
    catch (error) {
      rmSync(transactionRoot, { recursive: true, force: true });
      fail(`${error?.message || error}; semantic amendment rolled back`);
    }
    const priorState = structuredClone(state);
    const rebindAuditPaths = [];
    const rebindAudits = [];
    let installed = false;
    try {
      assertAmendmentRevision(id, expectedRevision);
      renameSync(basePath, priorPath);
      renameSync(stagedPath, basePath);
      installed = true;
      validate(id, "active");
      assertAmendmentRevision(id, expectedRevision);
      const currentContractRevision = priorContractRevision + 1;
      const currentRequiredProviders = requiredProviders(id);
      const currentBindings = invalidation.proof.preserveReceipts
        .map((provider) => selectiveBinding(id, provider, currentContractRevision))
        .filter(Boolean);
      let proofRecovery = planSelectiveProofRecovery({
        changeId: id,
        invalidation,
        requiredProviders: currentRequiredProviders,
        receiptBindings,
        currentBindings,
        priorContractRevision,
        currentContractRevision
      });
      compiled.invalidation.proofRecovery = proofRecovery;
      if (proofRecovery.status === "READY") {
        const nextFingerprint = contractFingerprint(id);
        for (const provider of proofRecovery.providers.preserved) {
          const priorReceipt = receiptBackups.get(provider);
          if (!priorReceipt) throw new Error(`selective proof receipt '${provider}' disappeared`);
          // A task-only amendment leaves the contract as it was: a receipt
          // already bound to it needs no rebind, and one that is not is rerun.
          if (nextFingerprint === priorContractFingerprint) {
            if (priorReceipt.contractFingerprint !== nextFingerprint)
              compiled.invalidation.proofRecovery = proofRecovery = demoteSelectivePreservation(
                proofRecovery, provider, "RECEIPT_STALE_FOR_UNCHANGED_CONTRACT");
            continue;
          }
          const rebound = rebindSelectiveProofReceipt({
            receipt: priorReceipt,
            provider,
            plan: proofRecovery,
            fromContractFingerprint: priorContractFingerprint,
            toContractFingerprint: nextFingerprint,
            reboundAt: now()
          });
          writeJson(receiptPath(id, provider), rebound);
          if (receiptValidity(id, provider).validity !== "valid")
            throw new Error(`selective proof receipt '${provider}' failed post-rebind validation`);
          const audit = {
            version: 1,
            kind: "semantic-amendment-receipt-rebind",
            changeId: id,
            provider,
            recordedAt: rebound.contractRebind.reboundAt,
            contract: proofRecovery.contract,
            decision: proofRecovery.decisions.find((row) => row.provider === provider),
            priorReceiptDigest: stableHash(priorReceipt),
            reboundReceiptDigest: stableHash(rebound)
          };
          const auditDirectory = join(root, ".foundation", "evidence", id, "receipt-rebinds");
          mkdirSync(auditDirectory, { recursive: true });
          const providerKey = createHash("sha256").update(provider).digest("hex").slice(0, 12);
          const auditPath = join(auditDirectory,
            `${currentContractRevision}-${providerKey}-${stableHash(audit).slice(0, 12)}.json`);
          writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, {
            encoding: "utf8", flag: "wx"
          });
          rebindAuditPaths.push(auditPath);
          rebindAudits.push({
            provider,
            path: relative(root, auditPath).replaceAll("\\", "/"),
            digest: stableHash(audit)
          });
        }
      }
      const nextState = loadRuntime(id);
      if (compiled.investigationAgreement) nextState.investigationAgreement = compiled.investigationAgreement;
      nextState.revision = Number(nextState.revision || 0) + 1;
      nextState.contractRevision = Number(nextState.contractRevision || 0) + 1;
      nextState.executionRevision = Number(nextState.executionRevision || 0) + 1;
      // The amended packet lives only in the isolated workspace until Land.
      // Its identity and a snapshot are kept so later gates recognise it as
      // the agreement, whatever bookkeeping moves the revision afterwards.
      const amendedWorkspace = nextState.workspace?.path &&
        pathInside(nextState.workspace.path, basePath) ? nextState.workspace.path : null;
      const amendedPacket = amendedWorkspace
        ? snapshotAmendedPacket(root, amendedWorkspace, id, nextState.contractRevision)
        : { identity: packetIdentity(basePath) };
      nextState.amendments = [...(nextState.amendments || []), amendmentHistoryRow({
        revision: nextState.contractRevision, amendedPacket, amendment, compiled, invalidation,
        proofRecovery, rebindAudits, intakeEffectiveness: completedAmendmentIntakeEffectiveness,
        appliedAt: now()
      })];
      const amendmentDelta = {
        added: compiled.addedRequirementKeys,
        revised: compiled.revisedRequirementKeys,
        removed: compiled.removedRequirementKeys
      };
      const requirementDelta = Object.values(amendmentDelta).some((keys) => keys.length);
      // Merge the amendment's risk signals before carrying consent: approval
      // lanes are routed from them, and a new signal can require a new lane.
      const amendedSignals = riskSignalValues([
        ...(priorState.riskSignals || []), ...(amendment.riskSignals || [])]);
      if (amendedSignals.length) nextState.riskSignals = amendedSignals;
      if (!carrySpecApproval(priorState, nextState, id, amendmentDelta,
        `semantic-amendment: ${String(amendment.reason || "Agreement expanded during Build")}`) &&
          (requirementDelta || nextState.pendingApprovalDelta))
        recordApprovalDelta(nextState, amendmentDelta);
      if (nextState.requirementFingerprints) {
        const fingerprints = { ...nextState.requirementFingerprints,
          ...draftRequirementFingerprints({
            requirements: [...(amendment.addRequirements || []),
              ...(amendment.reviseRequirements || [])],
            evidence: amendment.evidence
          }) };
        for (const key of compiled.removedRequirementKeys) delete fingerprints[key];
        nextState.requirementFingerprints = fingerprints;
      }
      // Prove judges per bound file only through this binding, so an amendment
      // that adds a scenario or a test path must update it.
      if (priorState.scenarioTestBinding?.rows)
        nextState.scenarioTestBinding = bindingRecord(amendedScenarioTestBinding(
          priorState.scenarioTestBinding.rows, {
            draft: compiled.bindingDraft, testMap: amendment.testMap,
            ledgerTasks: taskBlocks(compiled.tasksContent).map(taskMetadata),
            retiredClaimIds: [...compiled.removedClaimIds, ...compiled.changedClaimIds]
          }));
      // A proven candidate is still amendable until Land begins. Re-enter
      // Build so advance dispatches added tasks and re-finalizes this revision;
      // the prior proof and Land grant cannot authorize the amended packet.
      if (priorState.status === "proven")
        transitionLifecycleState(nextState, "building", "proven-agreement-amended");
      saveRuntime(nextState);
      // A prior proof-advance checkpoint describes the old contract. Even when
      // every executable receipt is preserved, the coordinator must re-enter
      // Prove and finalize the amended packet instead of accepting that stale
      // READY projection as if it covered the new revision.
      rmSync(proofAdvancePath, { force: true });
      rmSync(priorPath, { recursive: true, force: true });
    } catch (error) {
      if (installed && existsSync(basePath))
        rmSync(basePath, { recursive: true, force: true });
      if (existsSync(priorPath)) renameSync(priorPath, basePath);
      for (const [provider, receipt] of receiptBackups)
        writeJson(receiptPath(id, provider), receipt);
      for (const path of rebindAuditPaths) rmSync(path, { force: true });
      if (priorProofAdvance !== null) {
        mkdirSync(dirname(proofAdvancePath), { recursive: true });
        writeFileSync(proofAdvancePath, priorProofAdvance);
      }
      if (installed) saveRuntime(priorState);
      fail(`${error?.message || error}; semantic amendment rolled back`);
    } finally {
      rmSync(transactionRoot, { recursive: true, force: true });
    }
    if (options.consumeAmendment) {
      try { rmSync(source); }
      catch (error) {
        console.error(`WARNING: amendment succeeded but could not remove '${
          relative(root, source)}': ${error.message}`);
      }
    }
    try { rmSync(amendmentStatePath, { force: true }); }
    catch (error) {
      console.error(`WARNING: amendment succeeded but could not remove semantic intake state: ${
        error.message}`);
    }
    const amended = loadRuntime(id);
    const gate = decisionGateNotice(id);
    bestEffort(() => recordPrototypeSync(id)); // advisory
    console.log(amendedReport(id, amended, compiled, gate));
    return compiled;
  }

  function amendChange(id, amendmentPath, options = {}) {
    const state = loadRuntime(id);
    const observedRevision = amendmentRevision(state);
    return withAmendmentLock(id, observedRevision,
      () => amendChangeUnlocked(id, amendmentPath, options, state, observedRevision));
  }

  return {
    amendChange, inspectAmendment
  };
}
