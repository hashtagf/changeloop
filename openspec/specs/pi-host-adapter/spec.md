# pi-host-adapter Specification

## Purpose
Let Pi worker sessions take part in Change Loop Build: worker guards inherit the parent session's phase through FOUNDATION_PARENT_SESSION_ID without inheriting Land or Deliver authority, and the maintainer agent-team extension propagates that identity, dispatches leased Change Loop tasks, offers model-tier roles, and caps active workers by configuration and foundation.json maxParallelAgents.
## Requirements
### Requirement: worker-phase-inheritance

When the Pi process environment has FOUNDATION_PARENT_SESSION_ID set to a session identifier, the Pi adapter SHALL resolve the recorded phase for Write, Edit and Bash guards through that parent session, so a worker may write inside the parent's active Build workspace and a worker write to the main checkout SHALL be redirected into that workspace with a note.

#### Scenario: Worker writes in the parent's workspace

- **WHEN** the parent session is in Build and a worker session with FOUNDATION_PARENT_SESSION_ID equal to the parent writes a file inside the change workspace
- **THEN** the write is allowed

#### Scenario: Worker stays out of the main checkout

- **WHEN** the same worker writes a file in the main project checkout
- **THEN** the write goes to the same path inside the parent's workspace and the result names the redirect

#### Scenario: Unrelated session gains nothing

- **WHEN** a session without FOUNDATION_PARENT_SESSION_ID writes inside another session's Build workspace
- **THEN** the write runs at its own path without a redirect and the other session's phase is not used

### Requirement: worker-no-land

A Pi session started with FOUNDATION_PARENT_SESSION_ID SHALL NOT turn the /land and /deliver commands or natural Land consent into instructions, and its guards SHALL warn instead of blocking advance --through archived and Deliver primitives.

#### Scenario: Worker cannot land

- **WHEN** a worker session runs /land for a proven change and then advance --through archived
- **THEN** no Land instruction is sent and the advance result carries the Land warning

### Requirement: build-shell-cwd

While the session, or its coordinating parent, has a recorded Build phase with an existing workspace, the Pi adapter SHALL start every agent bash call and its guard check in that workspace; otherwise it SHALL keep the session cwd.

- The user's own ! and !! shell commands keep the session cwd.
- Investigate, Change, Prove, Land and Deliver are unchanged.
- The agent prompt states that Build shell calls start in the workspace and must not cd to the project root to write files.

#### Scenario: Relative write lands in the workspace

- **WHEN** the session is in Build and the agent runs a bash call that writes src/a.js by a relative path
- **THEN** the file is created in the change workspace and the main checkout is unchanged

#### Scenario: Outside Build nothing moves

- **WHEN** the session has no recorded Build phase and the agent runs bash
- **THEN** the call starts in the session cwd

#### Scenario: Worker inherits the coordinator's workspace

- **WHEN** a worker session started with FOUNDATION_PARENT_SESSION_ID runs bash while the parent is in Build
- **THEN** the call starts in the parent's change workspace

### Requirement: guard-warning-visible

When a guard returns additional context for an agent tool call, the Pi adapter SHALL append that text to the tool's result.

#### Scenario: Shell write outside the workspace is reported

- **WHEN** in Build the agent runs a bash call that cds to the project root and redirects into src/a.js
- **THEN** the tool result contains the phase guard's unverified shell mutation warning

### Requirement: archive-word-not-land

The Pi adapter SHALL treat a bash command as a Land operation only when a Change Loop CLI invocation (claude-foundation or foundation.mjs) runs a Land subcommand or advance --through archived.

#### Scenario: Git on an archived change path runs

- **WHEN** the agent runs git add openspec/changes/archive/2026-11-16-x/tasks.md without Land authority
- **THEN** the Pi adapter attaches no Land warning to it

#### Scenario: CLI archive still needs Land

- **WHEN** the agent runs node .claude/harness/foundation.mjs archive pi-case or claude-foundation sandbox apply pi-case without Land authority
- **THEN** the result carries the Land warning and the call is not blocked

### Requirement: natural-land-consent-variants

The Pi adapter SHALL treat short typed affirmatives such as 'land ได้', 'land เลย', 'land ได้ครับ', 'ลง land ได้', and 'go ahead and land' as Land consent, and SHALL NOT treat questions or refusals such as 'land ได้ไหม', 'land ได้ยัง', 'land?', 'อย่า land', 'ยังไม่ต้อง land', or "don't land" as consent.

#### Scenario: Short affirmative grants consent

- **WHEN** the user types 'land ได้' in the Pi session
- **THEN** it is recognized as Land consent

#### Scenario: Question is not consent

- **WHEN** the user types 'land ได้ไหม' or 'land ได้ยัง'
- **THEN** it is not recognized as Land consent

#### Scenario: Refusal is not consent

- **WHEN** the user types 'ยังไม่ต้อง land' or "don't land"
- **THEN** it is not recognized as Land consent

### Requirement: host-pi-runtime

claude-foundation host pi-runtime --protocol 1 --format json SHALL install the CLI's own package as the current shared Pi bundle in the Pi agent directory and SHALL print protocol-1 JSON with foundationVersion, bundle and path.

- The agent directory is --agent-dir, else PI_CODING_AGENT_DIR, else ~/.pi/agent.
- Installing the same package twice yields the same bundle and changes nothing else.
- It refuses a user-owned global changeloop.ts as installSharedPi already does.

#### Scenario: Endpoint installs and reports

- **WHEN** host pi-runtime runs against an empty agent directory
- **THEN** the JSON names this package's runtime version and a bundle that installation.json lists as current

### Requirement: loader-syncs

At load, the shared Pi loader SHALL compare the machine CLI version with Pi's current bundle and, when they differ, run that CLI's host pi-runtime endpoint before choosing a runtime.

- The machine CLI is CHANGELOOP_MACHINE_CLI when set (none disables the check), else cloop on PATH, else claude-foundation on PATH.
- A CLI inside a Pi runtime bundle is ignored.
- If the CLI is missing, fails or times out, the loader keeps the existing bundle and shows a warning; it does not fail closed for that reason.

#### Scenario: Upgrade is picked up

- **WHEN** Pi's current bundle is from an older version and the machine CLI reports a newer one
- **THEN** after the loader runs, installation.json names a bundle of the machine version

#### Scenario: Same version starts without reinstalling

- **WHEN** the machine CLI reports the same version as Pi's current bundle
- **THEN** host pi-runtime is not run

#### Scenario: Broken CLI keeps the old bundle

- **WHEN** the machine CLI exits with an error
- **THEN** Pi keeps the existing current bundle and the loader reports a warning

### Requirement: project-follow

A .changeloop.json with follow set to machine SHALL resolve to Pi's current bundle in the loader and in CLI runtime resolution, and /changeloop init SHALL write that form for a new project.

- A pinned marker (bundle, runtime, runtimeApi) keeps resolving to exactly that bundle.
- /changeloop follow rewrites the marker to follow the machine version; /changeloop pin pins the current bundle.
- An existing marker is never rewritten by init.

#### Scenario: Follow resolves to current

- **WHEN** a project's .changeloop.json is {version 1, host pi, installation shared, follow machine}
- **THEN** the CLI resolve command prints the path of Pi's current bundle

#### Scenario: Pinned stays pinned

- **WHEN** a project pins bundle A and Pi's current bundle is B
- **THEN** the project still resolves to bundle A

#### Scenario: Switch modes

- **WHEN** /changeloop pin then /changeloop follow run in a trusted project
- **THEN** the marker first names the current bundle, then contains follow machine and no bundle

### Requirement: docs

The harness README Pi adapter section and the changelog SHALL describe machine-version following, the follow and pin modes, and host pi-runtime.

#### Scenario: Documented

- **WHEN** a maintainer reads the Pi adapter section and the Unreleased changelog
- **THEN** both name host pi-runtime and the follow machine mode

### Requirement: bootstrap-commands

In a folder without Change Loop settings, the shared Pi loader SHALL register change, investigate, dev and feature commands that, in a trusted project, create follow-machine settings at the project root, reload Pi, and then run the same command with the same arguments once.

- The project root is the nearest Git root, else the current folder.
- The pending command is handed to the reloaded loader through a file in the Pi agent directory, bound to that project root and consumed once within two minutes.

#### Scenario: First /change in a fresh repository

- **WHEN** a trusted Git repository without settings runs /change add a feature
- **THEN** .changeloop.json follows the machine version at the Git root, Pi reloads, and /change add a feature is sent once after the reload

#### Scenario: Stale or foreign hand-off is ignored

- **WHEN** a pending command is older than two minutes or names another project root
- **THEN** no command is sent and the pending file is removed

### Requirement: bootstrap-refusals

The bootstrap commands SHALL refuse without writing when the project is untrusted, has a local Change Loop installation, or resolves to the home directory or filesystem root.

- A folder with a local runtime (.claude/harness/foundation.mjs at its project root) gets no bootstrap commands, so its own adapter keeps owning those names.

#### Scenario: Untrusted folder

- **WHEN** an untrusted repository runs /change
- **THEN** no file is written and the user is told to trust the project

#### Scenario: Home directory

- **WHEN** /change runs in the home directory with no Git root
- **THEN** no file is written and the user is told to open a project folder

#### Scenario: Local installation

- **WHEN** Pi opens a project that has .claude/harness/foundation.mjs
- **THEN** the shared loader registers no change command there

### Requirement: no-write-on-open

Loading Pi in a folder without settings SHALL NOT create .changeloop.json, foundation.json, openspec or .foundation.

#### Scenario: Just opened

- **WHEN** Pi loads and starts a session in a fresh repository
- **THEN** the repository contains no new Change Loop files

### Requirement: first-use-docs

The harness README Pi adapter section and the changelog SHALL describe first-use setup and its refusals.

#### Scenario: Documented

- **WHEN** a maintainer reads the Pi adapter section and the Unreleased changelog
- **THEN** both describe that the first /change in a trusted repository sets it up

### Requirement: natural-investigate-routing

Pi adapter SHALL ส่งข้อความ interactive ที่ขึ้นต้นด้วย investigate หรือ ช่วย investigate และมีหัวข้อตามมา เข้า workflow เดียวกับ /investigate โดยใช้หัวข้อเป็นอาร์กิวเมนต์

- ข้อความจาก extension, rpc หรือ worker ไม่ถูกส่งต่อ
- investigate ที่ไม่มีหัวข้อ หรือคำว่า investigate กลางประโยค ไม่ถูกส่งต่อ

#### Scenario: Investigate ภาษาธรรมดาเข้า workflow

- **GIVEN** Pi session ที่ Change Loop พร้อมใช้งาน
- **WHEN** ผู้ใช้พิมพ์ investigate ทำไม build ช้า
- **THEN** ข้อความถูกแทนด้วยคำสั่ง investigate ของ Change Loop ที่มีหัวข้อ ทำไม build ช้า
- **AND** shell ของ agent ทำงานใน phase investigate

#### Scenario: ไม่ใช่คำขอ investigate

- **WHEN** ผู้ใช้พิมพ์ investigate เปล่า ๆ หรือ ควร investigate ไหม
- **THEN** ข้อความผ่านไปตามปกติโดยไม่ถูกแทน

#### Scenario: ข้อความที่ไม่ได้มาจากผู้ใช้

- **WHEN** extension หรือ rpc ส่งข้อความ investigate ทำไม build ช้า
- **THEN** ข้อความไม่ถูกแทน

### Requirement: natural-deliver-consent

Pi adapter SHALL ถือว่าข้อความ interactive ทั้งประโยคที่เป็นคำขอ deliver หรือเปิด PR แบบยืนยัน เท่ากับ /deliver ของ change สถานะ proven, applied หรือ archived ที่ผูกกับ session นี้

- รูปแบบที่รับ: deliver, deliver ได้เลย, deliver <change-id>, เปิด PR ให้เลย, เปิด PR ได้เลย, open a PR, open a pull request พร้อมคำลงท้าย ครับ ค่ะ นะ please ได้
- คำถาม คำปฏิเสธ ข้อความที่มีคำอื่นต่อท้าย และข้อความจาก extension, rpc หรือ worker ไม่นับ
- มี change เดียวเลือกให้เอง หลาย change ให้ผู้ใช้เลือก ไม่มีเลยแจ้งเตือนและไม่ให้สิทธิ์
- สิทธิ์ที่ได้ผูกกับ change นั้นใน session นี้ และหายเมื่อมีข้อความใหม่หรือ reload เหมือน /deliver

#### Scenario: เปิด PR ให้เลย เลือก change ของ session

- **GIVEN** session มี change สถานะ archived หนึ่งรายการ
- **WHEN** ผู้ใช้พิมพ์ เปิด PR ให้เลย
- **THEN** ข้อความถูกแทนด้วยคำสั่ง deliver ของ change นั้น
- **AND** deliver advance ของ change นั้นไม่ถูกบล็อก ส่วน change อื่นยังถูกบล็อก

#### Scenario: คำถามหรือคำปฏิเสธไม่ใช่คำสั่ง

- **WHEN** ผู้ใช้พิมพ์ เปิด PR ได้ไหม หรือ อย่าเพิ่ง deliver
- **THEN** ข้อความไม่ถูกแทนและ deliver advance ยังถูกบล็อก

#### Scenario: ไม่มี change ใน session

- **GIVEN** session ไม่มี change ที่ proven, applied หรือ archived
- **WHEN** ผู้ใช้พิมพ์ deliver ได้เลย
- **THEN** Pi แจ้งว่าไม่มี change ที่พร้อม deliver และไม่ให้สิทธิ์

#### Scenario: Worker ส่งต่อไม่ได้

- **GIVEN** Pi session เป็น worker ของ session อื่น
- **WHEN** ผู้ใช้พิมพ์ เปิด PR ให้เลย
- **THEN** Pi ปฏิเสธด้วยข้อความว่า worker deliver ไม่ได้

#### Scenario: /deliver ไม่ใส่ change-id

- **GIVEN** session มี change ที่พร้อม deliver หนึ่งรายการ
- **WHEN** ผู้ใช้พิมพ์ /deliver
- **THEN** Pi เลือก change นั้นและส่งคำสั่ง deliver ของ change นั้น

### Requirement: natural-intent-docs

ส่วน Pi ใน WORKFLOW.md, harness README และ changelog SHALL อธิบายการส่ง investigate และ deliver แบบภาษาธรรมดา

#### Scenario: เอกสารครบ

- **WHEN** maintainer อ่านส่วน Pi ใน WORKFLOW.md, harness README และ Unreleased changelog
- **THEN** ทั้งสามที่ระบุ investigate ภาษาธรรมดาและ เปิด PR ให้เลย

### Requirement: background-bash-guarded

Pi adapter SHALL ตรวจคำสั่งของ tool background_bash ด้วย guard ชุดเดียวกับ bash ก่อนเริ่มงาน

- guard ที่ใช้: protect-secrets, phase-mutation-guard, shell-route-guard, no-detached-authority และคำเตือน Land/Deliver ของ adapter
- คำสั่ง authority run ผ่าน background_bash รันต่อพร้อมคำเตือนให้รันแบบ foreground
- ถ้า guard ใช้ไม่ได้ (startup ล้มเหลว) background_bash ถูกปฏิเสธเหมือน bash

#### Scenario: อ่านไฟล์ลับถูกกัน

- **GIVEN** โปรเจกต์มีไฟล์ .env
- **WHEN** เอเจนต์เรียก background_bash ด้วยคำสั่ง cat .env
- **THEN** คำสั่งถูกเขียนใหม่ให้อ่านสำเนาที่ปิดค่าลับ หรือถูกปฏิเสธ และค่าลับเดิมไม่ปรากฏ

#### Scenario: Land โดยไม่ได้รับสิทธิ์ถูกปฏิเสธ

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop advance <id> --through archived โดยผู้ใช้ไม่ได้สั่ง Land
- **THEN** การเรียกถูกบล็อกพร้อมข้อความว่าต้องได้สิทธิ์ Land

#### Scenario: authority run แบบ background ถูกปฏิเสธ

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop authority run <id>
- **THEN** การเรียกถูกบล็อกพร้อมบอกให้รันใน bash แบบ foreground

#### Scenario: เขียนนอก workspace ตอน Build ถูกกัน

- **GIVEN** session อยู่ใน Build
- **WHEN** background_bash เขียนไฟล์ลง main checkout ด้วย path เต็ม
- **THEN** phase guard ปฏิเสธหรือแนบคำเตือนเหมือนกับ bash

#### Scenario: Build เริ่มใน workspace

- **GIVEN** session อยู่ใน Build และไม่ได้ระบุ cwd
- **WHEN** เอเจนต์เรียก background_bash
- **THEN** input.cwd ถูกตั้งเป็น workspace ของงาน และคำสั่งปกติได้รันต่อ

#### Scenario: guard ใช้ไม่ได้ปิดตาย

- **GIVEN** startup ของ Change Loop ล้มเหลว
- **WHEN** เอเจนต์เรียก background_bash
- **THEN** การเรียกถูกบล็อกพร้อมข้อความว่า guard ใช้ไม่ได้

#### Scenario: Land โดยไม่ได้รับสิทธิ์ได้คำเตือน

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop advance <id> --through archived โดยผู้ใช้ไม่ได้สั่ง Land
- **THEN** การเรียกรันต่อและผลมีคำเตือนเรื่อง Land

#### Scenario: authority run แบบ background ได้คำเตือน

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop authority run <id>
- **THEN** การเรียกรันต่อและผลเตือนให้รันใน bash แบบ foreground

#### Scenario: เขียนนอก workspace ตอน Build ได้คำเตือน

- **GIVEN** session อยู่ใน Build
- **WHEN** background_bash เขียนไฟล์ลง main checkout ด้วย path เต็ม
- **THEN** phase guard แนบคำเตือนเหมือนกับ bash และไม่บล็อก

### Requirement: detached-authority-bash

Pi adapter SHALL รัน no-detached-authority กับทุกคำสั่ง bash ของเอเจนต์และ !/!! ของผู้ใช้

#### Scenario: authority run แบบ detach ถูกปฏิเสธ

- **WHEN** เอเจนต์รัน bash: cloop authority run demo &
- **THEN** การเรียกถูกบล็อกพร้อมบอกให้รันแบบ foreground

#### Scenario: authority run ปกติผ่าน

- **WHEN** เอเจนต์รัน bash: cloop authority run demo --help โดยไม่ detach
- **THEN** no-detached-authority ไม่บล็อกคำสั่ง

#### Scenario: authority run แบบ detach ถูกรันแบบ foreground

- **WHEN** เอเจนต์รัน bash: cloop authority run demo &
- **THEN** คำสั่งถูกเขียนใหม่ให้รันแบบ foreground และผลบอกเหตุผล

### Requirement: unknown-tool-warning

Pi adapter SHALL แนบคำเตือนครั้งเดียวต่อชื่อ tool ต่อ session เมื่อ tool ที่อยู่นอกขอบเขต guard ถูกใช้ระหว่างงานที่มี phase คุมอยู่

- งานที่มี phase คุมคือ session (หรือ parent) มี Build workspace ที่บันทึกไว้ หรือคำสั่งปัจจุบันเป็น investigate
- ไม่เตือน tool ในตัวที่ guard ดักอยู่, ls/find, background_bash และ tool ประสานงานที่ไม่แก้ไฟล์: ask_user, agent_list, agent_inbox, agent_send, agent_stop, agent_spawn, background_job, task_board, tool_guide, session_title
- คำเตือนต่อท้ายผลของ tool และไม่ทำให้ผลเป็น error

#### Scenario: MCP ระหว่าง Build ได้คำเตือน

- **GIVEN** session อยู่ใน Build
- **WHEN** เอเจนต์เรียก tool ชื่อ exa_search สองครั้ง
- **THEN** ผลครั้งแรกมีคำเตือนว่าอยู่นอก live guard
- **AND** ผลครั้งที่สองไม่มีคำเตือนซ้ำ
- **AND** ทั้งสองครั้งไม่ถูกบล็อก

#### Scenario: นอกงานไม่เตือน

- **GIVEN** session ไม่มี phase ที่บันทึกไว้
- **WHEN** เอเจนต์เรียก exa_search
- **THEN** ผลไม่มีคำเตือน

#### Scenario: tool ประสานงานไม่เตือน

- **GIVEN** session อยู่ใน Build
- **WHEN** เอเจนต์เรียก task_board
- **THEN** ผลไม่มีคำเตือน

### Requirement: session-digest

Pi adapter SHALL ส่งสรุปสถานะงานจาก session-context ให้เอเจนต์ในรอบแรกหลังเริ่ม session และหลัง compact

- แนบเป็นข้อความที่ซ่อนจากผู้ใช้ผ่าน before_agent_start ครั้งเดียวต่อ digest
- digest ล้มเหลวหรือว่างไม่บล็อก session

#### Scenario: เริ่ม session ได้ digest

- **GIVEN** มีงาน active หนึ่งงาน
- **WHEN** session เริ่มและเอเจนต์เริ่มรอบแรก
- **THEN** รอบนั้นได้ข้อความที่มีชื่องานและ next
- **AND** รอบถัดไปไม่ได้ข้อความซ้ำ

#### Scenario: หลัง compact ได้ digest ใหม่

- **WHEN** session ถูก compact แล้วเอเจนต์เริ่มรอบใหม่
- **THEN** รอบนั้นได้ digest อีกครั้ง

#### Scenario: digest ล้มเหลวไม่บล็อก

- **GIVEN** hook session-context ล้มเหลว
- **WHEN** session เริ่ม
- **THEN** Change Loop ยังพร้อมใช้และไม่มีข้อความ digest

### Requirement: dev-terminal-warning

Pi adapter SHALL ประเมินสถานะปลายทางของ /dev เมื่อเอเจนต์หยุดทำงาน และ SHALL เตือนผู้ใช้เมื่อหยุดก่อน proof ผ่านโดยไม่มีเหตุที่หยุดได้

- ใช้ตรรกะ evaluateDevTerminal เดียวกับ hook ของ Claude Code และบันทึก verdict ลง .foundation/logs/dev-terminal
- ประเมินที่ agent_settled ที่ไม่ได้ถูก abort และเฉพาะเมื่อคำสั่งปัจจุบันคือ /dev
- เป็นคำเตือนเท่านั้น ไม่สั่งให้เอเจนต์ทำต่อ

#### Scenario: หยุดก่อน proof ผ่านได้คำเตือน

- **GIVEN** /dev มีงาน active หนึ่งงานที่ยังไม่มี proof ผ่าน
- **WHEN** เอเจนต์หยุดทำงาน
- **THEN** ผู้ใช้ได้คำเตือนที่ระบุ proof-not-passing และทางไปต่อ

#### Scenario: คำสั่งอื่นไม่ถูกประเมิน

- **GIVEN** คำสั่งปัจจุบันไม่ใช่ /dev
- **WHEN** เอเจนต์หยุดทำงาน
- **THEN** ไม่มีคำเตือนและไม่มี verdict ใหม่

#### Scenario: plan-only ไม่เตือน

- **GIVEN** /dev --plan-only
- **WHEN** เอเจนต์หยุดทำงาน
- **THEN** ไม่มีคำเตือน

### Requirement: capability-truth

ตาราง capabilities และเอกสารของ Pi SHALL ระบุ sessionDigest เป็น live และ coverage เป็น partial พร้อมอธิบายว่า background_bash อยู่ในขอบเขตแต่ tool อื่นที่ไม่รู้จักได้แค่คำเตือน

#### Scenario: ตารางตรงกับเอกสาร

- **WHEN** รัน doc consistency check
- **THEN** แถว Pi ในตาราง capabilities รายงาน coverage partial และ session digest live
- **AND** hooks README แสดงค่าเดียวกัน

#### Scenario: prompt ไม่อ้างเกินจริง

- **WHEN** อ่าน system prompt ที่ adapter เพิ่ม
- **THEN** ข้อความบอกว่า tool ที่ไม่รู้จักอยู่นอก live guard และไม่อ้าง OS sandbox

### Requirement: pi-advisory-mode

Pi adapter SHALL รัน guard ในโหมด auto เว้นแต่ผู้ใช้ตั้ง FOUNDATION_GUARDRAIL_MODE ไว้ และ SHALL แนบคำเตือนแทนการบล็อก Land, Deliver และ authority run ผ่าน background_bash

- advance --through archived หรือคำสั่งย่อยของ Land ที่ไม่มีคำอนุมัติในเทิร์นนั้นรันต่อพร้อมคำเตือนว่า Land ควรทำเมื่อผู้ใช้สั่ง
- deliver advance หรือ delivery-advance ที่ไม่มี /deliver รันต่อพร้อมคำเตือน
- authority run ผ่าน background_bash รันต่อพร้อมคำเตือนว่า reviewer ควรรันแบบ foreground
- การแก้ไฟล์โดยไม่มีงานที่เปิดอยู่รันต่อโดยไม่ถูกปฏิเสธ

#### Scenario: Land โดยไม่มีคำอนุมัติรันต่อ

- **GIVEN** มีงาน proven และผู้ใช้ไม่ได้พิมพ์คำอนุมัติ Land ในเทิร์นนี้
- **WHEN** เอเจนต์รัน bash: cloop advance pi-case --through archived
- **THEN** การเรียกไม่ถูกบล็อก
- **AND** ผลของ tool มีคำเตือนเรื่อง Land

#### Scenario: Deliver โดยไม่มี /deliver รันต่อ

- **WHEN** เอเจนต์รัน bash: cloop deliver advance pi-case โดยไม่มี /deliver
- **THEN** การเรียกไม่ถูกบล็อก
- **AND** ผลของ tool มีคำเตือนเรื่อง Deliver

#### Scenario: แก้ไฟล์นอกงานรันต่อ

- **GIVEN** ไม่มีงานที่บันทึก phase ไว้
- **WHEN** เอเจนต์เรียก write src/main.js
- **THEN** การเรียกไม่ถูกบล็อก

#### Scenario: authority run ใน background รันต่อ

- **WHEN** เอเจนต์เรียก background_bash ด้วย cloop authority run demo
- **THEN** การเรียกไม่ถูกบล็อก
- **AND** ผลของ tool เตือนให้รันแบบ foreground

#### Scenario: ผู้ใช้เลือกโหมด block เอง

- **GIVEN** environment ของ Pi มี FOUNDATION_GUARDRAIL_MODE=block
- **WHEN** เอเจนต์เรียก write src/main.js โดยไม่มีงาน
- **THEN** การเรียกถูกบล็อกด้วยข้อความ phase guard
