# btw

`/btw <question>` asks a quick side question about the current conversation,
like Claude Code's `/btw`.

- Works while the agent is busy: Pi runs extension commands immediately during
  a run, so the main task keeps going.
- The current model answers from the conversation (completed user and
  assistant messages plus compaction summaries; tool output is left out). Long
  conversations keep the newest 80,000 characters.
- No tools: the side question cannot read files, run commands or edit.
- The answer opens in an overlay. `↑`/`↓`/`PgUp`/`PgDn` scroll; `Esc`, `Enter`
  or `q` close. `Esc` while waiting cancels only the side question.
- Nothing is written to the session: the main agent never sees the question or
  the answer, and closing the overlay discards it.

Outside the interactive terminal (print or RPC mode) the answer is shown as a
notification.

Test: `node --test btw/btw.test.cjs`.
