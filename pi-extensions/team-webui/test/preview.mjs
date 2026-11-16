// Local fixtures only: disposable files/repos, no provider or model calls.
import { createBackgroundJobs } from "../jobs.ts";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { createHub } from "../hub.ts";
import { createBridge } from "../bridge.ts";
import { registerSession, records, keyFor } from "../registry.ts";
import { describe, git } from "../workspace.ts";
import {createTaskStore,taskStatuses} from '../task-store.ts';
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const temp=await mkdtemp(join(tmpdir(),"pi-web-preview-")),registrations=[],owned=new Set(),identities=new Map();
// Keep disposable task fixtures out of the user’s persistent board.
process.env.PI_TASKS_ROOT=join(temp,'tasks');
async function project(name){
  const root=join(temp,name);await mkdir(root);await git(root,["init","-b","main"]);await git(root,["config","user.name","Preview"]);await git(root,["config","user.email","preview@example.invalid"]);
  await writeFile(join(root,"README.md"),"# "+name+"\n\nLocal preview project.\n");await mkdir(join(root,"src"));await writeFile(join(root,"src","index.ts"),"export const greeting = 'Hello Pi';\n");
  await git(root,["add","."]);await git(root,["commit","-m","Create preview project"]);await writeFile(join(root,"README.md"),"# "+name+"\n\nReady for the next change.\n");return root;
}
const first=await project("changeloop"),second=await project("claude-foundation");
if(process.env.PI_PREVIEW_CHANGELOOP==='1') {
  await mkdir(join(first,'.foundation/runtime'),{recursive:true});
  await writeFile(join(first,'.foundation/runtime/preview-change.json'),JSON.stringify({id:'preview-change',intent:'Change Loop preview task',status:'archived'}));
}
const isolated=join(temp,"changeloop-isolated");await git(first,["worktree","add","--detach",isolated]);
const sessionFixtures=process.env.PI_PREVIEW_CITY64==='1'?Array.from({length:64},(_,i)=>[first,i===0?'preview-main':'preview-'+i,`Agent ${String(i+1).padStart(2,'0')} · ${taskStatuses[i%10]}`]):[
 [first,"preview-main","Main · extension refactor"],
 [first,"preview-review","Review · Git workflow","agent-preview-main"],
 [first,"preview-tests","Tests · regression checks","agent-preview-main"],
 [first,"preview-edge","Edge cases · cancellation","agent-preview-review"],
 [isolated,"preview-isolation","Worktree · isolated verification","agent-preview-main"],
 [second,"preview-service","API · authentication"],
 [first,"preview-saved","Completed · old review","agent-preview-main"],
];
for(const[root,id,name,parentId]of sessionFixtures){
  if(process.env.PI_PREVIEW_CITY64==='1')createTaskStore().create(root,{key:id,title:'Work assigned to '+name,ownerSessionId:id,ownerName:name,status:taskStatuses[identities.size%10],evidence:'Fixture evidence only'},'fixture');
  identities.set(id,{agentId:"agent-"+id,parentId,kind:parentId?"managed":"session",name,createdAt:identities.size+1});
  const entries=[{type:"message",id:"user-intro",message:{role:"user",content:"ปรับ Web UI ให้จัดกลุ่มโปรเจกต์และ session พร้อมไฟล์กับ Git ครับ",timestamp:Date.now()-120000}},
    {type:"message",id:"answer",message:{role:"assistant",content:[{type:"text",text:"แยกการทำงานตาม session แล้วครับ คุณสลับแชทได้ระหว่างที่ agent ทำงานอยู่\n\nไฟล์และ Git จะอิง worktree ที่เลือก ส่วน extension ใช้จาก Pi process เดิม\n\n```ts\nconst workspace = { project, worktree, session };\n```"}],timestamp:Date.now()-60000}}];
  const sessionFile=join(temp,id+".jsonl");
  if(process.env.PI_PREVIEW_RICH==='1') {
    const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1kAAAAASUVORK5CYII=';
    await writeFile(join(root,'preview.png'),Buffer.from(png,'base64'));
    const md='# Rich response\n\n**Bold** and *italic* with ~~removed~~ and `inline code`.\n\n> A quoted note\n\n- [x] Verified\n- [ ] Remaining\n\n| Feature | State |\n|---|---|\n| Markdown | Ready |\n\n[Documentation](https://example.com)\n\n```js\nconsole.log("copy this");\n```\n\n```mermaid\nflowchart LR\n  A[Plan] --> B[Build]\n  B --> C[Verify]\n```\n\n```mermaid\nthis is not a valid diagram !!!\n```\n\n![Local preview](preview.png)\n\n![Remote preview](https://example.invalid/tracker.png)\n\n<script>window.RENDER_XSS=1</script><img src="javascript:alert(1)" onerror="window.RENDER_XSS=2">';
    const add=(id,message)=>entries.push({type:'message',id,message});
    add('rich-calls',{role:'assistant',timestamp:Date.now()-50000,content:[{type:'thinking',thinking:'PRIVATE_REASONING_FIXTURE'},{type:'toolCall',id:'call-mcp',name:'mcp__browseros_neo__get_page',arguments:{url:'https://example.com',token:'DO_NOT_EXPOSE'}},{type:'toolCall',id:'call-skill',name:'read',arguments:{path:'/fixture/skills/example/SKILL.md'}}]});
    add('mcp-result',{role:'toolResult',toolCallId:'call-mcp',toolName:'mcp__browseros_neo__get_page',timestamp:Date.now()-49000,content:[{type:'text',text:'## MCP result\n\nPage ready.'},{type:'image',mimeType:'image/png',data:png}]});
    add('skill-result',{role:'toolResult',toolCallId:'call-skill',toolName:'read',timestamp:Date.now()-48000,content:[{type:'text',text:'# Example skill\n\nUse the recorded workflow.'}]});
    add('shell-result',{role:'bashExecution',command:'fixture failing command',output:'Fixture error output',exitCode:1,timestamp:Date.now()-47000});
    add('rich-answer',{role:'assistant',timestamp:Date.now()-46000,content:[{type:'text',text:md},{type:'image',mimeType:'image/png',data:png}]});
  }
  await writeFile(sessionFile,[{type:"session",id,cwd:root,timestamp:new Date().toISOString()},...entries.map((e,i)=>({...e,parentId:i?entries[i-1].id:null}))].map(e=>JSON.stringify(e)).join("\n")+"\n");
  let bridge,seq=0;
  const ctx={cwd:root,mode:"tui",model:{id:"Local UI fixture",provider:"No model requests"},isIdle:()=>true,abort:async()=>bridge.event("agent_settled",{},ctx),
    ui:{notify(){},setStatus(){},setWidget(){},setEditorText(){},select:async()=>undefined,confirm:async()=>false,input:async()=>undefined,editor:async()=>undefined,custom:async()=>undefined,theme:{}},
    sessionManager:{getBranch:()=>entries,getSessionId:()=>id,getSessionName:()=>name,getSessionFile:()=>sessionFile}};
  const pi={getCommands:()=>[{name:"inspect",description:"Test an extension dialog",source:"extension"},{name:"panel",description:"Test a custom terminal component",source:"extension"}],
    getAllTools:()=>[{name:"read",description:"Read files"},{name:"bash",description:"Run commands"},{name:"agent_spawn",description:"Delegate to an agent"}],
    sendUserMessage(content,options){
      if(options.expandPromptTemplates){
        if(content.startsWith("/inspect"))void ctx.ui.confirm("Review changes","Continue reviewing this worktree?").then(value=>ctx.ui.notify("Review choice: "+value,"info"));
        else if(content.startsWith("/panel"))void ctx.ui.custom((_tui,_theme,_keys,done)=>({render:()=>["Choose agent","↑ ↓ to select · Enter open"],handleInput:key=>{if(key==="\r")done("main");}}));
        return;
      }
      const message={role:"user",content,timestamp:Date.now()},entry={type:"message",id:"sent-"+(++seq),message};entries.push(entry);
      bridge.event("message_start",{message},ctx);bridge.event("agent_start",{},ctx);
      setTimeout(()=>{const response={role:"assistant",content:[{type:"text",text:"ได้รับข้อความแล้วครับ นี่เป็นคำตอบจำลองสำหรับทดสอบ UI ไม่มีการเรียกโมเดลจริง"}],timestamp:Date.now()};
        entries.push({type:"message",id:"reply-"+seq,message:response});bridge.event("message_end",{message:response},ctx);bridge.event("agent_settled",{},ctx);},600);
    }};
  bridge=createBridge(pi);bridge.attach(ctx);registrations.push(await registerSession(bridge,root));owned.add(keyFor(id));
}
const jobManager=createRequire(import.meta.url)("../../background-bash/manager.cjs");
const jobsRoot=join(temp,"background-jobs"),jobDir=join(jobsRoot,createHash("sha256").update("preview-main").digest("hex").slice(0,24));
await jobManager.start(jobDir,{command:"rtk proxy sh -c 'printf \"Build started\\n\"; sleep 300; printf \"Build finished\\n\"'",cwd:first,notify:false});
await jobManager.start(jobDir,{command:"rtk proxy sh -c 'printf \"Old verification complete\\n\"; exit 7'",cwd:first,notify:false});
let tick=0;
const hub=await createHub({port:0,token:"preview-only",jobsService:createBackgroundJobs({root:jobsRoot,manager:jobManager}),history:async()=>[],members:async()=>identities,registry:async()=>{
 const rows=(await records()).filter(r=>owned.has(r.key));tick++;
 return (tick%2?rows.reverse():rows).map(row=>({...row,online:row.id!=="preview-saved",busy:row.id!=="preview-saved"&&(process.env.PI_PREVIEW_CITY64==='1'?identities.get(row.id).createdAt%4!==0:(tick+identities.get(row.id).createdAt)%2===0)}));
}});
console.log(JSON.stringify({preview:hub.urls[0],token:"preview-only",pid:process.pid,modelRequests:0}));
for(const signal of ["SIGTERM","SIGINT"])process.on(signal,async()=>{for(const job of jobManager.list(jobDir))jobManager.stop(jobDir,job.id);
  for(let i=0;i<30;i++){if(jobManager.list(jobDir).every(j=>j.finishedAt))break;await new Promise(done=>setTimeout(done,100));}
  await Promise.all(registrations.map(r=>r.stop()));await hub.stop();await rm(temp,{recursive:true,force:true});process.exit(0);});
