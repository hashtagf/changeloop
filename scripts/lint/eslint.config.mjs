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
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-unreachable": "error",
      "no-dupe-keys": "error",
      "changeloop/no-timer-wait": "error",
      "changeloop/no-workaround-comment": "error",
      "changeloop/no-silent-catch": "error",
      "changeloop/no-bare-disable": "error"
    }
  }
];
