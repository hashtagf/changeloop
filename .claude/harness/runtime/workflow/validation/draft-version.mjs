// Accepted semantic draft versions. v5 is v4 semantics plus authored folder
// prose, so every v4 rule applies to it. Drafts v1-v3 were retired in 3.7.
// This leaf module has no imports so validation modules can use it without a cycle.
export const SEMANTIC_DRAFT_VERSIONS = Object.freeze([4, 5]);

export function isSemanticVersion(version) {
  return SEMANTIC_DRAFT_VERSIONS.includes(version);
}

// The v5 draft is a folder: change.json declares this version.
export const FOLDER_DRAFT_VERSION = 5;

export function isFolderDraftVersion(version) {
  return version === FOLDER_DRAFT_VERSION;
}
