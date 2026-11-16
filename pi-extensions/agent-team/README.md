# Pi agent team

Run `/reload` in existing Pi sessions. New sessions load automatically.
Local to this machine; participating sessions use their normal provider/credentials.

## TUI

The agent bar is always below the main editor. Main's editor always belongs to
Main; each worker chat has its own composer and draft.
Worker conversations reuse Pi's native user/assistant Markdown components,
built-in tool renderers and multiline CustomEditor, matching Main's chat styling
without opening or writing the worker's session as another active Pi session.

- **Down** at the editor's bottom opens the shared picker. **Up/Down** browse;
  **Enter** opens that worker's saved chat/tool history without submitting a draft.
- Type in the picker to filter names/tasks; **Ctrl+O** includes offline/stopped
  sessions. **Escape** cancels selection; Up above Main returns to the editor.
- **Ctrl+Q / Ctrl+Alt+Q** selects the next/previous destination. In a worker chat,
  **Tab / Shift+Tab** switches workers and **Down / Ctrl+Q** opens the same picker.
- **Enter** sends steering; **Shift+Enter / Ctrl+J** inserts a newline. Multiline
  paste is preserved. **Alt+Enter** queues a follow-up. **PageUp/PageDown**
  scrolls history. **Escape** closes the worker view and returns to Main.
- **Ctrl+O** expands/collapses built-in tool output in the conversation (in the
  picker the same key still toggles offline history).
- **Ctrl+X** stops the selected managed worker and its descendants directly,
  without a model call. Wait for `stopped`; unrelated workers keep running.

Worker views fill the same terminal, covering Main with an opaque full-screen
view that includes the editor and shared agent bar. Resizing uses all available
rows; Escape restores Main and its draft. Selecting an agent neither starts
another Pi nor reloads model context. Saved history reads up to 200 entries from the last
4 MiB, excluding system prompts/thinking. Live text requires this extension
version in the viewed session; older workers still expose saved history/results.
Stopped workers are read-only. Ctrl+Q may be reserved on Windows/WSL or by custom
keybindings; arrow selection remains available.

UI verification: `rtk proxy node --test panel.test.cjs` and
`rtk proxy python3 test/chat-smoke.py`. The real TUI fixture uses no inference and
checks native Markdown/code/tool rendering, multiline delivery and draft return.

## Tools and natural language

Say “spawn pi มาช่วยงานนี้”, “ให้ตัวนั้นตรวจต่อ”, “งานถึงไหนแล้ว”, or “หยุดลูกทั้งหมด”.
Automatic delegation is off by default. Enable it with `/agents auto on` to
delegate long jobs and end the dispatch turn; workers execute and report back.
Model routing is guidance, not a keyword parser.

- `agent_spawn`: task, optional name/cwd/provider/model. Returns an independent
  worker ID immediately; inherits model/thinking/cwd/environment, not chat history.
  Concurrent requests wait for the shared spawn lock (up to 30 seconds) rather
  than failing on contention. Cancelling a waiting tool call creates no worker.
- `agent_list`: compact status of self and active descendants, 20 per page (max 50).
  Use `scope: "all"` for other sessions, `includeInactive: true` for history,
  and the returned `nextOffset` as `offset` for the next page. `id` selects one
  agent regardless of filters, including stopped agents. Add `details: true`
  with `id` for task/result previews (1,500 characters each) and paths to the full
  metadata/result/session/log files. Bulk listings never include tasks or results.
  Example: `agent_list({id: "worker-id", details: true})`. No agent is stopped,
  deleted, or hidden from explicit lookup by these display defaults.
- `agent_send`: to, message, optional delivery (`followUp` or `steer`). Recipient
  accepts ID, session ID, unique name, `parent`, or `self`.
- `agent_inbox`: previews only, 10 per page (max 20); optional unreadOnly, offset,
  limit. Use a message `id` to read text in 4,000-character chunks (maxChars up to
  8,000), following nextTextOffset with textOffset. The full envelope and details
  remain at the returned file path. Reads do not consume messages.
- `agent_stop`: id and optional includeChildren (default true). Managed workers
  may stop `self`; independent interactive sessions cannot be killed.

### Roles, Change Loop tasks and limits

`agent_spawn` accepts `role`: `explorer` (fast tier), `executor` (standard),
`reviewer` (deep) or `verifier` (standard). Explorer, reviewer and verifier run
with `write`/`edit` excluded (bash remains, so this is a guardrail, not a
sandbox). Every role ends its report with SUMMARY, CHANGES, CHECKS and BLOCKERS.
A tier resolves to `models.<tier>` in `config.json` (`"provider/id"`), else the
newest version (numeric order; snapshot dates only break ties; aliases last) of the tier family from the project's `foundation.json`
(haiku/sonnet/opus by default) on the current provider, else the current model.

For a Change Loop `execution.mode: parallel` envelope, spawn one worker per lease
with `changeLoopTask: {change, task, tier?}`. The worker runs from the project
root, first runs `cloop packet <change> --task <task>`, implements
only that task in the change workspace, and never edits `tasks.md` or leases;
the coordinator resumes `advance`. Every worker carries
`FOUNDATION_PARENT_SESSION_ID` (the root coordinating session), so Change Loop
guards let it write inside that session's Build workspace and never grant it
Land or Deliver. Workers do not get their own worktree: Change Loop serializes
writers per workspace.

Active managed workers are capped by `maxActiveWorkers` in `config.json`
(default 64). Inside a Change Loop project, `execution.maxParallelAgents` from
`foundation.json` is advice: a spawn above it still starts and its result
carries a `warning`. Verify with `rtk proxy node --test roles.test.cjs`.

Optional CLI: `/agents` returns to Main (lists JSON in RPC); `/agents view` opens
the shared picker including offline sessions; `/agents spawn <task>`,
`/agents send <id> <text>`, `/agents stop <id>`, `/agents inbox`.

## Report delivery

Batch mode is the default for each receiving session. Results, lifecycle notices,
and messages sent upward from a child are collected for 5 quiet seconds (at most
30 seconds from the first report). Normal batches wake the receiver at most once
per 30 seconds, only when it is idle with no queued messages. A user conversation
can postpone delivery longer; reports never interrupt that conversation.

- `/agents reports status`: show this session's mode and pending count (100+ is capped).
- `/agents reports quiet`: retain reports without starting a model turn, including failures.
- `/agents reports batch`: restore automatic grouped delivery.
- `/agents reports flush`: deliver one pending batch now, including in quiet mode,
  if idle. A zero delivered count while busy leaves reports queued; retry when idle.

Modes, pending reports, receipts and wakeup cooldown survive `/reload` and resume.
The footer shows pending reports. `/agents inbox` and `agent_inbox` read full
history without consuming it; `agent_inbox` with `unreadOnly: true` reads pending
report previews; select an id for its text. Every report reaches the model in full,
including earlier reports from the same worker. Batches target 128 KiB of report
text and at most 100 messages; an oversized single report is sent alone. Only
delivered messages are acknowledged; the rest remain queued for later batches.

Failures and explicit upward `agent_send` with `delivery: "steer"` are urgent:
they bypass the normal collection delay but still wait for idle, with at least
5 seconds between wakeups. Ordinary parent-to-worker instructions and unrelated
session messages keep their original steering/follow-up behavior, even in quiet
mode. Quiet applies to reports received by the selected session, not all sessions.

Every automatic result has `phase: "turn_settled"`: it reports the end of a run,
not a verified completed task. The coordinator must assess outcomes and checks,
combine updates, and avoid acknowledgement-only replies to workers. This is
model guidance; batching and receipt/cooldown enforcement are deterministic.
Existing main sessions need `/reload` to use this policy; older workers' reports
are compatible without restarting their work.

## Skills

Pi settings include the shared Claude/Codex skill directories. This extension
also discovers project `.claude/skills` and `.codex/skills`, from cwd up to the
repository root, only when Pi trusts the project. Native discovery handles
duplicates and lazy instruction loading.

Main and workers must check the catalog before task work or technical advice,
read relevant instructions, and name skills actually used. Delegation briefs
carry relevant skill names/paths; workers read them in their own context.
Complementary skills may be combined. Conflicting advice is resolved against
user intent, project guards and the task’s needs; explain material choices briefly.
Previously read instructions can be reused. Existing sessions need `/reload`;
new sessions and workers load the changes automatically.

## Runtime

Workers are detached Pi RPC processes with saved sessions. Parent exit/reload
leaves them running. Idle means available, not stopped. Resume the same parent
to receive queued results. Direct instructions trigger an idle receiver; reports
follow the receiving session's batch/quiet policy. Messages are durable;
receipts mean queued into context, not task completion. Crash recovery is at
least once. Use one running Pi instance per saved session.

Workers in the same cwd share files; choose an existing worktree or separate
file ownership. Limit: 64 live workers, depth 3.

Worker confirm/select/input/editor requests are saved and routed to the nearest
non-managed ancestor session, including requests from nested workers. Main shows
an alert and pending count; use `/agents questions` to answer the next request
through Pi's normal UI. No model answers or approves on the user's behalf.
Requests wait for an answer, explicit cancellation, their original timeout, or
worker shutdown. Pending dialogs prevent idle retirement. Parent reload retains
unanswered requests. Existing supervisors need a newly spawned worker for this
relay; `/reload` updates the parent UI but cannot replace a running supervisor.
Custom RPC UI components are still subject to Pi's native RPC support.

Managed workers automatically stop after 10 continuous idle minutes with no
active background jobs, pending messages, unread inbox or active child workers.
Interactive/main sessions are never retired. Work or uncertainty resets the idle
clock. History is retained; stopped workers free a slot and new work needs a new
worker. Existing sessions need `/reload` to enable this behavior.

Set `idleTimeoutMinutes` in `~/.pi/agent/agent-team/config.json` (or
`$PI_TEAM_ROOT/config.json`) to change the timeout; `0` disables retirement.
The file is reread by the existing monitor; no extra timer or model call is used.
Stop clears/aborts turns and background bash jobs, closes RPC, then force-kills
its owned process group after 3 seconds if needed. Deliberately daemonized bash
descendants may escape that group. History is retained; stopped workers need a
new spawn for further execution.

Data stays under `~/.pi/agent/agent-team/`: full settled results are retained;
result messages support up to 16 MiB, ordinary messages/tasks remain 64 KiB,
RPC log 10 MiB. No network listener or automatic history deletion. Incoming
extension/RPC/Web UI messages belong to Main. Prefixed `_agent_*` calls are
normalized before normal Pi validation/execution, preserving IDs and arguments.

## Structure and checks

`index.ts` loads `extension.ts` through Pi's reloadable TypeScript module graph.
All internal extension imports use `.ts`; native `.cjs` shims are reserved for
standalone Node supervisors/tests (Node 22.19+). Evicting native require caches
alone is insufficient in the bundled Pi loader. `extension.ts`
owns tools/lifecycle; `dock.ts` owns selection and editor navigation;
`panel.ts` owns worker composition/history; `store.ts` owns durable messages and
registry; `reports.ts` owns report aggregation and delivery policy;
`listing.ts` owns bounded status pages and explicit detail previews;
`worker.cjs` owns RPC processes. There is one picker, one draft store,
one parent refresh timer, and one sending path from the worker composer.

```
rtk proxy node --test ~/.pi/agent/extensions/agent-team/test.cjs ~/.pi/agent/extensions/agent-team/panel.test.cjs ~/.pi/agent/extensions/agent-team/idle.test.cjs ~/.pi/agent/extensions/agent-team/spawn.test.cjs ~/.pi/agent/extensions/agent-team/reports.test.cjs ~/.pi/agent/extensions/agent-team/reload.test.cjs ~/.pi/agent/extensions/agent-team/reload-rpc.test.cjs
rtk proxy python3 ~/.pi/agent/extensions/agent-team/test/tui-smoke.py
```

Tests use local mock inference; no external model request.

`rtk proxy node --test listing.test.cjs` verifies that large archived task/result
payloads stay out of status pages, pagination works, and explicit detail lookup
keeps full content available through files.

## Token economy

The one-second monitor reads live presence/process/results only for the current
session and its descendants. A cached metadata index discovers new member
directories immediately and reconciles existing metadata changes every 30 seconds;
unchanged historical metadata is not reopened. Dialog discovery reuses that same
team snapshot instead of enumerating every session again. Explicit all-session
lookups still read the registry. Before retiring an idle worker, the reaper checks
the fresh global parent/child graph to avoid missing a newly attached descendant.

Unread inbox polling lists receipts once and skips delivered message bodies.
Full inbox history remains available. Heartbeats run every five seconds while
status transitions remain immediate; inbox delivery still polls every second.
Unchanged dock/status text no longer triggers redraws, while an open worker chat
continues refreshing live output. Reload each existing Pi session to apply these
changes; active workers retain old code until reloaded, and new workers load the
updated extension automatically. No worker or background job is stopped by this
refactor.

`economy.ts` retains every settled result locally but suppresses automatic parent
wakeups for exact short acknowledgement/no-update responses after the first
published report, provided no tool ran. Identical prompt/result pairs are also
suppressed in that case. First reports, tool activity, errors and aborted runs
remain reportable. Matching is conservative, not semantic task-completion
inference; explicit agent_send messages are unchanged. The fingerprint is
persisted only after the report is durably queued.

Agent team no longer forces early context compaction or pauses report delivery
for its own compaction. Pi's native compaction settings and explicit `/compact`
remain in control. Model/thinking inheritance and worker concurrency are unchanged.

Existing Pi sessions need `/reload` to remove the old maintenance timer and load
full report delivery. Reload each worker separately for full result publication;
new workers load these changes automatically. Already truncated historical
reports cannot be reconstructed by this update; their source sessions remain.
Run `rtk proxy node --test economy.test.cjs reports.test.cjs dialogs.test.cjs test.cjs reload-rpc.test.cjs`.

## การสื่อสารกับผู้ใช้

ตัวหลักและตัวทำงานใช้คำสั่งร่วมจาก `communication.ts`: ตอบเป็นภาษาไทย
สรุปผลกระทบและขั้นตอนถัดไปแบบผู้จัดการผลิตภัณฑ์ ไม่ส่งรายงานดิบ
คำถามต้องมีชื่องาน เหตุผล ทางเลือกพร้อมผลกระทบ และคำแนะนำ
ตัวหลักหาข้อมูลจากรายงานหรือตัวทำงานก่อนถาม ไม่เดาข้อมูลหรือขออนุมัติซ้ำ
งานที่อนุมัติแล้วเดินหน้าต่อ ความคืบหน้าทั่วไปอยู่ในสถานะ
คำสั่งนี้กำกับการตอบของโมเดล ไม่ใช่ตัวตรวจภาษาแบบบังคับในโปรแกรม
ใช้ `/reload` ในแต่ละกระบวนการที่เปิดอยู่เพื่อโหลดคำสั่งใหม่

## เปิด–ปิดการแตกตัวทำงานอัตโนมัติ

- `/agents auto on` เปิดการมอบหมายงานอัตโนมัติ
- `/agents auto off` ให้ทำงานในบทสนทนานี้เอง แตกตัวทำงานเมื่อผู้ใช้สั่งชัดเจน (ค่าเริ่มต้น)
- `/agents auto status` ดูโหมดปัจจุบัน

บันทึกแยกตามบทสนทนาและคงอยู่หลังโหลดใหม่ มีผลกับคำสั่งของโมเดลในรอบถัดไป
ไม่หยุดตัวทำงานที่มีอยู่ ไม่เปลี่ยนโหมดของตัวอื่น และยังใช้ `/agents spawn` ได้
เป็นการกำกับพฤติกรรมผ่านคำสั่ง ไม่ใช่การปิดเครื่องมือแบบบังคับ
