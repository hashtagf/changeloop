#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BLOCK = /^  bottle do\n[\s\S]*?^  end\n/m;

// Put one bottle block directly after the formula's `head` line, replacing any
// block a previous release armed, with exactly one blank line on each side.
export function replaceBottleBlock(formula, block) {
  const bottle = block.match(BLOCK)?.[0];
  if (!bottle || !/sha256 cellar:/.test(bottle)) throw new Error("bottle output has no bottle block");
  const without = formula.replace(/\n*^  bottle do\n[\s\S]*?^  end\n/m, "\n");
  const head = without.match(/^  head .*\n/m);
  if (!head) throw new Error("formula has no head line");
  const at = head.index + head[0].length;
  const rest = without.slice(at).replace(/^\n+/, "");
  return `${without.slice(0, at)}\n${bottle}\n${rest}`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [formulaPath, blockPath] = process.argv.slice(2);
    if (!formulaPath || !blockPath) throw new Error("usage: replace-bottle-block.mjs FORMULA BOTTLE_OUTPUT");
    writeFileSync(formulaPath, replaceBottleBlock(readFileSync(formulaPath, "utf8"),
      readFileSync(blockPath, "utf8")));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
