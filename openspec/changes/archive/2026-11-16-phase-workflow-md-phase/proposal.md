# Change: แยกรายละเอียดแต่ละ phase ออกจาก WORKFLOW.md เป็นไฟล์ละ phase

- **Change:** `phase-workflow-md-phase` · **Lane:** standard (impact or coupling above the rapid limit)
- **Review:** medium tier · **Owner:** unassigned · **Created:** 2026-11-16

## เหตุผล

WORKFLOW.md ยาว 21.5k คำ และส่วน Lifecycle commands ส่วนเดียวกินไป 16.4k คำ agent กับคนอ่านต้องผ่านทั้งไฟล์เพื่อหากฎของ phase ที่ทำอยู่ change นี้ย้ายรายละเอียดแต่ละ phase ไปไฟล์ของตัวเองโดยไม่แก้ความหมายของกฎ และให้ WORKFLOW.md เหลือภาพรวมกับสัญญาที่ใช้ร่วมกัน

## ขอบเขต

- **In scope (`docs`):** WORKFLOW.md ส่วน Lifecycle commands เหลือสรุปสั้นต่อ phase พร้อมลิงก์; ไฟล์ใหม่ .claude/harness/lifecycle/{investigate,change,build,prove,land,deliver}.md; ลิงก์ในเอกสาร skill command เว็บไซต์ และ test ที่อ้างส่วนที่ย้าย
- **Out of scope:** edits outside `WORKFLOW.md`, `.claude/harness/lifecycle/**`, `.claude/harness/README.md`, `.claude/tests/docs/**`, `.claude/tests/affected-suite-selector.mjs`, `.claude/tests/harness/affected-suite-selector.test.mjs`, … +10 more; the authored Non-goals below

## Non-goals

- แก้ความหมายของกฎใด ๆ
- เปลี่ยน install.sh (ไฟล์ใหม่อยู่ใต้ .claude/harness ซึ่ง managed อยู่แล้ว)
- ย่อส่วน cross-cutting ของ WORKFLOW.md

## ผลกระทบและความเสี่ยง

- **Impact:** medium
- **Coupling:** coupled
- **Affected surfaces:** code
- **Security triggers:** none detected

## การสื่อสาร การดูแลหลังปล่อย และ release note

### Release note

WORKFLOW.md เหลือภาพรวมและสัญญาที่ใช้ร่วมกัน รายละเอียดเต็มของ /investigate, /change, /build, /prove, /land และ /deliver ย้ายไป .claude/harness/lifecycle/<phase>.md ซึ่งติดตั้งไปพร้อม harness; anchor เดิมของแต่ละ phase ใน WORKFLOW.md ยังใช้ได้

## วิธีตรวจด้วยตัวเอง

รัน `bash .claude/tests/docs/run-doc-consistency.sh`, `node --test .claude/tests/docs/documentation-governance.test.mjs` แล้วรัน `bash .claude/tests/run-all.sh`

## เกณฑ์ผ่าน

Task: `tasks.md`; scenario: ใน specs

| Requirement | Scenario | ชนิด | Task | Check | Decision |
|---|---|---|---|---|---|
| รายละเอียดแต่ละ phase อยู่ในไฟล์ของ phase นั้น | ไฟล์ phase ครบและลิงก์จาก WORKFLOW.md | success | T001, T002 | static-analysis: `.claude/tests/affected-suite-selector.mjs`, `.claude/tests/harness/affected-suite-selector.test.mjs` | — |
|  | anchor เดิมยังเปิดได้ | boundary | T001, T002 |  |  |
|  | ไม่มีเนื้อหาหาย | boundary | T001, T002 |  |  |
|  | ลิงก์ที่ชี้ส่วนที่ย้ายไม่เสีย | failure | T001, T002 |  |  |

## นิยามของงานเสร็จ

- Fresh evidence for every claim (4).
- Review: risk-tiered AI review (medium tier, configured model).
- Land archives it; Land never commits.
- Success: acceptance scenarios above pass.

## ภาคผนวก: ข้อมูลที่ harness สร้าง

- **Evidence capabilities:** defaulted to `test` (`static-analysis` for docs/chore) for lifecycle-files.

## ภาคผนวก: ผล review

| รอบ | ข้อค้นพบ | ความรุนแรง | การแก้ไข | ผู้ review |
|---|---|---|---|---|
| 1 | lifecycle-header-link-depth: The link back to WORKFLOW.md on line 3 of all six phase files (build, change, deliver, investigate, land, prove) is [WORKFLOW.md](../../../../../../WORKFLOW.md). From .claude/harness/lifecycle/ that goes three folders past the repository root. In this sandbox (.foundation/sandboxes/phase-workflow-md-phase) it happens to reach /Users/hashtagf/Desktop/Work/changeloop/WORKFLOW.md, the main checkout's copy, so the new link check in documentation-governance.test.mjs:149-160 passes here. After Land (it would point to /Users/hashtagf/Desktop/WORKFLOW.md), on CI, on GitHub, and in installed projects the target is missing. The link is broken there and the same test fails. The correct path is ../../../WORKFLOW.md, which the other WORKFLOW.md links in these files (for example build.md:42) already use. (root/.claude/harness/lifecycle/build.md:3) | blocker | ยืนยันการแก้ในรอบ 2 | claude-opus |
| 1 | moved-anchor-test-scope: The scenario requires the documentation test to fail, naming the link, whenever any document in the repo links to an anchor that moved out of WORKFLOW.md. The new test only scans WORKFLOW.md and the six lifecycle files; the older entry-guide test (lines 9-12, 57-70) only covers README.md, README.th.md, AGENTS.md, CLAUDE.md, CONTRIBUTING.md and two other READMEs. Several files this change rewrote are never checked: .claude/harness/README.md (links to WORKFLOW.md#land-change, #change-intent, #recovery-and-user-decisions), .claude/harness/EVIDENCE.md, .claude/skills/*/references/*.md and website/docs. A future link such as ../../WORKFLOW.md#decisions in EVIDENCE.md would fail no test. Their current links resolve when checked by hand, but the claim is unproven for these files. The fix is to add these files, or every repository .md outside archives and reports, to the scanned list. (root/.claude/tests/docs/documentation-governance.test.mjs:147) | major | แก้แล้วในรอบ 3 | claude-opus |
| 2 | moved-anchor-test-scope: This finding is not fixed. The new link test still scans only WORKFLOW.md and the six .claude/harness/lifecycle/*.md files (line 147). Other tests already cover README.md, README.th.md, AGENTS.md, CLAUDE.md, CONTRIBUTING.md, the tests and reports READMEs (lines 9-12 and 57-70), .claude/harness/README.md and grill-task-gu/references/intake-contract.md (run-doc-consistency.sh:539-550). No test checks .claude/harness/EVIDENCE.md, which links to ../../WORKFLOW.md#recovery-and-user-decisions at line 1069, the other .claude/skills/*/references/*.md files, or website/docs. Example: if EVIDENCE.md, a skill reference, or a website page linked to WORKFLOW.md#change-intent and that section had moved into lifecycle/change.md, no test would fail. The scenario requires the documentation test to fail and name the broken link for any document in the repo. Fix: build the list of scanned files at line 147 from every .md file in the repository, excluding openspec/changes/archive, docs/reports and CHANGELOG history, or at least add EVIDENCE.md, .claude/skills/**/references/*.md and website/docs/**/*.md. (root/.claude/tests/docs/documentation-governance.test.mjs:147) | major | แก้แล้วในรอบ 3 | claude-opus |
| 2 | lifecycle-test-slug-drift: The new heading-to-anchor function at line 140 removes combining marks (\p{M}) and underscores. The existing anchors() helper at lines 44-55, and GitHub, keep both. The new code also skips repeated-heading suffixes (-1, -2) and does not URL-decode the anchor. The new check can therefore wrongly flag a valid link to a heading with Thai vowel marks, an underscore, or a repeated name. Reusing the existing anchors() helper would avoid a second, conflicting slug rule. (root/.claude/tests/docs/documentation-governance.test.mjs:140) | minor | แก้แล้วในรอบ 3 | claude-opus |
| 3 | moved-anchor-test-skips-repo-blob-urls: The website part of moved-anchor-test-scope is still open. Website pages link to repository docs with absolute GitHub blob URLs, for example website/docs/src/content/docs/approval.md:91 and th/approval.md:83 (`https://github.com/hashtagf/changeloop/blob/main/...md#anchor`) and quickstart.md:127. Line 155 skips every href that has a URL scheme, so none of these links is checked. Concrete failure: before this change, approval.md linked to `https://github.com/hashtagf/changeloop/blob/main/WORKFLOW.md#approval-package-preview-and-role-lanes`, and that section moved into lifecycle/change.md. This change fixed that link by hand, but if it had been missed the test would still pass. The scenario 'ลิงก์ที่ชี้ส่วนที่ย้ายไม่เสีย' needs the doc test to fail and name such a link. Fix: before the scheme skip, rewrite hrefs that start with `https://github.com/hashtagf/changeloop/blob/main/` into repository-root paths. Then check those links like local ones. (root/.claude/tests/docs/documentation-governance.test.mjs:155) | major | ยืนยันการแก้ในรอบ 4 | claude-opus |
| 3 | moved-anchor-test-skips-untracked-docs: Line 146 builds the list of scanned documents with `git ls-files -z '*.md'`, which returns only tracked files. In this sandbox the six new `.claude/harness/lifecycle/*.md` files are untracked: the worktree index lists `.claude/harness/EVIDENCE.md` but has no `harness/lifecycle/` entries. Land leaves the diff uncommitted, so Prove runs the test on this tree. As a result the `own` check never scans the links inside the lifecycle files, and the same is true for any other new, uncommitted Markdown file. Concrete failure: lifecycle/build.md:42 links to `../../../WORKFLOW.md#blocking-policy`. If it linked to a moved anchor such as `../../../WORKFLOW.md#decisions`, or kept the wrong-depth header link that round 1 found, the test would still pass during Prove. It would fail only after the files were committed. Fix: add `--others --exclude-standard` to the `git ls-files` call (keeping `--cached`, the default). (root/.claude/tests/docs/documentation-governance.test.mjs:146) | major | ยืนยันการแก้ในรอบ 4 | claude-opus |
| 3 | link-path-not-decoded: The new check passes the raw href path to resolve() without decodeURIComponent. The existing entry-guide test decodes the path (line 63). A valid link with an encoded path, such as `%20`, to WORKFLOW.md or a lifecycle file would therefore be reported as broken. (root/.claude/tests/docs/documentation-governance.test.mjs:157) | minor | แก้แล้วในรอบ 4 | claude-opus |
