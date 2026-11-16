import { parseSpecDocument } from "../../contracts/change-artifacts.mjs";
import { FOLDER_DRAFT_VERSION, isFolderDraftVersion } from "../validation/draft-version.mjs";
import { unique } from "../../core/values.mjs";
import {
  PLACEHOLDER, comparableLabel, rawScenarioEntries, stringList, text, textList
} from "./semantic-draft-text.mjs";

const MINIMAL_KEY_MAX = 48;

const MINIMAL_STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "these", "those", "from", "into",
  "onto", "when", "then", "shall", "must", "not", "system", "are", "was", "were",
  "its", "their", "any", "all", "each", "every", "one", "has", "have", "can", "will",
  "src", "lib", "app", "test", "tests", "spec", "index", "mjs", "cjs", "js", "ts",
  "tsx", "jsx", "json", "md", "implement", "add", "update", "change", "make", "use"
]);

function shortSlug(value, max = MINIMAL_KEY_MAX) {
  const slug = text(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (slug.length <= max) return slug;
  const cut = slug.slice(0, max);
  const boundary = cut.lastIndexOf("-");
  return (boundary > max / 2 ? cut.slice(0, boundary) : cut).replace(/-+$/, "");
}

function uniqueKey(base, taken) {
  let key = base;
  for (let counter = 2; taken.has(key); counter += 1) {
    const suffix = `-${counter}`;
    key = `${base.slice(0, MINIMAL_KEY_MAX - suffix.length).replace(/-+$/, "")}${suffix}`;
  }
  taken.add(key);
  return key;
}

function significantWords(values) {
  return new Set(values.flatMap((value) =>
    text(value).toLowerCase().split(/[^a-z0-9]+/))
    .filter((word) => word.length >= 3 && !MINIMAL_STOPWORDS.has(word))
    .map((word) => word.replace(/(?:ies|es|s)$/, "")));
}

export function plainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// A v5 folder's change.json may use the same minimal shape (the template's:
// no requirement or task keys); it keeps version 5. A keyed v5 draft is a full
// draft and keeps v4's full-draft semantics, such as unmarked decisions. The
// draft recorded from a minimal v5 start carries derived keys and the
// `_minimalDraft` marker, so a merge revision still expands as minimal.
const unkeyed = (rows) => rows.every((row) => !text(row?.key));

export function isMinimalSemanticDraft(source) {
  const minimalVersion = source?.version === undefined ||
    (isFolderDraftVersion(source?.version) && Array.isArray(source.requirements) &&
      Array.isArray(source.tasks) &&
      (source._minimalDraft === true || (unkeyed(source.requirements) && unkeyed(source.tasks))));
  return plainObject(source) && minimalVersion && Boolean(text(source.intent)) &&
    source.claims === undefined && source.specs === undefined &&
    Array.isArray(source.requirements) && source.requirements.length > 0 &&
    source.requirements.every((row) => plainObject(row) &&
      (text(row.description) || Array.isArray(row.scenarios))) &&
    Array.isArray(source.tasks) && source.tasks.length > 0 &&
    source.tasks.every((row) => plainObject(row) && (text(row.outcome) || text(row.verify)));
}

// Derived scenario titles read as headings: whole words, at most
// SCENARIO_NAME_MAX characters, no leading article, and never ending on a
// word that leaves the title hanging ("titled", "to the"). Deterministic, so
// recompiling the same draft yields the same names.
const SCENARIO_NAME_MAX = 60;

const SCENARIO_NAME_LIMIT = 80;

const LEADING_ARTICLE = /^(?:the|a|an)$/i;

const DANGLING_WORDS = new Set([
  "a", "an", "the", "to", "of", "in", "on", "at", "for", "with", "by", "from", "into",
  "onto", "via", "per", "as", "about", "after", "before", "over", "under", "between",
  "through", "within", "without", "and", "or", "but", "nor", "so", "if", "than", "then",
  "when", "while", "whether", "that", "which", "who", "whose", "titled", "named",
  "called", "labeled", "labelled", "is", "are", "was", "were", "be", "been", "its",
  "their", "his", "her", "my", "our", "your", "this", "these", "those", "not", "no"
]);

function scenarioClause(value) {
  return text(value).replace(/^when\s+/i, "").replace(/[\s.;:,!?]+$/u, "").trim();
}

function quoteOpen(words) {
  const joined = words.join(" ");
  if ((joined.match(/"/g) || []).length % 2) return true;
  if ((joined.match(/\u201c/g) || []).length !== (joined.match(/\u201d/g) || []).length) return true;
  const opened = words.filter((word) => /^['\u2018`]/.test(word)).length;
  const closed = words.filter((word) => /['\u2019`][^\p{L}\p{N}]*$/u.test(word)).length;
  return opened > closed;
}

function bareWord(word) {
  return word.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function wholeWordTitle(value, max = SCENARIO_NAME_MAX) {
  let words = scenarioClause(value).split(/\s+/).filter(Boolean);
  if (words.length > 1 && LEADING_ARTICLE.test(words[0])) words = words.slice(1);
  if (!words.length) return "";
  const kept = [];
  for (const word of words) {
    if ([...kept, word].join(" ").length > max) break;
    kept.push(word);
  }
  // A single token longer than the limit (a script written without spaces)
  // has no word boundary to cut at.
  if (!kept.length) return words[0].slice(0, max).trim();
  if (kept.length < words.length)
    while (kept.length > 1 && quoteOpen(kept)) kept.pop();
  while (kept.length > 1 && DANGLING_WORDS.has(bareWord(kept.at(-1)))) kept.pop();
  const title = kept.join(" ").replace(/[\s,;:\u2013\u2014-]+$/u, "");
  return title.replace(/^\p{Ll}/u, (letter) => letter.toUpperCase());
}

// A trigger written as code (`sum([1, 2, 3]) is called`) cut at a word
// boundary reads as a broken fragment, so it never becomes a title.
function codeLikeTitle(title) {
  const count = (pattern) => (title.match(pattern) || []).length;
  return /^[^\s]*[([{=<>`]/.test(title) || count(/\(/g) !== count(/\)/g) ||
    count(/\[/g) !== count(/\]/g) || count(/\{/g) !== count(/\}/g);
}

function minimalScenarioName(scenario, index, requirementTitle = "") {
  const when = text(scenario.when);
  const repeatsWhen = (value) => comparableLabel(value) === comparableLabel(when);
  let name = wholeWordTitle(when);
  if (name && codeLikeTitle(name) && requirementTitle) return requirementTitle;
  // A short trigger with no leading article would repeat WHEN; the outcome
  // names the case instead.
  if (!name || repeatsWhen(name)) {
    const outcome = wholeWordTitle(scenario.then);
    if (outcome && !repeatsWhen(outcome)) name = outcome;
  }
  if (!name || repeatsWhen(name)) name = `${name || "Scenario"} (scenario ${index + 1})`;
  return name;
}

// Two derived titles in one requirement that read the same are told apart by
// what differs between the cases (the precondition, then the outcome), and
// only otherwise by a number.
function distinctScenarioName(name, scenario, taken) {
  if (!taken.has(comparableLabel(name))) return name;
  const budget = SCENARIO_NAME_LIMIT - name.length - 3;
  for (const clause of [...textList(scenario.given), text(scenario.then)]) {
    const detail = budget >= 8 ? wholeWordTitle(clause, budget) : "";
    const candidate = detail
      ? `${name} (${detail.replace(/^\p{Lu}(?=\p{Ll})/u, (letter) => letter.toLowerCase())})`
      : "";
    if (candidate && !taken.has(comparableLabel(candidate))) return candidate;
  }
  for (let counter = 2; ; counter += 1) {
    const candidate = `${name} (${counter})`;
    if (!taken.has(comparableLabel(candidate))) return candidate;
  }
}

function minimalScenarioNames(scenarios, requirementTitle = "") {
  const taken = new Set(scenarios.filter((scenario) => plainObject(scenario) && text(scenario.name))
    .map((scenario) => comparableLabel(scenario.name)));
  return scenarios.map((scenario, index) => {
    if (!plainObject(scenario) || text(scenario.name) || !text(scenario.when)) return scenario;
    const name = distinctScenarioName(minimalScenarioName(scenario, index, requirementTitle),
      scenario, taken);
    taken.add(comparableLabel(name));
    return { ...scenario, name };
  });
}

// Derived requirement keys and headings. Keys stay short, whole-word, and
// never end on a dangling word; the heading is the readable form of the same
// clause. Both are deterministic, so recompiling a draft yields the same ones.
const REQUIREMENT_KEY_WORDS = 5;

const REQUIREMENT_KEY_MAX = 40;

const REQUIREMENT_TITLE_MAX = 50;

const KEY_FILLER = new Set([
  "a", "an", "the", "its", "their", "his", "her", "our", "your", "my", "any", "each",
  "every", "whose", "that", "which", "is", "are", "be", "been"
]);

const ACTOR_LEAD = new RegExp("^(?:let|lets|allow|allows|enable|enables|permit|permits)\\s+" +
  "(?:(?:a|an|the|each|every|any)\\s+)?(?:users?|people|customers?|visitors?|admins?|" +
  "administrators?|operators?|members?)\\s+(?:to\\s+)?", "i");

// The behavior clause of a requirement statement: the text after SHALL/MUST,
// up to the first parenthetical, semicolon, colon, or dash aside.
function requirementClause(value) {
  return text(value).replace(/^.*?\b(?:SHALL|MUST)\b\s*/, "")
    .split(/\s*(?:[(;:]|\s[–—-]\s)/u)[0].replace(/[\s.,!?]+$/u, "").trim();
}

function conciseRequirementKey(clause) {
  const words = text(clause).replace(ACTOR_LEAD, "").toLowerCase()
    .split(/[^a-z0-9]+/).filter((word) => word && !KEY_FILLER.has(word));
  const kept = [];
  for (const word of words) {
    if (kept.length === REQUIREMENT_KEY_WORDS ||
        [...kept, word].join("-").length > REQUIREMENT_KEY_MAX) break;
    kept.push(word);
  }
  while (kept.length > 1 && DANGLING_WORDS.has(kept.at(-1))) kept.pop();
  if (kept.length === 1 && DANGLING_WORDS.has(kept[0])) return "";
  return kept.join("-") || shortSlug(clause, REQUIREMENT_KEY_MAX);
}

// Changes started before 3.5.30 derived keys this way; a pre-Build revise of
// such a change keeps them so its requirements are not re-identified.
function legacyRequirementKey(row, index) {
  const body = text(row.description).replace(/^.*?\b(?:SHALL|MUST)\b\s*/, "");
  return shortSlug(body) || shortSlug(row.outcome) || `requirement-${index + 1}`;
}

function derivedRequirementTitle(row, taken) {
  const title = wholeWordTitle(requirementClause(row.description) ||
    requirementClause(row.outcome), REQUIREMENT_TITLE_MAX);
  if (!title) return "";
  let candidate = title;
  for (let counter = 2; taken.has(candidate.toLowerCase()); counter += 1)
    candidate = `${title} (${counter})`;
  taken.add(candidate.toLowerCase());
  return candidate;
}

// A capability name is the intent's object noun phrase: the intent is split
// at prepositions, conjunctions, and punctuation; each chunk loses its leading
// subject, modal, verb, and article words and its generic qualifiers; the
// chunk with the most remaining words (first on a tie) supplies its last
// CAPABILITY_WORDS words. "Users can manage tasks on a browser kanban board"
// becomes "kanban-board".
const CAPABILITY_WORDS = 3;

const CAPABILITY_BREAKS = new Set([
  "on", "in", "with", "for", "to", "of", "using", "via", "by", "from", "into", "onto",
  "at", "and", "or", "that", "which", "where", "so", "when", "while", "as", "without",
  "within", "through", "across", "per", "than", "then", "if",
  // A participle after the noun opens a modifier: "a board stored in ...".
  "stored", "saved", "kept", "persisted", "built", "powered", "backed", "hosted",
  "shown", "displayed", "written", "made", "called", "named"
]);

const CAPABILITY_MODALS = new Set([
  "can", "could", "should", "shall", "must", "will", "may", "might", "to"
]);

const CAPABILITY_LEAD = new Set([
  "a", "an", "the", "users", "user", "people", "customers", "customer", "visitors",
  "visitor", "admins", "admin", "administrators", "operators", "members", "developers",
  "we", "i", "you", "they", "it", "system", "can", "could", "should", "shall", "must",
  "will", "may", "might", "be", "able", "is", "are", "let", "lets", "allow", "allows",
  "enable", "enables", "provide", "provides", "add", "adds", "build", "builds", "create",
  "creates", "implement", "implements", "support", "supports", "make", "makes", "manage",
  "manages", "view", "views", "see", "sees", "show", "shows", "display", "displays",
  "edit", "edits", "track", "tracks", "use", "uses", "get", "gets", "give", "gives",
  "introduce", "introduces", "fix", "fixes", "update", "updates", "change", "changes",
  "improve", "improves", "ship", "ships", "set", "sets", "write", "writes", "render",
  "renders", "have", "has", "keep", "keeps", "offer", "offers", "deliver", "delivers",
  "expose", "exposes", "need", "needs", "want", "wants", "reject", "rejects", "validate",
  "validates", "handle", "handles", "persist", "persists", "store", "stores", "save",
  "saves", "delete", "deletes", "remove", "removes", "move", "moves", "organize",
  "organizes", "organise", "organises", "list", "lists", "browse", "browses", "open",
  "opens", "access", "accesses", "run", "runs"
]);

const CAPABILITY_FILLER = new Set([
  "a", "an", "the", "its", "their", "his", "her", "our", "your", "my", "any", "all",
  "each", "every", "some", "own", "new", "simple", "basic", "minimal", "small", "single",
  "browser", "web", "based", "local", "client", "side"
]);

export function capabilityFromIntent(intent) {
  const chunks = [[]];
  const tokens = text(intent).toLowerCase().replace(/[,.;:!?()[\]{}"]+/g, " | ")
    .replace(/[^a-z0-9|]+/g, " ").split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (token === "|" || CAPABILITY_BREAKS.has(token)) chunks.push([]);
    else chunks.at(-1).push(token);
  }
  const phrases = chunks.map((chunk) => {
    // The word after a modal is the verb ("users can export reports").
    let start = 0;
    while (start < chunk.length && (CAPABILITY_LEAD.has(chunk[start]) ||
        (start > 0 && CAPABILITY_MODALS.has(chunk[start - 1])))) start += 1;
    return chunk.slice(start).filter((word) => !CAPABILITY_FILLER.has(word));
  });
  const best = phrases.reduce((winner, phrase) =>
    phrase.length > winner.length ? phrase : winner, []);
  return shortSlug(best.slice(-CAPABILITY_WORDS).join("-"), 40);
}

function minimalCapability(source) {
  // Used only when the repository has no canonical capability yet.
  const concise = capabilityFromIntent(source.intent);
  if (concise) return concise;
  const fromIntent = shortSlug(source.intent, 40);
  if (fromIntent) return fromIntent;
  for (const task of source.tasks)
    for (const path of stringList(task?.paths)) {
      const segment = path.split("/").map((part) => shortSlug(part.replace(/\.[^.]*$/, ""), 40))
        .find((part) => part && !MINIMAL_STOPWORDS.has(part));
      if (segment) return segment;
    }
  return "change";
}

// Coverage is inferred only where it is unambiguous: one task covers every
// requirement, or one requirement is covered by every task. Several tasks and
// several requirements need explicit `covers`; word overlap could silently
// assign a requirement to the wrong task.
function inferredCovers(requirements, tasks) {
  if (tasks.length === 1) return [requirements.map((row) => row.key)];
  if (requirements.length === 1) return tasks.map(() => [requirements[0].key]);
  return tasks.map(() => []);
}

function canonicalRequirementMatch(row, rows) {
  const name = text(row.requirement || row.title).toLowerCase();
  const description = text(row.description);
  return rows.find((spec) =>
    (name && spec.name.toLowerCase() === name) ||
    (description && spec.body.includes(description)));
}

const requirementSlug = (value) =>
  text(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// A `modified` row that names no requirement: the paid regression-fix runs
// declared keys such as `loyalty-tiers` for "Loyalty tiers" and repaired the
// draft one to three times. Match a restated description, then the key's
// slug, then the capability's only requirement; anything else stays the
// author's to name (the repair lists the choices).
function modifiedRequirementMatch(row, rows) {
  const key = requirementSlug(row.key);
  return canonicalRequirementMatch(row, rows) ||
    (key && rows.find((spec) => requirementSlug(spec.name) === key)) ||
    (rows.length === 1 ? rows[0] : null);
}

function unnamedModifiedRow(row) {
  return text(row.operation).toLowerCase() === "modified" && !text(row.requirement || row.title);
}

// When the repository already has capabilities, a minimal draft belongs to
// one of them. A requirement that restates a canonical requirement decides it;
// otherwise the capability whose name and requirement titles share strictly
// the most significant words with the draft's text and task paths wins, with
// at least one capability-name word or two title words. Anything weaker is
// left to the author rather than inventing a parallel spec.
function existingCapability(source, names, canonicalRows) {
  const open = source.requirements.filter((row) => !text(row.capability));
  const exact = names.map((name) =>
    open.filter((row) => canonicalRequirementMatch(row, canonicalRows(name))).length);
  const bestExact = Math.max(0, ...exact);
  if (bestExact > 0 && exact.filter((count) => count === bestExact).length === 1)
    return names[exact.indexOf(bestExact)];
  const draftWords = significantWords([
    source.intent,
    ...open.flatMap((row) => [row.description, row.requirement, row.title,
      ...rawScenarioEntries(row).flatMap((scenario) => [scenario?.when, scenario?.then])]),
    ...source.tasks.flatMap((task) => [task.outcome, ...stringList(task.paths)])
  ]);
  const scores = names.map((name) => {
    const nameHits = [...significantWords([name])].filter((word) => draftWords.has(word)).length;
    const titleHits = [...significantWords(canonicalRows(name).map((row) => row.name))]
      .filter((word) => draftWords.has(word)).length;
    return nameHits * 2 + titleHits;
  });
  const best = Math.max(0, ...scores);
  return best >= 2 && scores.filter((score) => score === best).length === 1
    ? names[scores.indexOf(best)] : "";
}

// `priorRequirementKeys` and `priorCapabilities` describe the active change a
// pre-Build revise replaces: a requirement or capability that change already
// identified by the pre-3.5.30 derivation keeps that identity.
// The capability a requirement without its own joins: the named one, the
// existing living spec the draft matches, or one derived from the intent.
// No confident match among existing specs records the choices instead.
function draftCapabilityChoice(source, named, {
  loadCanonicalSpec = null, listCanonicalCapabilities = null, priorCapabilities = []
} = {}) {
  const canonical = new Map();
  const canonicalRows = (name) => {
    if (!canonical.has(name))
      canonical.set(name, loadCanonicalSpec ? parseSpecDocument(loadCanonicalSpec(name) || "") : []);
    return canonical.get(name);
  };
  const existing = unique(stringList(listCanonicalCapabilities ? listCanonicalCapabilities() : []));
  const legacyCapability = shortSlug(source.intent, 40);
  let capability = named || (stringList(priorCapabilities).includes(legacyCapability)
    ? legacyCapability : minimalCapability(source));
  let choices = null;
  if (!named && existing.length && source.requirements.some((row) => !text(row.capability))) {
    capability = existingCapability(source, existing, canonicalRows);
    if (!capability) choices = existing;
  }
  return { capability, choices, canonicalRows };
}

// A first scenario's result is a requirement's outcome when it states none.
// A scenario's expected text may quote a literal such as `<the path given>`;
// only the outcome the author wrote is checked for placeholders. A derived one
// skips placeholder-shaped text, else falls back to the requirement clause, so
// the agent is never asked to repair a field it did not write.
function derivedOutcome(row) {
  const thens = rawScenarioEntries(row).map((scenario) => text(scenario?.then)).filter(Boolean);
  return thens.find((then) => !PLACEHOLDER.test(then)) ||
    requirementClause(row.description) || thens[0] || "";
}

// A keyed v5 draft keeps full-draft semantics (its keys, decisions, and
// unmarked rows stay the agent's), yet still receives the capability and
// outcome a minimal draft derives. Without them every keyed v5 draft cost an
// extra repair round for fields the harness can fill.
function keyedFolderDraftDefaults(input, context) {
  if (!plainObject(input) || !isFolderDraftVersion(input.version) ||
      input.claims !== undefined || input.specs !== undefined ||
      !Array.isArray(input.requirements) || !input.requirements.length ||
      !input.requirements.every(plainObject) ||
      !input.requirements.some((row) => !text(row.capability) || unnamedModifiedRow(row) ||
        (!text(row.outcome) && text(row.operation).toLowerCase() !== "removed")))
    return input;
  const source = structuredClone(input);
  const { capability, choices, canonicalRows } =
    draftCapabilityChoice(source, text(source.capability), context);
  if (choices) source._capabilityChoices = choices;
  source.requirements = source.requirements.map((input) => {
    const row = { ...input };
    if (!text(row.capability) && capability) row.capability = capability;
    if (unnamedModifiedRow(row) && text(row.capability)) {
      const match = modifiedRequirementMatch(row, canonicalRows(text(row.capability)));
      if (match) row.requirement = match.name;
    }
    if (!text(row.outcome) && text(row.operation).toLowerCase() !== "removed") {
      const outcome = derivedOutcome(row);
      if (outcome) row.outcome = outcome;
    }
    return row;
  });
  return source;
}

export function expandMinimalSemanticDraft(input, {
  loadCanonicalSpec = null, listCanonicalCapabilities = null,
  priorRequirementKeys = [], priorCapabilities = []
} = {}) {
  if (!isMinimalSemanticDraft(input))
    return keyedFolderDraftDefaults(input,
      { loadCanonicalSpec, listCanonicalCapabilities, priorCapabilities });
  const source = structuredClone(input);
  source.version = isFolderDraftVersion(input.version) ? FOLDER_DRAFT_VERSION : 4;
  source._minimalDraft = true;
  // An optional top-level `capability` names the living spec for every
  // requirement that does not name its own.
  const named = text(source.capability);
  delete source.capability;
  const requirementKeys = new Set(source.requirements.map((row) => text(row.key)).filter(Boolean));
  const priorKeys = new Set(stringList(priorRequirementKeys));
  const { capability, choices, canonicalRows } = draftCapabilityChoice(source, named,
    { loadCanonicalSpec, listCanonicalCapabilities, priorCapabilities });
  if (choices) source._capabilityChoices = choices;
  const titles = new Map();
  const takenTitles = (name) => {
    if (!titles.has(name))
      titles.set(name, new Set([
        ...canonicalRows(name).map((row) => row.name.toLowerCase()),
        ...source.requirements.filter((row) => text(row.capability || capability) === name)
          .map((row) => text(row.requirement || row.title).toLowerCase()).filter(Boolean)
      ]));
    return titles.get(name);
  };
  source.requirements = source.requirements.map((input, index) => {
    const row = { ...input };
    let derivedKey = false;
    if (!text(row.key)) {
      const legacy = legacyRequirementKey(row, index);
      if (priorKeys.has(legacy) && !requirementKeys.has(legacy)) {
        row.key = legacy;
        requirementKeys.add(legacy);
      } else {
        row.key = uniqueKey(conciseRequirementKey(requirementClause(row.description)) ||
          conciseRequirementKey(requirementClause(row.outcome)) ||
          `requirement-${index + 1}`, requirementKeys);
        derivedKey = true;
      }
    }
    if (!text(row.capability) && capability) row.capability = capability;
    if (Array.isArray(row.scenarios))
      row.scenarios = minimalScenarioNames(row.scenarios, text(row.requirement || row.title) ||
        wholeWordTitle(requirementClause(row.description), REQUIREMENT_TITLE_MAX));
    if (!text(row.outcome)) {
      const outcome = derivedOutcome(row);
      if (outcome) row.outcome = outcome;
    }
    if (!text(row.operation) && text(row.capability)) {
      const match = canonicalRequirementMatch(row, canonicalRows(row.capability));
      row.operation = match ? "modified" : "added";
      if (match && !text(row.requirement || row.title)) row.requirement = match.name;
    } else if (unnamedModifiedRow(row) && text(row.capability)) {
      const match = modifiedRequirementMatch(row, canonicalRows(row.capability));
      if (match) row.requirement = match.name;
    }
    // A derived key reads as an identifier; the living spec's heading reads as
    // a title of the same clause.
    if (derivedKey && text(row.capability) && !text(row.requirement || row.title) &&
        text(row.operation || "added").toLowerCase() === "added") {
      const title = derivedRequirementTitle(row, takenTitles(text(row.capability)));
      if (title) row.requirement = title;
    }
    return row;
  });
  const taskKeys = new Set(source.tasks.map((row) => text(row.key)).filter(Boolean));
  source.tasks = source.tasks.map((task, index) => text(task.key) ? task
    : { ...task, key: uniqueKey(shortSlug(task.outcome) || `task-${index + 1}`, taskKeys) });
  // A minimal draft's decisions are the defaults the agent chose without
  // asking; a decision the user made says so with decidedBy: "user".
  if (Array.isArray(source.decisions))
    source.decisions = source.decisions.map((decision) =>
      plainObject(decision) && !text(decision.decidedBy) ? { ...decision, decidedBy: "agent" } : decision);
  const missing = source.tasks.map((task) => task.covers === undefined);
  if (missing.some(Boolean)) {
    const covers = inferredCovers(source.requirements, source.tasks);
    source.tasks = source.tasks.map((task, index) =>
      missing[index] && covers[index].length ? { ...task, covers: covers[index] } : task);
  }
  return source;
}
