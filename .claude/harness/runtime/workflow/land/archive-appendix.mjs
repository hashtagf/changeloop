import {
  renderComplianceChangeRecord, renderReviewRecord, renderRolloutGates
} from "../validation/process-fields.mjs";
import { outlineRow, sectionHeading } from "../validation/outline-contract.mjs";

const ROLLOUT_GATES_HEADING = Object.freeze({
  en: "Appendix: Rollout gates", th: "ภาคผนวก: gate ของ rollout"
});

function appendixLanguage(value) {
  return /^th\b/i.test(String(value || "")) ? "th" : "en";
}

// The archive-only proposal appendices, rendered from records the runtime
// already holds: the review attempts, the compiled-from draft's compliance
// data (only when openspec/config.yaml enables it) with the spec-approval
// decision, and the deferred post-release rollout gates. "" when none apply.
export function archiveAppendixMarkdown({
  language, reviewAttempts = [], complianceEnabled = false, compliance = null,
  approvalRef = null, rolloutGates = []
} = {}) {
  const lang = appendixLanguage(language);
  const heading = (key) => sectionHeading(outlineRow("proposal", key), lang);
  const sections = [];
  const review = renderReviewRecord(reviewAttempts, { language: lang });
  if (review) sections.push(`## ${heading("reviewRecord")}\n\n${review}`);
  if (complianceEnabled) {
    const record = renderComplianceChangeRecord(compliance, { language: lang, approvalRef });
    if (record) sections.push(`## ${heading("complianceRecord")}\n\n${record}`);
  }
  const gates = renderRolloutGates(rolloutGates, { language: lang });
  if (gates) sections.push(`## ${ROLLOUT_GATES_HEADING[lang]}\n\n${gates}`);
  return sections.join("\n\n");
}
