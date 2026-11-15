# Background bash for Pi

Installed globally; run `/reload` in existing Pi sessions.

Background polling caches completed jobs and watches metadata changes. Every
1.5 seconds it refreshes active jobs; a 30-second reconciliation catches missed
directory events. Unsupported watchers fall back to metadata checks. Output log
writes do not invalidate job metadata. The closed panel redraws only when job
status changes, and reload/shutdown closes its watcher. Agent idle retirement
uses the same cache, with a fresh job scan before retirement.

Regression fixture: 1,000 completed jobs and one running job over five polls
required 10 JSON reads instead of 10,010. Run `monitor.test.cjs` with Node's test
runner to check caching, completion, promotion, receipts and discovery.

When a user-entered `!command` finishes, Pi automatically receives a follow-up to
continue the existing task from the saved result. Fast successive completions
are batched. This observes native history, so project-owned bash/guards still
work. It does not replay history on reload or resume after cancelled commands
or private `!!commands`. No extra timer or shell wrapper is installed.

All `bash` tool calls and user `!` / `!!` commands wait up to **10 seconds**,
then automatically return a background job ID. **Ctrl+B** sends waiting commands
to background immediately. This continues the same process, without restarting.
Short commands return output and exit code normally. Explicit timeouts still
terminate jobs even after backgrounding. Escape/abort stops a foreground command;
after backgrounding use `/jobs stop <id>`. Ctrl+B replaces the editor's default
move-left binding; the left arrow still works.

Compatibility: the bash wrapper registers after extensions load, and only when
the existing `bash` is Pi's built-in tool. If a project adapter such as Change
Loop owns `bash`, that adapter keeps control, including its environment and
workflow checks; automatic 10-second backgrounding/Ctrl+B do not wrap that
project's bash. Delegate long project tasks to agent workers so the main chat
stays available. Explicit background tools and existing job logs remain available.

- `background_bash`: command, optional cwd, timeoutSeconds, notify. The response
  contains a short command preview and job metadata, not the complete command.
- `background_job`: action list/status/log/stop, id. List defaults to active jobs,
  20 per page (max 50); includeFinished includes history and nextOffset supplies
  the next offset. Status never includes output. Log defaults to an 8 KiB tail
  (maxBytes up to 32 KiB); start at byteOffset 0 and follow nextByteOffset to read
  an entire log in chunks. Optional lines narrows output within that byte window.
  The full file remains available at logPath. Explicitly reading terminal status
  or log acknowledges its notification, preventing a redundant automatic wakeup.
- `/jobs`: list this session's jobs.
- `/jobs log <id>`: recent output.
- `/jobs stop <id>`: request termination of the command's process group,
  escalating from TERM to KILL after one second.

## TUI access

The Background bar stays below the editor. **Ctrl+B** detaches waiting commands;
when none are waiting it opens the jobs panel. **Ctrl+Alt+B** always opens it.
`/jobs` and `/jobs log <id>` also open the panel in TUI mode.

Use **↑/↓** to select, **Enter** for live output, **Ctrl+X** to stop the selected
job, **Ctrl+O** to show finished history, and **Esc** to go back. Type to filter
the list; PgUp/PgDn scroll output and End follows the tail. Returning preserves
the main editor draft. Jobs belong to the current Pi session; finished jobs are
hidden by default. Opening, reading and stopping jobs makes no model request.

The Web UI's **Background** button provides the same session-scoped list, live
output, stop, history and log download, including jobs whose Pi owner is offline.
Only managed jobs are tracked; unrelated `nohup` or shell processes are not adopted.

`background_bash` remains available to skip the initial 10-second wait.
Calls launched before this extension was reloaded cannot be adopted.

Completions are grouped while Pi is idle with no queued messages: 5 seconds of
collection, at most 30 seconds from the first pending completion, and at most one
normal wakeup per 30 seconds. Failures/timeouts/interrupted jobs take priority
and bypass collection, with a 5-second wakeup cooldown. A batch contains at most
20 outcomes and short output previews; remaining outcomes stay pending. Receipts
and cooldown persist across reload. Busy conversations postpone delivery.

Omitting notify uses automatic reporting: successful bare sleep commands and
intentional stops are recorded without waking the model. Commands that run checks
or shell chains are never inferred to be timers. Set notify:true explicitly for
a timer that must resume an agent. Existing jobs without this policy retain their
promised notifications. Set notify:false for persistent servers. Jobs survive reload and Pi exit; resume the same session
to inspect them. Quitting Pi does **not** stop jobs. Logs and command metadata stay
under `~/.pi/agent/background-jobs/`, scoped by session. No automatic deletion.
Logs combine stdout/stderr and are capped at 10 MiB; model log readback defaults
to 8 KiB (32 KiB maximum). The native interactive jobs panel is unchanged.

Commands use `/bin/bash -c`, inherit the environment, and have no interactive
stdin or PTY. Commands that deliberately daemonize into a new process group
cannot be stopped by the group termination mechanism. No tmux dependency.

Verification: `rtk proxy node --test ~/.pi/agent/extensions/background-bash/test.cjs ~/.pi/agent/extensions/background-bash/panel.test.cjs`.
The real terminal integration smoke is `rtk proxy python3 test/tui-smoke.py` from this directory.
