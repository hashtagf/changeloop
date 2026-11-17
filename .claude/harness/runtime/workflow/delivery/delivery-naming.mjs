import { mergePolicy } from "./delivery-merge.mjs";
import { clean, unique } from "./pull-request-body.mjs";

export function deliveryPolicy(policy = {}) {
  const configured = policy?.deliver || {};
  return {
    provider: clean(configured.provider) || "auto",
    remote: clean(configured.remote) || "origin",
    defaultBaseBranch: clean(configured.defaultBaseBranch) || null,
    branchPattern: clean(configured.branchPattern) || DEFAULT_BRANCH_PATTERN,
    commitSubject: clean(configured.commitSubject) || DEFAULT_COMMIT_SUBJECT,
    ticketPattern: clean(configured.ticketPattern) || null,
    missingPresentationEvidence: clean(configured.missingPresentationEvidence) || "draft",
    missingRequiredEvidence: clean(configured.missingRequiredEvidence) || "block",
    updateOwnedPullRequest: configured.updateOwnedPullRequest !== false,
    merge: mergePolicy(configured),
    allowForcePush: false,
    allowDefaultBranchPush: false,
    allowedHosts: Array.isArray(configured.allowedHosts)
      ? configured.allowedHosts.map(clean).filter(Boolean) : ["github.com"]
  };
}

export function safeBranchComponent(value) {
  return clean(value).toLowerCase()
    .replace(/[^a-z0-9._/-]+/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/\/{2,}/g, "/")
    .replace(/(?:^|\/)\.+(?:\/|$)/g, "/")
    .replace(/^[-/.]+|[-/.]+$/g, "")
    .slice(0, 120) || "change";
}

export const DEFAULT_BRANCH_PATTERN = "change/{changeId}";

export const DEFAULT_COMMIT_SUBJECT = "{commitType}: {title}";

export const COMMIT_SUBJECT_MAX_LENGTH = 180;

export const BRANCH_NAME_MAX_LENGTH = 200;

const NAMING_PLACEHOLDERS = ["changeId", "title", "commitType", "prType", "ticket"];

const PLACEHOLDER = /\{([^{}]*)\}/g;

// A project naming setting that cannot produce a valid commit subject or
// branch. Deliver refuses it before any workspace, commit, or push exists.
export function namingInvalid(message) {
  const error = new Error(`${message}; correct the 'deliver' naming settings in foundation.json and retry Deliver`);
  error.code = "DELIVERY_NAMING_INVALID";
  return error;
}

function templatePlaceholders(template, setting) {
  const names = [...template.matchAll(PLACEHOLDER)].map((match) => match[1]);
  const unknown = unique(names.filter((name) => !NAMING_PLACEHOLDERS.includes(name)));
  if (unknown.length)
    throw namingInvalid(`deliver.${setting} uses unknown placeholder ${unknown.map((name) => `{${name}}`).join(", ")} ` +
      `(supported: ${NAMING_PLACEHOLDERS.map((name) => `{${name}}`).join(", ")})`);
  if (/[{}]/.test(template.replace(PLACEHOLDER, "")))
    throw namingInvalid(`deliver.${setting} has an unbalanced brace`);
  return names;
}

// `{ticket}` is the first match of the project's `deliver.ticketPattern` in
// the change id, then the archived title, why, and summary (capture group 1
// when the pattern has one). A template that needs a ticket the change does
// not carry is refused, never filled with a guess.
export function deliveryTicket(ticketPattern, sources = []) {
  if (!ticketPattern) return null;
  let pattern;
  try { pattern = new RegExp(ticketPattern); }
  catch (error) { throw namingInvalid(`deliver.ticketPattern is not a valid regular expression (${error.message})`); }
  for (const source of sources) {
    const match = String(source ?? "").match(pattern);
    const value = clean(match?.[1] ?? match?.[0]);
    if (value) return value;
  }
  return null;
}

// The values naming templates may reference, all derived from the
// checkpointed narrative so a resumed or follow-up delivery names its commit
// and branch the same way.
export function deliveryNamingValues({ changeId, narrative = {}, ticketPattern = null }) {
  const title = clean(narrative.title) || clean(changeId);
  return {
    changeId: clean(changeId),
    title,
    commitType: title.toLowerCase().startsWith("fix") ? "fix" : "feat",
    prType: clean(narrative.type) || "feature-backend",
    ticket: deliveryTicket(ticketPattern, [changeId, narrative.title, narrative.why, narrative.summary]),
    ticketConfigured: Boolean(ticketPattern)
  };
}

function fillTemplate(template, setting, values, transform = (value) => value) {
  const names = templatePlaceholders(template, setting);
  if (names.includes("ticket") && !values.ticket)
    throw namingInvalid(values.ticketConfigured
      ? `deliver.${setting} uses {ticket} but no match for deliver.ticketPattern was found in the change id, title, or proposal`
      : `deliver.${setting} uses {ticket} but deliver.ticketPattern is not configured`);
  return template.replace(PLACEHOLDER, (_, name) => transform(clean(values[name]), name));
}

// The delivery commit subject. The default template reproduces the
// historical `feat: <title>` / `fix: <title>` subject byte for byte.
export function deliveryCommitSubject(template, values) {
  if (!clean(template) || clean(template) === DEFAULT_COMMIT_SUBJECT)
    return `${values.commitType}: ${values.title}`.slice(0, COMMIT_SUBJECT_MAX_LENGTH);
  const subject = clean(fillTemplate(clean(template), "commitSubject", values));
  if (!subject) throw namingInvalid("deliver.commitSubject produces an empty commit subject");
  if (/[\r\n]/.test(subject)) throw namingInvalid("deliver.commitSubject must produce a single-line subject");
  if (/[\u0000-\u001f\u007f]/.test(subject))
    throw namingInvalid("deliver.commitSubject produces a control character");
  if (subject.length > COMMIT_SUBJECT_MAX_LENGTH)
    throw namingInvalid(`deliver.commitSubject produces a ${subject.length}-character subject (limit ${COMMIT_SUBJECT_MAX_LENGTH})`);
  return subject;
}

// The delivery branch. A pattern using only `{changeId}` keeps its historical
// normalization unchanged. With any other placeholder, values are slugged
// (`{ticket}` is kept as matched) and the project's literal text is kept as
// written; the result is checked here and with `git check-ref-format`.
export function deliveryBranchName(pattern, changeId, values = {}) {
  const template = clean(pattern) || DEFAULT_BRANCH_PATTERN;
  if (templatePlaceholders(template, "branchPattern").every((name) => name === "changeId"))
    return safeBranchComponent(template.replaceAll("{changeId}", safeBranchComponent(changeId)));
  const slug = (value) => safeBranchComponent(value).replaceAll("/", "-").slice(0, 60).replace(/[-.]+$/, "");
  const branch = fillTemplate(template, "branchPattern", { ...values, changeId },
    (value, name) => name === "ticket" ? value
      : name === "changeId" ? safeBranchComponent(value).replaceAll("/", "-") : slug(value));
  const problem = branchNameProblem(branch);
  if (problem) throw namingInvalid(`deliver.branchPattern produces an invalid branch '${branch}': ${problem}`);
  return branch;
}

export function branchNameProblem(branch) {
  if (!branch) return "it is empty";
  if (branch.length > BRANCH_NAME_MAX_LENGTH) return `it is longer than ${BRANCH_NAME_MAX_LENGTH} characters`;
  if (/[\s~^:?*[\\\u0000-\u001f\u007f]/.test(branch) || branch.includes("@{") || branch === "@" ||
      branch.includes("..") || branch.includes("//") || /^[-/.]|[/.]$|\.lock(?:\/|$)|\/\./.test(branch))
    return "it is not a valid Git branch name";
  return null;
}
