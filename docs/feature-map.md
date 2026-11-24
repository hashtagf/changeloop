# Feature map

<!-- Generated from docs/feature-map.json by `node scripts/docs/feature-map.mjs --write`. Edit the JSON, not this file. -->

**Audience:** maintainers and coding agents changing Change Loop. Use these
feature names when you describe or request work, so people and agents mean the
same thing. Each feature lists what the user sees and the code, tests, and
docs that own it. User-facing terms are defined in the
[glossary](../website/docs/src/content/docs/glossary.md); the rules for
keeping this map current are in [How the map is kept current](#how-the-map-is-kept-current).

| Feature | ชื่อไทย | Phase | User sees |
|---|---|---|---|
| [Investigate](#investigate) | สืบค้นก่อนตกลง | investigate | `/investigate` |
| [Write the agreement](#agreement) | เขียนข้อตกลงของ change | change | `/change` |
| [Approval page](#approval-page) | หน้าอนุมัติ | change | `package`, `preview` |
| [Amend during Build](#amendment) | แก้ข้อตกลงระหว่าง Build | build | `change amend` |
| [Validate and trace](#validation) | ตรวจข้อตกลงและการโยงหลักฐาน | change | `change validate`, `change audit`, `change waive` |
| [Advance and what the user sees](#advance) | advance และสิ่งที่ผู้ใช้เห็น | cross-phase | `/dev`, `/feature`, `WORKING`, `TARGET_REACHED`, `DELIVERED`, `NEEDS_DECISION`, `WAITING_EXTERNAL`, `PAUSED` |
| [Build in a sandbox](#build-sandbox) | Build ใน sandbox | build | `/build` |
| [Parallel agents and task packets](#parallel-agents) | agent ทำงานขนานและ task packet | build | `agents plan`, `agents dispatch`, `agents acquire` |
| [Prove with evidence](#prove) | พิสูจน์ด้วยหลักฐาน | prove | `/prove` |
| [Review and external authority](#review) | รีวิวและผู้มีอำนาจภายนอก | prove | `authority request`, `authority status`, `authority dispatch` |
| [Land and archive](#land) | Land และ archive | land | `/land` |
| [Deliver as a pull request](#deliver) | ส่งงานเป็น pull request | deliver | `/deliver` |
| [Multiple repositories](#multi-repository) | หลาย repository | cross-phase | `repos` |
| [Status, history, and diagnosis](#status) | สถานะ ประวัติ และการวินิจฉัย | cross-phase | `/changes` |
| [Operations handoff](#operations-handoff) | ส่งต่องานปฏิบัติการ | cross-phase | `handoff status`, `handoff list`, `handoff packet` |
| [Abandon a change](#abandon) | ยกเลิก change | cross-phase | `change abandon` |
| [Consumer quality gates](#consumer-quality) | quality gate ของโปรเจกต์ผู้ใช้ | cross-phase | `quality discover`, `quality init`, `quality doctor` |
| [Pyramid readiness](#pyramid-readiness) | ความพร้อมตาม pyramid | cross-phase | `quality readiness` |
| [Project feature map](#project-feature-map) | feature map ของโปรเจกต์ | cross-phase | `features` |
| [Product documents (PRD and UX/UI)](#product-handoff) | เอกสาร product (PRD และ UX/UI) | cross-phase | `product status`, `product measure` |
| [Install, hosts, and onboarding](#install-and-hosts) | ติดตั้ง เชื่อม host และ onboarding | setup | `init`, `models`, `host agent-contract` |
| [Team dashboard](#team-dashboard) | dashboard ของทีม | setup | `dashboard`, `dashboard snapshot` |

<a id="investigate"></a>

## Investigate — สืบค้นก่อนตกลง

**Phase:** investigate

Research a problem, a bug's mechanics, or bounded alternatives without editing product code; hands grounded findings to Change.

ค้นข้อมูล กลไกของบั๊ก หรือทางเลือก โดยไม่แก้โค้ด แล้วส่งผลที่มีหลักฐานต่อให้ขั้น Change

| | |
|---|---|
| Slash commands | `/investigate` |
| CLI commands | `investigate` |
| User states | — |
| Runtime groups | `workflow/investigation` |
| Code | `.claude/harness/runtime/workflow/investigation/investigation-runtime.mjs` |
| Tests | `.claude/harness/tests/investigation-runtime.test.mjs` |
| Docs | `.claude/harness/lifecycle/investigate.md`, `website/docs/src/content/docs/loop/investigate.md` |

<a id="agreement"></a>

## Write the agreement — เขียนข้อตกลงของ change

**Phase:** change

Turn settled intent into an OpenSpec agreement: the agent writes a draft, the harness compiles proposal, design, specs, tasks, and evidence, and the user approves it.

เปลี่ยนเจตนาที่ตกลงแล้วเป็นข้อตกลง OpenSpec: agent เขียน draft, harness compile เป็น proposal, design, specs, tasks และ evidence แล้วผู้ใช้อนุมัติ

| | |
|---|---|
| Slash commands | `/change` |
| CLI commands | `change start`, `change new`, `change revise`, `change resolve`, `providers` |
| User states | — |
| Runtime groups | `workflow/change`, `workflow/draft`, `workflow/validation` |
| Code | `.claude/harness/runtime/workflow/change/change-lifecycle.mjs`, `.claude/harness/runtime/workflow/draft/semantic-draft.mjs`, `.claude/harness/runtime/workflow/draft/draft-folder.mjs` |
| Tests | `.claude/harness/tests/change-atomic-start.test.mjs`, `.claude/harness/tests/semantic-draft.test.mjs`, `.claude/harness/tests/change-lifecycle-surface.test.mjs` |
| Docs | `.claude/harness/lifecycle/change.md`, `website/docs/src/content/docs/loop/change.md` |

<a id="approval-page"></a>

## Approval page — หน้าอนุมัติ

**Phase:** change

The decision-first page the user reads before approving: risk, decisions, open questions, scope, and optional prototype previews.

หน้าที่ผู้ใช้อ่านก่อนอนุมัติ เรียงจากการตัดสินใจ: ความเสี่ยง, ทางเลือก, คำถามค้าง, ขอบเขต และ preview ของ prototype

| | |
|---|---|
| Slash commands | — |
| CLI commands | `package`, `preview` |
| User states | — |
| Runtime groups | `workflow/prototype` |
| Code | `.claude/harness/runtime/workflow/change/approval-package.mjs`, `.claude/harness/runtime/workflow/prototype/preview-runtime.mjs`, `.claude/harness/runtime/workflow/prototype/prototype-binding.mjs` |
| Tests | `.claude/harness/tests/approval-package.test.mjs`, `.claude/harness/tests/preview-runtime.test.mjs` |
| Docs | `website/docs/src/content/docs/approval.md` |

<a id="amendment"></a>

## Amend during Build — แก้ข้อตกลงระหว่าง Build

**Phase:** build

Change requirements or tasks mid-Build under the same change ID; only the affected proof is redone.

เพิ่ม แก้ หรือลบ requirement หรือ task ระหว่าง Build โดยใช้ change ID เดิม และทำ proof ใหม่เฉพาะส่วนที่กระทบ

| | |
|---|---|
| Slash commands | — |
| CLI commands | `change amend` |
| User states | — |
| Runtime groups | `workflow/draft` |
| Code | `.claude/harness/runtime/workflow/change/change-amendment.mjs`, `.claude/harness/runtime/workflow/draft/semantic-amendment.mjs` |
| Tests | `.claude/harness/tests/amendment-invalidation.test.mjs`, `.claude/harness/tests/amendment-record.test.mjs` |
| Docs | `.claude/harness/lifecycle/change.md` |

<a id="validation"></a>

## Validate and trace — ตรวจข้อตกลงและการโยงหลักฐาน

**Phase:** change

Check that every scenario, claim, task, and provider trace to each other, and record a user-approved waiver of one failing gate.

ตรวจว่า scenario, claim, task และ provider โยงกันครบ และบันทึกการยกเว้น gate ที่ผู้ใช้อนุมัติ

| | |
|---|---|
| Slash commands | — |
| CLI commands | `change validate`, `change audit`, `change waive` |
| User states | — |
| Runtime groups | `workflow/change` |
| Code | `.claude/harness/runtime/workflow/change/change-validation.mjs`, `.claude/harness/runtime/workflow/change/grounding-validation.mjs`, `.claude/harness/runtime/workflow/change/gate-waivers.mjs` |
| Tests | `.claude/harness/tests/change-validation-phases.test.mjs`, `.claude/harness/tests/traceability.test.mjs`, `.claude/harness/tests/waive-gate.test.mjs` |
| Docs | `website/docs/src/content/docs/evidence/claims.md` |

<a id="advance"></a>

## Advance and what the user sees — advance และสิ่งที่ผู้ใช้เห็น

**Phase:** cross-phase

The one resumable command that moves a change toward a target, reuses valid work, and stops only at a real decision; every stop becomes one of the user-facing states.

คำสั่งเดียวที่พา change ไปถึงเป้าหมาย ใช้งานที่ยังถูกต้องซ้ำ และหยุดเฉพาะเมื่อต้องตัดสินใจจริง ทุกจุดหยุดแสดงเป็นสถานะที่ผู้ใช้เห็น

| | |
|---|---|
| Slash commands | `/dev`, `/feature` |
| CLI commands | `advance`, `current`, `packet`, `budget checkpoint`, `budget continue` |
| User states | `WORKING`, `TARGET_REACHED`, `DELIVERED`, `NEEDS_DECISION`, `WAITING_EXTERNAL`, `PAUSED` |
| Runtime groups | `workflow/advance` |
| Code | `.claude/harness/runtime/workflow/advance/advance-runtime.mjs`, `.claude/harness/runtime/workflow/advance/advance-envelope.mjs`, `.claude/harness/runtime/core/lifecycle-outcome.mjs` |
| Tests | `.claude/harness/tests/advance-runtime.test.mjs`, `.claude/harness/tests/lifecycle-user-projection-golden.test.mjs`, `.claude/harness/tests/budget-continuation.test.mjs` |
| Docs | `WORKFLOW.md`, `website/docs/src/content/docs/cli.md` |

<a id="build-sandbox"></a>

## Build in a sandbox — Build ใน sandbox

**Phase:** build

Implement the change in an isolated workspace so the main checkout stays untouched until Land; keep it in sync with agreement revisions and target moves.

เขียนโค้ดใน workspace แยก checkout หลักไม่ถูกแตะจนถึง Land และ sync เมื่อข้อตกลงหรือ repo เป้าหมายเปลี่ยน

| | |
|---|---|
| Slash commands | `/build` |
| CLI commands | `sandbox create`, `sandbox sync`, `sandbox inspect`, `sandbox challenge`, `exec` |
| User states | — |
| Runtime groups | `workflow/sandbox` |
| Code | `.claude/harness/runtime/workflow/sandbox/sandbox-runtime.mjs`, `.claude/harness/runtime/workflow/sandbox/sandbox-sync.mjs` |
| Tests | `.claude/harness/tests/sandbox-create-phases.test.mjs`, `.claude/harness/tests/sandbox-runtime-sync.test.mjs`, `.claude/harness/tests/sandbox-data-loss.test.mjs` |
| Docs | `.claude/harness/lifecycle/build.md`, `website/docs/src/content/docs/loop/build.md` |

<a id="parallel-agents"></a>

## Parallel agents and task packets — agent ทำงานขนานและ task packet

**Phase:** build

Plan independently verifiable tasks, hand each worker a bounded packet, and fence shared resources with leases.

วางแผน task ที่ตรวจแยกกันได้ ส่ง packet ที่มีขอบเขตชัดให้แต่ละ worker และกันทรัพยากรที่ใช้ร่วมกันด้วย lease

| | |
|---|---|
| Slash commands | — |
| CLI commands | `agents plan`, `agents dispatch`, `agents acquire`, `agents release`, `agent-task` |
| User states | — |
| Runtime groups | `workflow/authority`, `workflow/packet` |
| Code | `.claude/harness/runtime/workflow/authority/agent-planning.mjs`, `.claude/harness/runtime/workflow/authority/agent-dispatch.mjs`, `.claude/harness/runtime/workflow/authority/lease-runtime.mjs`, `.claude/harness/runtime/workflow/packet/packet-runtime.mjs` |
| Tests | `.claude/harness/tests/agent-dispatch.test.mjs`, `.claude/harness/tests/lease-interleaving.test.mjs`, `.claude/harness/tests/packet-value.test.mjs` |
| Docs | `.claude/harness/lifecycle/build.md` |

<a id="prove"></a>

## Prove with evidence — พิสูจน์ด้วยหลักฐาน

**Phase:** prove

Run the project's own checks for every claim and bind each result to the exact code; detect and wire providers, and accept signed CI or external evidence.

รัน check ของโปรเจกต์ตาม claim แล้วผูกผลกับโค้ดชุดนั้นพอดี ตรวจหาและต่อ provider และรับ CI ที่ลงนามหรือหลักฐานจากภายนอก

| | |
|---|---|
| Slash commands | `/prove` |
| CLI commands | `proof readiness`, `proof collect`, `proof advance`, `proof run`, `proof preflight`, `proof execute`, `proof finalize`, `proof audit`, `proof-plan`, `evidence detect`, `evidence init`, `evidence doctor`, `evidence run`, `evidence record`, `evidence verify-ci`, `hash` |
| User states | — |
| Runtime groups | `evidence` |
| Code | `.claude/harness/runtime/evidence/proof-execution-runtime.mjs`, `.claude/harness/runtime/evidence/evidence-contract.mjs`, `.claude/harness/runtime/evidence/receipt-runtime.mjs`, `.claude/harness/runtime/evidence/app-smoke-check.mjs` |
| Tests | `.claude/harness/tests/proof-advance.test.mjs`, `.claude/harness/tests/proof-audit.test.mjs`, `.claude/harness/tests/signed-ci.test.mjs`, `.claude/harness/tests/app-smoke.test.mjs` |
| Docs | `.claude/harness/lifecycle/prove.md`, `.claude/harness/EVIDENCE.md`, `website/docs/src/content/docs/loop/prove.md`, `website/docs/src/content/docs/evidence/receipts.md` |

<a id="review"></a>

## Review and external authority — รีวิวและผู้มีอำนาจภายนอก

**Phase:** prove

Route AI or human review and acceptance, keep the attempt history, and record bound responses; retries and extra waves need a recorded user decision.

ส่งงานให้ AI หรือคนรีวิวและรับรอง เก็บประวัติแต่ละรอบ และบันทึกคำตอบที่ผูกกับโค้ด การลองซ้ำหรือเพิ่มรอบต้องมีการตัดสินใจของผู้ใช้

| | |
|---|---|
| Slash commands | — |
| CLI commands | `authority request`, `authority status`, `authority dispatch`, `authority abort`, `authority run`, `authority reset-infra`, `authority extend-review`, `authority reset-base-move`, `authority record` |
| User states | — |
| Runtime groups | `workflow/authority` |
| Code | `.claude/harness/runtime/workflow/authority/authority-runtime.mjs`, `.claude/harness/runtime/workflow/authority/authority-reviewer-run.mjs`, `.claude/harness/runtime/evidence/configured-reviewer.mjs` |
| Tests | `.claude/harness/tests/authority-continuity.test.mjs`, `.claude/harness/tests/configured-reviewer.test.mjs`, `.claude/harness/tests/review-repair-closure.test.mjs` |
| Docs | `.claude/harness/EVIDENCE.md` |

<a id="land"></a>

## Land and archive — Land และ archive

**Phase:** land

On the user's explicit instruction, apply the proven change to the target as an uncommitted diff with HEAD and index unchanged, then archive the agreement; interrupted Land resumes the same transaction.

เมื่อผู้ใช้สั่งชัดเจน นำ change ที่พิสูจน์แล้วลง repo เป้าหมายเป็น diff ที่ยังไม่ commit โดย HEAD และ index ไม่เปลี่ยน แล้ว archive ข้อตกลง ถ้าสะดุดจะกลับมาทำ transaction เดิมต่อ

| | |
|---|---|
| Slash commands | `/land` |
| CLI commands | `land check`, `land advance`, `land recover`, `land archive`, `land resume`, `land plan`, `sandbox apply` |
| User states | — |
| Runtime groups | `workflow/land`, `workflow/transaction` |
| Code | `.claude/harness/runtime/workflow/land/land-runtime.mjs`, `.claude/harness/runtime/workflow/land/apply-runtime.mjs`, `.claude/harness/runtime/workflow/transaction/land-journal.mjs` |
| Tests | `.claude/harness/tests/apply-runtime-archive.test.mjs`, `.claude/harness/tests/land-grant.test.mjs`, `.claude/harness/tests/recover-pending-apply.test.mjs` |
| Docs | `.claude/harness/lifecycle/land.md`, `website/docs/src/content/docs/loop/land.md` |

<a id="deliver"></a>

## Deliver as a pull request — ส่งงานเป็น pull request

**Phase:** deliver

Optionally commit an archived change on its own branch and open a pull request; needs separate delivery authority.

commit change ที่ archive แล้วบน branch ของตัวเองและเปิด PR (ทำหรือไม่ก็ได้) ต้องได้สิทธิ์ส่งงานแยกต่างหาก

| | |
|---|---|
| Slash commands | `/deliver` |
| CLI commands | `deliver advance` |
| User states | — |
| Runtime groups | `workflow/delivery` |
| Code | `.claude/harness/runtime/workflow/delivery/pull-request-runtime.mjs`, `.claude/harness/runtime/workflow/delivery/repository-delivery-saga.mjs` |
| Tests | `.claude/harness/tests/pull-request-runtime.test.mjs`, `.claude/harness/tests/repository-delivery-saga.test.mjs` |
| Docs | `.claude/harness/lifecycle/deliver.md` |

<a id="multi-repository"></a>

## Multiple repositories — หลาย repository

**Phase:** cross-phase

Work across submodules and sibling repositories: select them, isolate each, and land them in dependency order.

ทำงานข้าม submodule และ repo ข้างเคียง: เลือก repo แยก workspace แต่ละตัว และ Land ตามลำดับการพึ่งพา

| | |
|---|---|
| Slash commands | — |
| CLI commands | `repos` |
| User states | — |
| Runtime groups | `workflow/repository` |
| Code | `.claude/harness/runtime/workflow/repository/repository-topology.mjs`, `.claude/harness/runtime/workflow/repository/repository-snapshot.mjs` |
| Tests | `.claude/harness/tests/repository-topology.test.mjs`, `.claude/harness/tests/concurrent-repositories.test.mjs` |
| Docs | `website/docs/src/content/docs/multi-repository.md` |

<a id="status"></a>

## Status, history, and diagnosis — สถานะ ประวัติ และการวินิจฉัย

**Phase:** cross-phase

See active changes and their next step, diagnose readiness, and read measured cost, timing, outcomes, and recurring findings.

ดู change ที่กำลังทำและขั้นถัดไป ตรวจความพร้อม และอ่านค่าใช้จ่าย เวลา ผลลัพธ์ และปัญหาที่เกิดซ้ำที่วัดได้จริง

| | |
|---|---|
| Slash commands | `/changes` |
| CLI commands | `changes`, `doctor`, `metrics`, `feedback`, `outcomes`, `lessons`, `describe`, `help`, `version`, `update check` |
| User states | — |
| Runtime groups | `observability` |
| Code | `.claude/harness/runtime/core/diagnostics-runtime.mjs`, `.claude/harness/runtime/observability/metrics-runtime.mjs`, `.claude/harness/runtime/observability/outcomes-runtime.mjs` |
| Tests | `.claude/harness/tests/diagnostics-changes.test.mjs`, `.claude/harness/tests/outcomes-lessons.test.mjs` |
| Docs | `website/docs/src/content/docs/cli.md` |

<a id="operations-handoff"></a>

## Operations handoff — ส่งต่องานปฏิบัติการ

**Phase:** cross-phase

Track permission-bound external operations (deploys, migrations, access) as obligations for a named operator, not developer tasks.

ติดตามงานภายนอกที่ต้องใช้สิทธิ์ เช่น deploy, migration หรือการให้สิทธิ์ เป็นภาระของผู้ปฏิบัติการที่มีชื่อ ไม่ใช่ task ของ developer

| | |
|---|---|
| Slash commands | — |
| CLI commands | `handoff status`, `handoff list`, `handoff packet`, `handoff record` |
| User states | — |
| Runtime groups | `workflow/authority` |
| Code | `.claude/harness/runtime/workflow/authority/handoff-runtime.mjs` |
| Tests | `.claude/harness/tests/handoff-policy.test.mjs`, `.claude/harness/tests/handoff-operation-normalization.test.mjs` |
| Docs | `WORKFLOW.md` |

<a id="abandon"></a>

## Abandon a change — ยกเลิก change

**Phase:** cross-phase

Retire a change that cannot be proven after a recorded user decision, quarantining its record instead of deleting it.

เลิก change ที่พิสูจน์ไม่ได้หลังผู้ใช้ตัดสินใจ โดยเก็บบันทึกแยกไว้ ไม่ลบทิ้ง

| | |
|---|---|
| Slash commands | — |
| CLI commands | `change abandon` |
| User states | — |
| Runtime groups | `workflow/change` |
| Code | `.claude/harness/runtime/workflow/change/abandon-runtime.mjs` |
| Tests | `.claude/harness/tests/abandon-runtime.test.mjs` |
| Docs | `WORKFLOW.md` |

<a id="consumer-quality"></a>

## Consumer quality gates — quality gate ของโปรเจกต์ผู้ใช้

**Phase:** cross-phase

Optional CRAP, mutation, lint, type-check, file-size, and module-boundary checks on the user project; every one ratchets against a baseline that may only shrink.

ตรวจ CRAP, mutation, lint, type-check, ขนาดไฟล์ และขอบเขตโมดูลในโปรเจกต์ของผู้ใช้ (เปิดหรือไม่ก็ได้) ทุกตัว ratchet กับ baseline ที่ลดได้อย่างเดียว

| | |
|---|---|
| Slash commands | — |
| CLI commands | `quality discover`, `quality init`, `quality doctor`, `quality run`, `quality report`, `quality baseline`, `quality debt` |
| User states | — |
| Runtime groups | `quality` |
| Code | `.claude/harness/runtime/quality/quality-runtime.mjs`, `.claude/harness/runtime/quality/findings-ratchet.mjs`, `.claude/harness/runtime/quality/module-boundary-proposal.mjs`, `.claude/harness/runtime/quality/onboarding-candidates.mjs` |
| Tests | `.claude/harness/tests/quality-runtime.test.mjs`, `.claude/harness/tests/quality-adapters.test.mjs`, `.claude/harness/tests/findings-ratchet.test.mjs` |
| Docs | `.claude/harness/CONSUMER-QUALITY.md`, `website/docs/src/content/docs/consumer-quality.md` |

<a id="pyramid-readiness"></a>

## Pyramid readiness — ความพร้อมตาม pyramid

**Phase:** cross-phase

Per-layer readiness (codebase, static checks, verification, prose, review) of the user project, the same criteria Change Loop's own scorecard uses, with the next step for the weakest layer; a project with a user interface also gets UI rows (tokens, accessibility lint, rendered and accessibility checks, DESIGN.md).

ความพร้อมของโปรเจกต์ผู้ใช้แยกตามชั้น (ตัวโค้ด, ตัวตรวจอัตโนมัติ, เทสต์, เอกสาร, คนรีวิว) ด้วยเกณฑ์เดียวกับ scorecard ของ Change Loop เอง พร้อมขั้นต่อไปของชั้นที่อ่อนที่สุด; โปรเจกต์ที่มีหน้าจอได้เกณฑ์ UI เพิ่ม (design token, lint ด้าน a11y, ตรวจหน้าจอจริงและ a11y, DESIGN.md)

| | |
|---|---|
| Slash commands | — |
| CLI commands | `quality readiness` |
| User states | — |
| Runtime groups | — |
| Code | `.claude/harness/runtime/quality/pyramid-readiness.mjs`, `.claude/harness/runtime/quality/rule-registry.mjs`, `.claude/harness/runtime/quality/guide-rules.mjs`, `.claude/harness/runtime/quality/incident-records.mjs`, `.claude/harness/runtime/quality/ui-readiness.mjs`, `.claude/harness/runtime/composition/pyramid-readiness-command.mjs` |
| Tests | `.claude/harness/tests/pyramid-readiness.test.mjs`, `.claude/harness/tests/consumer-onboarding-path.test.mjs`, `.claude/harness/tests/repository-onboarding.test.mjs` |
| Docs | `.claude/harness/CONSUMER-QUALITY.md`, `website/docs/src/content/docs/consumer-quality.md` |

<a id="project-feature-map"></a>

## Project feature map — feature map ของโปรเจกต์

**Phase:** cross-phase

The user project names its own features and the paths behind them in openspec/feature-map.json; intake reads it, the features command checks it and names the features a change touches, and the approval page lists them.

โปรเจกต์ของผู้ใช้ตั้งชื่อฟีเจอร์ของตัวเองและ path ที่อยู่เบื้องหลังใน openspec/feature-map.json ขั้น intake อ่านไฟล์นี้ คำสั่ง features ตรวจและบอกว่า change แตะฟีเจอร์ไหน และหน้าอนุมัติแสดงรายการฟีเจอร์

| | |
|---|---|
| Slash commands | — |
| CLI commands | `features` |
| User states | — |
| Runtime groups | — |
| Code | `.claude/harness/runtime/workflow/validation/project-feature-map.mjs`, `.claude/harness/templates/feature-map.json` |
| Tests | `.claude/harness/tests/project-feature-map.test.mjs` |
| Docs | `website/docs/src/content/docs/artifacts.md`, `WORKFLOW.md` |

<a id="product-handoff"></a>

## Product documents (PRD and UX/UI) — เอกสาร product (PRD และ UX/UI)

**Phase:** cross-phase

A PM's PRD and a designer's uxui.md, in any layout with IDs, are found in the project; every change names the documents it comes from and must cover each owed item or exclude it with a reason, validation stops when a document changes after approval or an amendment drops an item, and product status shows every item across all changes. After release, product measure records each success metric's value and source.

PRD ของ PM และ uxui.md ของ designer ที่มี ID เขียนแบบไหนก็ได้ ระบบหาเจอในโปรเจกต์ ทุก change ต้องบอกว่ามาจากเอกสารไหนและต้องครอบคลุมทุกข้อที่ต้องทำหรือตัดออกพร้อมเหตุผล การตรวจจะหยุดเมื่อเอกสารถูกแก้หลังอนุมัติหรือ amendment ทำให้ข้อหาย และ product status แสดงทุกข้อข้ามทุก change หลังปล่อย product measure บันทึกค่าตัวชี้วัดความสำเร็จพร้อมแหล่งที่มา

| | |
|---|---|
| Slash commands | — |
| CLI commands | `product status`, `product measure` |
| User states | — |
| Runtime groups | — |
| Code | `.claude/harness/runtime/workflow/validation/product-handoff.mjs`, `.claude/harness/runtime/workflow/validation/handoff-binding.mjs`, `.claude/harness/runtime/workflow/validation/product-progress.mjs`, `.claude/skills/prd/SKILL.md`, `.claude/skills/ux-design/SKILL.md`, `.claude/harness/runtime/workflow/validation/product-measures.mjs` |
| Tests | `.claude/harness/tests/product-handoff.test.mjs`, `.claude/harness/tests/product-progress.test.mjs`, `.claude/tests/docs/pm-ux-skills.test.mjs` |
| Docs | `.claude/harness/lifecycle/change.md`, `website/docs/src/content/docs/loop/change.md`, `website/docs/src/content/docs/cli.md` |

<a id="install-and-hosts"></a>

## Install, hosts, and onboarding — ติดตั้ง เชื่อม host และ onboarding

**Phase:** setup

Install or upgrade Change Loop, connect agent hosts, then onboard the project: doctor lists setup rows and the onboard skill drafts the quality baselines and feature map for the user to confirm.

ติดตั้งหรืออัปเกรด Change Loop เชื่อม host ของ agent แล้ว onboard โปรเจกต์: doctor แสดงรายการ setup และ skill onboard ร่าง quality baseline กับ feature map ให้ผู้ใช้ยืนยัน

| | |
|---|---|
| Slash commands | — |
| CLI commands | `init`, `models`, `host agent-contract`, `host instruction`, `telemetry sync`, `telemetry import`, `telemetry host-import`, `event`, `api-version` |
| User states | — |
| Runtime groups | — |
| Code | `.claude/harness/adapters/pi-extension.mjs`, `.claude/harness/runtime/core/host-instruction.mjs`, `.claude/harness/runtime/observability/telemetry-runtime.mjs`, `.claude/harness/runtime/quality/guide-readiness.mjs`, `.claude/skills/onboard/SKILL.md` |
| Tests | `.claude/harness/tests/host-capability-matrix.test.mjs`, `.claude/harness/tests/telemetry-import-sync.test.mjs`, `.claude/harness/tests/setup-readiness.test.mjs` |
| Docs | `website/docs/src/content/docs/install.md`, `.claude/harness/README.md` |

<a id="team-dashboard"></a>

## Team dashboard — dashboard ของทีม

**Phase:** setup

Optional team presence and usage view fed by agent heartbeats.

หน้าแสดงว่าใครออนไลน์และการใช้งานของทีม (เปิดหรือไม่ก็ได้) จาก heartbeat ของ agent

| | |
|---|---|
| Slash commands | — |
| CLI commands | `dashboard`, `dashboard snapshot` |
| User states | — |
| Runtime groups | — |
| Code | `dashboard/server.js`, `dashboard/client.sh` |
| Tests | `dashboard/test/server.test.js` |
| Docs | `dashboard/README.md` |

## How the map is kept current

`node scripts/docs/feature-map.mjs` (run by the documentation suite in the
default gate) fails when:

- a CLI command in `.claude/harness/commands.json`, a slash command in
  `.claude/commands/`, a user state from `lifecycleUserState`, or a runtime
  group belongs to no feature, or a command belongs to two;
- a feature names a command, state, group, or path that does not exist;
- this page differs from what `--write` renders from the JSON.

Adding a user-facing command, state, or runtime group therefore means choosing
its feature in `docs/feature-map.json` and running `--write`.
