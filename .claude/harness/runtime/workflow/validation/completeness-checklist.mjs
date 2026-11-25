// Requirement completeness, asked before Build. Paid runs showed reviewers
// finding the same questions after proof, when nobody builds them any more:
// a missing or wrong-typed input, a later step failing after an earlier one
// succeeded, stored data that is corrupt, a size limit, the order of ties, an
// unsupported request. The draft is read deterministically: each question
// applies only when the requirements describe that kind of behavior, and is
// answered by any scenario, non-goal, or assumption that speaks to it. An
// open question is a design warning; the agent decides (a scenario to build,
// a non-goal the user sees, or a recorded assumption). Nothing is refused.

const text = (value) => typeof value === "string" ? value : value == null ? "" : JSON.stringify(value);

const TOPICS = [
  { key: "missing-input", when: /\b(input|request|body|field|param\w*|argument|query|payload|form|submit\w*|receives?)\b|ป้อน|ส่ง|ฟอร์ม/i,
    answered: /\b(missing|null|undefined|absent|omitted|not provided|without)\b|ไม่มี|ไม่ได้ส่ง/i,
    ask: "a required value is missing or null" },
  { key: "wrong-type", when: /\b(input|request|body|field|param\w*|argument|query|payload|number|amount|count|id)\b/i,
    answered: /\b(type|not a (number|string)|non-(numeric|integer|string|finite)|NaN|boolean|string instead|invalid|malformed|boxed|bigint)\b|ชนิด|ไม่ถูกต้อง/i,
    ask: "a value has the wrong type or is not finite" },
  { key: "empty", when: /\b(text|title|name|query|search|tag|string|list|items?)\b|ข้อความ|ชื่อ|ค้นหา/i,
    answered: /\b(empty|blank|whitespace|zero items|no items)\b|ว่าง/i,
    ask: "a value or list is empty or whitespace" },
  { key: "partial-failure",
    when: (body) => (body.match(/\b(save|store|persist|write|charge|refund|reserve|release|send|emit|publish|notify|transfer|debit|credit)\w*/gi) || [])
      .map((word) => word.toLowerCase().slice(0, 5)).filter((word, index, all) => all.indexOf(word) === index).length >= 2,
    answered: /\b(fails?|throws?|error|rollback|roll back|partial|retry|compensat\w*|atomic)\b|ล้ม|ผิดพลาด/i,
    ask: "a later step fails after an earlier one already succeeded" },
  { key: "stored-data", when: /\b(persist\w*|stor(e|ed|age)|database|file|disk|saved?|load(s|ed)? from|restart)\b|บันทึก|เก็บ/i,
    answered: /\b(corrupt\w*|malformed|unreadable|older (format|shape|version)|legacy|migrat\w*|missing file|invalid (file|data))\b|เสีย/i,
    ask: "stored data is corrupt, missing, or in an older shape" },
  { key: "limits", when: /\b(upload|body|text|title|name|description|list|page|batch|file|message)\b|ข้อความ|อัปโหลด/i,
    answered: /\b(limit|max(imum)?|too (long|large|many|big)|exceed\w*|size|length|at most|up to)\b|เกิน|สูงสุด|ยาว/i,
    ask: "a value exceeds a size or length limit" },
  { key: "ties", when: /\b(sort\w*|order(ed|ing)?|rank\w*|newest|oldest|latest|first|top)\b|เรียง/i,
    answered: /\b(tie|ties|same (time|value|score)|equal|stable)\b|เท่ากัน/i,
    ask: "two items tie on the sort key" },
  { key: "unsupported-request", when: /\b(endpoint|route|GET|POST|PUT|PATCH|DELETE|HTTP|API)\b/,
    answered: /\b(unsupported|not allowed|405|unknown (route|method|field)|empty (update|patch|body)|no fields)\b|ไม่รองรับ/i,
    ask: "an unsupported method, unknown field, or empty update arrives" }
];

function scenarioText(requirement) {
  const rows = Array.isArray(requirement?.scenarios) ? requirement.scenarios
    : requirement?.scenario !== undefined ? [requirement.scenario] : [];
  return rows.map((row) => typeof row === "object" && row
    ? ["name", "given", "when", "then", "and", "outcome"].map((field) => text(row[field])).join(" ")
    : text(row)).join(" ");
}

// One row per open question: { key, ask, requirements }.
export function completenessQuestions(draft) {
  const requirements = Array.isArray(draft?.requirements) ? draft.requirements : [];
  if (!requirements.length) return [];
  // Change-wide answers (non-goals, assumptions, constraints) cover every
  // requirement; a scenario answers only its own requirement.
  const shared = [draft?.nonGoals, draft?.assumptions, draft?.constraints].flat().map(text).join(" ");
  const open = [];
  for (const topic of TOPICS) {
    if (topic.answered.test(shared)) continue;
    const keys = requirements.filter((row) => {
      const body = [row?.description, row?.outcome, row?.title, row?.requirement, scenarioText(row)]
        .map(text).join(" ");
      const applies = typeof topic.when === "function" ? topic.when(body) : topic.when.test(body);
      return applies && !topic.answered.test(scenarioText(row));
    }).map((row) => text(row?.key)).filter(Boolean);
    if (keys.length) open.push({ key: topic.key, ask: topic.ask, requirements: keys.slice(0, 3) });
  }
  return open;
}

export function completenessWarnings(draft) {
  return completenessQuestions(draft).map((row) =>
    `completeness (${row.key}): what happens when ${row.ask}? (${row.requirements.join(", ")}) ` +
    "Answer before Build: add a scenario to build it, a non-goal the user sees, or an assumption.");
}
