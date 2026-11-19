// Product handoff coverage: when a change is built from a PM's PRD.md and a
// designer's uxui.md, every in-scope item those documents define must land in
// the change — a story in a requirement, an acceptance criterion in a
// scenario (so it becomes a test), a business rule, NFR, error case, ADR, and
// open question in the matching section, and every screen state in the UI
// contract — or be excluded with a reason the approver sees. Pure: the caller
// reads the files.

// Each ID kind (its prefix) and where the change must cite it.
export const PRD_KINDS = Object.freeze({
  US: { label: "User stories", places: ["requirements", "userStories"] },
  AC: { label: "Acceptance criteria", places: ["scenarios"] },
  BR: { label: "Business rules", places: ["requirements", "scenarios"] },
  F: { label: "Features", places: ["requirements", "tasks"] },
  NFR: { label: "Non-functional requirements", places: ["nfr", "requirements", "scenarios"] },
  ADR: { label: "Decisions (ADR)", places: ["decisions"] },
  DEP: { label: "Dependencies", places: ["dependencies", "decisions", "requirements"] },
  DATA: { label: "Data", places: ["dataModel", "requirements"] },
  PERM: { label: "Permissions", places: ["scenarios"] },
  ERR: { label: "Error handling", places: ["failureScenarios", "failureMatrix"] },
  Q: { label: "Open questions", places: ["decisions", "openQuestions"] }
});
export const SCREEN_LABEL = "Screens and states";

const PLACE_TEXT = {
  requirements: "a requirement's description or outcome",
  userStories: "a user story",
  scenarios: "a scenario (name, given, when, or then)",
  failureScenarios: 'a scenario with "kind": "failure"',
  failureMatrix: "a failureMatrix row",
  tasks: "a task",
  nfr: "an nfr row",
  decisions: "a decision",
  openQuestions: "an openQuestions entry",
  dependencies: "a dependencies row",
  dataModel: "a dataModel row",
  uiStates: "a uiStates row"
};
// Rows whose scope is the features they mention, as for open questions.
const MENTION_SCOPED = new Set(["Q", "DEP", "DATA", "PERM"]);

const text = (value) => typeof value === "string" ? value.trim() : "";

function sections(markdown) {
  const found = [...String(markdown).matchAll(/^##\s+(?:(\d{1,2})\.\s+)?(.+)$/gm)];
  return found.map((match, index) => ({ number: match[1] ? Number(match[1]) : null, title: match[2].trim(),
    body: markdown.slice(match.index, found[index + 1]?.index ?? markdown.length) }));
}

// IDs a text names, with ranges such as "AC-03–AC-06" expanded.
export function namedIds(value) {
  const out = new Set();
  const source = String(value);
  for (const match of source.matchAll(/\b([A-Z]{1,3})-(\d+)\s*[–-]\s*\1-(\d+)\b/g)) {
    const width = match[2].length;
    for (let n = Number(match[2]); n <= Number(match[3]); n += 1) out.add(`${match[1]}-${String(n).padStart(width, "0")}`);
  }
  for (const match of source.matchAll(/(?<![A-Za-z0-9-])((?:US|AC|BR|F|NFR|ADR|ERR|DEP|DATA|PERM|UP|MC)-\d+|Q-?\d+)(?!\d)/g)) out.add(match[1]);
  return out;
}

const tableRows = (body) => body.split("\n").filter((line) => /^\|/.test(line) && !/^\|[\s:|-]+\|?\s*$/.test(line));
const cells = (row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());

// Items the PRD defines, read from any shape: the ID prefix names the kind,
// so an ID is defined where a line, table row, list item, bold run, or heading
// starts with it, wherever it sits. Feature relations come from the PRD's
// feature mapping (a table row that starts with a feature and names other IDs),
// from an item's own row naming a feature, and from nesting under a feature
// heading; a criterion's stories from "AC-03 (US-04)", a story named in the
// criterion's row, or nesting under a story heading.
const DEFINED = /^(?:(?:\|\s*|[-*+]\s+(?:\[[ x]\]\s+)?|\d+[.)]\s+|#{1,6}\s+)(?:\*\*)?|\*\*)?((?:US|AC|BR|F|NFR|ADR|ERR|DEP|DATA|PERM)-\d+)(?![\d])/i;
const DEFINED_Q = /^(?:\|\s*|[-*+]\s+|\d+[.)]\s+|#{1,6}\s+|\*\*)(?:\*\*)?(Q-?\d+)(?![\d])/;
const kindOf = (id) => id.replace(/-?\d+$/, "");
const GLOSSARY_TITLE = /glossary|terms\b|terminology|vocabulary|definitions|อภิธาน|ศัพท์|นิยาม/i;

export function parsePrd(markdown) {
  const source = String(markdown).replace(/\r\n/g, "\n");
  const items = new Map();
  const mappingRows = new Map();
  const mapping = new Map();
  const criteria = new Map();
  const relate = (map, key, id) => { if (!map.has(key)) map.set(key, new Set()); map.get(key).add(id); };
  const headings = [];
  const headingFeatures = new Map();
  let fence = false;
  for (const raw of source.split("\n")) {
    const line = raw.trim();
    if (/^```/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const heading = line.match(/^(#{1,6})\s/);
    if (heading) {
      while (headings.length && headings.at(-1).level >= heading[1].length) headings.pop();
      headings.push({ level: heading[1].length, ids: namedIds(line) });
      for (const feature of [...namedIds(line)].filter((id) => id.startsWith("F-")))
        if (!headingFeatures.has(feature)) headingFeatures.set(feature, line.replace(/^#+\s*/, ""));
    }
    const head = (line.match(DEFINED) || line.match(DEFINED_Q))?.[1]?.toUpperCase();
    if (!head || !PRD_KINDS[kindOf(head)]) continue;
    const kind = kindOf(head);
    const named = namedIds(line);
    const others = [...named].filter((id) => id !== head);
    // A feature row that names other IDs is the feature's mapping row.
    if (kind === "F" && /^\|/.test(line) && others.some((id) => !id.startsWith("F-"))) {
      for (const feature of [...named].filter((id) => id.startsWith("F-"))) {
        if (!mappingRows.has(feature)) mappingRows.set(feature, line);
        for (const id of named) relate(mapping, feature, id);
      }
      continue;
    }
    const enclosing = heading ? headings.slice(0, -1) : headings;
    for (const id of [...others, ...enclosing.flatMap((entry) => [...entry.ids])].filter((id) => id.startsWith("F-")))
      relate(mapping, id, head);
    if (kind === "AC")
      for (const story of [...others, ...enclosing.flatMap((entry) => [...entry.ids])].filter((id) => id.startsWith("US-")))
        relate(criteria, head, story);
    if (items.has(head)) continue;
    const body = line.replace(/^[|*#\-+\s]+|[|*\s]+$/g, "").replace(/^\d+[.)]\s+/, "").replace(/\s*\|\s*/g, " · ")
      .replace(new RegExp(`^${head}\\b\\**\\s*[:·–—-]?\\s*`, "i"), "");
    items.set(head, { id: head, kind, text: body.slice(0, 160) });
  }
  // A feature defined only by its mapping row.
  for (const [feature, line] of mappingRows) if (!items.has(feature))
    items.set(feature, { id: feature, kind: "F", text: line.replace(/^[|\s]+|[|\s]+$/g, "").replace(/\s*\|\s*/g, " · ")
      .replace(new RegExp(`^${feature}\\s*·?\\s*`), "").slice(0, 160) });
  // A feature named only in a heading ("## Cart (F-01)").
  for (const [feature, title] of headingFeatures) if (!items.has(feature))
    items.set(feature, { id: feature, kind: "F", text: title.slice(0, 160) });
  for (const match of source.matchAll(/\b(AC-\d+)\s*\(([^)]*)\)/g))
    for (const story of namedIds(match[2])) if (story.startsWith("US-")) relate(criteria, match[1], story);
  return { items, mapping, criteria, glossary: parseGlossary(source) };
}

// Glossary terms from the section named Glossary (or its Thai name): each
// table row's first cell or list item's term, with its aliases
// ("ตะกร้า (Cart)" is both "ตะกร้า" and "Cart").
function parseGlossary(source) {
  const section = sections(source).find((row) => GLOSSARY_TITLE.test(row.title));
  if (!section) return [];
  const terms = [...tableRows(section.body).slice(1).map(cells).map((row) => row[0]),
    ...[...section.body.matchAll(/^\s*[-*+]\s+(?:\*\*([^*]+)\*\*|([^:—–\n]+?)\s*[:—–])/gm)].map((match) => match[1] || match[2])];
  return terms.map((term) => String(term || "").replace(/\*\*/g, "").trim()).filter(Boolean).map((term) => ({ term,
    aliases: term.split(/[()/,]/).map((alias) => alias.trim()).filter((alias) => alias.length >= 2) }));
}

// Screen Inventory rows of uxui.md: screen, feature, and its states.
export function parseUxui(markdown) {
  const list = sections(markdown);
  // UP-nn and MC-nn rows count wherever they sit.
  const idRows = (prefix) => tableRows(String(markdown))
    .map(cells).filter((row) => new RegExp(`^${prefix}-\\d+$`).test(row[0]))
    .map((row) => ({ id: row[0], text: row.slice(1).join(" · "),
      copy: [...row.join(" ").matchAll(/["“]([^"”]{3,})["”]/g)].map((match) => match[1]) }));
  const extra = { permissions: idRows("UP"), microcopy: idRows("MC") };
  const inventory = list.find((row) => /screen inventory/i.test(row.title)) ||
    list.find((row) => /screens?\b|หน้าจอ/i.test(row.title) && /\|[^\n]*(?:screen|หน้า)[^\n]*\|[^\n]*(?:state|สถานะ)/i.test(row.body));
  if (!inventory) return { screens: [], ...extra };
  const rows = tableRows(inventory.body);
  if (rows.length < 2) return { screens: [], ...extra };
  const header = cells(rows[0]).map((cell) => cell.toLowerCase());
  const column = (...names) => header.findIndex((cell) => names.some((name) => cell.includes(name)));
  const screen = column("screen", "หน้า", "ชื่อหน้า");
  const feature = column("feature", "ฟีเจอร์");
  const states = column("state", "สถานะของหน้า");
  const screens = rows.slice(1).map(cells).map((row) => ({
    screen: row[screen] || row[0],
    feature: feature >= 0 ? row[feature] || "" : "",
    states: states >= 0 ? (row[states] || "").split(/[,/·;]|\s+และ\s+/).map((value) => value.trim()).filter(Boolean) : []
  })).filter((row) => row.screen);
  return { screens, ...extra };
}

// The items a change owes: every defined item for "all", otherwise the scoped
// features with everything their mapping rows name, the criteria of their
// stories, and the open questions that mention any of them.
export function scopedItems(prd, scope) {
  if (scope === "all" || scope === undefined) return new Set(prd.items.keys());
  const owed = new Set();
  for (const feature of scope) {
    owed.add(feature);
    for (const id of prd.mapping.get(feature) || []) owed.add(id);
  }
  for (const [criterion, stories] of prd.criteria)
    if ([...stories].some((story) => owed.has(story))) owed.add(criterion);
  for (const [id, item] of prd.items)
    if (MENTION_SCOPED.has(item.kind) && [...namedIds(item.text)].some((named) => owed.has(named))) owed.add(id);
  return new Set([...owed].filter((id) => prd.items.has(id)));
}

// Where each place of the draft cites IDs, with a readable location.
function draftPlaces(draft) {
  const places = Object.fromEntries(Object.keys(PLACE_TEXT).map((place) => [place, []]));
  const add = (place, where, value) => places[place].push({ where, ids: namedIds(JSON.stringify(value ?? "")) });
  for (const requirement of draft.requirements || []) {
    const where = `requirement ${text(requirement.key) || text(requirement.description).slice(0, 40)}`;
    add("requirements", where, { description: requirement.description, outcome: requirement.outcome, key: requirement.key });
    for (const scenario of requirement.scenarios || []) {
      const named = `scenario "${text(scenario.name) || text(scenario.when).slice(0, 40)}"`;
      add("scenarios", named, scenario);
      if (scenario.kind === "failure") add("failureScenarios", named, scenario);
    }
  }
  for (const story of draft.userStories || []) add("userStories", "user story", story);
  for (const task of draft.tasks || []) add("tasks", `task ${text(task.key) || text(task.id) || text(task.outcome).slice(0, 40)}`, task);
  for (const row of draft.nfr || []) add("nfr", `nfr ${text(row.key)}`, row);
  for (const row of draft.failureMatrix || []) add("failureMatrix", "failure matrix", row);
  for (const decision of draft.decisions || []) add("decisions", `decision ${text(decision.key)}`, decision);
  for (const question of draft.openQuestions || []) add("openQuestions", "open question", question);
  for (const row of [].concat(draft.dependencies || [])) add("dependencies", "dependency", row);
  for (const row of [].concat(draft.dataModel || [])) add("dataModel", `data ${text(row?.entity)}`, row);
  for (const row of draft.uiStates || []) add("uiStates", `UI states ${text(row?.screen)}`, row);
  return places;
}

const normalized = (value) => String(value).toLowerCase().replace(/\s+/g, " ").trim();

// Coverage of one change against its handoff documents.
// `handoff` is the draft's productHandoff; `prdText` / `uxuiText` are the
// file contents (null when the draft names none).
export function productHandoffCoverage(draft, handoff, { prdText = null, uxuiText = null } = {}) {
  const issues = [];
  const rows = [];
  const excluded = new Map();
  for (const [index, row] of (Array.isArray(handoff?.excluded) ? handoff.excluded : []).entries()) {
    if (!text(row?.id) || !text(row?.reason))
      issues.push(`semantic draft productHandoff.excluded[${index}] needs an id and the reason it is not part of this change`);
    else excluded.set(text(row.id), text(row.reason));
  }
  const used = new Set();
  const places = draftPlaces(draft);
  if (prdText !== null) {
    const prd = parsePrd(prdText);
    if (!prd.items.size) issues.push("semantic draft productHandoff.prd defines no ID (US-, AC-, BR-, F-, NFR-, ADR-, ERR-, DEP-, DATA-, PERM-, Q-): " +
      "convert it with the prd skill's import step, which keeps every statement and checks nothing was dropped");
    const scope = handoff.scope === undefined || handoff.scope === "all" ? "all"
      : Array.isArray(handoff.scope) ? handoff.scope.map(text).filter(Boolean) : null;
    if (scope === null) issues.push('semantic draft productHandoff.scope must be "all" or a list of feature IDs (F-nn)');
    for (const feature of Array.isArray(scope) ? scope : [])
      if (!prd.items.has(feature)) issues.push(`semantic draft productHandoff.scope names ${feature}, which the PRD does not define`);
    for (const id of [...scopedItems(prd, scope || [])].sort(compareIds)) {
      const item = prd.items.get(id);
      const allowed = PRD_KINDS[item.kind].places;
      const coveredBy = allowed.flatMap((place) => places[place].filter((entry) => entry.ids.has(id)).map((entry) => entry.where));
      // Excluding a story excludes the criteria written only for it.
      const stories = item.kind === "AC" ? [...(prd.criteria.get(id) || [])] : [];
      const viaStories = stories.length && stories.every((story) => excluded.has(story))
        ? `with ${stories.join(", ")}: ${excluded.get(stories[0])}` : undefined;
      const reason = excluded.get(id) ?? viaStories;
      if (excluded.has(id)) used.add(id);
      rows.push({ id, kind: item.kind, text: item.text, coveredBy: [...new Set(coveredBy)], excluded: reason ?? null });
      if (!coveredBy.length && reason === undefined)
        issues.push(`semantic draft does not cover ${id} from the PRD: cite "${id}" in ${
          allowed.map((place) => PLACE_TEXT[place]).join(" or ")}, or add it to productHandoff.excluded with the reason`);
    }
    glossaryCoverage(prd, rows, draft, excluded, used, issues);
  }
  if (uxuiText !== null) {
    const { screens } = parseUxui(uxuiText);
    const { permissions, microcopy } = parseUxui(uxuiText);
    if (!screens.length && !permissions.length && !microcopy.length)
      issues.push("semantic draft productHandoff.uxui has no screen table (screen and state columns), UP-nn, or MC-nn row: convert it with the " +
      "ux-design skill's import step");
    const featureNames = handoff.scope && handoff.scope !== "all" && prdText !== null ? scopedFeatureNames(prdText, handoff.scope) : null;
    for (const row of screens) {
      if (featureNames && !featureNames.some((name) => normalized(row.feature).includes(name))) continue;
      const contract = (draft.uiStates || []).find((entry) => normalized(entry.screen || "") === normalized(row.screen) ||
        normalized(entry.screen || "").includes(normalized(row.screen)));
      const declared = new Set((contract?.states || []).map((state) => normalized(state?.state || state)));
      for (const state of row.states.length ? row.states : [""]) {
        const id = state ? `screen:${row.screen}/${state}` : `screen:${row.screen}`;
        const reason = excluded.get(id) ?? excluded.get(`screen:${row.screen}`);
        if (reason !== undefined) used.add(excluded.has(id) ? id : `screen:${row.screen}`);
        const covered = contract && (!state || declared.has(normalized(state)));
        rows.push({ id, kind: "SCREEN", text: state ? `${row.screen} — ${state}` : row.screen,
          coveredBy: covered ? [`UI states ${contract.screen}`] : [], excluded: reason ?? null });
        if (!covered && reason === undefined)
          issues.push(`semantic draft does not cover ${id} from uxui.md: add a uiStates row for screen "${row.screen}"${
            state ? ` with state "${state}"` : ""}, or add "${id}" to productHandoff.excluded with the reason`);
      }
    }
  }
  if (uxuiText !== null) uxuiRowCoverage(uxuiText, handoff, prdText, draft, places, excluded, used, rows, issues);
  for (const id of excluded.keys())
    if (!used.has(id)) issues.push(`semantic draft productHandoff.excluded names ${id}, which is not owed by this change`);
  return { rows, issues };
}

// A glossary term the owed items use must be defined in the change's
// domainLanguage, so the spec and the code use the PM's words.
function glossaryCoverage(prd, rows, draft, excluded, used, issues) {
  const owedText = normalized(rows.filter((row) => row.excluded === null && row.kind !== "SCREEN").map((row) => row.text).join(" "));
  const defined = normalized(JSON.stringify(draft.domainLanguage || []));
  for (const { term, aliases } of prd.glossary) {
    if (!aliases.some((alias) => owedText.includes(normalized(alias)))) continue;
    const id = `GL:${term}`;
    const covered = aliases.some((alias) => defined.includes(normalized(alias)));
    const reason = excluded.get(id);
    if (reason !== undefined) used.add(id);
    rows.push({ id, kind: "GL", text: term, coveredBy: covered ? ["domain language"] : [], excluded: reason ?? null });
    if (!covered && reason === undefined)
      issues.push(`semantic draft uses the PRD glossary term "${term}" but its domainLanguage does not define it: ` +
        `add { "term": "${aliases[0]}", "meaning": "<from the PRD glossary>" }, or exclude "${id}" with the reason`);
  }
}

// uxui.md permission rows (UP-nn) become scenarios; microcopy rows (MC-nn)
// appear in a scenario or UI state by ID or by their exact quoted text. A row
// is owed when the scope is "all" or it names a scoped screen or feature.
function uxuiRowCoverage(uxuiText, handoff, prdText, draft, places, excluded, used, rows, issues) {
  const { screens, permissions, microcopy } = parseUxui(uxuiText);
  const scoped = handoff.scope && handoff.scope !== "all" && prdText !== null;
  const names = scoped ? [...scopedFeatureNames(prdText, handoff.scope),
    ...screens.filter((row) => scopedFeatureNames(prdText, handoff.scope).some((name) => normalized(row.feature).includes(name)))
      .map((row) => normalized(row.screen))] : [];
  const drafted = normalized(JSON.stringify([draft.requirements || [], draft.uiStates || []]));
  for (const [kind, list, allowed] of [["UP", permissions, ["scenarios"]], ["MC", microcopy, ["scenarios", "uiStates"]]]) {
    for (const row of list) {
      if (scoped && !names.some((name) => normalized(row.text).includes(name))) continue;
      const byId = allowed.flatMap((place) => places[place].filter((entry) => entry.ids.has(row.id)).map((entry) => entry.where));
      const byCopy = kind === "MC" && row.copy.length && row.copy.every((copy) => drafted.includes(normalized(copy)))
        ? ["the exact copy"] : [];
      const coveredBy = [...new Set([...byId, ...byCopy])];
      const reason = excluded.get(row.id);
      if (reason !== undefined) used.add(row.id);
      rows.push({ id: row.id, kind, text: row.text, coveredBy, excluded: reason ?? null });
      if (!coveredBy.length && reason === undefined)
        issues.push(`semantic draft does not cover ${row.id} from uxui.md: cite "${row.id}" in ${
          allowed.map((place) => PLACE_TEXT[place]).join(" or ")}${kind === "MC" ? " or use its exact text" : ""
        }, or add it to productHandoff.excluded with the reason`);
    }
  }
}

function scopedFeatureNames(prdText, scope) {
  const prd = parsePrd(prdText);
  return scope.flatMap((feature) => {
    const name = (prd.items.get(feature)?.text || "").split(" · ")[0] || "";
    return [normalized(feature), normalized(name)].filter(Boolean);
  });
}

function compareIds(left, right) {
  const order = Object.keys(PRD_KINDS);
  const [lk, ln] = [left.replace(/-?\d+$/, ""), Number(left.match(/\d+$/)?.[0] || 0)];
  const [rk, rn] = [right.replace(/-?\d+$/, ""), Number(right.match(/\d+$/)?.[0] || 0)];
  return order.indexOf(lk) - order.indexOf(rk) || ln - rn;
}

export function productHandoffShapeIssues(handoff) {
  if (handoff === undefined) return [];
  if (!handoff || typeof handoff !== "object" || Array.isArray(handoff))
    return ["semantic draft productHandoff must be an object { prd?, uxui?, scope?, excluded? }"];
  const issues = [];
  if (handoff.none !== undefined) {
    if (!text(handoff.none)) issues.push("semantic draft productHandoff.none must say why this change is not from the product documents");
    if (text(handoff.prd) || text(handoff.uxui)) issues.push("semantic draft productHandoff.none cannot be combined with prd or uxui");
    return issues;
  }
  if (!text(handoff.prd) && !text(handoff.uxui))
    issues.push("semantic draft productHandoff names neither prd nor uxui");
  if (handoff.excluded !== undefined && !Array.isArray(handoff.excluded))
    issues.push("semantic draft productHandoff.excluded must be an array of { id, reason }");
  return issues;
}

// The proposal section: one table per PRD heading, then screens and states.
export function renderProductHandoff(coverage, { language = "en" } = {}) {
  if (!coverage?.rows?.length) return "";
  const th = language === "th";
  const groups = [...Object.entries(PRD_KINDS).map(([kind, { label }]) => [kind, label]), ["GL", "Glossary terms"],
    ["SCREEN", SCREEN_LABEL], ["UP", "UX/UI permissions"], ["MC", "Microcopy"]];
  const head = th ? "| ID | รายการ | อยู่ใน change ที่ |\n|---|---|---|" : "| ID | Item | Covered in this change by |\n|---|---|---|";
  const cell = (value) => String(value).replace(/\|/g, "\\|");
  const parts = [coverage.documents ? `${th ? "เอกสาร" : "Documents"}: ${coverage.documents}` : ""];
  for (const [kind, label] of groups) {
    const rows = coverage.rows.filter((row) => row.kind === kind);
    if (!rows.length) continue;
    parts.push(`### ${label}\n\n${head}\n${rows.map((row) => `| ${cell(row.id)} | ${cell(row.text)} | ${
      row.excluded !== null ? `${th ? "ไม่อยู่ใน change นี้" : "Not in this change"}: ${cell(row.excluded)}` : cell(row.coveredBy.join(", "))} |`).join("\n")}`);
  }
  return parts.filter(Boolean).join("\n\n");
}
