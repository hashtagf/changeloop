# skill-guidance Specification

## Purpose
ขั้นตอนที่ตรวจได้จาก pstack ใน reference ของ owner skill โดยไม่ขัดกฎเดิมและไม่เกิน budget
## Requirements
### Requirement: Performance work has a bounded hillclimb procedure

ระบบ SHALL ให้ performance-investigation มี reference hillclimb ที่กำหนด stop predicate, การพิสูจน์ความไวของ harness ก่อน freeze, attempt log และการเปลี่ยนทางเมื่อถึง plateau

- stop predicate = target คู่กับจำนวน attempt ขั้นต่ำ หรือ plateau ที่ยืนยันแล้ว
- ก่อนเริ่มต้องพิสูจน์ว่า harness แยก workload ที่ต่างกันได้ แล้ว freeze ไม่แก้ harness ระหว่าง hillclimb
- ทุก hypothesis ต้องระบุกลไก และไล่ตามลำดับ mantra จากถูกไปแพง
- keep หรือ revert แต่ละ attempt ด้วยการแก้ workspace และเก็บ log เป็น raw run นอก managed skills ไม่ใช้ commit
- การอ้าง improvement สุดท้ายใช้ benchmark provider หรือ project tool ผ่าน harness และ paid workload ต้องมี authority

#### Scenario: reference มีขั้นตอนครบ

- **WHEN** อ่าน performance-investigation/references/hillclimb.md
- **THEN** มี stop predicate, harness sensitivity และ freeze, attempt log, plateau pivot และ mantra order

#### Scenario: เข้าถึงได้จาก reference เดิม

- **WHEN** reference governance ตรวจ bundle performance-investigation
- **THEN** hillclimb.md reachable จาก measurement.md โดย SKILL.md ไม่เพิ่มคำ

#### Scenario: ไม่สั่ง commit ต่อ attempt

- **GIVEN** เนื้อหามีคำสั่ง commit ต่อ attempt หรือ status ledger
- **WHEN** รัน skill-catalog.test.mjs
- **THEN** test คำต้องห้าม fail

### Requirement: Performance claims explain the number

ระบบ SHALL ให้ measurement.md กำหนดให้เขียนประโยค claim ก่อนวัด ถามว่าทำไมไม่เป็นสองเท่า และตัดสิน inconclusive เมื่อไม่รู้ limiter

#### Scenario: มีกฎ claim

- **WHEN** อ่าน measurement.md
- **THEN** มีขั้นเขียน claim ก่อนวัด, why-not-double และ inconclusive เมื่อ limiter ไม่มีชื่อ

#### Scenario: pin เดิมคงอยู่

- **WHEN** รัน skill-catalog.test.mjs
- **THEN** /returned Build/, /Never fabricate missing measurements/ และ not a status ledger ยังผ่าน

### Requirement: Debugging stops guessing and repairs the root cause

ระบบ SHALL ให้ debug-fundamentals มี reference root-cause ที่หยุดการแก้ต่อหลังแก้ล้มซ้ำสองครั้งจนกว่าจะเขียนและทดสอบ premise และตรวจความชอบธรรมของ guard

- trigger: แก้ล้มสองครั้งบน gate เดียวกัน ต้องเขียน premise และ experiment ที่ falsify ได้ก่อนแก้ต่อ
- guard เป็นการแก้ได้ก็ต่อเมื่อ state ที่มันรับมือนั้นชอบธรรม; การลบ guard ยังต้องพิสูจน์ตาม coding-discipline
- instance อื่นของ pattern เดียวกันที่อยู่นอกขอบเขตของ change ให้รายงานเป็น follow-up ไม่รวมเป็น cleanup

#### Scenario: มี stop rule

- **WHEN** อ่าน debug-fundamentals/references/root-cause.md
- **THEN** มี trigger แก้ล้มสองครั้งและข้อกำหนดเขียน premise ก่อนแก้ต่อ

#### Scenario: ไม่ขัด no bundled cleanup

- **GIVEN** เนื้อหาสั่งให้แก้ทุก instance ทั่ว repo โดยไม่จำกัดขอบเขต
- **WHEN** รัน skill-catalog.test.mjs
- **THEN** test fail เพราะไม่มีข้อความจำกัดขอบเขตและ follow-up

#### Scenario: pin bisection คงอยู่

- **WHEN** รัน skill-catalog.test.mjs
- **THEN** bisection.md ยังตรง /never the active target or Build workspace/

### Requirement: Tests are judged against behavior and internal edits

ระบบ SHALL ให้ test-design.md มีการทดสอบ test ด้วยการแก้สองแบบในใจและรายการสาเหตุของ hollow assertion

- การแก้สองแบบ: break the behavior ต้องทำให้ test fail; change the internals ต้องไม่ทำให้ test fail
- hollow assertion: ค่าคาดหวังคำนวณจากโค้ดที่ทดสอบ, ค่าคงที่ที่ทวนซ้ำ, assertion แบบไม่มีการเรียกที่ไม่มี positive case คู่กัน
- การทำ effect ซ้ำสองครั้งเป็น mutation ที่ใช้ตรวจ idempotent behavior
- ถ้าไฟล์เกิน 300 บรรทัดต้องมี ## Contents ที่ลิงก์ได้
- programming-fundamentals ไม่มี references/testing.md อีกต่อไป; SKILL.md ของมันลิงก์ไป ../../testing-fundamentals/references/test-design.md แทน

#### Scenario: มีสองการแก้และ hollow assertion

- **WHEN** อ่าน test-design.md
- **THEN** มี break the behavior, change the internals และรายการ hollow assertion

#### Scenario: ไม่ซ้ำกับ programming-fundamentals testing

- **GIVEN** references ของ programming-fundamentals หลัง change นี้ (module-design, details, error-handling, complexity, naming)
- **WHEN** reference governance ตรวจ duplicate และ skill-catalog.test.mjs ตรวจไฟล์
- **THEN** programming-fundamentals/references/testing.md ไม่มีอยู่ และไม่มีย่อหน้าซ้ำหรือใกล้เคียง (Jaccard ≥ 0.92) ระหว่าง test-design.md กับไฟล์ใดใน references ของ programming-fundamentals

### Requirement: Impact claims state how far safety was proven

ระบบ SHALL ให้ change-impact-analysis มี reference proof ladder ห้าระดับและข้อกำหนดระบุ load-bearing safety fact

- ladder: คำบอก, อ่านโค้ด, ค้นหา consumer, รันจริงผ่าน project tool, ทำซ้ำในแอปที่รันอยู่
- รายงานต้องบอกว่าหยุดที่ระดับใด ไม่เรียก cleared จากระดับที่ต่ำกว่า
- การรันจริงเป็นหลักฐานได้ต่อเมื่อผ่าน provider ของ harness ไม่ใช่คำอ้าง
- SKILL.md ได้ลิงก์หนึ่งบรรทัดไม่เกิน 12 คำ

#### Scenario: มี ladder

- **WHEN** อ่าน change-impact-analysis/references/proof-ladder.md
- **THEN** มีห้าระดับ, say where it stopped และ load-bearing safety fact

#### Scenario: pin เดิมคงอยู่

- **WHEN** รัน skill-catalog.test.mjs
- **THEN** SKILL.md ยังตรง /OpenSpec/, /not receipts/ และ /never hand-edit/

### Requirement: Operations answer the rerun and crash questions

ระบบ SHALL ให้ Principle 5 ใน shared-state-and-async.md มีสามคำถาม idempotency และกฎเขียนไฟล์ชั่วคราวแล้ว rename

- สามคำถาม: รันซ้ำแล้วเกิดอะไร, run ก่อนหน้า crash กลางทางแล้วเกิดอะไร, สอง run พร้อมกันแล้วเกิดอะไร
- derive แต่ละขั้นจาก state ปัจจุบัน, เขียน temp แล้ว rename, ตัดสิน staleness จากหลักฐานที่ถูกต้องทุกจุด crash
- queue-fundamentals/references/idempotency.md ลิงก์มาที่ Principle 5 แทนการคัดลอก

#### Scenario: มีสามคำถาม

- **WHEN** อ่าน shared-state-and-async.md Principle 5
- **THEN** มีสามคำถามและกฎ temp แล้ว rename

#### Scenario: Contents ยังลิงก์ได้

- **WHEN** รัน skill-catalog.test.mjs
- **THEN** ## Contents ของ shared-state-and-async.md ยัง resolve ทุก anchor

### Requirement: Recurring lessons become the strongest workable check

ระบบ SHALL ให้ coding-discipline/references/details.md มี enforcement ladder และข้อกำหนดว่า check ใหม่ต้อง fail บนกรณีจริงในอดีต

- ladder: architecture, type, lint ที่ error บอกวิธีแก้, test, เอกสารเป็นทางเลือกสุดท้าย
- check ใหม่ต้อง fail บน occurrence จริงในอดีต โดยใช้ base-tree ของ tests that fail without the change
- การนำ check เข้าทำผ่าน /change ปกติ ไม่มี commit แยก
- การเขียนคำสั่งเดิมซ้ำเป็นครั้งที่สองคือ trigger ให้พิจารณา check แทน prose

#### Scenario: มี ladder

- **WHEN** อ่าน coding-discipline/references/details.md
- **THEN** มีลำดับ architecture, type, lint, test, docs และ fail-on-past-case

#### Scenario: ไม่สั่ง commit แยก

- **GIVEN** เนื้อหามี one commit each หรือ separate commit
- **WHEN** รัน skill-catalog.test.mjs
- **THEN** test คำต้องห้าม fail

### Requirement: Repeated work builds a lever and domain models show skip signals

ระบบ SHALL ให้ details.md มีกฎ build-the-lever และ module-design.md มี skip signal ของ domain model และการทดสอบผู้อ่าน 30 วินาที

#### Scenario: มี lever และ skip signals

- **WHEN** อ่าน details.md และ module-design.md
- **THEN** มี build-the-lever, one more branch, synchronized boolean และ 30-second reader test

#### Scenario: pin programming-fundamentals คงอยู่

- **WHEN** รัน skill-catalog.test.mjs
- **THEN** SKILL.md ยังมี Design deep, cohesive modules และ references/module-design.md

### Requirement: Prose deliverables follow one writing reference

ระบบ SHALL ให้ init-project-docs/references/writing.md เป็นแนวทางการเขียนเดียวที่มีการเลือกรูปแบบเอกสารแบบ Diátaxis และ catalog รูปแบบภาษาแบบ AI พร้อมตัวอย่างก่อนและหลัง

- ลิงก์จาก init-project-docs/references/documentation-workflow.md, git-workflow/references/commit-messages.md, git-workflow/references/pull-requests.md, harness-html-report/references/report.md และ claude-md/references/guide-workflow.md
- ห้ามแก้ข้อความที่ผู้ใช้ quote, หัวข้อหรือ marker ที่ parser ต้องการ (Requirement:, Scenario:, WHEN/THEN/SHALL) และภาษาของเอกสารที่ผู้ใช้กำหนด
- การเขียน commit message หรือ PR ไม่ให้สิทธิ์ commit หรือเปิด PR

#### Scenario: มี Diátaxis และ catalog

- **WHEN** อ่าน writing.md
- **THEN** มีการเลือก tutorial/how-to/reference/explanation, catalog รูปแบบภาษา และตัวอย่างก่อนหลัง

#### Scenario: เข้าถึงได้ทุก bundle ที่เขียน prose

- **WHEN** reference governance ตรวจ
- **THEN** writing.md reachable จาก init-project-docs และลิงก์ข้าม bundle ทั้งห้า resolve

#### Scenario: ไม่ทำลาย marker ของ parser

- **GIVEN** writing.md สั่งให้เขียนหัวข้อ Requirement หรือ Scenario ใหม่
- **WHEN** รัน skill-catalog.test.mjs
- **THEN** test fail เพราะไม่มีข้อความคุ้มครอง parser marker

### Requirement: New skill guidance is guarded against contradicting existing contracts

ระบบ SHALL มี test ที่ตรวจไฟล์ reference ทุกไฟล์ที่ change นี้เพิ่มหรือแก้ว่าไม่มีคำสั่งที่ขัดกับกฎเดิม และ pstack-adoption.md บันทึก review ของ commit e5136d8

- รายการคำต้องห้ามรวม: commit per/each attempt, one commit each, open a PR, push, merge to, spawn, fan out to models, without asking, proceed without approval, delete the old API immediately
- ข้อความปฏิเสธที่มีอยู่แล้ว (เช่น Land never commits) ไม่นับเป็นการละเมิด: test ตรวจเฉพาะเนื้อหาที่ change นี้เพิ่ม
- pstack-adoption.md เพิ่ม provenance ของ e5136d8 และ Verification boundary bullets ที่ลิงก์ reference ใหม่ โดยตาราง Disposition ยังมี 58 แถว

#### Scenario: เนื้อหาสะอาด

- **WHEN** รัน skill-catalog.test.mjs
- **THEN** test คำต้องห้ามผ่านทุกไฟล์ใหม่และที่แก้

#### Scenario: คำต้องห้ามถูกจับ

- **GIVEN** ไฟล์ใหม่มีคำว่า open a PR
- **WHEN** รัน test
- **THEN** test fail ระบุไฟล์และคำ

#### Scenario: ตาราง adoption ไม่เปลี่ยน

- **WHEN** รัน skill-catalog.test.mjs
- **THEN** ตาราง Disposition ยังมี 58 แถวและ provenance มีทั้ง 5062f28 และ e5136d8

### Requirement: Skill bodies stay within the context budget

ระบบ SHALL คง SKILL.md ทุกไฟล์ไม่เกิน 700 คำและรวมไม่เกิน 9500 คำ โดย change นี้เพิ่มรวมไม่เกิน 12 คำ

#### Scenario: budget ผ่าน

- **WHEN** รัน run-context-budget-tests.sh
- **THEN** ทุก assertion ผ่าน

#### Scenario: เกิน budget

- **GIVEN** SKILL.md รวมเกิน 9500 คำ
- **WHEN** รัน budget test
- **THEN** test คืน CONTEXT_BUDGET_USER_DECISION_REQUIRED

### Requirement: trigger-descriptions

ระบบ SHALL ให้ description ของ skill ทั้ง 40 ตัว (ที่ไม่ใช่ lifecycle 32 ตัวและ lifecycle 8 ตัว) เป็นประโยค trigger สั้นที่บอกว่าใช้ทำอะไร ใช้เมื่อไร (สถานการณ์และคำที่ผู้ใช้พิมพ์จริง ทั้งไทยและอังกฤษ) และข้ามเมื่อไรโดยชี้ไปที่ skill ข้างเคียงจริง ตามข้อความที่กำหนดด้านล่าง

- lifecycle skill 8 ตัว (change, build, prove, land, investigate, dev, feature, changes) แก้ได้เฉพาะ description; body ไม่ถูกแก้ และ description ของ land ยังมี standalone Git requests to git-workflow
- description ของ skill ที่ไม่ใช่ lifecycle ≤ 40 คำ ของ lifecycle ≤ 80 คำ ขึ้นต้นด้วย Use ... และมีส่วนข้าม (Skip ... หรือ use <skill> for ...)
- description ของ testing-fundamentals, database-fundamentals, api-design-fundamentals, security-fundamentals, debug-fundamentals ยังมีคำ workType, riskSignals, requirement หรือ scenario และคำว่า Skip
- ไม่มีคำว่า Must always apply, any prose surface, Use any MCP tool
- brainstorming: Use when the outcome or approach is still open and the user must choose between real alternatives before building: 'what should we build', 'which approach', 'ควรทำ A หรือ B', compare options' trade-offs. Skip settled work and how/why questions (investigate).
- change-impact-analysis: Use before changing an API, schema, config, event, or shared behavior when consumers are unknown: who breaks, blast radius, is it safe to change. Skip isolated code with known consumers, sequencing (plan-writing), and choosing between options (brainstorming).
- coding-discipline: Use before coding a fix or feature whose scope, assumptions, or size is unclear: keep the diff minimal, avoid over-building or bundled cleanup, fix causes not symptoms, verify done. Skip unknown-cause bugs (debug-fundamentals) and behavior-preserving restructuring (refactoring-fundamentals).
- debug-fundamentals: Use when workType is bugfix and the cause is unknown: บั๊ก, crash, wrong output, flaky test, regression. Reproduce, localize, fix, prove. Skip obvious one-line corrections, new features, and slowness or memory growth (performance-investigation).
- performance-investigation: Use when something is slow (ช้า), latency or throughput regressed, memory grows or leaks toward OOM, or a speedup or benchmark claim must be proven. Skip functional bugs (debug-fundamentals) and telemetry design (observability-fundamentals).
- plan-writing: Use when an agreed change needs a design or task breakdown — ordering, dependencies, compatibility, migration, rollback, parallel slices — before coding. Skip open choices (brainstorming), impact discovery (change-impact-analysis), and obvious small work.
- refactoring-fundamentals: Use when restructuring code without changing behavior: extract, move, rename, split, deduplicate, simplify, untangle legacy code, รีแฟกเตอร์. Skip bug fixes (debug-fundamentals) and new features (programming-fundamentals).
- testing-fundamentals: Use when a requirement or scenario needs tests: write failing-first tests, pick unit/integration/e2e level and mocks, fix flaky or hollow tests, read coverage. Skip docs, renames, and unknown-cause bugs (debug-fundamentals).
- api-design-fundamentals: Use when workType includes api or library, or a requirement defines a request, response, status code, error body, pagination, webhook, or version other code consumes: 'design an endpoint', REST/GraphQL/gRPC, breaking change. Skip private module interfaces (use programming-fundamentals).
- architecture-fundamentals: Use when deciding how services, runtimes, or deployables split, talk, fail, or scale: monolith vs microservices, sync vs async, timeouts and retries, 'แยก service'. Skip single-process module design (programming-fundamentals) and domain meaning (ddd-strategic).
- concurrency-fundamentals: Use when threads, async tasks, goroutines, locks, shared mutable state, cancellation, or races affect correctness inside one process: deadlock, flaky race, 'runs twice', unbounded Promise.all. Skip cross-process queues (queue-fundamentals) and database isolation (database-fundamentals).
- database-fundamentals: Use when workType includes data or migration, or a requirement touches a schema, query, index, transaction, or persisted file: 'add a column', N+1, lost update, 'ย้าย schema'. Skip read-only analysis and measured slowness (use performance-investigation).
- ddd-strategic: Use when business terms, bounded contexts, aggregates, or who owns a model are unclear: one word means two things, event storming, splitting a domain, aggregate too big. Skip generic CRUD, settled single-context code, and runtime splits (architecture-fundamentals).
- hexagonal-backend: Use when one backend service needs domain logic isolated from framework and storage through ports and adapters: clean architecture, layering, 'where should this logic live', testable use cases with fake repositories. Skip trivial CRUD and cross-service design (architecture-fundamentals).
- observability-fundamentals: Use when adding or reviewing logs, metrics, traces, dashboards, SLOs, or alerts for a runtime failure surface: 'add logging', 'we can't see this error in prod', noisy alerts. Skip offline code and bug root-causing (debug-fundamentals); use performance-investigation to explain measurements.
- programming-fundamentals: Use for nontrivial logic inside one process: modeling types and state, data structures, error paths, module boundaries, abstraction depth ('design this module', 'ออกแบบโมดูล'). Skip trivial or generated code, cross-service design (architecture-fundamentals), and behavior-preserving restructuring (refactoring-fundamentals).
- queue-fundamentals: Use when work crosses processes through a broker, stream, job queue, or worker (Kafka, SQS, RabbitMQ, BullMQ, cron jobs): delivery semantics, idempotency, retries, DLQ, ordering, outbox, backpressure, duplicate messages. Skip in-process async (concurrency-fundamentals).
- security-fundamentals: Use when riskSignals include access-control, authorization, secrets, or external-integration, or a scenario must reject forged, replayed, oversized, or unauthorized input: login, tokens, permissions, uploads, webhooks, 'ช่องโหว่'. Skip work without a trust boundary; endpoint shape alone is api-design-fundamentals.
- claude-md: Use when asked to create, update, slim down, or audit a repository's CLAUDE.md (or AGENTS.md-style agent guide). Skip human onboarding docs under docs/ (init-project-docs).
- delivery-engineering: Use when changing or repairing CI/CD: failing CI to fix, pipelines, build scripts, Dockerfiles/containers, deploys, rollouts, rollbacks, release artifacts. Skip application code, Git operations (git-workflow), and read-only status questions (changes).
- frontend-design: Use when building or polishing web UI — pages, components, layout, typography, color, motion, responsive states — once UX direction is settled (ทำหน้าเว็บให้สวย). Skip unresolved interaction decisions (ux-ui-principles) and shared token systems (tailwind-design-system).
- git-workflow: Use when asked to branch, commit, write a commit message, rebase, merge, push, recover lost work, or open a PR. Skip read-only inspection and CI/deploy (delivery-engineering); Land never grants Git authority.
- grill-task-gu: Use when grooming an approved PRD into one source-grounded Decision Sheet and an ordered task backlog with coverage (แตก task จาก PRD). Skip open product ideas (brainstorming), implementation, and compiled-spec approval.
- grill-task-gu-please: Use when the user invokes the legacy name grill-task-gu-please, e.g. /grill-task-gu-please <PRD>; alias for grill-task-gu. Otherwise skip it (grill-task-gu).
- harness-html-report: Use when asked for an HTML report or dashboard of a Change Loop project's changes, tasks, gates, budgets, or evidence (สรุปงานเป็น HTML). Requires .foundation/ and openspec/. Skip status checks (changes) and anything changing state.
- init-project-docs: Use when asked to document an existing codebase for humans: onboarding, architecture, data model, API, business-rule docs under docs/, or refreshing them after code changes (ทำเอกสาร). Skip CLAUDE.md-only requests (claude-md).
- skill-creator: Use when explicitly asked to create, edit, restructure, or optimize the description of a skill (SKILL.md, references). Skip unrequested skill changes, live behavior comparisons (skill-evaluation), and catalog-wide audits (skill-suite-auditor).
- skill-evaluation: Use when testing whether a new or changed skill, description, or trigger actually performs better than its baseline on real model runs (A/B, with/without skill). Skip static catalog checks (skill-suite-auditor) and authoring (skill-creator).
- skill-suite-auditor: Use when auditing a skills directory as a whole: frontmatter, overlapping or competing triggers, broken references, missing owners, or conflicting instructions. Skip live model comparisons (skill-evaluation) and writing a skill (skill-creator).
- tailwind-design-system: Use when creating or maintaining shared Tailwind CSS v4 tokens (@theme), component variants, themes or dark mode, or migrating Tailwind v3 to v4. Skip one-off page styling (frontend-design).
- ui-ux-pro-max: Use when looking up style, color palette, font pairing, product-type, landing, chart, or per-stack UI guidance from the bundled searchable design data. Skip flow or usability decisions (ux-ui-principles) and implementing visuals (frontend-design).
- ux-ui-principles: Use when designing or reviewing user flows, hierarchy, forms, navigation, UI states, accessibility, or responsive layout, or when users find a screen confusing (ใช้งานยาก, UX). Skip visual styling (frontend-design), tokens (tailwind-design-system), style/palette search (ui-ux-pro-max).
- change: Use when settled intent must become or amend an OpenSpec agreement through Change Loop: /change, a new behavior request, or new observable behavior found during Build. Preserve approval boundaries; write no product code. Skip open options (brainstorming) and pre-Change research (investigate).
- build: Use when an approved Change Loop change must be implemented or repaired in its isolated workspace: /build, returned EDIT/REPAIR tasks, or continue approved work. Follow harness task ownership and resume routes; never Land or mutate Git history. Skip agreement edits (change) and evidence refresh (prove).
- prove: Use when an existing Change Loop change needs evidence produced or refreshed: /prove, providers, review, acceptance, stale receipts, or proof repair. Proven is not delivered and never grants Land. Skip product implementation (build) and read-only status (changes).
- land: Use when the user explicitly says to land, apply, or archive a proven Change Loop change (/land). Applies through advance, preserves target HEAD/index, and recovers the same transaction. Route standalone Git requests to git-workflow and deployment or publication to delivery-engineering.
- investigate: Use before Change to research feasibility, requirements, a bug's mechanics, how or why code works, or recorded rationale without product edits: /investigate, explain this flow, ดูว่าทำงานยังไง. Ask only unresolved material questions. Skip choosing among open product options (brainstorming).
- dev: Use when /dev is invoked: the legacy Change Loop composition from concrete intent through Change, isolated Build, and Prove, landing only with explicit authority. Skip targeted phase work; use change, build, prove, or land directly.
- feature: Use when /feature is invoked or a selected PRD or backlog group must be implemented and proven through discovery, one Decision Sheet, compiled Change approval, and isolated Build. Proven is not delivery; intake approval grants no Land. Skip PRD grooming alone (grill-task-gu).
- changes: Use when asked to read or explain current status without editing: /changes, active or blocked changes, readiness, CI or evidence state, next actions (ติดอะไร, ทำอะไรต่อ). Read-only; never start implementation, grant authority, or infer delivery from proven. Skip HTML reports (harness-html-report).

#### Scenario: description ตรงตามข้อความที่กำหนด

- **GIVEN** SKILL.md ของ skill ทั้ง 40 ตัว
- **WHEN** อ่าน frontmatter description
- **THEN** ทุกตัวตรงกับข้อความใน details (ต่างได้เฉพาะเครื่องหมายวรรคตอน) อยู่ในจำนวนคำที่กำหนด และมีส่วนที่บอกว่าเมื่อไรไม่ควรใช้

#### Scenario: spec-vocabulary ยังอยู่

- **GIVEN** skill 5 ตัวที่ spec-vocabulary-descriptions กำหนด
- **WHEN** รัน .claude/harness/tests/skill-routing.test.mjs
- **THEN** ผ่านทุก assertion

#### Scenario: body ของ lifecycle skill ไม่ถูกแตะ

- **GIVEN** SKILL.md ของ lifecycle skill 8 ตัว
- **WHEN** เทียบเนื้อหาหลัง frontmatter กับ HEAD 281caac1b
- **THEN** เหมือนเดิมทุกไบต์ ต่างได้เฉพาะ description

#### Scenario: description ยาวเกิน

- **WHEN** description ใดเกิน 80 คำ
- **THEN** skill-catalog.test.mjs fail ระบุชื่อ skill

### Requirement: minimal-skill-bodies

ระบบ SHALL ให้ SKILL.md ของ skill ในขอบเขตใช้โครงเดียวกัน: จุดยืน 1 บรรทัด, Steps ≤ 6 ข้อ, Harness ≤ 3 บรรทัด และรายการ References ที่อ่านเมื่อจำเป็น

- โครงเดิม: วรรคเปิด + ## Rules 7 ข้อ + ## Check before finishing 4-6 ข้อ + วรรค handoff + วรรค References (40-80 บรรทัด, 300-450 คำ)
- โครงใหม่: # ชื่อ / จุดยืน 1 บรรทัด / ## Steps (≤ 6 ข้อ ทำตามได้ทันที) / ## Harness (≤ 3 บรรทัด) / ## References (read only when needed) bullet: ชื่อไฟล์ — เมื่อไรควรอ่าน
- SKILL.md แต่ละไฟล์ในขอบเขต ≤ 250 คำ (ไม่รวม frontmatter) และรวมทุก SKILL.md ≤ 9,500 คำตาม budget เดิม
- skill ใช้งานได้เมื่อโหลดตัวเดียว (standalone): Steps มีขั้นตอนขั้นต่ำที่ทำได้เองโดยไม่บังคับโหลด skill อื่น การอ้าง skill อื่นเป็นเพียงการอ่านเพิ่มเมื่อมีติดตั้ง และไม่บังคับพึ่งไฟล์ของ harness หรือไฟล์ที่มีเฉพาะใน repo นี้ (tests, docs, release)
- วรรค Harness เป็นแบบมีเงื่อนไข: With OpenSpec/Change Loop ระบุว่า harness เป็นเจ้าของ lifecycle, receipts, task status และ Build ไม่ stage/commit; Otherwise ระบุที่บันทึกการตัดสินใจหรือ follow-up และสิ่งที่ใช้เป็น proof (CI หรือผลเทสต์); ยกเว้น harness-html-report ที่ต้องมี project Change Loop และ skill ที่ vendor มา (frontend-design, skill-creator, ui-ux-pro-max, tailwind-design-system) ที่แก้เฉพาะ description
- ข้อความที่ test เดิม pin (เช่น Design deep, cohesive modules; Never ask what you can find; not receipts; never hand-edit; approves intake choices, not a compiled OpenSpec packet) ยังอยู่หรือถูกแทนด้วยถ้อยคำใหม่ที่ test อัปเดตให้ตรงกันในงานเดียวกัน

#### Scenario: ทุก body อยู่ใน budget และใช้โครงเดียวกัน

- **GIVEN** SKILL.md 32 ไฟล์ในขอบเขต
- **WHEN** นับคำหลัง frontmatter และอ่านหัวข้อ
- **THEN** ทุกไฟล์ ≤ 250 คำ มีหัวข้อ Steps, Harness, References และ run-context-budget-tests.sh ผ่าน

#### Scenario: guardrail ยังถูกจับ

- **GIVEN** SKILL.md หรือ reference ที่ย่อแล้วถูกแทรกคำว่า commit when green หรือ open a PR
- **WHEN** รัน skill-catalog.test.mjs
- **THEN** test fail ระบุไฟล์และคำ

#### Scenario: จำนวน assertion ห้ามคำไม่ลดลง

- **GIVEN** skill-catalog.test.mjs, run-doc-consistency.sh และ run-context-budget-tests.sh ที่ HEAD มี doesNotMatch/assert_file_not_contains รวม 21 จุด
- **WHEN** เทียบหลังแก้
- **THEN** จำนวนไม่น้อยกว่า 21 และทุก regex ที่เปลี่ยนมีคู่ใหม่ที่ความหมายเดิม

### Requirement: pruned-references

ระบบ SHALL ให้ references ของ skill ในขอบเขตเป็นไปตามแผน keep/merge/drop รายไฟล์ด้านล่าง โดยคงเนื้อหาที่ spec หรือ test pin ไว้ครบ

- references รวมทุก skill ≤ 8,500 บรรทัด (จาก 14,048)
- วรรค Principle N (from SKILL.md) ที่คัดลอก body ของ SKILL.md มาซ้ำถูกตัดออกทุก bundle
- reference-governance.mjs ผ่าน: ทุกไฟล์ reachable, ลิงก์และ anchor resolve, ไม่มี block ซ้ำหรือใกล้เคียง (Jaccard ≥ 0.92); ไฟล์เกิน 300 บรรทัดยังมี ## Contents
- ไฟล์ที่ถูกลบหรือรวมต้องไม่มีลิงก์เข้าจากไฟล์ที่ shipped
- debug-fundamentals (332): keep reproduction/root-cause/bisection (pinned); merge instrumentation + distributed-debugging → tools.md ~80
- performance-investigation (134): keep hillclimb, measurement (pinned)
- change-impact-analysis (48): keep proof-ladder (pinned)
- refactoring-fundamentals (397): keep refactoring-discipline, characterization-tests, large-scale (pinned); catalog → ตาราง move/when ~60; code-smells → ตาราง smell/fix ~50
- testing-fundamentals (514): keep test-design (pinned), coverage, verification-drivers; test-doubles-and-levels ตัดวรรค Principle ซ้ำ → ~120
- coding-discipline (105): keep details, cleanup (pinned)
- ddd-strategic (1,055): aggregate-design → ~200 (ตัดตัวอย่าง Scrum, ย่อ persistence/events); bounded-contexts → ~150 (ตัด glossary building, drawing a map); event-storming → ~80 (ตัด facilitation, sticky colors, Domain Storytelling); subdomain-classification → ~80 (ตัด Wardley, worked examples); failure-modes keep
- architecture-fundamentals (834): drop observability.md (ซ้ำ observability-fundamentals → ลิงก์ข้าม bundle); communication → ~130 (ตัด API versioning/deprecation ที่ซ้ำ api-design evolution); resilience → ~120; boundaries → ~100
- programming-fundamentals (544): keep module-design (pinned); drop testing.md (ซ้ำ testing-fundamentals → ลิงก์); details → ~50; error-handling → ~60; complexity → ~40; naming → ~30
- concurrency-fundamentals (595): shared-state-and-async keep Contents + Principle 5 + Quick reference (pinned); Principle 1-4, 6-7 ย่อเป็น pointer; recipes 1-5 ตัด ~40% → ~350
- database-fundamentals (841): indexing → ~110; migrations → ~130; query-performance → ~130; schema-design → ~50; transactions → ~120
- hexagonal-backend (676): keep patterns-and-pitfalls (pinned); go → ~180 และ typescript → ~130 (ตัวอย่างชั้นละหนึ่ง)
- api-design-fundamentals (350): merge auth-and-limits เข้า contracts-and-errors (→ ~90); evolution → ~100; resource-modeling → ~70
- queue-fundamentals (873): broker-selection → ~90 (ตัด per-broker cheat sheet); idempotency → ~130 (ลิงก์ Principle 5 ตาม pin); operating → ~130; outbox → ~120
- security-fundamentals (504): authn-authz → ~150; input-and-output → ~140; trust-and-hardening → ~70
- observability-fundamentals (514): logs-metrics-traces ตัด Principle 1-7 ซ้ำ body เหลือ conventions/recipes/worked example → ~330
- tailwind-design-system (835): setup-and-migration → ~100; component-patterns → ~150; layout-motion-theming → ~150; utilities-and-advanced → ~80
- ux-ui-principles (863, 13 ไฟล์ → 10): merge visual + visual-composition → ~90; merge accessibility + accessibility-verification → ~90; merge patterns + experience-patterns → ~110; experience-workflow → ~90; sources → ~40; keep interaction, validation, do-and-dont, change-loop-handoff, upstream (pinned)
- ui-ux-pro-max (563): keep search-tool (เอกสารเครื่องมือ), experience-workflow; quick-reference → ~150; app-ui-rules → ~70
- git-workflow (594): keep pull-requests (pinned); commit-messages → ~120 (คง provenance และ writing link ที่ pin); recovery → ~120; branching-and-rebasing → ~100
- delivery-engineering (537): keep ci-and-review-repair; pipeline-and-deploy → ~280 (7 principles ย่อเหลือ ~100)
- init-project-docs (642): keep writing, documentation-workflow (pinned); doc-templates → ~200 (เหลือหัวข้อ ตัดเนื้อหาตัวอย่าง); workflow-and-quality → ~70
- skill-creator (718): keep ทั้งหมด (schemas เป็น contract ของ script; ที่เหลือ pinned); creating-skills → ~80
- claude-md, harness-html-report, grill-task-gu, skill-evaluation, skill-suite-auditor (447): keep ทั้งหมด (pinned หรือเป็น contract)
- brainstorming, plan-writing, frontend-design, grill-task-gu-please: ไม่มี references แก้เฉพาะ description และ SKILL.md
- scripts/, assets/, data/ ของ ui-ux-pro-max และ skill-creator ไม่ถูกแตะ

#### Scenario: ขนาดรวมลดและ governance ผ่าน

- **GIVEN** references หลังตัด
- **WHEN** นับบรรทัดรวมและรัน reference-governance.mjs
- **THEN** รวม ≤ 8,500 บรรทัด และไม่มี issue

#### Scenario: เนื้อหาที่ pin ยังครบ

- **GIVEN** ไฟล์ reference ที่ test pin ไว้
- **WHEN** รัน skill-catalog.test.mjs และ run-context-budget-tests.sh
- **THEN** ทุก assertion ผ่าน

#### Scenario: ไฟล์ที่แผนบอกว่าลบหรือรวมหายไปจริง

- **GIVEN** แผนระบุ drop observability.md ของ architecture, testing.md ของ programming, auth-and-limits.md, instrumentation.md, distributed-debugging.md และคู่ซ้ำ 3 คู่ของ ux-ui-principles
- **WHEN** list ไฟล์ใน references หลัง Build
- **THEN** ไฟล์เหล่านั้นไม่อยู่ และไฟล์ที่รวมเข้าไปมีเนื้อหาส่วนที่ย้ายมา

#### Scenario: ลบไฟล์ที่ยังถูกอ้าง

- **WHEN** reference ถูกลบแต่ SKILL.md หรือ reference อื่นยังลิงก์ถึง
- **THEN** reference-governance.mjs รายงาน unresolved reference

### Requirement: router-in-sync

ระบบ SHALL ให้แถว trigger ใน .claude/rules/fundamentals.md ใช้คำเดียวกับ description ของ skill ที่มันชี้ไป

- fundamentals.md ≤ 700 คำ และยังมีประโยคที่ test pin: Skills supply judgment and procedures; the harness owns lifecycle, module boundary, abstraction depth, structured question tool, record the answers in the change packet

#### Scenario: แถว router ตรงกับ description

- **GIVEN** ตาราง Process/Construction/Delivery ใน fundamentals.md
- **WHEN** เทียบคำ trigger ของแต่ละแถวกับ description ของ skill ปลายทาง
- **THEN** ทุกแถวมีคำหลักร่วมกับ description อย่างน้อยหนึ่งคำ และ budget 700 คำผ่าน

### Requirement: trigger-evaluation-report

ระบบ SHALL มีรายงาน skill-evaluation ลงวันที่ที่เทียบการ trigger ของ catalog ที่ HEAD 281caac1b กับ catalog ใหม่บน case ชุดเดียวกัน

- ใช้ positive/negative case จาก skill-evaluation/references/evaluation-cases.json ของ skill ในขอบเขต รันแต่ละ case อย่างน้อย 2 ครั้งต่อ arm
- รายงานอยู่ที่ docs/reports/2026-10-27-skill-catalog-trigger-evaluation.md ระบุ source revision ทั้งสอง arm, model, จำนวน run, per-case ผล, missed/false trigger, usage ที่วัดได้ (ไม่วัดได้ = unknown)
- transcript ดิบอยู่นอก Git; ไฟล์ใน .claude/skills ไม่ถูกใช้เก็บผล
- evaluation-cases.json ยัง execution: not-run และทุก case status: not-run ตาม test เดิม
- ถ้า missed trigger ของ catalog ใหม่มากกว่า baseline ในระดับที่ทำซ้ำได้ ให้รายงานเป็น regression และหยุดก่อน Land

#### Scenario: รายงานมีสอง arm

- **GIVEN** baseline และ candidate รันครบ
- **WHEN** อ่านรายงาน
- **THEN** มีตาราง per-case ที่แต่ละแถวบอก skill ที่ถูกโหลดใน arm เก่าและใหม่ พร้อมสรุป missed/false trigger ของแต่ละ arm

#### Scenario: run ไม่สำเร็จ

- **WHEN** host runner ไม่พร้อมหรือ case รันไม่ได้
- **THEN** รายงานระบุ case นั้นเป็น not-run ไม่ใช่ pass

#### Scenario: catalog ใหม่แย่ลง

- **WHEN** missed trigger ของ candidate มากกว่า baseline ในทุกรอบที่รัน
- **THEN** รายงานติดป้าย regression และ Prove ไม่ผ่าน

### Requirement: approval-page-contract

หน้าอนุมัติที่ skill prototype สร้าง SHALL เรียงหัว แถบข้อเท็จจริงของ harness มุมมองหลักคือ prototype รายการที่ต้องแสดงพร้อมสถานะ ก่อน-หลัง เส้นทาง กรณีพลาดพร้อม recovery undo และ who แล้วรายละเอียดผู้ตรวจที่พับไว้ SHALL เป็นไฟล์เดียวที่ไม่เรียกเครือข่าย SHALL NOT มีฟอร์มหรือปุ่มตัดสินใจ SHALL ใช้ภาษาของ draft และ SHALL อ่านได้ด้วยคีย์บอร์ดโดยไม่พึ่งสีอย่างเดียว

#### Scenario: ลำดับของหน้า

- **GIVEN** skill สร้างหน้าของ change ที่มี scratch ครบและข้อมูลจาก package
- **WHEN** เปิดหน้า
- **THEN** ลำดับคือ หัว แถบข้อเท็จจริง prototype รายการที่ต้องแสดง ก่อน-หลัง เส้นทาง กรณีพลาด undo และ who รายละเอียดผู้ตรวจ

#### Scenario: แถบข้อเท็จจริงคัดลอกจากข้อมูล

- **GIVEN** package พิมพ์ระดับความเสี่ยง proof และ role พร้อม factsDigest
- **WHEN** skill สร้างแถบข้อเท็จจริง
- **THEN** แถบใช้ค่าเดียวกับข้อมูลทุกค่าและมี factsDigest ล่าสุดอยู่ในหน้า

#### Scenario: ค่าที่ไม่ทราบ

- **GIVEN** draft ไม่ระบุฟิลด์ที่ต้องแสดง
- **WHEN** skill สร้างหน้า
- **THEN** ช่องนั้นเขียนว่า ไม่ทราบ ไม่เดาค่าและไม่ประดิษฐ์ข้อมูล

#### Scenario: ป้ายไม่ใช่ proof

- **GIVEN** หน้ามี prototype
- **WHEN** เปิดหน้า
- **THEN** มีป้ายว่าเป็นภาพจำลองไม่ใช่ proof และไม่มีฟอร์มหรือปุ่มตัดสินใจ

#### Scenario: ไม่พึ่งเครือข่าย

- **GIVEN** เครื่องที่เปิดหน้าไม่มีอินเทอร์เน็ต
- **WHEN** เปิดหน้า
- **THEN** หน้าแสดงครบ ฟอนต์ภาพและสคริปต์อยู่ในไฟล์หรือใช้ของระบบ

#### Scenario: ใช้คีย์บอร์ดและไม่พึ่งสี

- **GIVEN** ผู้ใช้ใช้คีย์บอร์ดหรือมองสีไม่ชัด
- **WHEN** สลับสถานะและอ่านระดับความเสี่ยงกับสถานะครอบคลุม
- **THEN** ทุกปุ่มใช้ Tab ได้ และระดับกับสถานะอ่านได้จากคำและสัญลักษณ์

### Requirement: prototype-skill-contract

skill prototype SHALL กำหนดรายการที่ต้องแสดงจากข้อมูลของ package เองโดยไม่ถามผู้ใช้ว่าต้องการแบบไหน

- อ่าน change ก่อนสร้างทุกครั้ง คือ proposal, specs, design, tasks ที่คอมไพล์แล้ว หรือ draft ถ้ายังไม่คอมไพล์ ไม่ใช้ความจำจากแชทแทน
- มีแนวทางครบทุก work type ที่ catalog ประกาศ
- ใช้ design token ของ project นั้นเมื่อมี
- เมื่อหน้าถูกแก้ ต้อง revise หรือ amend change ให้ตรงในรอบเดียวกัน
- เมื่อ host มี skill design หรือ Artifact ชนิด design ต้องสร้างและแก้หน้าบน canvas นั้นเป็นหลัก จัดเป็นเฟรมต่อหน้าจอหรือสถานะ มีเลขลำดับและหัวข้อกลุ่ม
- ส่งออกไฟล์ใน .foundation/previews ทุกครั้งที่สร้างหรือแก้ เพราะ harness ตรวจจากไฟล์นั้น

#### Scenario: อ่าน change ก่อนสร้าง

- **GIVEN** change มี requirement และ scenario ที่คอมไพล์แล้ว และมีเรื่องที่คุยในแชทแต่ไม่อยู่ใน change
- **WHEN** skill ทำงาน
- **THEN** skill อ่านเอกสารของ change ก่อน และทุกอย่างในหน้ามาจาก requirement scenario หรือข้อมูลของ package ส่วนเรื่องที่มีแต่ในแชทไม่ถูกใส่ในหน้า แต่ skill เสนอ change revise

#### Scenario: ยังไม่มี change

- **GIVEN** ผู้ใช้สั่งให้ทำหน้าอนุมัติแต่ยังไม่มี change หรือ draft
- **WHEN** skill ทำงาน
- **THEN** skill ไม่สร้างหน้าจากการเดา และบอกให้ทำ change ก่อน

#### Scenario: รู้เองว่าต้องแสดงอะไร

- **GIVEN** change ประเภท api ที่ draft มี apiContracts และผู้ใช้สั่งให้ทำหน้าอนุมัติ
- **WHEN** skill ทำงาน
- **THEN** skill ใช้รายการจาก package สร้างแผง API ตามนั้นและประกาศ covers โดยไม่ถามว่าต้องการแบบไหน

#### Scenario: ทุก work type มีแนวทาง

- **GIVEN** catalog ประกาศ work type ทั้ง 26 ชนิด
- **WHEN** ตรวจ reference แนวทางตามชนิดงานของ skill
- **THEN** reference ระบุทุกชนิดพร้อมรูปแบบ prototype ที่เหมาะ และชุดทดสอบ catalog ล้มถ้ามีชนิดที่ขาด

#### Scenario: ใช้ design ของ project

- **GIVEN** project มี design token หรือธีมในซอร์ส
- **WHEN** skill สร้างหน้า
- **THEN** หน้าใช้ token นั้นและบอกที่มาไว้ในหน้า ถ้าไม่มี token ใช้ค่ากลางและบอกว่าไม่ใช่ design ของ project

#### Scenario: แก้หน้าแล้วแก้ change

- **GIVEN** ผู้ใช้ขอเพิ่มปุ่มกรองที่ agreement ไม่มี
- **WHEN** skill แก้หน้า
- **THEN** skill revise draft ก่อน Build หรือ amend ระหว่าง Build ให้มี requirement และ scenario ของปุ่มนั้นในรอบเดียวกัน แล้วรายงาน requirement delta ที่รออนุมัติ

#### Scenario: ขัดกับ agreement ที่อนุมัติแล้ว

- **GIVEN** ผู้ใช้ขอให้หน้าแสดงสิ่งที่ขัดกับ requirement ที่อนุมัติแล้ว
- **WHEN** skill แก้หน้า
- **THEN** skill ไม่ปล่อยให้ไม่ตรงเงียบ ๆ แต่เสนอ amend หรือยกเลิกการแก้ และไม่ลบ requirement โดยไม่ได้รับอนุมัติ

#### Scenario: ใช้ canvas เมื่อมี design skill

- **GIVEN** host มี skill design หรือ Artifact ชนิด design
- **WHEN** skill สร้างหน้าอนุมัติ
- **THEN** skill สร้างบน canvas นั้นโดยไม่ถามผู้ใช้ว่าจะใช้หรือไม่ จัดเป็นเฟรมต่อหน้าจอหรือสถานะ มีเลขลำดับและหัวข้อกลุ่ม แล้วส่งออกไฟล์ prototype.html ใน .foundation/previews เพราะ harness ตรวจจากไฟล์นั้น

#### Scenario: แก้บน canvas แล้วส่งออกใหม่

- **GIVEN** ผู้ใช้แก้เฟรมบน canvas
- **WHEN** skill ทำงานต่อ
- **THEN** skill ส่งออกไฟล์ใหม่และ revise หรือ amend change ให้ตรงในรอบเดียวกัน ไม่ปล่อยให้ไฟล์ค้างเป็นฉบับเก่า

#### Scenario: canvas ใช้ไม่ได้

- **GIVEN** host มี design skill แต่สร้างบน canvas ไม่สำเร็จ
- **WHEN** skill สร้างหน้า
- **THEN** skill ตกกลับไปเขียนไฟล์ HTML อย่างเดียว บอกผู้ใช้ว่าเหตุใดไม่ได้ใช้ canvas และไม่หยุดงาน

#### Scenario: ไม่มีที่แสดงผลแบบ design

- **GIVEN** host ไม่มีทั้ง skill design และ Artifact ชนิด design
- **WHEN** skill สร้างหน้าเสร็จ
- **THEN** skill เขียนไฟล์ HTML อย่างเดียวและไม่ถามผู้ใช้

#### Scenario: ไม่แชร์เอง

- **GIVEN** ที่แสดงผลแบบ design รองรับการแชร์
- **WHEN** skill แสดงหน้า
- **THEN** skill ไม่แชร์หรือเผยแพร่ให้ผู้อื่นจนกว่าผู้ใช้จะสั่ง
