// Type sizes and radii of the repository's interfaces go through scale tokens.
import assert from "node:assert/strict";
import test from "node:test";
import { scaleFindings, scaleLiterals } from "../ui-scale.mjs";

test("px and rem sizes and radii outside a custom property are findings", () => {
  const css = ":root{--text-12:12px;--radius-4:4px}\n" +
    "a{font-size:var(--text-12);border-radius:var(--radius-4)}\n" +
    "b{font-size:13px}\nc{font:600 0.9rem/1.4 serif}\nd{border-radius:4px 4px 0 0}\n" +
    "e{font-size:0.9em;border-radius:50%;border-top-left-radius:0}\nf{font:inherit}\n/* g{font-size:9px} */";
  assert.deepEqual(scaleLiterals(css).map((row) => `${row.line}:${row.property}:${row.literal}`),
    ["3:font-size:13px", "4:font:0.9rem", "5:border-radius:4px"]);
});

test("the repository's own interfaces use only scale tokens", () => {
  assert.deepEqual(scaleFindings(), []);
});
