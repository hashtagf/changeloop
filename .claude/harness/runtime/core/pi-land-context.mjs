import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { bestEffort } from "./best-effort.mjs";

const ID = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const POLITE = String.raw`(?:\s*(?:ครับ|ค่ะ|คับ|นะ|please))?[.!！]*$`;

// Whole user utterances only: quoted examples, negatives and generic agreement
// are not Land authority. Tool output and worker messages never enter here.
// The whole-string anchor is what refuses questions and refusals: any extra
// word (ไหม, ยัง, อย่า, ไม่ต้อง, don't, ?) makes the utterance not match.
export function isLandConsent(text) {
  return /^(?:land(?:\s+(?:it|this|this change|now|please))?|(?:please\s+)?(?:go ahead and\s+)?land(?:\s+it)?|(?:ช่วย\s*|ลง\s*)?land\s*(?:ได้เลย|ได้|เลย|งานนี้ได้เลย|งานนี้ให้หน่อย))(?:\s*(?:ครับ|ค่ะ|นะ|please))?[.!！]*$/iu.test(String(text).trim());
}

// A short, whole-utterance publication request: "deliver ได้เลย", "deliver
// <change>", "เปิด PR ให้เลย", "open a PR". Same anchoring as Land consent, so
// questions, refusals and longer sentences never match. Returns null or
// { id } where id is the explicitly named change, if any.
export function deliverRequest(text) {
  const value = String(text).trim();
  const named = value.match(new RegExp(String.raw`^(?:please\s+)?deliver\s+([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\s*(?:ได้เลย|ได้|เลย)?${POLITE}`, "iu"));
  if (named && !/^(?:it|this|now|please)$/i.test(named[1])) return { id: named[1].toLowerCase() };
  const generic = new RegExp(String.raw`^(?:(?:please\s+)?(?:go ahead and\s+)?deliver(?:\s+(?:it|this|this change|now))?|(?:ช่วย\s*)?deliver\s*(?:ได้เลย|ได้|เลย|ให้หน่อย|ให้เลย)|(?:ช่วย\s*)?เปิด\s*(?:PR|pull request)\s*(?:ให้\s*(?:เลย|หน่อย)|ได้เลย|เลย)|(?:please\s+)?(?:go ahead and\s+)?open\s+(?:a\s+|the\s+)?(?:PR|pull request)(?:\s+now)?)${POLITE}`, "iu");
  return generic.test(value) ? { id: "" } : null;
}

// "investigate <topic>" or "ช่วย investigate <topic>" at the start of a user
// utterance routes to /investigate with the topic as its argument.
export function investigateRequest(text) {
  const match = String(text).trim().match(/^(?:ช่วย\s*)?investigate(?:\s+|\s*:\s*)(\S[\s\S]*)$/iu);
  return match ? match[1].trim() : null;
}

function sessionCandidates(root, sessionId, statuses) {
  if (!sessionId) return [];
  const directory = join(root, ".foundation/runtime");
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter(file => file.endsWith(".json") && ID.test(file.slice(0, -5)))
    .flatMap(file => {
      const id = file.slice(0, -5);
      try {
        const state = JSON.parse(readFileSync(join(directory, file), "utf8"));
        if (state.id !== id || !statuses.includes(state.status)) return [];
        const rows = readFileSync(join(root, ".foundation/logs", id, "phase-context.jsonl"), "utf8").split("\n");
        const belongs = rows.some(line => {
          try { const row = JSON.parse(line); return row.changeId === id && row.sessionId === sessionId; }
          catch { return false; }
        });
        if (!belongs) return [];
        let title = id;
        bestEffort(() => {
          const proposal = readFileSync(join(root, "openspec/changes", id, "proposal.md"), "utf8");
          title = proposal.match(/^#\s+(.+)$/m)?.[1]?.trim() || id;
        }); // An ID remains an unambiguous fallback label.
        return [{ id, title }];
      } catch { return []; }
    }).sort((a, b) => a.id.localeCompare(b.id));
}

export function sessionLandCandidates(root, sessionId) {
  return sessionCandidates(root, sessionId, ["proven", "applied"]);
}

export function sessionDeliverCandidates(root, sessionId) {
  return sessionCandidates(root, sessionId, ["proven", "applied", "archived"]);
}

async function choose(candidates, ctx, { none, title }) {
  if (candidates.length === 1) return candidates[0].id;
  if (!candidates.length) { ctx.ui.notify(none, "warning"); return undefined; }
  const labels = candidates.map(item => `${item.title} (${item.id})`);
  const choice = await ctx.ui.select(title, labels);
  return candidates[labels.indexOf(choice)]?.id;
}

export async function resolveSessionLand(root, ctx) {
  return choose(sessionLandCandidates(root, ctx.sessionManager.getSessionId()), ctx, {
    none: "No change ready for Land is linked to this session. Continue the current change through Prove first, or identify the intended change.",
    title: "Which completed change should be landed?" });
}

export async function resolveSessionDeliver(root, ctx) {
  return choose(sessionDeliverCandidates(root, ctx.sessionManager.getSessionId()), ctx, {
    none: "No change ready for Deliver is linked to this session. Continue the current change through Prove first, or use /deliver <change>.",
    title: "Which change should be delivered?" });
}
