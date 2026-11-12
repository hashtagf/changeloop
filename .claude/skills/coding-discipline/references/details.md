# Coding discipline — rationale and procedures

`SKILL.md` states each rule once. This file gives each rule's reason and the
minimum procedure to apply it alone, plus two procedures: encoding a recurring
correction and building a lever. Skills named at the end are optional.

## Why this exists

The failure modes are conduct gaps, not knowledge gaps: the model assumes
silently, over-builds, patches the symptom, and edits code it does not
understand as a side effect. Sources, independently rewritten:
[Andrej Karpathy's observations on LLM coding pitfalls](https://x.com/karpathy/status/2015883857489522876)
(via the MIT-licensed [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)),
the [ponytail](https://github.com/DietrichGebert/ponytail) stance, and pstack's
skills (Lauren Tan, `cursor/plugins`, MIT).

## 1. Think before coding

**Why:** choosing one interpretation silently and building 200 lines on it is
the most expensive failure.

"Make this faster" assumes the slow part is where the asker thinks; "add a
retry" assumes the failure is transient. Check the premise against something
observable (a profile, a log line, a reproduced failure); if evidence rules out
the requested change, show it instead of building. A question you can settle by
running something is not the user's to answer. Candor over agreement: say when
an addition does not earn its place.

## 2. Simplicity first

**Why:** unrequested flexibility is a guess about a future that rarely arrives,
and a tax on every reader until then.

Cover the whole requirement, including unhappy paths; between options that both
cover it, choose the smaller diff. Stop at the first rung that solves it:

1. **Does it need to exist?**
2. **Standard library or a language built-in?**
3. **A native platform feature** of the runtime, framework, or database?
4. **An already-installed dependency?** A new dependency is not a free rung: it
   adds supply-chain risk and a trust boundary. If unavoidable, choose a
   maintained, widely used package, pin it, and validate its inputs.
5. **Can it be one line?**
6. **Only then** write the minimum code.

**Lazy, not negligent:** never trim trust-boundary validation, error and
data-loss handling, authorization, or accessibility. Mark a deliberate shortcut
with `ponytail: <upgrade path>`. No unrequested features or config, no handling
for impossible states, no abstraction for a single call site (extract on the
second real use). Validate at the trust boundary and trust parsed types inside;
make each decision once. Add a layer only when it removes more reader load than
it adds. If 200 lines could be 50, rewrite it.

## 3. Fix the root cause

**Why:** a symptom fix hides the evidence and leaves the fault free to surface
elsewhere.

1. **Reproduce** with the smallest reliable trigger before editing.
2. **Trace back** from where the wrong state surfaced to the first place the
   system did something it should not, or mishandled a state it must accept.
3. **Judge legitimacy:** handle a legitimate state where the code broke; fix
   the producer of one that should never exist.
4. **Pin it** with a regression test that fails before the fix.
5. **After two failed fixes** on the same check, write down the shared premise
   and test it before editing again.

Fix other instances inside the change's scope; report the rest as follow-ups.
A workaround that needs a paragraph to justify it signals wrong code.

**Fallback versus masking:** a fallback is legitimate when the spec, data
contract, or existing behavior defines it (for example, an unknown time zone
falls back to UTC with a warning). It is masking when it turns a state that must
never occur into silent success. Remove neither kind without proof.

**Order of effects:** validate and resolve every input a handler needs before
its first external or irreversible effect (sending, charging, writing, or
publishing). A failure after one effect has happened leaves partial work that
no retry can undo, such as an email that was sent without its SMS.

## 4. Surgical changes

**Why:** reformatting or refactoring unbroken code buries the real change and
risks breaking code you do not understand.

A preparatory refactor is in scope only when this change needs it, it preserves
behavior, it lands as its own slice before the behavior change, and tests
(existing or a new characterization test) pass before and after. Then integrate
the requirement as if it had been a design assumption from the start.

Unrelated findings need a durable route, since chat is lost. Report each with
location and evidence; do not fix it in this diff or create work items as a
side effect. Under Change Loop, the active Change's follow-up gate routes it: an
independent fix becomes a proposed successor Change once the user decides; a
blocker of the approved outcome is in-contract repair or a semantic amendment.
Elsewhere, propose an issue or TODO entry.

## 5. Goal-driven execution

**Why:** "make it work" is unverifiable; the user becomes the test harness.

For multi-step work, give each step its check: `[step] → verify: [check]`.

- **Check the real artifact:** run the feature, read the value, inspect the
  diff. A compile, cached result, or self-report is not proof. When a check
  fails unexpectedly, suspect the observation first.
- **Test first:** a failing test per requirement scenario, then the project's
  own test, lint, and type commands.
- **Verify each unit before the next;** a break found after a batch is buried.
- **Never weaken a gate:** skipping a test, overwriting a snapshot, widening a
  timeout, or adding a suppression is a user decision, not a repair.

Proof is CI or test output, or harness receipts under Change Loop; a checklist
is not proof.

## Encode a recurring correction

**Trigger:** you are writing the same instruction a second time, or a lessons review (Change Loop: `lessons`) reports a recurring code across changes. Prose that repeats is the symptom; nothing fails when the next agent skips it.

Choose the strongest workable enforcement, in this order:
1. **Architecture** — one owner per piece of state and one supported path per task, so the wrong route does not exist.
2. **Type** — make the bad state unrepresentable so it cannot compile.
3. **A lint whose message names the fix** — the error points at the file, type, or function to use instead. On a pattern already common in the codebase, fail only on new occurrences.
4. **A test** — it fails when the behavior breaks and survives internal edits.
5. **Documentation last** — only for judgment calls no check can encode; add the failure example beside the rule.

**A new check must fail on a real past occurrence.** Point it at the base tree that contained the mistake (Change Loop's "tests that fail without the change"); a check that passes on the known-bad tree proves nothing. Adopt it through an ordinary `/change` (or the project's normal change process) with its own agreement and evidence, never as a side edit to unrelated work. Removing an older guard the check supersedes still follows "Prove a guard unnecessary before removing it" and [cleanup.md](cleanup.md).

## Build the lever

**Trigger:** a nontrivial edit repeats across many sites, files, or records. Hand edits can only be re-verified by redoing them; a script, codemod, or generator reruns identically and a reviewer can read it.

1. Do the first unit by hand to learn the exact recipe.
2. Write the smallest script, codemod, or generator that performs that recipe; no framework.
3. Run the tool on the hand-done unit and diff the two. Fix the tool until the diff is empty.
4. Run it on the remaining units and make it safe to rerun (a second pass changes nothing).

Skip the lever for a couple of obvious edits visible at a glance. Keep the tool inside the change's declared scope; it does not widen the request.

## Deeper reading, if available

Not required: [[brainstorming]] (open outcomes), [[programming-fundamentals]]
(code mechanics, reader load), [[security-fundamentals]] (dependencies, trust
boundaries), [[debug-fundamentals]] (root cause), [[refactoring-fundamentals]]
(restructuring), [[testing-fundamentals]] (test design), [[git-workflow]]
(commits, only when separately authorized). [cleanup.md](cleanup.md) removes
residue after a change.
