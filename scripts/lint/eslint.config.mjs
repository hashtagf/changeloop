// Repository-only lint configuration for the harness ratchet. The runner
// (scripts/lint/ratchet.mjs) passes this array directly, so it never changes
// how other ESLint users in this repository (complexity collection) resolve a
// config. Not shipped to consumers.
import globals from "globals";
import changeloop from "./plugin.mjs";

export default [
  {
    files: ["**/*.mjs", "**/*.js"],
    linterOptions: { reportUnusedDisableDirectives: "off" },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node }
    },
    plugins: { changeloop },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none", ignoreRestSiblings: true }],
      "no-unreachable": "error",
      "no-dupe-keys": "error",
      "changeloop/no-timer-wait": "error",
      "changeloop/no-workaround-comment": "error",
      "changeloop/no-silent-catch": "error",
      "changeloop/no-bare-disable": "error"
    }
  },
  {
    // The named timer primitives; every other module waits through them.
    files: [".claude/harness/runtime/core/timing.mjs"],
    rules: { "changeloop/no-timer-wait": "off" }
  },
  {
    // The named ignore-on-failure primitive; every other catch handles the error.
    files: [".claude/harness/runtime/core/best-effort.mjs"],
    rules: { "changeloop/no-silent-catch": "off" }
  }
];
