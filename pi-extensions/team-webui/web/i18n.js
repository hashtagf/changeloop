// Interface-label translation (English ⇄ Thai). Chat, code, files and task text are never translated.
// Each entry is [English, Thai]; lookups work in both directions so either source language can be used.
const WORDS = [
  ['Your projects.', 'โปรเจกต์ของคุณ'], ['Your agents.', 'agent ของคุณ'],
  ['One workspace for Pi sessions, files and Git.', 'พื้นที่เดียวสำหรับ session ของ Pi ไฟล์ และ Git'],
  ['Your name', 'ชื่อของคุณ'], ['Name', 'ชื่อ'], ['Access code', 'รหัสเข้าใช้'],
  ['Paste the code from /serve', 'วางรหัสจาก /serve'], ['Open workspace', 'เปิดพื้นที่ทำงาน'],
  ['Access includes the connected projects, files and Git.', 'สิทธิ์ครอบคลุมโปรเจกต์ ไฟล์ และ Git ที่เชื่อมต่ออยู่'],
  ['Access code is invalid or expired. Ask the host for a new invite.', 'รหัสเข้าใช้ไม่ถูกต้องหรือหมดอายุ ขอลิงก์เชิญใหม่จากเจ้าของ'],
  ['Your access ended. Sign in again.', 'สิทธิ์เข้าใช้สิ้นสุดแล้ว เข้าใช้ใหม่อีกครั้ง'],
  ['Read-only access.', 'สิทธิ์ดูอย่างเดียว'],
  ['Connecting', 'กำลังเชื่อมต่อ'], ['● Connected', '● เชื่อมต่อแล้ว'], ['Reconnecting', 'กำลังเชื่อมต่อใหม่'],
  ['Find project or session…', 'ค้นหาโปรเจกต์หรือ session…'], ['Find project or session', 'ค้นหาโปรเจกต์หรือ session'],
  ['PROJECTS · FIXED ORDER', 'โปรเจกต์ · ลำดับคงที่'],
  ['Invite ↗', 'เชิญ ↗'], ['Access', 'สิทธิ์เข้าใช้'], ['Sign out', 'ออกจากระบบ'], ['Help', 'ช่วยเหลือ'],
  ['Show projects', 'แสดงโปรเจกต์'], ['Close projects', 'ปิดรายการโปรเจกต์'],
  ['Choose a session', 'เลือก session'], ['Chat', 'แชท'], ['Tasks', 'งาน'], ['3D City', 'เมือง 3D'],
  ['Background', 'เบื้องหลัง'], ['Files & Git', 'ไฟล์และ Git'],
  ['Skip to conversation', 'ข้ามไปที่บทสนทนา'],
  ['A place for every thread.', 'ที่สำหรับทุกบทสนทนา'],
  ['Select a session to continue its conversation.', 'เลือก session เพื่อคุยต่อ'],
  ['Agents keep working while you switch.', 'agent ทำงานต่อระหว่างที่คุณสลับ'],
  ['Got it', 'เข้าใจแล้ว'], ['Close', 'ปิด'], ['Cancel', 'ยกเลิก'], ['Continue', 'ดำเนินการต่อ'], ['Create', 'สร้าง'],
  ['Working', 'กำลังทำงาน'], ['Idle', 'ว่าง'], ['Offline', 'ออฟไลน์'], ['Saved · offline', 'บันทึกไว้ · ออฟไลน์'],
  ['Main', 'หลัก'], ['Sub', 'ย่อย'], ['Parent session unavailable', 'ไม่พบ session แม่'],
  ['LIVE SESSION', 'SESSION ที่ออนไลน์'], ['SAVED SESSION', 'SESSION ที่บันทึกไว้'],
  ['Message Pi, or use an extension /command…', 'พิมพ์ถึง Pi หรือใช้ /command ของ extension…'],
  ['Resume this session in Pi to send messages…', 'เปิด session นี้ใน Pi อีกครั้งเพื่อส่งข้อความ…'],
  ['Read-only access · you can view but not send or change anything.', 'สิทธิ์ดูอย่างเดียว · ดูได้แต่ส่งหรือแก้ไขไม่ได้'],
  ['Queue after task', 'ต่อคิวหลังงานปัจจุบัน'], ['Steer next turn', 'แทรกในรอบถัดไป'],
  ['Send ↑', 'ส่ง ↑'], ['■ Stop', '■ หยุด'], ['Attach files', 'แนบไฟล์'],
  ['Enter send · Shift Enter newline · drop files to attach', 'Enter ส่ง · Shift Enter ขึ้นบรรทัด · ลากไฟล์มาวางเพื่อแนบ'],
  ['Loading conversation…', 'กำลังโหลดบทสนทนา…'], ['Loading…', 'กำลังโหลด…'],
  ['Start a conversation. Messages go to this Pi session with its existing context and extensions.', 'เริ่มบทสนทนา ข้อความจะถูกส่งไปยัง session นี้พร้อมบริบทและ extension เดิม'],
  ['Files', 'ไฟล์'], ['Git', 'Git'], ['Extensions', 'Extension'], ['Jobs', 'งานเบื้องหลัง'], ['Activity', 'กิจกรรม'],
  ['Close inspector', 'ปิดแผงข้อมูล'], ['WORKTREE FILES', 'ไฟล์ใน WORKTREE'], ['Collapse all', 'ยุบทั้งหมด'],
  ['Secrets, .git and dependency folders are hidden.', 'ซ่อนไฟล์ลับ .git และโฟลเดอร์ dependency'],
  ['Save changes', 'บันทึกการแก้ไข'], ['← Files', '← ไฟล์'],
  ['SOURCE CONTROL', 'SOURCE CONTROL'], ['+ Branch', '+ Branch'], ['Stage all', 'Stage ทั้งหมด'],
  ['Working tree is clean.', 'ไม่มีการเปลี่ยนแปลง'], ['Commit message', 'ข้อความ commit'], ['Commit', 'Commit'],
  ['WORKTREES', 'WORKTREE'], ['+ New worktree', '+ Worktree ใหม่'], ['RECENT COMMITS', 'COMMIT ล่าสุด'], ['Remove', 'ลบ'],
  ['New branch', 'Branch ใหม่'], ['New worktree', 'Worktree ใหม่'], ['Branch name', 'ชื่อ branch'],
  ['Creates a sibling worktree on a new branch.', 'สร้าง worktree ข้าง ๆ บน branch ใหม่'],
  ['Base', 'ฐาน'],
  ['SESSION COMMANDS', 'คำสั่งของ SESSION'], ['TOOL & SHELL HISTORY', 'ประวัติ TOOL และ SHELL'],
  ['BACKGROUND JOBS', 'รายการงานเบื้องหลัง'], ['Show finished', 'แสดงที่เสร็จแล้ว'], ['Hide finished', 'ซ่อนที่เสร็จแล้ว'],
  ['SELECTED JOB', 'งานที่เลือก'], ['■ Stop job', '■ หยุดงาน'], ['Download log ↓', 'ดาวน์โหลด log ↓'],
  ['Show saved', 'แสดงที่บันทึกไว้'], ['Hide saved', 'ซ่อนที่บันทึกไว้'],
  ['No matching sessions.', 'ไม่พบ session ที่ตรงกัน'],
  ['PROJECT WORK', 'ภาพรวมงาน'], ['Project tasks', 'งานของโปรเจกต์'], ['Deleted tasks', 'งานในถังขยะ'],
  ['Shared across sessions · Record the next step before you leave.', 'ใช้ร่วมกันทุก session · บันทึกขั้นต่อไปก่อนออก'],
  ['+ New task', '+ งานใหม่'], ['Project', 'โปรเจกต์'], ['Search', 'ค้นหา'], ['Status', 'สถานะ'],
  ['All statuses', 'ทุกสถานะ'], ['Trash', 'ถังขยะ'], ['Refresh', 'รีเฟรช'], ['Dependency graph', 'กราฟความเชื่อมโยง'],
  ['Title, description or owner…', 'ชื่อ คำอธิบาย หรือผู้รับผิดชอบ…'], ['Previous', 'ก่อนหน้า'], ['Next', 'ถัดไป'],
  ['Stages', 'ขั้นงาน'], ['No tasks in this stage', 'ไม่มีงานในขั้นนี้'], ['Unassigned', 'ยังไม่มอบหมาย'],
  ['Loading tasks…', 'กำลังโหลดงาน…'], ['Saved on this machine · shared across sessions', 'บันทึกบนเครื่องนี้ · ใช้ร่วมกันทุก session'],
  ['No tasks yet', 'ยังไม่มีงาน'],
  ['Moving a card records status. It does not create a PR, merge code, tag a release or deploy.', 'การย้ายการ์ดบันทึกสถานะเท่านั้น ไม่ได้เปิด PR รวมโค้ด ออกเวอร์ชัน หรือขึ้นระบบ'],
  ['Open', 'รอเริ่ม'], ['Investigate', 'สำรวจ'], ['Change', 'ตกลงขอบเขต'], ['Build', 'พัฒนา'], ['Prove', 'ตรวจหลักฐาน'],
  ['Land', 'นำเข้าโปรเจกต์'], ['Deliver', 'ส่งมอบ'], ['Merge', 'รวมโค้ด'], ['Tag', 'ออกเวอร์ชัน'], ['Deploy', 'ขึ้นระบบ'],
  ['New work waiting to start.', 'งานใหม่ที่รอเริ่ม'],
  ['Research the problem before committing to a change.', 'ศึกษาปัญหาก่อนตกลงเปลี่ยนแปลง'],
  ['Agree on the scope and expected behavior.', 'ตกลงขอบเขตและพฤติกรรมที่ต้องการ'],
  ['Implement in an isolated workspace.', 'พัฒนาในพื้นที่แยก'],
  ['Collect test and review evidence.', 'ขั้นตรวจหลักฐาน: เก็บผลทดสอบและรีวิว'],
  ['Apply the proven change to the project.', 'นำการเปลี่ยนแปลงที่ผ่านแล้วเข้าโปรเจกต์'],
  ['Open a pull request or hand over.', 'เปิด PR หรือส่งมอบงาน'],
  ['Merged into the main branch.', 'รวมเข้า branch หลักแล้ว'], ['Released as a version.', 'ออกเป็นเวอร์ชันแล้ว'],
  ['Running in an environment.', 'ใช้งานจริงบนระบบแล้ว'],
  ['Title', 'ชื่องาน'], ['Owner session', 'session ผู้รับผิดชอบ'], ['Description', 'คำอธิบาย'], ['Next step', 'ขั้นต่อไป'],
  ['Blocker', 'สิ่งที่ติดขัด'], ['Evidence / references', 'หลักฐาน / อ้างอิง'], ['Save task', 'บันทึกงาน'],
  ['Reload latest', 'โหลดล่าสุด'], ['Move to trash', 'ย้ายไปถังขยะ'], ['Restore task', 'กู้คืนงาน'],
  ['Change history', 'ประวัติการเปลี่ยนแปลง'], ['Task details', 'รายละเอียดงาน'], ['New task', 'งานใหม่'],
  ['Hand off to selected session', 'ส่งต่อให้ session ที่เลือก'], ['Dependencies · required milestones', 'งานที่ต้องเสร็จก่อน'],
  ['Agent city', 'เมืองที่งานเดินหน้า'], ['All projects', 'ทุกโปรเจกต์'], ['Search agents…', 'ค้นหา agent…'],
  ['Include offline', 'รวมออฟไลน์'], ['ready / resting', 'พร้อม / พัก'], ['offline · station', 'ออฟไลน์ · สถานี'],
  ['LIVE · real status', 'LIVE · สถานะจริง'], ['Disconnected · last known data', 'ขาดการเชื่อมต่อ · ข้อมูลล่าสุด'],
  ['Pause motion', 'หยุดการเคลื่อนไหว'], ['Play motion', 'เล่นการเคลื่อนไหว'], ['Reset view', 'มุมเริ่มต้น'],
  ['Open chat ↗', 'เปิดแชต ↗'], ['People in the city', 'ผู้คนในเมือง'], ['Building the city…', 'กำลังสร้างเมือง…'],
  ['No agents match this filter.', 'ยังไม่มี agent ตรงกับตัวกรองนี้'], ['Drag to rotate · click a person to select', 'ลากเพื่อหมุน · คลิกคนเพื่อเลือก'],
  ['Ready for work', 'พร้อมรับงาน'], ['Resting / waiting to connect', 'พัก / รอเชื่อมต่อ'],
  ['General work · no assigned task', 'กำลังทำงานทั่วไป · ยังไม่มี task มอบหมาย'], ['No assigned task', 'ยังไม่มี task มอบหมาย'],
  ['Blocked: ', 'ติด blocker: '],
  ['Real status from sessions + Kanban · latest active task assigned to each agent · poses and walking are illustrative', 'สถานะจริงจาก session + Kanban · เลือกงาน active ล่าสุดที่มอบหมายให้ agent · ท่าทางและการเดินเป็นภาพประกอบ'],
  ['Districts follow assigned tasks and session status · movement is illustrative and never runs work or changes the Kanban', 'ตำแหน่งย่านอ้างอิง task ที่มอบหมายและสถานะ session · ท่าทาง/การเดินสุ่มเป็นภาพประกอบ ไม่รันงานหรือเปลี่ยน Kanban'],
  ['Read a brief', 'รับโจทย์ · อ่านเอกสาร'], ['Point at a plan', 'สืบค้น · ชี้กระดาน'], ['Agree the spec · sketch', 'ตกลงสเปก · วาดแบบ'],
  ['Write code · assemble', 'เขียนโค้ด · ประกอบงาน'], ['Prove · inspect equipment', 'พิสูจน์ · ตรวจเครื่องมือ'],
  ['Land · read findings', 'นำลง · อ่านผล'], ['Hand over documents', 'ส่งมอบ · ส่งเอกสาร'], ['Merge · assemble parts', 'รวมงาน · ประกอบชิ้นส่วน'],
  ['Pack a release', 'ออกเวอร์ชัน · แพ็กกล่อง'], ['Operate · scan monitors', 'ดูแลระบบ · ตรวจจอ'],
  ['Language', 'ภาษา'], ['Access and invites', 'สิทธิ์เข้าใช้และลิงก์เชิญ'], ['Loading access…', 'กำลังโหลดสิทธิ์…'],
  ['Copy main invite', 'คัดลอกลิงก์เชิญหลัก'], ['Create invite', 'สร้างลิงก์เชิญ'], ['Role', 'บทบาท'], ['Expires after', 'หมดอายุหลัง'],
  ['Viewer · read only', 'ผู้ชม · ดูอย่างเดียว'], ['Member · full access', 'สมาชิก · สิทธิ์เต็ม'],
  ['1 hour', '1 ชั่วโมง'], ['24 hours', '24 ชั่วโมง'], ['7 days', '7 วัน'], ['Revoke', 'เพิกถอน'],
  ['ACTIVE INVITES', 'ลิงก์เชิญที่ใช้ได้'], ['SIGNED-IN PEOPLE', 'คนที่เข้าใช้อยู่'], ['RECENT ACTIVITY', 'กิจกรรมล่าสุด'],
  ['No extra invites. Create one below.', 'ยังไม่มีลิงก์เชิญเพิ่มเติม สร้างได้ด้านล่าง'], ['No recorded changes yet.', 'ยังไม่มีการเปลี่ยนแปลงที่บันทึก'],
  ['Invites and activity are kept in hub memory and cleared by /serve stop.', 'ลิงก์เชิญและกิจกรรมเก็บในหน่วยความจำของ hub และหายเมื่อ /serve stop'],
  ['Invite link copied.', 'คัดลอกลิงก์เชิญแล้ว'], ['Invite revoked.', 'เพิกถอนลิงก์เชิญแล้ว'],
  ['viewer', 'ผู้ชม'], ['member', 'สมาชิก'],
  ['How Pi Workspace works', 'วิธีใช้ Pi Workspace'],
  ['3D is unavailable in this browser. Use Chat to continue.', 'เปิด 3D ไม่ได้ในเบราว์เซอร์นี้ ใช้ Chat เพื่อทำงานต่อได้'],
  ['3D stopped · use the agent list or return to Chat and refresh', '3D หยุดทำงาน · ใช้รายชื่อ agent หรือกลับ Chat แล้วรีเฟรช'],
  ['Kanban could not load · showing last known data without guessing task status', 'Kanban โหลดไม่ได้ · แสดงข้อมูลล่าสุด ไม่เดาสถานะงาน'],
  ['City camera', 'ควบคุมมุมมองเมือง'], ['Rotate left', 'หมุนเมืองซ้าย'], ['Rotate right', 'หมุนเมืองขวา'],
  ['Zoom in', 'ขยายเมือง'], ['Zoom out', 'ย่อเมือง'],
  ['Message delivery', 'วิธีส่งข้อความ'], ['Message this session', 'ส่งข้อความถึง session นี้'],
  ['Open background jobs', 'เปิดงานเบื้องหลัง'], ['Workspace view', 'มุมมองพื้นที่ทำงาน'],
  ['Copy this invite link', 'คัดลอกลิงก์เชิญนี้'], ['Attachments ready.', 'แนบไฟล์พร้อมแล้ว'],
  ['Enter a commit message.', 'ใส่ข้อความ commit'], ['Stop requested.', 'ส่งคำขอหยุดแล้ว'],
];
// Templates with {n}/{s} placeholders, matched in either language.
const TEMPLATES = [
  ['{n} live', 'ออนไลน์ {n}'], ['Show saved · {n}', 'แสดงที่บันทึกไว้ · {n}'], ['Hide saved · {n}', 'ซ่อนที่บันทึกไว้ · {n}'],
  ['CHANGES · {n}', 'การเปลี่ยนแปลง · {n}'], ['AVAILABLE TOOLS · {n}', 'TOOL ที่ใช้ได้ · {n}'],
  ['{n} agents · 10 districts · choose a district or person to focus', '{n} agents · 10 ย่านงาน · เลือกย่านหรือคนเพื่อดูใกล้ ๆ'],
  ['{n} / 64 agents', '{n} / 64 agents'], ['{n}–{n} of {n} tasks', '{n}–{n} จาก {n} งาน'],
  ['Message sent to {s}.', 'ส่งข้อความถึง {s} แล้ว'], ['Moved to {s}.', 'ย้ายไป {s} แล้ว'],
  ['Expires {s}', 'หมดอายุ {s}'],
  ['Showing 64 of {n} · filter by project to see more', 'แสดง 64 จาก {n} · กรองโปรเจกต์เพื่อดูเพิ่มเติม'],
  ['Attached {n}. {s}', 'แนบ {n} ไฟล์ {s}'],
];
export const DICTIONARY = WORDS;
const lookup = new Map();
for (const [en, th] of WORDS) { lookup.set(en, { en, th }); if (!lookup.has(th)) lookup.set(th, { en, th }); }
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const compile = (template) => new RegExp('^' + escape(template).replace(/\\\{n\\\}/g, '(\\d+)').replace(/\\\{s\\\}/g, '(.+?)') + '$');
const patterns = TEMPLATES.map(([en, th]) => ({ en, th, res: { en: compile(en), th: compile(th) } }));
const fill = (template, values) => { let i = 0; return template.replace(/\{[ns]\}/g, () => values[i++] ?? ''); };

export const LOCALES = ['en', 'th'];
export function detectLocale(stored, navigatorLanguage) {
  if (LOCALES.includes(stored)) return stored;
  return String(navigatorLanguage || '').toLowerCase().startsWith('th') ? 'th' : 'en';
}
/** Translate one interface label; unknown text is returned unchanged. */
export function translate(text, lang) {
  if (typeof text !== 'string' || !text.trim()) return text;
  const lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0], core = text.trim();
  const hit = lookup.get(core);
  if (hit) return lead + hit[lang] + tail;
  for (const p of patterns) for (const from of LOCALES) {
    const m = core.match(p.res[from]);
    if (m) return lead + fill(p[lang], m.slice(1)) + tail;
  }
  return text;
}

// Browser part: translate interface text as it is rendered, skipping user content.
const SKIP = '.message-body,.message-head strong,pre,code,textarea,.file-tree,.diff,.log-row,.job-output,.job-command,.job-command-label,.worktree-card,.task-card strong,.task-card p,.task-card-id,.task-owner,.session-name,.session-worktree,.worktree-label,.project-name,#chat-title,#session-title,#project-title,#worktree-title,#member,#model,#city-agent-name,.city-person>span,#dialog-content,.git-file,.attachment,[data-no-i18n]';
const ATTRS = ['placeholder', 'aria-label', 'title'];
let current = 'en', observer;
export const locale = () => current;
export const t = (text) => translate(text, current);
function skipped(node) { const element = node.nodeType === 1 ? node : node.parentElement; return !element || Boolean(element.closest(SKIP)); }
function translateNode(node) {
  if (node.nodeType === 3) { if (!skipped(node)) { const next = translate(node.nodeValue, current); if (next !== node.nodeValue) node.nodeValue = next; } return; }
  if (node.nodeType !== 1 || skipped(node)) return;
  for (const name of ATTRS) { const value = node.getAttribute(name); if (value) { const next = translate(value, current); if (next !== value) node.setAttribute(name, next); } }
  for (const child of node.childNodes) translateNode(child);
}
export function setLocale(lang, root = document.body) {
  current = LOCALES.includes(lang) ? lang : 'en';
  try { localStorage.setItem('pi-locale', current); } catch {}
  document.documentElement.lang = current;
  translateNode(root);
  if (!observer) {
    observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') translateNode(r.target);
        else if (r.type === 'attributes') {
          const value = r.target.getAttribute(r.attributeName);
          if (value && !skipped(r.target)) { const next = translate(value, current); if (next !== value) r.target.setAttribute(r.attributeName, next); }
        }
        else for (const n of r.addedNodes) translateNode(n);
      }
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
}
