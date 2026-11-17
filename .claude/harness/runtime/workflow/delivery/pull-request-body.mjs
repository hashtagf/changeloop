import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const TYPE_LABELS = {
  "feature-frontend": "Feature — Frontend",
  "feature-backend": "Feature — Backend",
  "bug-fix": "Bug Fix",
  "refactor-technical-debt": "Refactor / Technical Debt",
  "database-migration": "Database / Migration",
  "infrastructure-devops": "Infrastructure / DevOps",
  performance: "Performance",
  "security-hotfix": "Security / Hotfix"
};

const TYPE_SECTIONS = {
  "feature-frontend": ["Design and visual evidence", "Responsive and states", "Accessibility and analytics"],
  "feature-backend": ["API contract", "Data and authorization", "Idempotency and concurrency"],
  "bug-fix": ["Problem", "Root cause", "Fix", "Regression evidence"],
  "refactor-technical-debt": ["Objective", "Behavior change", "Before and after", "Quality metrics"],
  "database-migration": ["Schema change", "Migration execution", "Compatibility", "Backup and rollback"],
  "infrastructure-devops": ["Infrastructure change", "Expected result", "Operational verification"],
  performance: ["Benchmark method", "Before and after metrics", "Capacity impact"],
  "security-hotfix": ["Threat or incident", "Attack or failure path", "Mitigation", "Security regression evidence"]
};

const SECRET_FIELD = /(?:password|passwd|private[_-]?key|secret|credential|access[_-]?token|refresh[_-]?token|api[_-]?key)/i;

const SECRET_VALUE = /(?:AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\bBearer\s+[A-Za-z0-9._~-]{16,}|https?:\/\/[^\s/:@]+:[^\s@]+@)/i;

export function clean(value) {
  return String(value ?? "").trim();
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function parseGitHubRemote(value) {
  const raw = clean(value);
  const https = raw.match(/^https?:\/\/([^/]+)\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  const ssh = raw.match(/^(?:ssh:\/\/)?git@([^:/]+)[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
  const match = https || ssh;
  if (!match) return null;
  return { host: match[1].toLowerCase(), owner: match[2], repository: match[3], slug: `${match[2]}/${match[3]}` };
}

export function classifyPullRequest({ text = "", paths = [] } = {}) {
  const source = `${text}\n${paths.join("\n")}`.toLowerCase();
  const matches = (pattern) => pattern.test(source);
  if (matches(/\b(security|vulnerab|cve|idor|xss|csrf|auth(?:entication|orization)?|hotfix|incident)\b/))
    return "security-hotfix";
  if (matches(/\b(database|migration|migrate|schema|index|backfill|postgres|mysql|mongo)\b/))
    return "database-migration";
  if (matches(/\b(terraform|kubernetes|k8s|docker|helm|cloudflare|ci\/cd|workflow|infrastructure|devops)\b/))
    return "infrastructure-devops";
  if (matches(/\b(performance|latency|throughput|benchmark|p50|p95|p99|rps|capacity)\b/))
    return "performance";
  if (matches(/\b(bug|fix|incorrect|regression|root cause|failure|broken)\b/))
    return "bug-fix";
  if (matches(/\b(refactor|technical debt|complexity|crap score|mutation score|cleanup)\b/))
    return "refactor-technical-debt";
  if (paths.some((path) => /(?:^|\/)(?:app|pages|components|web|frontend|ui)(?:\/|$)|\.(?:css|scss|tsx|jsx|vue|svelte)$/i.test(path)))
    return "feature-frontend";
  return "feature-backend";
}

export function markdownSection(source, heading) {
  const lines = String(source || "").split(/\r?\n/);
  const wanted = clean(heading).toLowerCase();
  const start = lines.findIndex((line) => {
    const match = line.match(/^#{1,6}\s+(.+?)\s*$/);
    return match && clean(match[1]).toLowerCase() === wanted;
  });
  if (start < 0) return "";
  const level = lines[start].match(/^#+/)[0].length;
  const body = [];
  for (const line of lines.slice(start + 1)) {
    const marker = line.match(/^(#+)\s+/);
    if (marker && marker[1].length <= level) break;
    body.push(line);
  }
  return body.join("\n").trim();
}

function bullets(source) {
  return String(source || "").split(/\r?\n/)
    .map((line) => line.match(/^\s*[-*]\s+(?:\[[ xX]\]\s*)?(?:\*\*[^*]+\*\*\s*)?(.+)$/)?.[1])
    .map(clean).filter(Boolean);
}

function taskTitles(source) {
  return String(source || "").split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*-\s+\[[ xX]\]\s+\*\*(T\d+)\*\*\s+(.+?)(?:\s+—|\s+\[repo:|$)/);
    return match ? [`${match[1]} — ${clean(match[2])}`] : [];
  });
}

function relatedReferences(source) {
  const urls = String(source || "").match(/https?:\/\/[^\s)>]+/g) || [];
  return unique(urls).slice(0, 20);
}

export function pullRequestUrlKey(value) {
  return clean(value).replace(/[#?].*$/, "").replace(/[.,;:]+$/, "").replace(/\/+$/, "")
    .replace(/\/(?:files|commits|checks)$/, "").toLowerCase();
}

// A follow-up change records the delivery it continues by citing that
// delivery's pull-request URL in its agreement (proposal or design). Only a
// URL that a verified receipt of another change in this project produced
// binds; an ordinary related link never redirects publication.
export function followUpDeliveryCandidates({ changeId, proposal = "", design = "", receipts = [] }) {
  const cited = new Set(relatedReferences(`${proposal}\n${design}`).map(pullRequestUrlKey));
  return receipts.filter((receipt) => receipt && receipt.changeId !== changeId &&
    !receipt.multiRepository && receipt.branch && receipt.pullRequest?.url &&
    cited.has(pullRequestUrlKey(receipt.pullRequest.url)));
}

export function pullRequestNarrative({ changeId, state, proposal, design, tasks, proof, paths }) {
  const why = markdownSection(proposal, "Why") || clean(state.intent) || `Deliver ${changeId}`;
  const changes = markdownSection(proposal, "What changes") || markdownSection(proposal, "What Changes");
  const nonGoals = markdownSection(proposal, "Non-goals") || markdownSection(proposal, "Non-Goals");
  // Older proposals list "What changes"; the current layout states the same
  // requirement titles once, in Scope.
  const scoped = String(proposal || "").match(/^\s*-\s*\*\*In scope(?: \([^)]*\))?:\*\*\s*(.+)$/m)?.[1]
    ?.split(/;\s+/).map(clean).filter(Boolean) || [];
  const included = bullets(changes).length ? bullets(changes)
    : scoped.length ? scoped : taskTitles(tasks);
  const excluded = bullets(nonGoals);
  const titleSource = included[0] || clean(state.intent) || changeId;
  const title = titleSource.replace(/[`*_]/g, "").replace(/[.!]$/, "").slice(0, 120);
  const type = classifyPullRequest({ text: `${proposal}\n${design}\n${tasks}`, paths });
  const receipts = Array.isArray(proof?.receipts) ? proof.receipts : [];
  return {
    changeId,
    title,
    summary: included.length ? included.join("\n") : clean(changes) || title,
    why,
    relatedWork: relatedReferences(`${proposal}\n${design}`),
    included,
    excluded,
    type,
    testEvidence: receipts.map((receipt) => ({
      provider: receipt.provider,
      repositoryId: receipt.repositoryId || null,
      reference: receipt.path,
      digest: receipt.sha256 || null
    })),
    risk: `Impact: ${state.impact || "unknown"}; coupling: ${state.coupling || "unknown"}.`,
    rollback: markdownSection(design, "Rollback") ||
      markdownSection(design, "Compatibility and migration") ||
      "Revert the delivery commit; no deployment or merge is performed by Deliver.",
    monitoring: markdownSection(design, "Monitoring") ||
      "No runtime monitoring plan was declared in the archived change.",
    paths
  };
}

function receiptEvidenceText(root, proof, readJson) {
  return (proof?.receipts || []).flatMap((entry) => {
    const receipt = entry?.path ? readJson(join(root, entry.path), {}) : {};
    return [entry.provider, receipt.observed,
      ...(receipt.references || []),
      ...(receipt.artifacts || []).flatMap((artifact) =>
        [artifact.type, artifact.path, artifact.name, artifact.description])]
      .map(clean).filter(Boolean);
  }).join("\n").toLowerCase();
}

export function deliveryEvidenceAssessment({ root, lifecycle, proof, narrative, readJson }) {
  const requiredIssues = [];
  if (proof?.status !== "pass") requiredIssues.push("finalized proof is missing or not passing");
  if (!proof?.proofRunId || proof.proofRunId !== lifecycle?.land?.proofRunId)
    requiredIssues.push("proof run does not match the Land binding");
  if (!Array.isArray(proof?.receipts) || proof.receipts.length === 0)
    requiredIssues.push("proof has no durable receipt manifest");
  for (const entry of proof?.receipts || []) {
    const path = entry?.path ? join(root, entry.path) : null;
    if (!path || !existsSync(path) || pathIdentityForEvidence(path) !== entry.sha256)
      requiredIssues.push(`proof receipt is missing or changed: ${entry?.provider || "unknown"}`);
  }

  const evidenceText = receiptEvidenceText(root, proof, readJson);
  const presentationPatterns = {
    "feature-frontend": /screenshot|visual|image|\.png\b|\.jpe?g\b|\.webp\b|\.gif\b|video|\.webm\b|\.mp4\b/,
    "feature-backend": /request|response|api|integration|contract/,
    "bug-fix": /regression|before|after|reproduc|root.?cause/,
    "refactor-technical-debt": /coverage|complexity|mutation|crap|behavior|test/,
    "database-migration": /migration|schema|backfill|record|lock|database/,
    "infrastructure-devops": /metric|grafana|terraform|plan|docker|kubernetes|helm|infrastructure/,
    performance: /benchmark|k6|latency|throughput|p50|p95|p99|rps|cpu|memory/,
    "security-hotfix": /attack|security|vulnerab|authorization|authentication|incident|idor|xss|csrf/
  };
  const pattern = presentationPatterns[narrative.type];
  const presentationComplete = Boolean(pattern?.test(evidenceText));
  const scoreParts = {
    summary: Boolean(clean(narrative.summary)),
    why: Boolean(clean(narrative.why)),
    scope: narrative.paths.length > 0,
    evidence: requiredIssues.length === 0,
    risk: Boolean(clean(narrative.risk)),
    rollback: Boolean(clean(narrative.rollback)),
    monitoring: Boolean(clean(narrative.monitoring)),
    typeEvidence: presentationComplete
  };
  const score = Math.round(Object.values(scoreParts).filter(Boolean).length /
    Object.keys(scoreParts).length * 100);
  return {
    requiredComplete: requiredIssues.length === 0,
    requiredIssues,
    presentationComplete,
    presentationIssue: presentationComplete ? null :
      `No ${TYPE_LABELS[narrative.type] || narrative.type} presentation evidence was identified in the proven receipts.`,
    quality: { score, checks: scoreParts }
  };
}

function pathIdentityForEvidence(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function markdownList(values, empty) {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : `- ${empty}`;
}

export function renderPullRequestBody(narrative, { draft = false } = {}) {
  const typeSections = TYPE_SECTIONS[narrative.type] || [];
  const evidence = narrative.testEvidence.map((row) =>
    `- **${row.provider}**${row.repositoryId ? ` (${row.repositoryId})` : ""}: \`${row.reference}\`${row.digest ? ` — \`${row.digest.slice(0, 12)}\`` : ""}`);
  const related = narrative.relatedWork.length ? narrative.relatedWork : [`OpenSpec change: \`${narrative.changeId}\``];
  const extra = typeSections.map((heading) =>
    `## ${heading}\n\nNot separately declared; see the verified evidence and archived design above.`).join("\n\n");
  return [
    "## Summary", "", narrative.summary, "",
    "## Why", "", narrative.why, "",
    "## Related Work", "", markdownList(related, `OpenSpec change: \`${narrative.changeId}\``), "",
    "## Type", "", TYPE_LABELS[narrative.type] || narrative.type, "",
    "## Scope", "", "### Included", "",
    markdownList(narrative.included, "See the proven path projection below."), "",
    "### Not Included", "", markdownList(narrative.excluded, "No explicit non-goals were declared."), "",
    "### Proven paths", "", markdownList(narrative.paths.map((path) => `\`${path}\``), "No product path changes."), "",
    "## Test & Evidence", "", markdownList(evidence, "No receipt references were available."), "",
    "## Risk", "", narrative.risk, "",
    "## Rollback", "", narrative.rollback, "",
    "## Monitoring", "", narrative.monitoring,
    narrative.quality ? `\n\n## PR Quality\n\nScore: **${narrative.quality.score}/100**` : "",
    extra ? `\n\n${extra}` : "",
    draft ? "\n\n> This pull request is a draft because presentation evidence is incomplete." : "",
    "\n\n---\nGenerated from archived OpenSpec and content-bound Foundation proof."
  ].join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function containsSecretMaterial(value) {
  if (SECRET_VALUE.test(String(value || ""))) return true;
  return String(value || "").split(/\r?\n/).some((line) => {
    const match = line.match(/^\s*([^:=]+)\s*[:=]\s*(.+)$/);
    return match && SECRET_FIELD.test(match[1].replace(/[^a-z0-9]/gi, "")) && clean(match[2]) &&
      !/^(?:none|not applicable|redacted|\*+|x+)$/i.test(clean(match[2]));
  });
}

export function resultText(result) {
  return clean(result?.stderr || result?.stdout || result?.error?.message);
}
