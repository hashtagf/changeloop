import assert from "node:assert/strict";
import test from "node:test";
import { shortPath, selectAttachments, skippedMessage, branchNameError, defaultStage } from "../web/ui-helpers.js";
import { translate, detectLocale, DICTIONARY } from "../web/i18n.js";

test("paths are shortened to the last two segments without home or temp prefixes", () => {
  assert.equal(shortPath("/private/var/folders/xv/abc/changeloop"), "…/abc/changeloop");
  const label = shortPath("/Users/me/work/app");
  assert.equal(label, "…/work/app"); assert.ok(!label.includes("/Users/me"));
  assert.equal(shortPath("/app"), "/app");
  assert.equal(shortPath(""), "");
});

test("attachments keep files within limits and report skipped ones", () => {
  const file = (name, size = 2) => ({ name, size });
  const twelve = Array.from({ length: 12 }, (_, i) => file("f" + i + ".txt"));
  const result = selectAttachments(0, twelve);
  assert.deepEqual(result.accepted.map((f) => f.name), twelve.slice(0, 10).map((f) => f.name));
  assert.equal(result.skipped.length, 2);
  assert.equal(skippedMessage(result.skipped), "Skipped 2 files: up to 10 files per message.");
  const mixed = selectAttachments(0, [file("big.bin", 21 * 1024 * 1024), file("note.txt")]);
  assert.deepEqual(mixed.accepted.map((f) => f.name), ["note.txt"]);
  assert.equal(skippedMessage(mixed.skipped), "big.bin: limit is 20 MB.");
  const full = selectAttachments(10, [file("one.txt")]);
  assert.equal(full.accepted.length, 0); assert.equal(skippedMessage(full.skipped), "Skipped 1 file: up to 10 files per message.");
  assert.equal(selectAttachments(0, [file("exact", 20 * 1024 * 1024)]).accepted.length, 1);
});

test("branch names are checked before a request is sent", () => {
  for (const ok of ["feature/x", "fix-12", "release/1.2"]) assert.equal(branchNameError(ok), "", ok);
  for (const bad of ["", "   ", "bad name..", "a..b", "-x", "x/", "x.lock", "a~b", "a^b", "a:b", "a?b", "a*b", "a[b", "a\\b", "a//b", "a@{b"])
    assert.notEqual(branchNameError(bad), "", JSON.stringify(bad));
});

test("narrow boards default to the first stage with work", () => {
  const statuses = ["open", "investigate", "land"];
  assert.equal(defaultStage(statuses, { land: 1 }), "land");
  assert.equal(defaultStage(statuses, {}), "open");
  assert.equal(defaultStage(statuses, { land: 1 }, "open"), "open");
  assert.equal(defaultStage(statuses, { land: 1 }, "unknown"), "land");
});

test("interface labels translate both ways; unknown and user text stay unchanged", () => {
  assert.equal(translate("Project tasks", "th"), "งานของโปรเจกต์");
  assert.equal(translate("งานของโปรเจกต์", "en"), "Project tasks");
  assert.equal(translate("เมืองที่งานเดินหน้า", "en"), "Agent city");
  assert.equal(translate(" Idle ", "th"), " ว่าง ");
  assert.equal(translate("6 live", "th"), "ออนไลน์ 6");
  assert.equal(translate("ออนไลน์ 6", "en"), "6 live");
  assert.equal(translate("CHANGES · 3", "th"), "การเปลี่ยนแปลง · 3");
  assert.equal(translate("1–1 of 1 tasks", "th"), "1–1 จาก 1 งาน");
  assert.equal(translate("Collect test and review evidence.", "th"), "ขั้นตรวจหลักฐาน: เก็บผลทดสอบและรีวิว");
  assert.equal(translate("something the user typed", "th"), "something the user typed");
  assert.equal(translate("Project tasks", "en"), "Project tasks");
  assert.equal(detectLocale(undefined, "th-TH"), "th");
  assert.equal(detectLocale(undefined, "en-US"), "en");
  assert.equal(detectLocale("en", "th-TH"), "en");
  assert.equal(detectLocale("fr", "fr-FR"), "en");
});

test("every Thai label maps back to exactly one English label", () => {
  const seen = new Map();
  for (const [en, th] of DICTIONARY) {
    if (seen.has(th) && seen.get(th) !== en) assert.fail(`${th} is used for both ${seen.get(th)} and ${en}`);
    seen.set(th, en);
  }
});
