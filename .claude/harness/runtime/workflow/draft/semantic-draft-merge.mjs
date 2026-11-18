// Merging a semantic draft with an amendment or an earlier draft: identities
// that key each list, and array and value merge rules.
import { text } from "./semantic-draft-text.mjs";
import { plainObject } from "./semantic-draft-minimal.mjs";

// ---- Partial revision ---------------------------------------------------------
// `change revise --merge` applies a patch to the draft the change was compiled
// from instead of requiring the whole draft again. Objects merge recursively
// and `null` deletes a key (JSON Merge Patch). An array whose base entries all
// carry an identity field (key, dimension, or name) merges by identity: a patch
// entry names its item by any of those fields every base entry has (the first
// it provides, in that order), merges into the matching entry, `"$remove":
// true` drops it, and any other entry is appended. A `$remove` that matches no
// entry is an error, never a silent no-op. Every other array is replaced.
const MERGE_IDENTITIES = ["key", "dimension", "name"];

function mergeIdentities(base) {
  if (!Array.isArray(base) || !base.length || !base.every(plainObject)) return [];
  return MERGE_IDENTITIES.filter((field) => base.every((row) => text(row[field])));
}

function mergeArray(base, patch) {
  const fields = mergeIdentities(base);
  if (!fields.length || !patch.every(plainObject)) return structuredClone(patch);
  const result = base.map((row) => structuredClone(row));
  for (const entry of patch) {
    const field = fields.find((name) => text(entry[name]));
    const identity = field ? text(entry[field]) : "";
    const index = identity ? result.findIndex((row) => text(row[field]) === identity) : -1;
    if (entry.$remove === true) {
      if (index < 0)
        throw new Error(identity
          ? `"$remove" names ${field} '${identity}', which matches no existing entry`
          : `"$remove" entry names no ${fields.join(" or ")} to identify what it removes`);
      result.splice(index, 1);
      continue;
    }
    const { $remove: _flag, ...value } = entry;
    if (index >= 0) result[index] = mergeValue(result[index], value);
    else result.push(structuredClone(value));
  }
  return result;
}

function mergeValue(base, patch) {
  if (Array.isArray(patch))
    return Array.isArray(base) ? mergeArray(base, patch) : structuredClone(patch);
  if (!plainObject(patch)) return patch;
  const result = plainObject(base) ? structuredClone(base) : {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete result[key];
    else result[key] = mergeValue(result[key], value);
  }
  return result;
}

function requirementKeySet(draft) {
  return new Set((Array.isArray(draft?.requirements) ? draft.requirements : [])
    .map((row) => text(row?.key)).filter(Boolean));
}

export function mergeSemanticDraft(base, patch) {
  if (!plainObject(base)) throw new Error("partial revision requires the change's prior draft");
  if (!plainObject(patch)) throw new Error("partial revision patch must be a JSON object");
  const merged = mergeValue(base, patch);
  // A removed requirement takes its evidence entry and task coverage with it;
  // the compiler owns those links. A task left covering nothing is reported.
  const kept = requirementKeySet(merged);
  const removed = [...requirementKeySet(base)].filter((key) => !kept.has(key));
  if (removed.length) {
    if (plainObject(merged.evidence))
      for (const key of removed) delete merged.evidence[key];
    if (Array.isArray(merged.tasks))
      merged.tasks = merged.tasks.map((task) => plainObject(task) && Array.isArray(task.covers)
        ? { ...task, covers: task.covers.filter((key) => !removed.includes(text(key))) }
        : task);
  }
  return merged;
}
