import path from 'node:path';
import * as store from './store.ts';
export function autoDelegation(root, self, mode = 'status') {
  const file = path.join(store.dir(root, self), 'delegation-settings.json');
  if (!['on', 'off', 'status'].includes(mode)) throw new Error('ใช้ /agents auto on | off | status');
  if (mode !== 'status') store.atomic(file, { enabled: mode === 'on' });
  return store.read(file, {}).enabled === true;
}
export const manualWorkflow = 'โหมดแตกตัวทำงานอัตโนมัติปิดอยู่: ทำงานและตรวจสอบในบทสนทนานี้เอง ห้ามสร้างหรือส่งงานต่อให้ตัวทำงานโดยอัตโนมัติ ใช้ตัวทำงานได้เมื่อผู้ใช้สั่งให้แตกตัวทำงานหรือมอบหมายงานอย่างชัดเจนเท่านั้น ยังคงรับและสรุปผลจากตัวทำงานเดิมได้ โหมดนี้ไม่หยุดงานที่กำลังทำอยู่';
