# Persistent user questions

`ask_user({ key, question, options? })` records a question and immediately returns
its ID and pending status. The model can continue independent work. Instructions
require it to wait for an answer before dependent work; this is not a sandbox
that can mechanically determine which arbitrary commands depend on a question.

In Pi, `/questions` or **Ctrl+Alt+U** opens the pending list. Select a question,
choose an option or type an answer. New questions open the list once when Pi is
idle. Esc, empty input, reload, shutdown and worker exit never resolve or remove
a question. A persistent status shows the unanswered count. Only a submitted
non-empty answer resolves it; there is no model-facing cancellation tool.

Questions from managed workers are routed to their interactive ancestor session
and remain visible there even if the worker exits. Replies are durable and wait
for the original owner session to resume; they never go to an unrelated session.
Idle retirement is blocked while questions or answer deliveries remain pending.
An explicitly stopped worker is not automatically restarted.

Records and answers live under `~/.pi/agent/user-questions` (or the test override
`PI_QUESTIONS_ROOT`). Pending indexes only contain unanswered questions; polling
does not scan completed history. Keys are scoped to the owner session and cannot
silently replace the original question. Concurrent replies use first-writer-wins.
Answers are delivered with the full original question and ID. Delivery is retried
after reload until visible in saved conversation history.

This covers new `ask_user` questions. It does not guess which historical prose
messages were questions or turn existing transient extension dialogs into these
records. The Web UI can invoke `/questions` through its existing command/dialog
bridge; no separate web question dashboard is installed.

Validation: `rtk node --test ~/.pi/agent/extensions/ask-user/*.test.cjs`.
Existing sessions need `/reload`; existing workers need their own reload/resume.
# Delivery reliability

Answered questions are acknowledged against Pi's persisted `custom_message`
entries across the session tree. Settling a turn does not clear queued delivery
IDs. Reload reconciles saved history before sending pending answers. Answers
remain durable until saved delivery is observed; failed sends remain retryable.
No extra answer is injected merely because the agent completes another turn.
