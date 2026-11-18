// What Land writes beside an archived change: archive telemetry, the
// verification record of the accepted proof and reviews, and the proposal
// appendix; each can be stripped and rewritten so a resumed archive is
// idempotent.
import { existsSync, lstatSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { complianceEnabledFromConfig, renderVerificationRecord } from "../validation/process-fields.mjs";
import { bestEffort } from "../../core/best-effort.mjs";
import { archiveAppendixMarkdown } from "./archive-appendix.mjs";
import { telemetryUsageSatisfied } from "./apply-journal.mjs";

// The archive-only proof summary Land writes beside the archived proposal.
export const VERIFICATION_RECORD_FILE = "verification.md";

export function createArchiveRecords({
  changePath, fail, now, proofPath, readJson, reviewAttemptRecords, rolloutGates, root,
  saveRuntime, telemetryReadiness
}) {
  function recordArchiveTelemetry(id, state) {
    const telemetry = telemetryReadiness?.(id) || null;
    state.land = {
      ...(state.land || {}),
      telemetry: telemetry ? {
        classification: telemetry.classification,
        reason: telemetry.reason,
        correlatedHosts: telemetry.correlatedHosts,
        measuredDimensions: telemetry.measuredDimensions
      } : null,
      updatedAt: now()
    };
    saveRuntime(state);
    if (telemetry && !["measured", "no-usage"].includes(telemetry.classification)) {
      console.error(telemetry.classification === "not-ingested"
        ? "WARNING: no model usage was imported for this change; cost and token columns stay empty — telemetry not-ingested"
        : telemetryUsageSatisfied(telemetry)
          ? `WARNING: telemetry ${telemetry.classification}; unavailable dimensions remain empty`
          : `WARNING: telemetry ${telemetry.classification}; cost and token columns may stay empty`);
    }
    return telemetry;
  }

  // Rendered while the active packet still exists (rollout gates read it) and
  // kept in the Land record, so a resumed Land appends the same text.
  function prepareArchiveAppendix(id, state) {
    const draft = state.draftSource?.draft || {};
    let configText = "";
    configText = bestEffort(() => readFileSync(join(root, "openspec", "config.yaml"), "utf8"), configText);
    const read = (reader) => { try { return reader(id, state) || []; } catch { return []; } };
    const language = draft.language || state.documentLanguage;
    const reviewAttempts = read(reviewAttemptRecords);
    return {
      markdown: archiveAppendixMarkdown({
        language,
        reviewAttempts,
        complianceEnabled: complianceEnabledFromConfig(configText),
        compliance: draft.compliance || null,
        approvalRef: state.specApproval?.decisionRef || null,
        rolloutGates: read(rolloutGates)
      }),
      verification: prepareVerificationRecord(id, language, reviewAttempts)
    };
  }

  // The proof Land accepted, with each receipt it names read from the local
  // proof store. An unreadable receipt is passed as missing, never as a pass.
  function prepareVerificationRecord(id, language, reviewAttempts) {
    let proof = null;
    try { proof = readJson(proofPath(id), null); } catch { proof = null; }
    const receipts = {};
    for (const entry of Array.isArray(proof?.receipts) ? proof.receipts : []) {
      if (!entry?.path || typeof entry.path !== "string") continue;
      bestEffort(() => {
        const absolute = resolve(root, entry.path);
        if (absolute.startsWith(`${resolve(root)}/`))
          receipts[entry.path] = readJson(absolute, null);
      }); // rendered as unavailable
    }
    const markdown = renderVerificationRecord({
      language: /^th\b/i.test(String(language || "")) ? "th" : "en",
      proof, receipts, reviewAttempts
    });
    return markdown ? `${markdown}\n` : "";
  }

  // Refused before any target write: Land owns this name in the archive.
  function assertVerificationRecordUnclaimed(id, state) {
    const packets = [changePath(id)];
    if (state?.workspace?.path && state.workspace.mode !== "direct")
      packets.push(join(state.workspace.path, "openspec", "changes", id));
    const claimed = packets.filter((packet) => existsSync(join(packet, VERIFICATION_RECORD_FILE)));
    if (claimed.length)
      fail(`change '${id}' packet already contains ${VERIFICATION_RECORD_FILE}, which Land writes ` +
        `into the archived change; move that content to another file through 'cloop change revise ${id}' ` +
        `and land again`);
  }

  // Volatile records (review, compliance, rollout) are written only into the
  // archived proposal, after the merged specs verify and before the delivery
  // integrity record binds the archived tree. The pre-append byte length is
  // recorded first, so a resumed Land can restore the exact archived packet
  // (whose identity the approval and projection checks bind) and append again.
  function appendArchiveAppendix(state, archivedPath) {
    writeVerificationRecord(state, archivedPath);
    const appendix = state.land?.archiveAppendix;
    if (!appendix?.markdown || !archivedPath) return;
    const proposal = join(root, archivedPath, "proposal.md");
    if (!existsSync(proposal)) return;
    stripProposalAppendix(state, archivedPath);
    const original = readFileSync(proposal);
    state.land.archiveAppendix = { ...appendix, offset: original.length };
    saveRuntime(state);
    const separator = original.length && !original.toString("utf8").endsWith("\n") ? "\n\n" : "\n";
    writeFileSync(proposal, Buffer.concat([original,
      Buffer.from(`${separator}${appendix.markdown}\n`, "utf8")]));
  }

  function writeVerificationRecord(state, archivedPath) {
    const verification = state.land?.archiveAppendix?.verification;
    if (!verification || !archivedPath || !existsSync(join(root, archivedPath))) return;
    const file = join(root, archivedPath, VERIFICATION_RECORD_FILE);
    stripVerificationRecord(state, archivedPath);
    writeFileSync(file, verification);
  }

  // Removes only the exact text Land recorded, so a resumed Land rewrites it
  // once and an edited file is never deleted.
  function stripVerificationRecord(state, archivedPath) {
    const verification = state.land?.archiveAppendix?.verification;
    if (!verification || !archivedPath) return;
    const file = join(root, archivedPath, VERIFICATION_RECORD_FILE);
    if (!existsSync(file) && !isSymlink(file)) return;
    if (lstatSync(file).isFile() && readFileSync(file, "utf8") === verification) {
      rmSync(file, { force: true });
      return;
    }
    // Checked here, before any retained-integrity or approval check that would
    // otherwise report the whole archived packet as changed.
    fail(`archived ${VERIFICATION_RECORD_FILE} differs from the recorded proof summary at ` +
      `'${archivedPath}'; it is kept. Preserve a copy, remove it, and resume with ` +
      `'cloop advance ${state.id} --through archived'`);
  }

  function isSymlink(path) {
    try { return lstatSync(path).isSymbolicLink(); } catch { return false; }
  }

  function stripArchiveAppendix(state, archivedPath) {
    stripVerificationRecord(state, archivedPath);
    stripProposalAppendix(state, archivedPath);
  }

  function stripProposalAppendix(state, archivedPath) {
    const offset = state.land?.archiveAppendix?.offset;
    if (!Number.isInteger(offset) || !archivedPath) return;
    const proposal = join(root, archivedPath, "proposal.md");
    if (existsSync(proposal)) {
      const bytes = readFileSync(proposal);
      if (bytes.length > offset &&
          bytes.subarray(offset).toString("utf8").includes(state.land.archiveAppendix.markdown))
        writeFileSync(proposal, bytes.subarray(0, offset));
    }
    const { offset: _offset, ...rest } = state.land.archiveAppendix;
    state.land.archiveAppendix = rest;
    saveRuntime(state);
  }

  return { recordArchiveTelemetry, prepareArchiveAppendix, assertVerificationRecordUnclaimed, appendArchiveAppendix, stripArchiveAppendix };
}
