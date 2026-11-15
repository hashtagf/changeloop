// Keep Pi's entire extension dependency graph in jiti's reloadable TS path.
// Native CJS shims are only for standalone Node supervisors and tests.
export { default } from './extension.ts';
