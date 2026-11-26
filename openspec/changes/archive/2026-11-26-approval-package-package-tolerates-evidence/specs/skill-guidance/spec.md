# skill-guidance

## MODIFIED Requirements

### Requirement: approval-page-contract

หน้าอนุมัติที่ agent หรือผู้ใช้เขียน SHALL เป็นไฟล์เดียวที่เรียงจากข้อเท็จจริงของ harness ไปถึงรายละเอียดผู้ตรวจ

- ไฟล์อยู่ที่ .foundation/previews/(change)/approval.html และไม่มี skill ที่ ship สำหรับเขียนหน้านี้ (commands.json package); prototype.html ไม่ถูกใช้แทนหน้าอนุมัติ
- ลำดับ: หัว แถบข้อเท็จจริงของ harness พร้อม factsDigest ล่าสุด, prototype ที่ลิงก์หรือฝังไว้ถ้ามี, รายการที่ต้องแสดงพร้อมสถานะ, ก่อน-หลัง, เส้นทาง, กรณีพลาดพร้อม recovery, undo และ who, รายละเอียดผู้ตรวจที่พับไว้
- ไม่เรียกเครือข่าย ไม่มีฟอร์มหรือปุ่มตัดสินใจ ใช้ภาษาของ draft และอ่านได้ด้วยคีย์บอร์ดโดยไม่พึ่งสีอย่างเดียว

#### Scenario: ลำดับของหน้า

- **GIVEN** ผู้เขียนหน้าสร้างหน้าของ change ที่มี scratch ครบและข้อมูลจาก package
- **WHEN** เปิดหน้า
- **THEN** ลำดับคือ หัว แถบข้อเท็จจริง prototype (ถ้ามี) รายการที่ต้องแสดง ก่อน-หลัง เส้นทาง กรณีพลาด undo และ who รายละเอียดผู้ตรวจ

#### Scenario: แถบข้อเท็จจริงคัดลอกจากข้อมูล

- **GIVEN** package พิมพ์ระดับความเสี่ยง proof และ role พร้อม factsDigest
- **WHEN** ผู้เขียนหน้าสร้างแถบข้อเท็จจริง
- **THEN** แถบใช้ค่าเดียวกับข้อมูลทุกค่าและมี factsDigest ล่าสุดอยู่ในหน้า

#### Scenario: ค่าที่ไม่ทราบ

- **GIVEN** draft ไม่ระบุฟิลด์ที่ต้องแสดง
- **WHEN** ผู้เขียนหน้าสร้างหน้า
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

### Requirement: trigger-descriptions

ระบบ SHALL ให้ description ของ skill ทั้ง 42 ตัว (ที่ไม่ใช่ lifecycle 34 ตัวและ lifecycle 8 ตัว ไม่นับ skill ที่ vendor มาทั้งชุดตาม Requirement vendored-skills) เป็นประโยค trigger สั้นที่บอกว่าใช้ทำอะไร ใช้เมื่อไร (สถานการณ์และคำที่ผู้ใช้พิมพ์จริง ทั้งไทยและอังกฤษ) และข้ามเมื่อไรโดยชี้ไปที่ skill ข้างเคียงจริง ตามข้อความที่กำหนดด้านล่าง

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
- onboard: Use when a project, with or without Change Loop installed, needs setting up for agents: quality lanes and baselines, the feature map, module boundaries (ตั้งค่าโปรเจกต์ให้พร้อมใช้ Change Loop). Skip installing files (cloop init) and agent guides (claude-md).
- prd: Use when a product requirement document must be written or revised as PRD.md plus prd.html: goal, stories, acceptance, rules, flows, NFR, ADR, scope, data, errors, open questions (เขียน PRD). Skip grooming a PRD into tasks (grill-task-gu).
- ux-design: Use when a product's UX/UI must be designed end to end in confirmed phases: uxui.md, a versioned design-system HTML, and per-feature or landing HTML artifacts (ออกแบบ UX/UI ทั้งโปรเจกต์). Skip single UX questions, audits, or one-screen fixes (ux-ui-principles).
- change: Use when settled intent must become or amend an OpenSpec agreement through Change Loop: /change, a new behavior request, or new observable behavior found during Build. Preserve approval boundaries; write no product code. Skip open options (brainstorming) and pre-Change research (investigate).
- build: Use when an approved Change Loop change must be implemented or repaired in its isolated workspace: /build, returned EDIT/REPAIR tasks, or continue approved work. Follow harness task ownership and resume routes; never Land or mutate Git history. Skip agreement edits (change) and evidence refresh (prove).
- prove: Use when an existing Change Loop change needs evidence produced or refreshed: /prove, providers, review, acceptance, stale receipts, or proof repair. Proven is not delivered and never grants Land. Skip product implementation (build) and read-only status (changes).
- land: Use when the user explicitly says to land, apply, or archive a proven Change Loop change (/land). Applies through advance, preserves target HEAD/index, and recovers the same transaction. Route standalone Git requests to git-workflow and deployment or publication to delivery-engineering.
- investigate: Use before Change to research feasibility, requirements, a bug's mechanics, how or why code works, or recorded rationale without product edits: /investigate, explain this flow, ดูว่าทำงานยังไง. Ask only unresolved material questions. Skip choosing among open product options (brainstorming).
- dev: Use when /dev is invoked: the Change Loop composition from optional Investigate through Change, isolated Build, Prove, Land, and Deliver, stopping at the user's target (asked when unstated); Land and Deliver only with explicit authority. Skip targeted phase work; use the phase skill directly.
- feature: Use when /feature is invoked or a selected PRD or backlog group must be implemented and proven through discovery, one Decision Sheet, compiled Change approval, and isolated Build. Proven is not delivery; intake approval grants no Land. Skip PRD grooming alone (grill-task-gu).
- changes: Use when asked to read or explain current status without editing: /changes, active or blocked changes, readiness, CI or evidence state, next actions (ติดอะไร, ทำอะไรต่อ). Read-only; never start implementation, grant authority, or infer delivery from proven. Skip HTML reports (harness-html-report).

#### Scenario: description ตรงตามข้อความที่กำหนด

- **GIVEN** SKILL.md ของ skill ทั้ง 42 ตัว
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

- **WHEN** description ของ skill ที่ไม่ได้ vendor มาทั้งชุดเกิน 80 คำ
- **THEN** skill-catalog.test.mjs fail ระบุชื่อ skill

### Requirement: minimal-skill-bodies

ระบบ SHALL ให้ SKILL.md ของ skill ในขอบเขตใช้โครงเดียวกัน: จุดยืน 1 บรรทัด, Steps ≤ 6 ข้อ, Harness ≤ 3 บรรทัด และรายการ References ที่อ่านเมื่อจำเป็น

- โครงเดิม: วรรคเปิด + ## Rules 7 ข้อ + ## Check before finishing 4-6 ข้อ + วรรค handoff + วรรค References (40-80 บรรทัด, 300-450 คำ)
- โครงใหม่: # ชื่อ / จุดยืน 1 บรรทัด / ## Steps (≤ 6 ข้อ ทำตามได้ทันที) / ## Harness (≤ 3 บรรทัด) / ## References (read only when needed) bullet: ชื่อไฟล์ — เมื่อไรควรอ่าน
- SKILL.md แต่ละไฟล์ในขอบเขต ≤ 250 คำ (ไม่รวม frontmatter) และรวมทุก SKILL.md ≤ 9,500 คำตาม budget เดิม
- skill ใช้งานได้เมื่อโหลดตัวเดียว (standalone): Steps มีขั้นตอนขั้นต่ำที่ทำได้เองโดยไม่บังคับโหลด skill อื่น การอ้าง skill อื่นเป็นเพียงการอ่านเพิ่มเมื่อมีติดตั้ง และไม่บังคับพึ่งไฟล์ของ harness หรือไฟล์ที่มีเฉพาะใน repo นี้ (tests, docs, release)
- วรรค Harness เป็นแบบมีเงื่อนไข: With OpenSpec/Change Loop ระบุว่า harness เป็นเจ้าของ lifecycle, receipts, task status และ Build ไม่ stage/commit; Otherwise ระบุที่บันทึกการตัดสินใจหรือ follow-up และสิ่งที่ใช้เป็น proof (CI หรือผลเทสต์); ยกเว้น harness-html-report ที่ต้องมี project Change Loop และ skill ที่ vendor มา (frontend-design, skill-creator, ui-ux-pro-max, tailwind-design-system) ที่แก้เฉพาะ description; skill ที่ vendor มาทั้งชุดตาม Requirement vendored-skills อยู่นอกขอบเขตนี้
- ข้อความที่ test เดิม pin (เช่น Design deep, cohesive modules; Never ask what you can find; not receipts; never hand-edit; approves intake choices, not a compiled OpenSpec packet) ยังอยู่หรือถูกแทนด้วยถ้อยคำใหม่ที่ test อัปเดตให้ตรงกันในงานเดียวกัน

#### Scenario: ทุก body อยู่ใน budget และใช้โครงเดียวกัน

- **GIVEN** SKILL.md 34 ไฟล์ในขอบเขต
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
- reference-governance.mjs ผ่าน: ทุกไฟล์ reachable, ลิงก์และ anchor resolve, ไม่มี block ซ้ำหรือใกล้เคียง (Jaccard ≥ 0.92); ไฟล์เกิน 300 บรรทัดยังมี ## Contents ยกเว้นใน skill ที่ vendor มาทั้งชุด
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
- ux-ui-principles (863, 13 ไฟล์ → 10): merge visual + visual-composition → ~90; merge accessibility + accessibility-verification → ~90; merge patterns + experience-patterns → ~110; experience-workflow → ~90; sources → ~40; keep interaction, validation, do-and-dont, change-loop-handoff, upstream (pinned); แผนนี้เป็นประวัติ: bundle นี้ถูกแทนด้วยสำเนา vendor ตาม Requirement vendored-skills ซึ่งอยู่นอกแผนและยอดบรรทัดนี้
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
- **WHEN** รัน skill-catalog.test.mjs และ reference-governance.mjs
- **THEN** test ยืนยันว่า references รวมไม่รวม skill ที่ vendor มา ≤ 8,500 บรรทัด และไม่มี issue

#### Scenario: เนื้อหาที่ pin ยังครบ

- **GIVEN** ไฟล์ reference ที่ test pin ไว้
- **WHEN** รัน skill-catalog.test.mjs และ run-context-budget-tests.sh
- **THEN** ทุก assertion ผ่าน

#### Scenario: ไฟล์ที่แผนบอกว่าลบหรือรวมหายไปจริง

- **GIVEN** แผนระบุ drop observability.md ของ architecture, testing.md ของ programming, auth-and-limits.md, instrumentation.md, distributed-debugging.md และคู่ซ้ำ 3 คู่ของ ux-ui-principles
- **WHEN** รัน skill-catalog.test.mjs
- **THEN** test ยืนยันว่า observability.md ของ architecture, testing.md ของ programming, auth-and-limits.md, instrumentation.md และ distributed-debugging.md ไม่อยู่

#### Scenario: ลบไฟล์ที่ยังถูกอ้าง

- **WHEN** reference ถูกลบแต่ SKILL.md หรือ reference อื่นยังลิงก์ถึง
- **THEN** reference-governance.mjs รายงาน unresolved reference

## REMOVED Requirements

### Requirement: prototype-skill-contract

skill prototype ถูกลบใน 3.6.10

**Migration:** skill prototype ถูกลบแล้ว (dcdaa038) หน้าอนุมัติเขียนโดย agent หรือผู้ใช้ตาม approval-page-contract และ prototype เป็นตัวอย่างชนิด prototype ใน draft
