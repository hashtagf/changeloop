# UX for AI features

Generative and predictive features (assistants, summaries, suggestions,
classification, auto-fill, agents) behave differently from deterministic UI:
output varies, can be wrong with confidence, takes time, and may act on the
user's behalf. These are this skill's project recommendations built on the
general principles elsewhere (system status, control, error recovery,
consequence-based friction); they are not drawn from a dedicated external
standard. Source IDs resolve in [sources.md](sources.md).

## Decide whether AI fits the task

| Good fit | Poor fit |
|---|---|
| Drafting, summarizing, searching, suggesting, classifying with human review | Decisions that must be exact and auditable without review (payout amounts, legal determinations) |
| Tasks where a "good enough" first draft saves time | Tasks where errors are costly and hard to detect |
| Large unstructured input (documents, tickets) | Simple tasks a form or filter already solves |

Write the failure mode down: what happens when the output is wrong, and how
will the user notice?

## Set expectations

- Say what the feature does and doesn't do, in one sentence, where it's used.
- Label AI-generated content where people could mistake it for human or
  verified content.
- Show the sources or inputs used when output summarizes or answers questions,
  so users can check.

## Keep the human in control

| Consequence | Pattern |
|---|---|
| Low (wording suggestions, summaries) | Show inline; accept/edit/dismiss; easy undo |
| Medium (drafted messages, categorized records) | Draft for review; user sends or saves |
| High (money, permissions, deletion, external communication) | AI proposes; user reviews a check-answers summary and confirms; actions logged with "suggested by AI" [S48] |
| Agentic multi-step actions | Show the plan before acting; confirm consequential steps; show progress; allow stop; report exactly what was done |

Never let AI silently change data the user owns. Everything AI does is
attributable in history (see auditability in [trust-security-privacy.md](trust-security-privacy.md)).

## States for AI output

| State | Design |
|---|---|
| Waiting | Show progress or stream partial output; allow cancel; say if it may take long |
| Partial / streaming | Readable as it arrives; don't move the user's focus or scroll position unexpectedly |
| Low confidence / no answer | Say so plainly and offer alternatives; don't fabricate |
| Error / unavailable | Explain and keep the user's input; offer the non-AI path |
| Refusal / policy block | Explain what can't be done and what can |
| Edited by user | Keep the edit; regenerate doesn't overwrite without asking |

Announce completion of long generations to assistive technology via a status
message; don't steal focus. [S13]

## Input design

- Offer starting points (example prompts, templates, "summarize this ticket")
  rather than an empty box only.
- Keep user input on failure and between regenerations.
- Let users refine with follow-up instructions and see previous versions.
- Make it clear what data is sent to the model; don't send sensitive data
  without need and consent ([trust-security-privacy.md](trust-security-privacy.md)).

## Feedback and improvement

- Lightweight feedback (useful / not useful, with optional reason) on outputs.
- Measure acceptance rate, edit distance, time saved, and error reports — not
  just usage ([measurement.md](measurement.md)).
- Review failures qualitatively; AI quality issues often look like UX issues.

## Content and tone

- Plain, specific language; avoid anthropomorphic claims ("I understand how
  you feel") in task tools.
- Consistent terminology with the rest of the product ([content-design.md](content-design.md)).
- For Thai products, check output language quality and register with real users.

## Review checklist

1. The failure mode is defined and detectable by the user.
2. Users review before consequential actions; AI actions are attributed in history.
3. Sources or inputs are visible when output makes claims.
4. Waiting, partial, low-confidence, error and refusal states are designed.
5. Input is preserved; regenerate doesn't destroy edits.
6. Data sent to the model is minimal and disclosed.
7. Success measured by acceptance and correctness, not usage alone.

## Do / Don't

| Do | Don't |
|---|---|
| Present AI output as a draft the user can edit. | Send AI-written messages to customers without review. |
| Show where an answer came from. | Present generated answers as verified facts. |
| Say when the model isn't sure. | Fill gaps with plausible invented details. |
| Keep a non-AI path for the task. | Make the AI the only way to complete a core task. |
