import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { replaceBottleBlock } from "../../../scripts/release/replace-bottle-block.mjs";

const block = (version) => `==> output\n  bottle do\n    root_url "https://example/v${version}"\n` +
  `    sha256 cellar: :any_skip_relocation, arm64_sequoia: "${"a".repeat(64)}"\n  end\n`;

test("re-arming an already bottled formula leaves no extra blank line", () => {
  const formula = readFileSync(new URL("../../../Formula/cloop.rb", import.meta.url), "utf8");
  const once = replaceBottleBlock(formula, block("9.9.9"));
  const twice = replaceBottleBlock(once, block("9.9.10"));
  for (const result of [once, twice]) {
    assert.doesNotMatch(result, /\n\n\n/, "no consecutive blank lines");
    assert.equal(result.match(/^  bottle do$/gm).length, 1);
    assert.match(result, /^  head .*\n\n  bottle do\n/m);
    assert.match(result, /^  end\n\n\S|^  end\n\n  #/m);
  }
  assert.match(twice, /v9\.9\.10/);
  assert.doesNotMatch(twice, /v9\.9\.9"/);
});

test("a formula without a block gets one after head", () => {
  const formula = `class X < Formula\n  url "u"\n  head "h.git", branch: "main"\n\n  def install\n  end\nend\n`;
  const result = replaceBottleBlock(formula, block("1.0.0"));
  assert.match(result, /head "h\.git", branch: "main"\n\n  bottle do\n[\s\S]*?  end\n\n  def install/);
});

test("bottle output without a block is refused", () => {
  assert.throws(() => replaceBottleBlock("  head \"h\"\n", "no block\n"), /no bottle block/);
});
