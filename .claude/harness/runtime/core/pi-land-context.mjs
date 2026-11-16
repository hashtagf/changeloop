import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

// Whole user utterances only: quoted examples, negatives and generic agreement
// are not Land authority. Tool output and worker messages never enter here.
// The whole-string anchor is what refuses questions and refusals: any extra
// word (ไหม, ยัง, อย่า, ไม่ต้อง, don't, ?) makes the utterance not match.
export function isLandConsent(text) {
  return /^(?:land(?:\s+(?:it|this|this change|now|please))?|(?:please\s+)?(?:go ahead and\s+)?land(?:\s+it)?|(?:ช่วย\s*|ลง\s*)?land\s*(?:ได้เลย|ได้|เลย|งานนี้ได้เลย|งานนี้ให้หน่อย))(?:\s*(?:ครับ|ค่ะ|นะ|please))?[.!！]*$/iu.test(String(text).trim());
}

export function sessionLandCandidates(root, sessionId) {
  if (!sessionId) return [];
  const directory = join(root, ".foundation/runtime");
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter(file => file.endsWith(".json") && ID.test(file.slice(0, -5)))
    .flatMap(file => {
      const id = file.slice(0, -5);
      try {
        const state = JSON.parse(readFileSync(join(directory, file), "utf8"));
        if (state.id !== id || !["proven", "applied"].includes(state.status)) return [];
        const rows = readFileSync(join(root, ".foundation/logs", id, "phase-context.jsonl"), "utf8").split("\n");
        const belongs = rows.some(line => {
          try { const row = JSON.parse(line); return row.changeId === id && row.sessionId === sessionId; }
          catch { return false; }
        });
        if (!belongs) return [];
        let title = id;
        try {
          const proposal = readFileSync(join(root, "openspec/changes", id, "proposal.md"), "utf8");
          title = proposal.match(/^#\s+(.+)$/m)?.[1]?.trim() || id;
        } catch { /* An ID remains an unambiguous fallback label. */ }
        return [{ id, title }];
      } catch { return []; }
    }).sort((a, b) => a.id.localeCompare(b.id));
}

export async function resolveSessionLand(root, ctx) {
  const candidates = sessionLandCandidates(root, ctx.sessionManager.getSessionId());
  if (candidates.length === 1) return candidates[0].id;
  if (!candidates.length) {
    ctx.ui.notify("No change ready for Land is linked to this session. Continue the current change through Prove first, or identify the intended change.", "warning");
    return undefined;
  }
  const labels = candidates.map(item => `${item.title} (${item.id})`);
  const choice = await ctx.ui.select("Which completed change should be landed?", labels);
  return candidates[labels.indexOf(choice)]?.id;
}
