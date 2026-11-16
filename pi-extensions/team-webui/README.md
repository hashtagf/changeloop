# Pi Workspace

One private web hub for all Pi projects, worktrees and sessions. Part of `@hashtagf/pi-extensions`: `index.ts` re-exports `extension.ts`, which loads into each Pi process. Commands below run from `pi-extensions/`.

## Open

After upgrading, run `/reload` once in each existing Pi session. New sessions register automatically. Run `/serve` once and open its invite link.

- `/serve`: start/reuse the workspace hub.
- `/serve --lan`: explicitly bind LAN/VPN interfaces.
- `/serve --port 4319`: use another port.
- `/serve status`: show the current link.
- `/serve stop`: stop the hub; Pi sessions keep running.
- CLI startup: `pi --serve [--serve-lan] [--serve-port 4318]`.

Default port is 4318. A default `/serve` also reuses an already running hub on another port. Changing LAN/local binding requires stopping the existing hub first.

The hub runs independently of its creator. Closing, switching or reloading one session does not close the website or restart the other sessions. Switching chats makes no model request and does not load a new agent context.

## Workspace

- Project → Main session → sub agents, including nested agents and children in other worktrees.
- Fixed project/creation order independent of activity and heartbeat timestamps; status updates preserve rows, focus and scroll.
- Collapse/expand agent families; the preference is saved in this browser. Search retains parent context.
- Saved/offline sessions are hidden by default; use Show saved to review history. Ancestors of live agents and the archived conversation currently being read remain visible. Idle connected agents stay available for follow-ups.
- Separate composer drafts and attachments per session.
- Live conversation, current tools, stop, follow-up queue or steering.
- Saved Pi history is discoverable across projects. Offline history is read-only; resume it in Pi and reload to connect.
- Files: browse, image/text preview, download, edit and save. Saves reject changes made on disk since opening the file.
- Git: status, staged/unstaged diff, stage/unstage, commit, branch creation/switching, worktree listing/creation/removal, recent commits.
- Worktree removal refuses primary/current/locked/dirty worktrees and any worktree with a connected session.
- Activity: tool results and shell execution history, with bounded output. Private model reasoning is excluded.
- Rich chat: GFM Markdown headings, lists, task lists, tables, quotes, links and
  fenced code with Copy. Mermaid diagrams render after streaming finishes, with
  source disclosure and an error fallback. Images can be expanded in a dialog.
- Tool, MCP, skill-file reads, shell and dispatched command cards appear in the
  conversation and Activity inspector. Expand a call for input/output and tool
  images. Live calls show running/completed/error/interrupted states; nested
  call parents and duration are shown when Pi supplies them. Saved tool calls
  are reconstructed from the selected session branch. Arbitrary calls inside a
  shell script are not invented as separate events; Pi must report them.
- Thinking blocks show presence/state only, never private reasoning text.
  Skill reads indicate loading instructions, not completion of a skill workflow.
  Command dispatch alone is not reported as successful completion.
- Tool details load on demand; summaries are bounded to 100 calls, text outputs
  to 32 KB, live retained call data to about 16 MB (individual image results may
  exceed that budget). Known credential fields in structured inputs are redacted.
  Tool output is available to authenticated workspace members, as are files/Git.
- Markdown HTML is sanitized with DOMPurify. Mermaid uses strict security and
  sanitized SVG image previews, with no interactive callbacks. Diagram code
  loads lazily from this hub; rendering uses no external service. External
  Markdown images load only on an explicit button click. Local image paths stay
  confined to the selected worktree. CSP permits inline diagram styling but not
  inline scripts or eval. Existing message DOM is reused across heartbeats.
- Background: a persistent button with running count opens the selected session's managed jobs. View live output, elapsed time and exit status, stop a job directly, download its log, or show finished history. Works for offline owners too; viewing and stopping require no model request. Unrelated shell/`nohup` processes are not adopted.

## Persistent task board

Choose **Tasks** in the workspace header. The columns are **Open → Plan → Design
→ Build → Verify → Review → PR → Merge → Tag → Deployed**. Select a project,
create a card, drag it to another stage, or open it to choose a status with the
keyboard. Search and status filters are available on desktop and mobile.

Each card keeps its description, owner session, next step, blocker, evidence and
change history. Tasks belong to the project, shared across its Git worktrees and
sessions. They remain accessible after their owner or every project session goes
offline. There is no delete or automatic expiry. Deployed cards remain available.
Boards paginate after 200 matching tasks; Next/Previous expose the remaining work.

SQLite transactions and version checks prevent two agents or browser windows from
silently overwriting each other. On conflict, the editor keeps the user's draft;
Reload latest explicitly discards it. Browser drafts survive reload in that tab.
Task records live in `~/.pi/agent/task-board/tasks.sqlite` (under
`PI_CODING_AGENT_DIR` when set, or `PI_TASKS_ROOT` for isolated fixtures).

Agents get a `task_board` tool (list/get/create/update/sync/link) and a bounded snapshot of
unfinished project work before each turn. Instructions require recording accepted
substantive work, updating next steps and blockers, and handing work off rather
than dropping it at session end. This requires model cooperation: ordinary prose
is not automatically converted into tasks. Existing conversations are not imported.

Use `/tasks` or **Ctrl+Alt+T** for a full-screen native Kanban in Pi. It uses the
same database as the web board and needs no web hub or model call. Narrow terminals
show fewer columns; all ten remain reachable with Left/Right or Tab/Shift+Tab.

- Up/Down selects a task; Enter opens its details; Esc returns to the board/chat.
- `n` creates a task; `e` edits its title, description, next step, blocker, evidence
  or assignment; `m` chooses a status; `h` shows change history.
- `/` searches; `[`/`]` page through large boards; `r` refreshes changes made by
  other sessions. There is no background polling when the board is closed.
- Edits use the same version/evidence checks as the web. A conflicting edit shows
  the latest value and the draft and requires an explicit choice before applying.
  Main editor drafts are preserved when the board closes.

`/tasks add <title>` also creates a task directly. Agents use `task_board`
(list/get/create/update/sync/link) in TUI and RPC sessions; they do not operate the keyboard
UI to manage tasks. Use `/serve` for the browser board.
Existing Pi sessions need `/reload` to load the new tool. An already running web
hub must be restarted (`/serve stop`, then `/serve`) to load new API routes;
this does not stop Pi sessions or background jobs.

Status records progress only. It does **not** perform Git or deployment actions
or provide permission for them. PR/Merge/Tag/Deployed require an evidence/reference
field; the application records that claim without independently verifying it.

### Handoff and dependency graph

Assign work to an existing session with **Hand off to selected session** in task
details, or TUI `a`. Save a concrete next step. This updates the shared card;
it does not spawn an agent, send a chat message, or require a callback. Tell the
recipient to check their inbox when you want them to start. Offline assignments
remain saved. Recipients record findings on the card instead of reporting back.

Agents use `task_board` actions `agents`, `handoff` (id, version, ownerSessionId,
nextStep), and `inbox`. Inbox includes assigned tasks across projects; pass the
returned `project` to `get`/`update`. Lists return compact summaries, 40 per page;
get retrieves full details. Turn context includes at most eight inbox entries.

Set dependencies in task details or TUI `d`. Each prerequisite specifies a task
and required milestone, e.g. “Design must reach Review before Build proceeds.”
The graph shows prerequisite → dependent layers and blocked/ready tasks. Web:
**Dependency graph**; TUI: `g`; agent: `task_board` action `graph`. Self-edges,
duplicates, cycles and cross-project edges are rejected transactionally. If a
prerequisite regresses, readiness recalculates. These are planning constraints;
they do not run tasks or grant Git/publication authority. Manual status changes
remain possible; agents must check readiness before dependent work.

### Change Loop records

The board imports local `.foundation/runtime/*.json` changes and
`.foundation/investigations/*.json` investigations automatically, with one card
per source record. TUI, web and agents share these cards. The read-only phase is
**Investigate → Change → Build → Prove → Land → Deliver** alongside the ten planning
columns. Change includes plan/design/implementation plan; Prove includes review
and verification. Applied/archived maps to Land, never merge/tag/deployed.
Only a verified local Deliver record with an open-PR receipt maps to PR.
This is a local snapshot, not fresh proof validation or a live GitHub check.

Sync occurs on task reads, agent turn start and TUI opening/refresh, cached for
five seconds per project. There is no new idle watcher. `/tasks sync`, TUI `r`, or
`task_board {"action":"sync"}` forces refresh. `task_board` with `action:"link"`,
`id` and `changeId` binds an existing manual card before import; if the source is
already imported, reuse that card. TUI Edit also offers Link Change Loop change.
Optional `recordKind:"investigation"` links investigations through the tool.

Unchanged records do not create duplicate cards, history or version updates.
Missing/corrupt sources retain their cards and show a source-unavailable warning.
Manual ownership and handoffs are preserved. Status follows the source while it
matches the previous projected status; manual stage choices remain planning
metadata (a source rollback resets to its earlier stage). No source files are
written and no Change Loop command is executed by syncing or moving a card.

Validation: `test/tasks.test.mjs`, `test/task-extension.test.mjs` and
`test/tasks-browser.py` cover persistence, project isolation, worktree handoff,
concurrent edits, authenticated APIs and the desktop/mobile board.
`test/task-panel.test.mjs` checks TUI navigation and mutations;
`rtk proxy python3 test/tasks-tui.py` exercises the installed Pi keyboard/renderer,
status movement, editing, main draft preservation and reload without a model call.

## Attachments

Drop files, paste images, or use the attach button. Up to 10 files per message, 20 MB each. PNG/JPEG/GIF/WebP images are sent as native Pi image blocks. Model image support still depends on the selected provider/model.

Other files remain available at their local attachment paths. UTF-8 text is included directly; PDF text uses local `pdftotext` (first 40 pages), and DOCX text uses local `unzip`. Extracted text is capped at 64,000 characters per file. Unsupported/binary formats use the original file and the session's tools. This is not OCR for scanned documents.

Attachments can be downloaded from chat. They expire after 24 hours; storage is bounded at 256 files / 1 GB per hub. Their local paths and extracted payloads are hidden from the visual message bubble.

## Extensions

Requests enter the existing Pi process through its extension API, preserving project hooks, guards, skills, tools, model and context. The Extensions tab lists that session's registered commands, skills and tools. Slash commands opt into Pi command/template expansion.

Standard extension select/confirm/input/editor dialogs can be answered on the web. Notifications, status text and text widgets are mirrored. Custom terminal components have a keyboard-driven text view.

Compatibility is not universal for terminal-specific UI: native editor replacements, extension keybindings, graphical terminal output, custom footer/widget components and commands explicitly restricted to TUI mode may still need the Pi terminal. No guards are bypassed to make a command work remotely. Local terminal interactions continue to use the terminal UI.

## Access

Localhost only by default. An invite grants access to all discovered projects, conversations, files, Git and registered commands; there are no separate viewer/editor roles. Use LAN mode only with trusted collaborators on a trusted LAN/VPN. The server uses HTTP rather than built-in TLS.

Invite tokens exchange for HttpOnly/SameSite cookies. Host/origin validation, authentication, bounded bodies, action limits, session-scoped attachment IDs and message retry receipts apply. File APIs confine paths to the selected worktree, reject symlink escapes and hide secret/configuration paths such as `.env`, private keys, `.ssh` and `.git`.

Private registry files and uploads live under `~/.pi/agent/web-ui` (or `PI_CODING_AGENT_DIR/web-ui`) with owner-only permissions. Never copy the hub metadata or invite links into public reports.

## Structure

- `extension.ts` — Pi lifecycle and /serve.
- `bridge.ts`, `extension-ui.ts` — native message/activity projection and extension UI.
- `registry.ts`, `history.ts` — connected processes and saved sessions.
- `hub.ts`, `server.ts` — shared routing, authentication and transport.
- `workspace.ts`, `attachments.ts` — filesystem/Git and document extraction.
- `jobs.ts` — session-scoped access to the existing background job manager.
- `web/` — responsive client; optional 3D City lazy-loads vendored Three.js 0.187.0 (MIT).

Runtime modules use `.ts` so Pi reloads the complete extension dependency graph; native `.mjs` imports can retain stale module instances across `/reload`. Node 22.19 or newer is required.

No server-side third-party runtime dependencies. Three.js is served locally for the optional City view (license in `web/vendor/THREE-LICENSE.txt`).
Marked, DOMPurify and Mermaid browser bundles are served locally too; versions
are pinned in package-lock.json and listed in `web/vendor/RENDERERS.txt`.
Run `npm run build:renderers` after changing their devDependencies. License
notices are embedded in the bundles. `test/rich-browser.py <preview-url>` tests
the rich renderer; start its fixture with `PI_PREVIEW_RICH=1`.
Renderer configuration follows [Marked's sanitization guidance](https://marked.js.org/)
and [Mermaid's strict security mode](https://mermaid.js.org/config/usage).

## Verify

`npm test` runs security, workspace, bridge and real Pi integration tests without model calls. Git writes occur only in temporary repositories.

For browser checks, start `PI_CODING_AGENT_DIR=/tmp/pi-web-preview node team-webui/test/preview.mjs`, then use Python Playwright to run `team-webui/test/browser-smoke.py <preview-url>`. The script uses the locally installed Chrome executable. Start a fresh fixture for each run. Screenshots and evidence are written to `team-webui/reports/`, which is not committed.

`test/background-browser.py <preview-url>` checks the Background interface on desktop and mobile, including an actual fixture process stop and session isolation. Start a fresh preview fixture for this check too.

## 3D City

Choose **Chat / 3D City** in the header. The enlarged city supports 64 visible
agents and ten Kanban districts. The latest active task assigned to a session
determines its district (a deployed task is used when no active task exists).
Assignments refresh every five seconds while City is visible. Session presence
still controls whether the agent is working, resting or offline. No assigned
task means a general-work Build district for busy sessions, or the park for idle
sessions; offline agents stay at the station. Blocker text stops decorative work.

| Status | District | Decorative activity |
|---|---|---|
| open | Intake | Read a brief |
| plan | Planning | Point at a plan |
| design | Design | Sketch |
| build | Build | Type on a device |
| verify | Test Lab | Inspect equipment |
| review | Review | Read findings |
| pr | PR Exchange | Hand over documents |
| merge | Integration | Assemble parts |
| tag | Release | Pack a release |
| deployed | Operations | Scan monitors |

Agents walk through avenues on status changes, with staggered local wandering,
limb motion and idle breathing. Movement and props are illustrations, not proof
of progress; City never runs tools or changes tasks. Initial assignment loading
places agents directly in their actual districts. Click a district or roster
entry to focus the camera, then Open chat. Drafts stay with each session.

Drag to rotate, or use the camera buttons. Pause motion and reduced-motion preferences are supported. Rendering stops while City or the browser tab is hidden. A lost connection freezes movement and labels the data stale. Browsers without WebGL can continue using Chat. At most 64 citizens are drawn; the roster retains all matching sessions.

Static geometry and all character limbs use instanced meshes. Animation targets
at most 30 fps on desktop and 20 fps on mobile, with pixel ratio capped at 1.5;
these are limits, not performance guarantees. The 64-session Chrome fixture
measured 56 draw calls per frame. `PI_PREVIEW_CITY64=1` enables that fixture;
`test/city64-browser.py` checks assignments, stage changes, animation, pause,
hidden-view suspension, focus controls and mobile layout without model calls.

## Tool selection and task CRUD

`tool_guide` provides on-demand guides for tasks, questions, agents, shell,
research, cloud and workflow. The short routing index is included at turn start;
full guides are read only when needed. Each guide covers when/why/how, example
inputs, result verification and failure handling. Examples do not run commands.

`task_board` supports create, list/get, update, delete and restore. Delete moves
a card to recoverable trash, preserving its ID, stable creation key and history.
Delete/restore require the current `version`; stale changes are rejected.
`list` with `deleted:true` returns only trash. Deleted tasks are excluded from
normal lists, inboxes, dependency graphs and City assignments. Change Loop sync
keeps tombstones rather than recreating deleted cards. Creating with a deleted
card's key returns that existing card; restore it deliberately to resume.

An active dependent prevents deletion of its prerequisite. Remove/redirect the
dependency deliberately first, or delete the dependent as part of authorized
cleanup. Restore prerequisites before dependents. There is no permanent purge
or implicit bulk deletion. Deletion never removes Change Loop source files.

Web: open task details → Move to trash; Trash → task → Restore task.
TUI: `/tasks`, `x` deletes/restores the selected card, `t` switches board/trash.
Deletion is confirmed in the UI. Agents may delete only for user-directed cleanup,
never to conceal unfinished work. All surfaces share the same SQLite store.
Existing Pi sessions need `/reload` to load the new tool schemas and guide.

## Context budget

The task startup snapshot contains counts and at most three assignments for the
current session, prioritizing the current project. It never includes another
session's card text. JSON is capped at 2,800 characters including bounded sync
warnings; moreAssigned/moreWarnings disclose omitted entries. Full details stay
available through task_board. No tasks or pending questions are discarded.

The agent tool's list/inbox/agents actions default to 20 items (limit 1–40), with
offset/nextOffset pagination. agents defaults to online sessions; includeInactive
also discovers offline sessions. The Web/TUI board pagination is unchanged.

Global Pi instructions retain essential rules and routing. Detailed AWS profiles,
cloud/research procedures and agent communication policy live in
~/.pi/agent/reference/tool-workflows.md and agent-workflow.md, read on demand.
Existing sessions need /reload; existing conversation history is not rewritten.
Character counts in reports/context-economy.json measure only the changed prompt
sections, not provider token counts, cache billing or total conversation size.
