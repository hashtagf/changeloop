export const cityStatus = row => !row.online ? "offline" : row.busy ? "working" : "idle";
export const cityStatusLabel = { working: "กำลังทำงาน", idle: "พร้อมรับงาน", offline: "ออฟไลน์" };
export const districts = [
  ['open','Intake','รับโจทย์ · อ่านเอกสาร','#789995','read'],
  ['investigate','Research','สืบค้น · ชี้กระดาน','#8a94b3','point'],
  ['change','Change','ตกลงสเปก · วาดแบบ','#b68ea4','draw'],
  ['build','Build','เขียนโค้ด · ประกอบงาน','#c58759','type'],
  ['prove','Test Lab','พิสูจน์ · ตรวจเครื่องมือ','#74a3b5','inspect'],
  ['land','Landing','นำลง · อ่านผล','#aa9b6c','read'],
  ['deliver','PR Exchange','ส่งมอบ · ส่งเอกสาร','#a48dbb','handoff'],
  ['merge','Integration','รวมงาน · ประกอบชิ้นส่วน','#70a58a','assemble'],
  ['tag','Release','ออกเวอร์ชัน · แพ็กกล่อง','#bf9273','pack'],
  ['deploy','Operations','ดูแลระบบ · ตรวจจอ','#729db1','monitor'],
].map(([id,name,description,color,pose],i)=>({id,name,description,color,pose,x:(i%5-2)*12,z:Math.floor(i/5)*18-10}));
export function cityAssignment(row,assignments=[]) {
  const task=assignments.find(t=>t.ownerSessionId===row.id);
  const district=!row.online?'offline':task&&districts.some(d=>d.id===task.status)?task.status:row.busy?'build':'idle';
  return {district,task,source:task?'kanban':row.busy?'session':'presence',blocked:Boolean(task?.blocker),pose:!row.online?'still':task?.blocker?'wait':row.busy?(districts.find(d=>d.id===district)?.pose||'type'):'idle'};
}
export function cityRows(catalog, project = "", query = "", showSaved = false) {
  return catalog.filter(row => !row.unavailable && (showSaved || row.online) &&
    (!project || (row.projectRoot || row.project) === project) &&
    (!query || [row.sessionName, row.project, row.worktree].join(" ").toLowerCase().includes(query.toLowerCase())))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || a.key.localeCompare(b.key));
}
// Each citizen keeps a stable lane as status and server ordering change.
export function cityDestination(status, slot) {
  const district=districts.find(d=>d.id===(status==='working'?'build':status));
  const x=district?.x || 0,z=district?district.z:status==='offline'?25:-25;
  return {x:x+(slot%8-3.5)*1.05,z:z+Math.floor(slot/8)*.78};
}
export function cityRoute(from,to) {
  // Districts face an east-west avenue; changes travel through roads, not buildings.
  const road=z=>z< -18?-19:z<0?-1:z<20?17:22;
  return [{x:from.x,z:road(from.z)},{x:30,z:road(from.z)},{x:30,z:road(to.z)},{x:to.x,z:road(to.z)},to];
}
