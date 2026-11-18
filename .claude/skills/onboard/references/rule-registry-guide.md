# Rule registry guide

`quality/rule-enforcement.json` lists each rule an agent must follow in this
project and the strongest layer that enforces it. Trust in an agent comes from
what the project checks, not from what its guides ask; a rule that lives only
in prose is the last layer and is the first to be ignored.

## The pyramid, strongest first

| Layer | Holds the rule by | Example |
|---|---|---|
| architecture | structure that makes the wrong import impossible | a `module-boundaries` lane |
| type | a type that makes the bad state unrepresentable | a branded id |
| lint | a rule whose message names the fix | an ESLint rule |
| test | a test that fails when the rule is broken | a permission test |
| mutation | a mutation suite proving the test bites | a mutation lane |
| judgment | nothing can check it; say why | "naming must read well" |
| prose | only the guide says it | a sentence in `AGENTS.md` |

## Shape

```json
{
  "version": 1,
  "proseOnlyCeiling": 0,
  "rules": [
    { "id": "owner-only-delete", "source": "AGENTS.md",
      "quote": "Only the owner may delete a note.",
      "layer": "test", "enforcedBy": ["test/notes-delete.test.js"] },
    { "id": "plain-copy", "source": "AGENTS.md",
      "quote": "Error messages are written for end users.",
      "layer": "judgment", "judgment": "tone needs a person; review reads every message" }
  ]
}
```

- `quote` is copied exactly from the guide; a reworded guide fails the check
  until the quote matches again.
- A check layer names the project files that fail when the rule is broken.
- Draft every row, then ask the user to confirm the layers. Never mark a rule
  as a check without a file that enforces it; prose-only is an honest answer.

`cloop quality readiness` reports the share of rules a check holds, and
`doctor` names the next one to enforce.
