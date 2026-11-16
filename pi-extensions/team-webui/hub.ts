import { promises as fs } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { randomBytes, createHash } from "node:crypto";
import { createTeamServer, jsonBody } from "./server.ts";
import { dataDir, records, publicRecord, readJSON, writePrivate, sessionRequest, privateDir, teamMetadata } from "./registry.ts";
import { workspace, problem } from "./workspace.ts";
import { legacyState, legacyActivity } from "./legacy-activity.ts";
import { savedSessions, savedState } from "./history.ts";
import { extractAttachment } from "./attachments.ts";
import { createBackgroundJobs } from "./jobs.ts";
import { createTaskStore, taskStatuses } from './task-store.ts';
import { createChangeLoopSync } from './changeloop-tasks.ts';

export async function createHub({port=4318,host="127.0.0.1",token, registry=records, history=savedSessions, members=teamMetadata, jobsService=createBackgroundJobs(), tasksService=createTaskStore()}: any = {}) {
  let list=[], timer;
  const changeLoop=createChangeLoopSync(tasksService);
  const uploads=new Map<any, any>();
  const uploadRoot=join(dataDir,'uploads');
  try {
    for(const dir of (await fs.readdir(uploadRoot)).filter(n=>/^[a-f0-9]{32}$/.test(n))) {
      for(const name of (await fs.readdir(join(uploadRoot,dir))).filter(n=>/^[a-f0-9]{32}\.json$/.test(n))) {
        const item=await readJSON(join(uploadRoot,dir,name));
        if(item?.session===dir && item.path?.startsWith(join(uploadRoot,dir)+'/'))uploads.set(item.id,item);
      }
    }
  } catch {}
  const find=async key=>{const row=list.find(s=>s.key===key);if(!row)throw problem(404,"Session not found.");return row;};
  const cleanup=async()=>{for(const[id,item]of uploads)if(Date.now()-item.at>24*60*60*1000){uploads.delete(id);await fs.rm(item.path,{force:true});await fs.rm(join(uploadRoot,item.session,id+'.json'),{force:true});}};
  const server=createTeamServer({host,port,token,
    getSnapshot:()=>({sessions:list.map(publicRecord),queued:[],messages:[],project:"Pi Workspace"}),
    onMessage:async body=>{if(list.length!==1)throw problem(400,"Choose a session.");await sessionRequest(list[0],"message",body);},
    onAbort:async name=>{if(list.length!==1)throw problem(400,"Choose a session.");await sessionRequest(list[0],"abort",{name});},
    async onApi(req,url,member) {
      if(url.pathname==='/api/city') {
        if(req.method!=='GET')throw problem(405,'Use GET.');
        return {assignments:tasksService.cityAssignments(),updatedAt:Date.now()};
      }
      if (url.pathname === '/api/tasks' || url.pathname === '/api/tasks/projects') {
        const projects = new Map<any, any>(tasksService.projects().map(p => [p.project, { root: p.project, name: basename(p.project), count: p.count }]));
        for (const row of list) {
          const root = row.projectRoot || row.root;
          if (root && !projects.has(root)) projects.set(root, { root, name: row.project || basename(root), count: 0 });
        }
        if (url.pathname.endsWith('/projects')) {
          if (req.method !== 'GET') throw problem(405, 'Use GET.');
          return { projects: [...projects.values()].sort((a,b) => a.name.localeCompare(b.name)), statuses: taskStatuses };
        }
        const body = req.method === 'POST' ? await jsonBody(req, 64000) : Object.fromEntries(url.searchParams);
        if (!projects.has(body.project)) throw problem(404, 'Project not found.');
        if (req.method === 'GET') {
          const sync=changeLoop.sync(body.project);
          return {...(body.graph==='1'?tasksService.graph(body.project):body.id ? tasksService.get(body.project, body.id) : tasksService.list(body.project, body)),changeLoop:sync};
        }
        if (req.method !== 'POST') throw problem(405, 'Use GET or POST.');
        if (['delete','restore'].includes(body.action)) return tasksService[body.action](body.project,body.id,body,`user:${member.name}`);
        if (body.action === 'create') return tasksService.create(body.project, body, `user:${member.name}`);
        if (body.action === 'update') return tasksService.update(body.project, body.id, body, `user:${member.name}`);
        if (body.action === 'link') return changeLoop.link(body.project,body.id,body.changeId,body.recordKind);
        if(body.action==='handoff') {
          const target=list.find(s=>s.id===body.ownerSessionId);
          if(!target || !body.nextStep?.trim())throw problem(400,'Choose an existing session and enter the next step.');
          return tasksService.update(body.project,body.id,{...body,ownerSessionId:target.id,ownerName:target.sessionName||target.id},`user:${member.name}`);
        }
        throw problem(400, 'Use create or update. Tasks cannot be deleted.');
      }
      const match=url.pathname.match(/^\/api\/sessions\/([a-f0-9]{32})(?:\/([a-z-]+))?$/);
      if(!match)throw problem(404,"Unknown session route.");
      const row=await find(match[1]), action=match[2]||"state";
      if(req.method==="GET") {
        if(action==='jobs')return url.searchParams.get('download')==='1'?jobsService.download(row.id,url.searchParams.get('id')):jobsService.snapshot(row.id,url.searchParams.get('id'),url.searchParams.get('summary')==='1');
        if(action==="state")return row.online ? legacyState(row, url.searchParams.get("since"), sessionRequest) : savedState(row);
        if(action==='activity')return row.online ? legacyActivity(row,url.searchParams.get('id'),sessionRequest) : savedState(row, true,url.searchParams.get('id'));
        if(["tree","file","download","git","diff"].includes(action))return workspace(row.root,action,Object.fromEntries(url.searchParams));
        if(action==="attachment") {
          const id=url.searchParams.get('id');
          if(!/^[a-f0-9]{32}$/.test(id||''))throw problem(404,'Attachment not found.');
          const item=uploads.get(id) || await readJSON(join(dataDir,'uploads',row.key,id+'.json'));
          if(!item||item.session!==row.key)throw problem(404,"Attachment not found.");
          return {name:item.name,binary:await fs.readFile(item.path)};
        }
        throw problem(404,"Unknown session route.");
      }
      if(req.method!=="POST")throw problem(405,"Use GET or POST.");
      const body=await jsonBody(req,action==="upload"?30*1024*1024:3*1024*1024);
      if(action==='job-stop')return {body:jobsService.stop(row.id,body.id)};
      if(action==="upload") {
        if(!row.online)throw problem(409,"Connect this session before uploading.");
        if(typeof body.name!=="string"||!body.name||body.name.length>240||/[\x00-\x1f/\\]/.test(body.name)||typeof body.data!=="string"||!/^[A-Za-z0-9+/]*={0,2}$/.test(body.data))throw problem(400,"Invalid attachment.");
        const bytes=Buffer.from(body.data,"base64");
        if(!bytes.length||bytes.length>20*1024*1024)throw problem(413,"Attachment limit is 20 MB.");
        if(uploads.size>=256||[...uploads.values()].filter(f=>f.session===row.key).length>=64)throw problem(429,"Attachment limit reached.");
        if([...uploads.values()].reduce((n,f)=>n+f.size,bytes.length)>1024*1024*1024)throw problem(429,'Attachment storage is full. Old attachments expire after 24 hours.');
        const images={"image/png":[0x89,0x50,0x4e,0x47],"image/jpeg":[0xff,0xd8,0xff],"image/gif":[0x47,0x49,0x46],"image/webp":[0x52,0x49,0x46,0x46]};
        const mimeType=images[body.mimeType]?.every((b,i)=>bytes[i]===b)?body.mimeType:"application/octet-stream";
        const id=randomBytes(16).toString("hex"),dir=join(dataDir,"uploads",row.key),path=join(dir,id+"-"+body.name);
        await privateDir(dir);await fs.writeFile(path,bytes,{mode:0o600});
        const item={id,session:row.key,path,name:body.name,mimeType,size:bytes.length,at:Date.now()};uploads.set(id,item);
        await writePrivate(join(dir,id+'.json'),item);
        return {id,name:item.name,mimeType,size:item.size};
      }
      if(action==="message") {
        if(typeof body.text!=="string"||body.text.length>16000||(!body.text.trim()&&!body.attachments?.length)||!/^[-\w]{8,80}$/.test(body.id))throw problem(400,"Enter a message or attachment.");
        if(!["followUp","steer",undefined].includes(body.deliverAs))throw problem(400,"Invalid delivery mode.");
        if(!Array.isArray(body.attachments||[])||(body.attachments||[]).length>10)throw problem(400,"Attach up to 10 files.");
        const files=[];
        for(const id of body.attachments||[]) {
          const item=uploads.get(id);if(!item||item.session!==row.key)throw problem(403,"Attachment does not belong to this session.");
          files.push({...item,...(item.mimeType.startsWith("image/")?{data:(await fs.readFile(item.path)).toString("base64")}:await extractAttachment(item.path,item.name))});
        }
        return sessionRequest(row,"message",{id:body.id,name:member.name,text:body.text,deliverAs:body.deliverAs||"followUp",attachments:files});
      }
      if(action==="abort")return sessionRequest(row,"abort",{name:member.name});
      if(action==="command"||action==="ui")return sessionRequest(row,action,body);
      if(["save","stage","unstage","commit","switch","worktree-add","worktree-remove"].includes(action)) {
        if(action==="worktree-remove"&&list.some(s=>s.online&&s.root===body.path))throw problem(409,"A connected Pi session uses this worktree.");
        return workspace(row.root,action,body);
      }
      throw problem(404,"Unknown session action.");
    }
  });
  const refresh=async()=>{
    const merged=new Map<any, any>((await history()).map(row=>[row.key,row]));
    for(const row of await registry())merged.set(row.key,row);
    const metadata=await members();
    list=[...merged.values()].map(row=>{
      const member=metadata.get(row.id);if(!member)return row;
      const {name,...identity}=member;
      return {...row,...identity,sessionName:member.kind==='managed'?name:row.sessionName};
    }).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0)||a.key.localeCompare(b.key));server.publish();
  };
  await refresh();const info=await server.start();
  timer=setInterval(()=>{void refresh().catch(()=>{});void cleanup().catch(()=>{});},1500);timer.unref();
  return {...info,async stop(){clearInterval(timer);await server.stop();},server};
}
export async function ensureHub({port=4318,host="127.0.0.1"}: any = {}) {
  const path=join(dataDir,"hub-"+port+".json");
  let existing=await readJSON(path);
  // A default /serve reuses the existing workspace hub, including a fallback port.
  if(!existing && port===4318) {
    let files=[];try{files=await fs.readdir(dataDir);}catch{}
    for(const file of files.filter(f=>/^hub-\d+\.json$/.test(f))) {
      const candidate=await readJSON(join(dataDir,file));
      try {process.kill(candidate.pid,0);if(candidate.host===host){existing=candidate;break;}}catch{}
    }
  }
  if(existing) {
    try{
      process.kill(existing.pid,0);
      const res=await fetch("http://127.0.0.1:"+existing.port+"/health",{signal:AbortSignal.timeout(1000)});
      const health=(await res.json() as any);
      if(res.ok && health.instance===createHash('sha256').update(existing.token).digest('hex').slice(0,16)) {
        if(existing.host!==host)throw problem(409,"Hub already runs with "+existing.host+". Stop it before changing LAN access.");
        return existing;
      }
    }catch(e){if(e.status)throw e;}
  }
  const child=spawn(process.execPath,[fileURLToPath(import.meta.url),"--run",String(port),host],{detached:true,stdio:"ignore",env:process.env});child.unref();
  for(let i=0;i<100;i++) {
    await new Promise(done=>setTimeout(done,100));
    const info=await readJSON(path);
    if(info) {try{process.kill(info.pid,0);if(info.host===host)return info;}catch{}}
    if(child.exitCode!==null)break;
  }
  throw problem(503,"Hub did not start. Check whether port "+port+" is already in use.");
}
export async function stopHub(port=4318) {
  let path=join(dataDir,"hub-"+port+".json"),info=await readJSON(path);
  if(!info && port===4318) {
    let names=[];try{names=await fs.readdir(dataDir);}catch{}
    for(const name of names.filter(n=>/^hub-\d+\.json$/.test(n))){const candidate=await readJSON(join(dataDir,name));if(candidate){path=join(dataDir,name);info=candidate;break;}}
  }
  if(info) {
    try {
      const response=await fetch('http://127.0.0.1:'+info.port+'/health',{signal:AbortSignal.timeout(1000)}),health=(await response.json() as any);
      if(health.instance===createHash('sha256').update(info.token).digest('hex').slice(0,16)) {
        process.kill(info.pid,'SIGTERM');
        for(let attempt=0;attempt<80;attempt++) {
          try {
            const next=await fetch('http://127.0.0.1:'+info.port+'/health',{signal:AbortSignal.timeout(250)});
            if(((await next.json() as any)).instance!==health.instance)break;
          } catch { break; }
          await new Promise(done=>setTimeout(done,25));
        }
      }
    }catch{}
    await fs.rm(path,{force:true});
  }
}
if(process.argv[2]==="--run") {
  const port=Number(process.argv[3]),host=process.argv[4];
  const hub=await createHub({port,host});const path=join(dataDir,"hub-"+port+".json");
  await writePrivate(path,{port:hub.port,host:hub.host,urls:hub.urls,inviteUrls:hub.inviteUrls,token:hub.token,pid:process.pid});
  for(const signal of ["SIGTERM","SIGINT"])process.on(signal,async()=>{await fs.rm(path,{force:true});await hub.stop();process.exit(0);});
}
