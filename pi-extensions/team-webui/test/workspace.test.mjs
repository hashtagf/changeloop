import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, mkdir, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBridge } from "../bridge.ts";


import { workspace, describe, git, safePath } from "../workspace.ts";
const testProfile=await mkdtemp(join(tmpdir(),"pi-web-test-profile-"));
process.env.PI_CODING_AGENT_DIR=testProfile;
after(()=>rm(testProfile,{recursive:true,force:true}));
const { createHub }=await import("../hub.ts");
const { registerSession, records, keyFor }=await import("../registry.ts");
const { savedState }=await import("../history.ts");

async function fixture(t) {
  const root=await mkdtemp(join(tmpdir(),"pi-web-workspace-"));
  t.after(()=>rm(root,{recursive:true,force:true}));
  await git(root,["init","-b","main"]);await git(root,["config","user.name","Web Test"]);await git(root,["config","user.email","web-test@example.invalid"]);
  await writeFile(join(root,"notes.txt"),"original\n");await writeFile(join(root,".gitignore"),".env\n");
  await git(root,["add","."]);await git(root,["commit","-m","Initial"]);
  return root;
}
function context(root,id) {
  const entries=[];
  return {cwd:root,mode:"tui",ui:{notify(){},setStatus(){},setWidget(){},setEditorText(){},
    async select(){return "terminal";},async confirm(){return false;},async input(){return undefined;},async editor(){return undefined;},async custom(){return undefined;},theme:{}},
    isIdle:()=>true,abort:async()=>{},sessionManager:{getBranch:()=>entries,getSessionId:()=>id,getSessionName:()=>id,getSessionFile:()=>undefined}};
}
test("files are confined to worktree, secrets and escaped symlinks are blocked; saves reject concurrent edits",async t=>{
  const root=await fixture(t),outside=await mkdtemp(join(tmpdir(),"pi-web-outside-"));t.after(()=>rm(outside,{recursive:true,force:true}));
  await writeFile(join(outside,"secret.txt"),"secret");await symlink(outside,join(root,"escape"));await writeFile(join(root,".env"),"TOKEN=secret");
  for(const path of ["../secret.txt","/etc/passwd",".env",".git/config","escape/secret.txt"])await assert.rejects(workspace(root,"file",{path}),e=>e.status===403);
  assert.ok(!(await workspace(root,"tree")).entries.some(e=>e.name===".env"||e.name===".git"));
  const file=await workspace(root,"file",{path:"notes.txt"});await writeFile(join(root,"notes.txt"),"external");
  await assert.rejects(workspace(root,"save",{path:"notes.txt",hash:file.hash,text:"overwrite"}),e=>e.status===409);
  const next=await workspace(root,"file",{path:"notes.txt"});await workspace(root,"save",{path:"notes.txt",hash:next.hash,text:"edited"});
  assert.equal(await readFile(join(root,"notes.txt"),"utf8"),"edited");
});
test("git supports diff, stage, unstage, commit, branches and safe worktree lifecycle",async t=>{
  const root=await fixture(t);
  await writeFile(join(root,"notes.txt"),"changed\n");
  assert.match((await workspace(root,"diff",{path:"notes.txt"})).text,/changed/);
  await workspace(root,"stage",{paths:["notes.txt"]});assert.equal((await workspace(root,"git")).changes[0].status,"M ");
  await workspace(root,"unstage",{paths:["notes.txt"]});assert.equal((await workspace(root,"git")).changes[0].status," M");
  await workspace(root,"stage",{paths:["notes.txt"]});await workspace(root,"commit",{message:"Web edit"});
  assert.equal((await workspace(root,"git")).changes.length,0);
  await workspace(root,"switch",{branch:"feature",create:true});assert.equal((await workspace(root,"git")).branch,"feature");
  const wt=await workspace(root,"worktree-add",{branch:"parallel"});t.after(()=>rm(wt.path,{recursive:true,force:true}));
  const a=await describe(root),b=await describe(wt.path);assert.equal(a.projectRoot,b.projectRoot);
  await writeFile(join(wt.path,"dirty.txt"),"dirty");
  await assert.rejects(workspace(root,"worktree-remove",{path:wt.path}));
  await rm(join(wt.path,"dirty.txt"));await workspace(root,"worktree-remove",{path:wt.path});
  await assert.rejects(workspace(root,"worktree-add",{branch:"--bad"}),e=>e.status===400);
  await assert.rejects(workspace(root,"stage",{paths:["../escape"]}),e=>e.status===403);
});
test("hub routes two sessions without sharing messages, attachments, commands or aborts; UI dialogs return to original extension",async t=>{
  const root=await fixture(t),sent=[[],[]],stopped=[0,0],contexts=[context(root,"hub-a-"+crypto.randomUUID()),context(root,"hub-b-"+crypto.randomUUID())];
  const bridges=contexts.map((ctx,i)=>{
    const bridge=createBridge({sendUserMessage:(...args)=>sent[i].push(args),getCommands:()=>[{name:"review",source:"extension",description:"Review"}],getAllTools:()=>[{name:"bash",description:"Shell"}]});
    ctx.abort=async()=>stopped[i]++;bridge.attach(ctx);return bridge;
  });
  const registrations=await Promise.all(bridges.map(b=>registerSession(b,root)));t.after(()=>Promise.all(registrations.map(r=>r.stop())));
  const keys=contexts.map(c=>keyFor(c.sessionManager.getSessionId()));
  const hub=await createHub({port:0,token:"hub-test",history:async()=>[],registry:async()=>(await records()).filter(r=>keys.includes(r.key))});t.after(()=>hub.stop());
  const base=hub.urls[0];
  async function req(path,body,cookie) {
    const response=await fetch(base+path,{method:body===undefined?"GET":"POST",headers:{...(body===undefined?{}:{"Content-Type":"application/json",Origin:base}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
    return {response,value:await response.json()};
  }
  const login=await req("/api/login",{name:"Tester",token:hub.token}),cookie=login.response.headers.get("set-cookie").split(";")[0];
  const endpoint=(i,a)=>"/api/sessions/"+keys[i]+"/"+a;
  assert.equal((await req(endpoint(0,"state"))).response.status,401);
  const catalog=(await req("/api/state",undefined,cookie)).value;
  assert.equal(catalog.sessions.length,2);assert.ok(!JSON.stringify(catalog).includes('"token"'));assert.ok(!JSON.stringify(catalog).includes('"port"'));
  const upload=await req(endpoint(0,"upload"),{name:"diagram.png",mimeType:"image/png",data:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a30sAAAAASUVORK5CYII="},cookie);
  assert.equal(upload.response.status,200);assert.equal(upload.value.mimeType,"image/png");
  const body={id:"hub-request-123",text:"Inspect",attachments:[upload.value.id]};
  assert.equal((await req(endpoint(1,"message"),body,cookie)).response.status,403);
  assert.equal((await req(endpoint(0,"message"),body,cookie)).response.status,200);
  assert.equal(sent[0][0][0][1].type,"image");assert.equal(sent[1].length,0);
  await req(endpoint(0,"message"),body,cookie);assert.equal(sent[0].length,1,"retry must not dispatch twice");
  assert.equal((await req(endpoint(0,"message"),{...body,text:"changed"},cookie)).response.status,409);
  await req(endpoint(1,"abort"),{},cookie);assert.deepEqual(stopped,[0,1]);
  await req(endpoint(1,"command"),{text:"/review src"},cookie);assert.equal(sent[1][0][0],"/review src");assert.equal(sent[1][0][1].expandPromptTemplates,true);
  assert.equal((await req(endpoint(1,"command"),{text:"/not-installed"},cookie)).response.status,400);
  const answer=contexts[1].ui.select("Pick branch",["main","feature"]);
  const state=(await req(endpoint(1,"state"),undefined,cookie)).value,dialog=state.extensionUI.dialogs[0];
  assert.equal(dialog.title,"Pick branch");
  await req(endpoint(1,"ui"),{id:dialog.id,value:"feature"},cookie);assert.equal(await answer,"feature");
  const rev=(await req(endpoint(1,"state"),undefined,cookie)).value.revision;
  assert.equal((await req(endpoint(1,"state?since="+rev),undefined,cookie)).value.unchanged,true);
  assert.equal((await req(endpoint(0,"upload"),{name:"../escape",data:"aGVsbG8="},cookie)).response.status,400);
  const other=await req(endpoint(0,"upload"),{name:"notes.txt",mimeType:"text/plain",data:Buffer.from("attached text").toString("base64")},cookie);
  await req(endpoint(0,"message"),{id:"hub-files-12345",text:"Read attached",attachments:[other.value.id]},cookie);
  assert.match(sent[0][1][0],/\[Pi attached files\]/);
  assert.match(sent[0][1][0],/attached text/);
  const download=await fetch(base+endpoint(0,"attachment?id="+other.value.id),{headers:{Cookie:cookie}});
  assert.equal(await download.text(),"attached text");
  assert.match(download.headers.get("content-disposition"),/attachment/);
  const wrong=await fetch(base+endpoint(1,"attachment?id="+other.value.id),{headers:{Cookie:cookie}});assert.equal(wrong.status,404);
});
test("saved history follows selected branch and does not reveal hidden reasoning",async t=>{
  const root=await fixture(t),file=join(root,"session.jsonl");
  await writeFile(file,[
    {type:"session",id:"saved-test",cwd:root},
    {type:"message",id:"a",parentId:null,message:{role:"user",content:"start"}},
    {type:"message",id:"discarded",parentId:"a",message:{role:"assistant",content:"old branch"}},
    {type:"message",id:"new",parentId:"a",message:{role:"assistant",content:[{type:"text",text:"new branch"},{type:"thinking",thinking:"secret"}]}},
  ].map(x=>JSON.stringify(x)).join("\n")+"\n");
  const result=await savedState({sessionFile:file,id:"saved-test"});
  assert.deepEqual(result.messages.map(m=>m.text),["start","new branch"]);assert.ok(!JSON.stringify(result).includes("secret"));
});
