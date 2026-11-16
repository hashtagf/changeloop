// Keep this expression in native ESM: Pi's TS loader normalizes URL queries.
// FROZEN CONTRACT: a running Pi caches this module by URL for its whole life,
// so /reload never sees edits here. Never change or extend its exports; put
// evolving loader logic in revision-import.mjs, which the entry loads by revision.
export const importNative = url => import(url);
