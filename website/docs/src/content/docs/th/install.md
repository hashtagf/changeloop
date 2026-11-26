---
title: ติดตั้ง
description: requirement และวิธีติดตั้ง Change Loop ลงในรีโปที่มีอยู่แล้วสองแบบ
---

<!-- docs-audience: project-maintainers -->
**ผู้อ่าน:** ผู้ดูแลโปรเจกต์และ agent ที่ได้รับอนุญาตให้ตั้งค่า หากต้องการใช้งานตามปกติ เริ่มที่ [เริ่มใช้งาน](/docs/th/quickstart/)

ติดตั้ง CLI `cloop` ครั้งเดียวในเครื่อง แล้ว initialize Change Loop
ในแต่ละโปรเจกต์ ทั้งคุณและ agent ใช้คำสั่ง `cloop` การรัน `init` ซ้ำคือการอัปเกรดไฟล์ที่ระบบดูแล ใช้กับรีโปที่มีของ
อยู่แล้วได้: ระบบเติมสิ่งที่ขาด รีเฟรชเฉพาะไฟล์ของตัวเอง และไม่แตะไฟล์ของโปรเจกต์

## สิ่งที่จำเป็นและเครื่องมือที่แนะนำ

| เครื่องมือ | สถานะ | เหตุผล |
|---|---|---|
| **Node.js 20.19 ขึ้นไป** | จำเป็น | runtime เป็น ESM Node ล้วน ไม่มีขั้นตอน compile |
| **OpenSpec CLI 1.7** | จำเป็น (เตรียมให้อัตโนมัติ) | ใช้ sync spec และ archive |
| **Git** | แนะนำ | ใช้แยกงานด้วย worktree; โปรเจกต์ที่ dirty หรือไม่ใช่ Git จะใช้ isolated copy แทน |

ปกติไม่ต้องติดตั้ง OpenSpec เอง: installer จะใช้ `openspec` รุ่นที่เข้ากันได้ที่มีอยู่ในโปรเจกต์
หรือบน `PATH` ถ้าไม่มีจะดาวน์โหลดรุ่นที่กำหนดไว้ลง `.foundation/tools` (ต้องเข้า npm registry ได้)
ถ้าไม่สำเร็จ การติดตั้งยังจบได้พร้อมคำเตือน และ harness จะลองใหม่ก่อน Build, Prove และ Land
ถ้าเครื่องเข้า registry ไม่ได้ ให้ติดตั้งเอง:

```bash
npm install -g @fission-ai/openspec@1.7.0
```

แนะนำให้มี `jq` เพื่อ merge hook เข้า `.claude/settings.json` เดิม หากไม่มี
installer จะทำงานต่อโดยเก็บไฟล์เดิมไว้ และสร้าง
`.claude/settings.foundation.json` ให้ตรวจและ merge เอง

## ติดตั้งจาก source

```bash
git clone https://github.com/hashtagf/changeloop.git
cd changeloop
./install.sh /path/to/your-project
```

## ติดตั้งด้วย Homebrew

```bash
brew tap hashtagf/changeloop \
  https://github.com/hashtagf/changeloop
brew install hashtagf/changeloop/cloop
cloop init /path/to/your-project --yes
```

`cloop init` คือ installer ตัวเดียวกัน ส่วน `--yes` คือข้ามการถามยืนยัน
เวลาอัปเกรดให้รัน `brew upgrade hashtagf/changeloop/cloop` แล้วรัน `init` ในแต่ละโปรเจกต์
ที่ต้องการรีเฟรช

:::tip
เปิด session ของ agent **ใหม่** ในโปรเจกต์ปลายทางหลังติดตั้งเสร็จ เพื่อให้ slash command ถูกลงทะเบียน
:::

## ย้ายจาก claude-foundation

Change Loop ย้ายมาอยู่ที่ [hashtagf/changeloop](https://github.com/hashtagf/changeloop) และเปลี่ยนมาใช้คำสั่ง `cloop` อัปเกรดในโปรเจกต์เดิมได้เลย ไม่ต้องสร้างใหม่ แต่การติดตั้ง CLI ใหม่อย่างเดียวยังไม่อัปเกรดโปรเจกต์

**ถ้าเคยติดตั้งด้วย Homebrew** ให้ใช้ tap ใหม่ การรัน `brew upgrade` จาก tap เดิมจะไม่ย้ายมา Change Loop

```bash
brew tap hashtagf/changeloop https://github.com/hashtagf/changeloop
brew install hashtagf/changeloop/cloop
cloop init /path/to/existing-project
```

ตั้งแต่ Homebrew 6 การติดตั้งด้วยชื่อสูตรเต็มจะให้ความเชื่อถือเฉพาะ `cloop` ไม่ต้องรัน `brew trust` แยก ถ้าเคยติดตั้งจาก `hashtagf/changeloop` ด้วยชื่อสูตรเดิม ให้รัน `brew update` แล้วรัน `brew upgrade hashtagf/changeloop/cloop` แทนการติดตั้งใหม่ ดู [คู่มือ Tap Trust ของ Homebrew](https://docs.brew.sh/Tap-Trust)

**ถ้าเคยติดตั้งจากซอร์ส** ให้ทำตามหัวข้อ [ติดตั้งจาก source](#ติดตั้งจาก-source) โดยใช้รีโปใหม่ แล้วรัน `install.sh` โดยระบุพาธของโปรเจกต์เดิม ไม่ใช่โฟลเดอร์ใหม่

ทำขั้นตอนอัปเกรดซ้ำกับแต่ละโปรเจกต์ที่ต้องการย้าย ตัวติดตั้งจะอัปเดตคำสั่ง hook และไฟล์รันไทม์ที่ระบบดูแล โดยเก็บ OpenSpec spec, change ที่ยังทำอยู่ และสถานะเดิมของโปรเจกต์ไว้ ถ้าเคยแก้ไฟล์ที่ระบบดูแล ให้เก็บสำเนาส่วนที่แก้ก่อนอัปเกรด ดู [ไฟล์ที่ตัวติดตั้งดูแล](/docs/th/artifacts/) เพื่อเช็กว่าไฟล์ไหนจะถูกแทนที่

ในโปรเจกต์ที่อัปเกรดแล้ว ให้รัน `cloop doctor --stage change` และแก้ปัญหาที่ระบบแจ้ง จากนั้นเปิด Claude Code session ใหม่เพื่อโหลด slash command ที่อัปเดตแล้ว

## agent host อื่นนอกจาก Claude Code

Claude Code ไม่ต้องใช้ adapter ส่วน host อื่นใช้ `--host` เพื่อวาง adapter ทับการติดตั้งชุดเดียวกัน:

```bash
cloop init /path/to/your-project --host cursor    # หรือ opencode, codex, pi
```

| Host | adapter เพิ่มอะไรให้ |
|---|---|
| **Pi ≥1.5.2** | extension ต่อโปรเจกต์ที่ `.pi/extensions/changeloop.ts` ลงทะเบียนคำสั่งจากต้นฉบับ โหลด agent contract จากแพ็กเกจ และเชื่อม guard ของ built-in tools, lint feedback, session identity และ shell `!`/`!!` ต้องใช้ `@earendil-works/pi-coding-agent`, Change Loop CLI รุ่นตรงกับโปรเจกต์, Node.js และ jq |
| **Cursor** | เจ็ด lifecycle prompt หลักรวม `/deliver` แบบ optional พร้อม `/changes` และ alias `/feature` ใน `.cursor/commands/` และ skill router แบบ always-on เป็น rule `.mdc` ที่ตั้ง `alwaysApply: true` |
| **OpenCode** | prompt หลักเจ็ดตัวรวม `/deliver` แบบ optional พร้อม utility/alias สองตัวใน `.opencode/commands/` และ guard plugin ที่ `.opencode/plugins/foundation.js` ซึ่ง replay hook ที่ ship มา — secrets guard กับ phase-mutation guard บล็อกแบบ live ส่วน lint ให้ feedback ตอนแก้ไฟล์ ส่วน skill กับ agent contract ไม่ต้องมี adapterเลย เพราะ OpenCode อ่าน `.claude/skills/` และ `AGENTS.md` ได้เอง |
| **Codex CLI** | prompt หลักเจ็ดตัวรวม `/deliver` แบบ optional พร้อม utility/alias สองตัวใน `$CODEX_HOME/prompts` (Codex ไม่มีไดเรกทอรี prompt ต่อโปรเจกต์) พร้อม ownership marker เพื่อให้การติดตั้งซ้ำรีเฟรชเฉพาะ prompt ของ Change Loop โดยไม่ทับ prompt ชื่อซ้ำของผู้ใช้ |

เมื่อ Pi ถาม ให้ยืนยันความเชื่อถือโปรเจกต์ แล้วเปิด session ใหม่หรือใช้ `/reload`
หากต้องการให้ runtime อยู่นอก repo ของโปรเจกต์ Pi ให้เพิ่ม `--shared-runtime` ใน
`cloop init /path/to/your-project --host pi` โดย runtime ที่ pin เวอร์ชันจะอยู่ใน Pi
ส่วนโปรเจกต์มีเพียง `.changeloop.json`, `foundation.json`, settings และ artifacts
ของ OpenSpec กับ state ที่สร้างใน `.foundation` โปรเจกต์ถัดไปใช้ `/changeloop init`
ใน Pi แล้ว `/reload` ได้ การติดตั้งแบบเดิมยังใช้ต่อได้ คำสั่งนี้ไม่ลบหรือย้ายไฟล์เดิม
ใช้ `/land <change>` เพื่อสั่ง Land โดยชัดเจน ส่วน `/build` และ `/prove` ไม่ให้สิทธิ์ Land
guard ของ Pi แนะนำเป็นค่าเริ่มต้น: Land, Deliver, การแก้ไฟล์นอกงาน, รูปแบบ shell และ `authority run`
ผ่าน background รันต่อพร้อมคำเตือนในผลของ tool แทนการปฏิเสธ การปิดค่าลับยังบังคับเหมือนเดิม
และตั้ง `FOUNDATION_GUARDRAIL_MODE=block` ก่อนเปิด Pi เพื่อให้ปฏิเสธแบบเดิม
ถ้าระบุโหมดที่ไม่รู้จัก ระบบจะใช้ `auto` ซึ่งไม่ต้องเปิด Change เพื่อแก้ไฟล์ทั่วไป
ถ้า hook สำหรับแนะนำขั้นตอนใช้ไม่ได้ Pi จะเตือนแทนการหยุดเครื่องมือทั่วไป
โดยยังตรวจค่าลับและเปลี่ยนเส้นทางไปยัง Build workspace ตามเดิม
guard ของ Pi ครอบคลุมบางส่วน: tool ในตัวและ `background_bash` ผ่าน guard ส่วน custom/MCP
tools อื่นอยู่นอกขอบเขต live guard และได้คำเตือนครั้งเดียวระหว่างทำงาน มี session digest
ตอนเริ่มและหลัง compact และ `/dev` เตือนเมื่อหยุดก่อน proof ผ่าน การวิเคราะห์ shell ใช้นโยบายร่วมของ runtime
(ค่าเริ่มต้นเป็น audit; ตั้ง `FOUNDATION_SHELL_GUARD=block` เพื่อบังคับตรวจ shell)
extension นี้ไม่ใช่ OS sandbox และไม่ออก unattended sandbox attestation
การกำหนด model และ reviewer ยังคงอยู่ใน `foundation.json`
extension ตรึงทุก shell ไว้กับโปรเจกต์ของ session ดังนั้นคำสั่ง Change Loop ที่รันอยู่ภายใน
โปรเจกต์ Change Loop อื่น (เช่น test fixture หรือ checkout ข้างเคียง) จะถูกปฏิเสธแทนที่จะไปแก้
โปรเจกต์ของ session ให้รันด้วย `--project <path>` หรือรันจาก session ของโปรเจกต์นั้นเอง

:::caution[Codex ไม่มี tool hook]
Codex รัน guard แบบ live ไม่ได้ ดังนั้น secrets guard กับ phase-mutation guard จะไม่ทำงานที่นั่น — การบังคับใช้จึงเหลือ Land gate กับ `no-direct-main-commit.sh` ที่เป็น opt-in
:::

## ตรวจสอบ

```bash
cloop version
cloop doctor --stage change
```

`doctor` คือคำสั่งที่ควรหยิบใช้ทุกครั้งที่รู้สึกว่ามีอะไรผิดปกติ มันวินิจฉัยสถานะของโปรเจกต์ provider และ lifecycle และรายงาน apply transaction ที่ค้างอยู่ก่อนที่ Land จะไปเจอเข้า

installer จะเพิ่มส่วนที่ Change Loop ดูแลลงใน `.prettierignore`, `.eslintignore` หรือ `.stylelintignore` ที่โปรเจกต์มีอยู่แล้ว (และสร้าง `.prettierignore` ถ้าโปรเจกต์ใช้ Prettier) เพื่อให้ตัว format และ lint ของคุณไม่ไปตรวจไฟล์ของ Change Loop รายการเดิมของคุณยังอยู่ครบ

## ตั้งค่าโปรเจกต์ให้พร้อมสำหรับ agent

หลังติดตั้งครั้งแรก `doctor` จะแสดงรายการ **setup** เพิ่ม บอกว่าตั้งค่า consumer quality
แล้วหรือยัง, lane ของ lint, type-check, ขนาดไฟล์ และขอบเขตโมดูลมี baseline หรือยัง,
`openspec/feature-map.json` ระบุฟีเจอร์ของคุณแล้วหรือยัง และมี `openspec/lessons.md`
แล้วหรือยัง, `AGENTS.md` หรือ `CLAUDE.md` มีกฎของโปรเจกต์แล้วหรือยัง (ไม่ใช่มีแค่ส่วนที่ Change Loop ใส่ไว้) และ `REVIEW.md` ยังเป็น template ทั่วไปอยู่ไหม แต่ละรายการบอกคำสั่งถัดไป และไม่มีรายการไหนทำให้ `doctor` fail การ onboard จะร่างกฎรีวิวเฉพาะโปรเจกต์ให้คุณยืนยัน และถามครั้งเดียวว่าจะเพิ่ม `SECURITY.md` ไหม

สั่ง agent ให้ onboard โปรเจกต์ ("onboard this repo") skill `onboard` จะรันคำสั่งที่
`doctor` บอก ร่าง feature map และขอบเขตโมดูล (ถ้าต้องการ) จากโค้ดของคุณ แล้วถามให้คุณยืนยัน
และถามว่าจะใช้ finding ที่มีวันนี้เป็น baseline ไหม คุณเป็นคนตัดสิน ไม่มีอะไรมีผลบังคับโดยที่คุณไม่รู้

งาน product ที่เริ่มก่อนจะมี change มี skill 2 ตัวที่เขียนข้อมูลตั้งต้นให้ Change Loop ใช้ต่อ `prd`
เขียน `PRD.md` และ `prd.html` (18 หัวข้อ: goal, user story, acceptance แบบ Given/When/Then,
business rule, flow, NFR, ADR, scope, data และ permission, error, open question) และตรวจว่า
แต่ละส่วนอ้างถึงกันครบ PRD ที่อนุมัติแล้วส่งต่อให้ `grill-task-gu` แล้วจึง `/feature` หรือ `/change`
ส่วน `ux-design` ทำ UX/UI ทีละ phase โดยให้คุณยืนยันทีละขั้น: `uxui.md`, `design-system.html`
ที่มีเลขเวอร์ชัน และ artifact ของแต่ละหน้าหรือฟีเจอร์ที่ใช้ Token Block ชุดเดียวกัน artifact
ที่อนุมัติแล้วกลายเป็น `prototypeSelection` ของ change ซึ่งการตรวจภาพจะเทียบ UI ที่สร้างจริงกับมัน

## Commit การติดตั้ง

ถ้าเป็น Git project installer จะ stage ไฟล์ setup ที่ดูแลให้ แต่จะไม่ commit
ตรวจแล้ว commit ก่อนเริ่ม change แรก:

```bash
git status
git commit -m "chore: install Change Loop"
```

ขั้นนี้ต้องได้รับอนุญาตจากคุณอย่างชัดเจน ถ้ายังไม่ commit ระบบจะมองไฟล์ติดตั้งเป็น
ส่วนหนึ่งของ change ถัดไปตามจริง ทำให้ change แรกใหญ่ขึ้นและต้องใช้ isolated copy

## เริ่ม change แรก

เปิด session ใหม่ของ agent ในโปรเจกต์ที่ initialize แล้ว จากนั้นบอกผลลัพธ์ที่ต้องการ:

```text
/change ให้เจ้าของ account แก้ display name ของตัวเองได้
```

ตรวจข้อตกลงที่ agent เสนอ แล้วทำต่อด้วย `/build`, `/prove` และ `/land` ที่อนุมัติ
อย่างชัดเจน Agent จะรัน CLI และคำสั่ง recovery เบื้องหลังเอง ดูขั้นตอนทั้งหมดที่
[เริ่มใช้งาน](/docs/th/quickstart/)

## การตั้งค่าขั้นสูง

จำเป็นเฉพาะสภาพแวดล้อมที่ล็อกสิทธิ์หรือรันแบบไม่มีคนเฝ้า (CI) การตั้งค่าแบบ
interactive ปกติข้ามส่วนนี้ได้

### Permission allowlist

`.claude/settings.json` ยังเป็นของ project Installer จะ merge hook ที่ ship มา และต่อท้าย `permissions.allow` แบบแคบ เพื่อไม่ให้ Claude Code ขออนุมัติทุกขั้นของ harness ได้แก่ `Bash(cloop *)`, `Bash(.foundation/bin/cloop *)`, `Bash(node .claude/harness/foundation.mjs *)`, `Edit(/.foundation/sandboxes/**)`, `Edit(/.foundation/repository-sandboxes/**)`, `Edit(/.foundation/drafts/**)` (draft ของ Change), `Edit(/openspec/investigations/**)` (record ของ Investigate) และคำสั่งอ่านอย่างเดียว ได้แก่ `Bash(find *)`, `Bash(grep *)`, `Bash(ls *)`, `Bash(head *)`, `Bash(wc *)` รวมถึงรูปแบบที่ `rtk ls` / `rtk grep` แปลงให้ และ Git แบบอ่านอย่างเดียว (`Bash(git status)`, `Bash(git status *)` และคู่เดียวกันสำหรับ `diff`, `log`, `show`) `cat` ไม่ได้รับ rule (rule แบบ prefix จะปล่อย `cat > file` ด้วย ให้อ่านไฟล์ผ่าน Read tool แทน) และไม่มี rule ใดให้สิทธิ์เขียน ลบ หรือ Git ที่เปลี่ยน state เนื่องจาก rule อ่านเหล่านี้จับแบบ prefix installer จึงต่อท้าย `permissions.deny` ที่ปฏิเสธรูปแบบที่เขียนไฟล์หรือรันคำสั่งอื่น ได้แก่ `find` ที่มี `-delete`, `-exec`/`-execdir`, `-ok`/`-okdir`, `-fprint`/`-fprintf` หรือ `-fls` และ `git diff`/`log`/`show` ที่มี `--output` flag นับเฉพาะเมื่อมีช่องว่างนำหน้า ชื่ออย่าง `*-okhttp*` จึงยังอ่านได้ กฎ deny มีผลเหนือ allow และปฏิเสธคำสั่งทันทีโดยไม่ถาม โปรเจกต์ที่ upgrade แล้วยังมี rule เดิมจึงได้รับการป้องกันด้วย test runner ของโปรเจกต์ไม่ได้รับ rule: Build task แต่ละงานคืน verify เป็น `checkCommand` (`cloop exec <change> --task <id> -- <verify>`) ซึ่ง rule ของ CLI ครอบคลุมอยู่แล้ว โดยเพิ่มเฉพาะ rule ที่ยังไม่มีต่อจาก rule ของผู้ใช้ ไม่ลบหรือสลับลำดับ entry เดิม และการรันซ้ำไม่เพิ่มอะไร guard ของ PreToolUse ยังทำงานก่อน rule เหล่านี้ ให้ใส่ `--no-permission-allowlist` ทุกครั้งที่ install หรือ upgrade หากไม่ต้องการให้แตะ `permissions.allow` และ `permissions.deny`

### Headless / CI (`claude -p`)

Claude Code จะไม่ใช้ `permissions.allow` ของโปรเจกต์จนกว่า workspace จะถูก trust ใน checkout ใหม่ การรัน `claude -p` แบบ headless จะแสดง `Ignoring ... permissions.allow entry ... this workspace has not been trusted` ทำให้ rule `Bash(cloop *)` ที่ installer ใส่ไว้ไม่มีผล และทุกคำสั่ง harness ถูกปฏิเสธ ให้รัน `claude` แบบ interactive ในโปรเจกต์หนึ่งครั้งแล้วยอมรับ trust prompt หรือให้สิทธิ์ตาม allowlist ที่ installer ใส่ไว้เท่านั้นทุกครั้งที่รัน headless (rule `Edit` ครอบคลุม `Write` ด้วย และการแก้ไฟล์อื่นในโปรเจกต์ยังถูกปฏิเสธ):

```bash
claude -p "/change <intent>" --allowedTools \
  "Bash(cloop *)" "Bash(.foundation/bin/cloop *)" \
  "Bash(node .claude/harness/foundation.mjs *)" "Edit(/.foundation/drafts/**)" \
  "Edit(/.foundation/sandboxes/**)" "Edit(/.foundation/repository-sandboxes/**)" \
  "Edit(/openspec/investigations/**)" \
  "Bash(find *)" "Bash(grep *)" "Bash(ls *)" "Bash(head *)" "Bash(wc *)" \
  "Bash(rtk ls *)" "Bash(rtk grep *)" \
  "Bash(git status)" "Bash(git status *)" "Bash(git diff)" "Bash(git diff *)" \
  "Bash(git log)" "Bash(git log *)" "Bash(git show)" "Bash(git show *)" \
  --disallowedTools \
  "Bash(find -delete*)" "Bash(find * -delete*)" "Bash(find -exec*)" \
  "Bash(find * -exec*)" "Bash(find -ok*)" "Bash(find * -ok*)" \
  "Bash(find -fprint*)" "Bash(find * -fprint*)" "Bash(find -fls*)" \
  "Bash(find * -fls*)" "Bash(git diff --output*)" "Bash(git diff * --output*)" \
  "Bash(git log --output*)" "Bash(git log * --output*)" "Bash(git show --output*)" \
  "Bash(git show * --output*)"
```

check ของ Build รันผ่าน `cloop exec` จึงไม่ต้องให้สิทธิ์ test runner เพิ่ม tool อื่นของโปรเจกต์เฉพาะเมื่อการรันต้องใช้ Claude Code ถือว่า path ใต้ `~/.claude/` เป็น sensitive path จึงควรวาง consumer project ไว้นอก directory นั้นเมื่อรันแบบไม่มีคนเฝ้า

## installer เป็นเจ้าของอะไรบ้าง

เส้นแบ่งนี้สำคัญ เพราะการอัปเกรดทำงานตามมัน ไฟล์ที่ Change Loop เป็นเจ้าของจะ **ถูกคัดลอกทับทุกครั้งที่ติดตั้ง** และถูกบันทึกไว้ใน `.foundation/install-manifest.txt`

```text
.claude/orchestrator.md
.claude/commands
.claude/harness
.claude/skills
.claude/rules
.claude/hooks
openspec/schemas
.foundation/.gitignore
.foundation/README.md
WORKFLOW.md
```

ส่วนไฟล์ที่โปรเจกต์เป็นเจ้าของจะถูกสร้างให้ตอนยังไม่มี หรือ merge เข้าไป แต่ **ไม่เคยถูกเขียนทับ**

```text
.claude/settings.json          # merge hook ด้วย jq พร้อม backup ที่มี timestamp
openspec/config.yaml           # คัดลอกเฉพาะตอนยังไม่มี
openspec/repositories.yaml     # คัดลอกเฉพาะตอนยังไม่มี
foundation.json                # สร้างเริ่มต้น; เติม field/ย้าย default เก่าที่รองรับ
CLAUDE.md / AGENTS.md          # เขียนทับเฉพาะบล็อก pointer ที่ทำเครื่องหมายไว้
REVIEW.md                      # คัดลอกเฉพาะตอนยังไม่มี
openspec/incidents/, openspec/lessons.md  # คัดลอกเฉพาะตอนยังไม่มี
```

spec, change ที่ยัง active, runtime state, agent ที่คุณเขียนเอง และ hook ของคุณรอดทุกการอัปเกรด และถ้ามี path ถูกถอดออกจากรายการที่ Change Loop ดูแล มันจะถูกลบจากโปรเจกต์คุณก็ต่อเมื่อ manifest เคยระบุว่าเป็นเจ้าของไฟล์นั้นเท่านั้น — Change Loop จึงไม่เคยลบไฟล์ที่มันไม่ได้ติดตั้งเอง

เพราะ `foundation.json` เป็นของโปรเจกต์ การอัปเกรดรักษานโยบายที่ปรับเอง
โดยไม่แทนที่ทั้งไฟล์ แต่อาจเติม field ที่ขาดและย้ายค่า budget default เก่าที่รู้จัก อ่าน
[ตั้งค่า foundation.json](/docs/th/foundation-config/) ก่อนแก้ไฟล์นี้

ไฟล์เป็นของโปรเจกต์ไม่ได้หมายความว่าผู้ใช้ต้องแก้เอง Agent ที่ได้รับอนุญาต
ช่วยตั้งค่าได้ คำสั่งระบบที่ติดตั้งแยกจากกฎของโปรเจกต์
ดู [ไฟล์และเจ้าของข้อมูล](/docs/th/artifacts/)

## หลักฐานฝั่งเบราว์เซอร์ยังเป็นของคุณ

Change Loop ไม่ติดตั้ง test framework เบราว์เซอร์ หรือ dependency ของโปรเจกต์ให้ ถ้า claim ต้องการหลักฐานจากเบราว์เซอร์ ให้ติดตั้งและล็อกเวอร์ชัน `@playwright/test` พร้อม browser binary **ในแอปของคุณเอง** Change Loop จะตรวจสอบและสั่งรันเครื่องมือที่มีอยู่ในเครื่อง แต่จะไม่โหลด browser framework ที่ไม่ได้ล็อกเวอร์ชันมาระหว่างพิสูจน์

กฎเดียวกันนี้ใช้กับทุกอย่าง: executable ทุกตัวที่ adapter เรียกใช้ต้องเป็นของรีโปคุณและถูกล็อกเวอร์ชันโดยรีโปคุณ ไม่ใช่โดย harness
