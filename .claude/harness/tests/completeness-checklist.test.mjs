// Questions a reviewer kept raising after proof (when nobody builds them any
// more) are asked at change start instead: only those the requirements make
// relevant, each answered by its own scenarios or a change-wide non-goal,
// assumption, or constraint. Warnings only; the agent decides.
import assert from "node:assert/strict";
import test from "node:test";

import {
  completenessQuestions, completenessWarnings
} from "../runtime/workflow/validation/completeness-checklist.mjs";

const keys = (draft) => completenessQuestions(draft).map((row) => row.key);

test("a notes API without edge scenarios gets the questions reviewers raised", () => {
  const draft = { requirements: [{ key: "create-note", description: "The API SHALL create a note from the request body title and text",
    scenarios: [{ when: "POST /notes with a title", then: "201 with the note" }] }] };
  assert.deepEqual(keys(draft), ["missing-input", "wrong-type", "empty", "limits", "unsupported-request"]);
  const [first] = completenessWarnings(draft);
  assert.match(first, /^completeness \(missing-input\): what happens when a required value is missing or null\? \(create-note\)/);
  assert.match(first, /add a scenario to build it, a non-goal the user sees, or an assumption/);
});

test("a scenario answers its own requirement only; a non-goal answers the change", () => {
  const notes = { key: "notes", description: "The API SHALL list notes sorted newest first",
    scenarios: [{ name: "Ties", when: "two notes have the same createdAt", then: "the lower id comes first" }] };
  const tags = { key: "tags", description: "The API SHALL list tags sorted by name", scenarios: [{ when: "GET /tags", then: "names" }] };
  assert.deepEqual(completenessQuestions({ requirements: [notes, tags] })
    .find((row) => row.key === "ties").requirements, ["tags"]);
  const waived = { requirements: [tags], nonGoals: ["No tie-break rule: equal names keep insertion order"] };
  assert.equal(keys(waived).includes("ties"), false);
});

test("several side effects ask about a later step failing; one does not", () => {
  const refund = { requirements: [{ key: "cancel", description: "Cancel SHALL refund the charge and release the stock",
    scenarios: [{ when: "cancel", then: "refunded" }] }] };
  assert.ok(keys(refund).includes("partial-failure"));
  const answered = { requirements: [{ ...refund.requirements[0],
    scenarios: [{ when: "release throws after the refund", then: "the order stays placed and the refund is retried" }] }] };
  assert.equal(keys(answered).includes("partial-failure"), false);
  const single = { requirements: [{ key: "save", description: "The form SHALL save the profile", scenarios: [] }] };
  assert.equal(keys(single).includes("partial-failure"), false);
});

test("a change with nothing that applies asks nothing", () => {
  assert.deepEqual(completenessQuestions({ requirements: [{ key: "docs", description: "The README SHALL explain setup",
    scenarios: [{ when: "a reader opens it", then: "setup is listed" }] }] }), []);
  assert.deepEqual(completenessQuestions({}), []);
});
