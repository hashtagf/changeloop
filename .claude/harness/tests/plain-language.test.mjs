// A proposal's top half is for whoever decides: business language, a plain
// risk sentence, the user's language for labels; code names live below the
// Technical details divider.
import assert from "node:assert/strict";
import test from "node:test";

import { plainLanguageWarnings, plainRisk } from "../runtime/workflow/validation/plain-language.mjs";
import { renderScope } from "../runtime/workflow/validation/packet-overview.mjs";
import { pullRequestNarrative } from "../runtime/workflow/delivery/pull-request-body.mjs";

test("code names in the summary or why are flagged; plain text is not", () => {
  const coded = plainLanguageWarnings({ summary: "btw calls `streamSimple` instead of modelRegistry.complete",
    why: "Fix providerConfig in btw/index.ts" });
  assert.equal(coded.length, 2);
  assert.match(coded[0], /'Summary' contains code in backticks \(`streamSimple`\)/);
  assert.match(coded[1], /'Why' contains a file name \(index\.ts\)|'Why' contains a camelCase identifier/);
  assert.deepEqual(plainLanguageWarnings({ summary: "ผู้ใช้ถาม /btw ได้ทุกโมเดล ไม่ค้างอีก",
    why: "Users on the auto model saw no answer [Data: smoke test]" }), []);
  assert.match(plainLanguageWarnings({})[0], /add a plain-language 'summary'/);
  assert.deepEqual(plainLanguageWarnings({}, () => "", { lead: false }), []);
  assert.deepEqual(plainLanguageWarnings({}, (key) => key === "why" ? "Users wait." : ""), [],
    "a written Why is a lead too");
});

test("impact and coupling get one plain risk sentence in the draft's language", () => {
  assert.equal(plainRisk("low", "isolated"),
    "Low risk: the change stays in one place and does not affect other parts.");
  assert.equal(plainRisk("high", "coupled (derived: repositories a, b)", "th"),
    "ความเสี่ยงสูง: แตะส่วนที่ฟีเจอร์อื่นใช้ร่วม จึงต้องตรวจส่วนนั้นด้วย");
  assert.equal(plainRisk("unknown", "isolated"), "");
});

test("scope splits business and technical parts, in Thai too, and PR bodies still read it", () => {
  const draft = { changes: ["ผู้ใช้ถาม /btw ได้ทุกโมเดล"], nonGoals: ["ไม่เปลี่ยนกล่องคำตอบ"],
    tasks: [{ paths: ["btw/index.ts"] }] };
  const business = renderScope(draft, { part: "business", language: "th" });
  assert.match(business, /\*\*อยู่ในขอบเขต:\*\* ผู้ใช้ถาม \/btw ได้ทุกโมเดล/);
  assert.match(business, /\*\*นอกขอบเขต:\*\* สิ่งที่ไม่ทำ \(Non-goals\) ด้านล่าง/);
  assert.doesNotMatch(business, /btw\/index\.ts/);
  const technical = renderScope(draft, { part: "technical", language: "th",
    selectedRepositories: ["pi"], hasUnselectedRepositories: true });
  assert.match(technical, /\*\*นอกขอบเขต:\*\* การแก้นอกไฟล์ `btw\/index\.ts`; repository อื่นที่ประกาศไว้ทั้งหมด/);
  assert.doesNotMatch(technical, /อยู่ในขอบเขต/);
  const narrative = pullRequestNarrative({ changeId: "btw", state: { intent: "btw" }, design: "",
    tasks: "- [ ] **T001** x", paths: ["btw/index.ts"], proof: { receipts: [] },
    proposal: `# Change: btw\n\n## ขอบเขต\n\n- **อยู่ในขอบเขต:** ตอบได้ทุกโมเดล; ไม่ค้าง\n` });
  assert.deepEqual(narrative.included, ["ตอบได้ทุกโมเดล", "ไม่ค้าง"]);
});
