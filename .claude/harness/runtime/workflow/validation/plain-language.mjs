// The top half of a proposal is read by people who decide, not only by
// developers: the summary and the reason say what users get and which problem
// stops, in business language (the PRD skill's Goal and Why). Code there
// (backticks, file names, dotted or camelCase identifiers) is a warning, never
// a refusal: some changes are technical through and through.
const CODE = [
  [/`[^`]+`/, "code in backticks"],
  [/\b[\w-]+\.(?:m?js|cjs|ts|tsx|py|go|rb|java|json|ya?ml|sql|sh)\b/i, "a file name"],
  [/\b[a-z][a-z0-9]*(?:\.[a-z][A-Za-z0-9]*)+\(?/, "a dotted code identifier"],
  [/\b[a-z]+[A-Z][A-Za-z0-9]*\b/, "a camelCase identifier"]
];

function codeIn(value) {
  const body = String(value || "");
  for (const [pattern, label] of CODE) {
    const match = body.match(pattern);
    if (match) return `${label} (${match[0].slice(0, 40)})`;
  }
  return null;
}

// One sentence a decision maker reads before the Impact/Coupling labels.
const RISK = {
  en: { low: "Low risk", medium: "Medium risk", high: "High risk",
    isolated: "the change stays in one place and does not affect other parts",
    coupled: "the change touches parts other features rely on, so they are checked too" },
  th: { low: "ความเสี่ยงต่ำ", medium: "ความเสี่ยงปานกลาง", high: "ความเสี่ยงสูง",
    isolated: "แก้เฉพาะจุด ไม่กระทบส่วนอื่น",
    coupled: "แตะส่วนที่ฟีเจอร์อื่นใช้ร่วม จึงต้องตรวจส่วนนั้นด้วย" }
};

export function plainRisk(impact, coupling, language = "en") {
  const words = RISK[language === "th" ? "th" : "en"];
  const level = String(impact).split(" ")[0];
  const shape = String(coupling).split(" ")[0];
  if (!words[level] || !words[shape]) return "";
  return `${words[level]}: ${words[shape]}${language === "th" ? "" : "."}`;
}

// `prose(key)` returns the authored proposal.md body for an outline row.
// `lead`: also ask for a Summary when neither it nor a Why is written.
/**
 * @param {any} draft
 * @param {(key: string) => string} [prose]
 * @param {{ lead?: boolean }} [options]
 */
export function plainLanguageWarnings(draft, prose = (_key) => "", { lead = true } = {}) {
  const warnings = [];
  const written = (key) => String(draft?.[key] || prose(key) || "").trim();
  if (lead && !written("summary") && !written("why"))
    warnings.push("add a plain-language 'summary' (1-2 sentences, business language): what users can " +
      "do after this change or which problem stops; it is the first thing a decision maker reads");
  for (const [key, label] of [["summary", "Summary"], ["why", "Why"]]) {
    const found = codeIn(draft?.[key] || prose(key));
    if (found) warnings.push(`'${label}' contains ${found}; say it in the user's terms and keep ` +
      "code names for the technical details (file map, bugfix analysis)");
  }
  return warnings;
}
