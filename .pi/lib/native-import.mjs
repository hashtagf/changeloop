// Keep this expression in native ESM: Pi's TS loader normalizes URL queries.
import { registerHooks } from 'node:module';

export const importNative = url => import(url);

const REVISION = 'pi-revision';
const scopes = (globalThis[Symbol.for('changeloop.pi-revision-scopes')] ??= new Set());

// Native ESM caches by URL, so a revision query on the entry alone leaves its
// static dependencies stale across /reload. Propagate the entry's revision to
// every file it resolves inside `scope` so the whole graph reloads together.
export function importRevision(url, revision, scope) {
  const prefix = new URL(scope.endsWith('/') ? scope : scope + '/').href;
  if (typeof registerHooks === 'function' && !scopes.has(prefix)) {
    scopes.add(prefix);
    registerHooks({
      resolve(specifier, context, nextResolve) {
        const result = nextResolve(specifier, context);
        const parent = context.parentURL && URL.canParse(context.parentURL) ? new URL(context.parentURL) : null;
        const value = parent?.searchParams.get(REVISION);
        if (!value || !result.url.startsWith(prefix) || result.url.includes('/node_modules/')) return result;
        const target = new URL(result.url);
        if (target.searchParams.get(REVISION) === value) return result;
        target.searchParams.set(REVISION, value);
        return { ...result, url: target.href };
      },
    });
  }
  const target = new URL(url);
  target.searchParams.set(REVISION, revision);
  return import(target.href);
}
