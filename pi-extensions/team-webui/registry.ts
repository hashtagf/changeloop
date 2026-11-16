import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { createHash, randomBytes } from "node:crypto";
import http from "node:http";
import { describe, problem, git } from "./workspace.ts";

export const profile = process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
export const dataDir = join(profile, "web-ui");
export const keyFor = id => createHash("sha256").update(id).digest("hex").slice(0,32);
export async function privateDir(path) { await fs.mkdir(path, {recursive:true,mode:0o700}); await fs.chmod(path,0o700); }
export async function writePrivate(path, value) {
  await privateDir(join(path, ".."));
  const temp = path + "." + randomBytes(6).toString("hex");
  await fs.writeFile(temp, JSON.stringify(value), {mode:0o600}); await fs.rename(temp,path);
}
export async function readJSON(path) { try { return JSON.parse(await fs.readFile(path,"utf8")); } catch { return null; } }
let membersCache=new Map<any, any>(),membersChecked=0;
export async function teamMetadata() {
  if(Date.now()-membersChecked<3000)return membersCache;
  const dir=join(process.env.PI_TEAM_ROOT || join(profile,'agent-team'),'members'),next=new Map<any, any>();
  let names=[];try{names=await fs.readdir(dir);}catch{}
  for(const name of names) {
    const [meta,presence]=await Promise.all([readJSON(join(dir,name,'meta.json')),readJSON(join(dir,name,'presence.json'))]);
    if(!meta?.id || !presence?.sessionId)continue;
    next.set(presence.sessionId,{agentId:meta.id,parentId:meta.parentId,kind:meta.kind,createdAt:meta.createdAt,name:meta.name});
  }
  membersCache=next;membersChecked=Date.now();return next;
}
export async function sessionRequest(record, action, body) {
  if (!record?.port || !record?.token || !record.online) throw problem(409,"This session is offline. Resume it in Pi and /reload to connect.");
  const res = await fetch("http://127.0.0.1:" + record.port + "/" + action, {
    method: body === undefined ? "GET" : "POST", headers: { Authorization: "Bearer " + record.token, "Content-Type":"application/json" },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(10000)
  }).catch(()=>{ throw problem(503,"Session is no longer connected."); });
  const result = (await res.json() as any);
  if (!res.ok) throw problem(res.status,result.error || "Session request failed.");
  return result;
}
export async function registerSession(bridge, cwd) {
  const token = randomBytes(24).toString("base64url");
  let file, lastId, lastRecord, branchChecked=Date.now(), stopped=false, pending=Promise.resolve(), metadata = await describe(cwd);
  const server = http.createServer(async(req,res)=>{
    res.setHeader("Content-Type","application/json");
    if (req.headers.authorization !== "Bearer " + token) { res.writeHead(401); res.end("{}"); return; }
    try {
      let body: any = {}, size = 0, chunks = [];
      for await (const chunk of req) { size += chunk.length; if(size > 32*1024*1024) throw problem(413,"Request too large."); chunks.push(chunk); }
      if(chunks.length) body = JSON.parse(Buffer.concat(chunks).toString());
      let value;
      const url = new URL(req.url, 'http://127.0.0.1');
      if(req.method === "GET" && url.pathname === "/state") {
        value = bridge.snapshot();
        if(url.searchParams.get('since') === String(value.revision)) value = { unchanged: true };
      }
      else if(req.method === 'GET' && url.pathname === '/activity') value = bridge.activity(url.searchParams.get('id'));
      else if(req.method === "POST" && req.url === "/message") { await bridge.send(body); value = {ok:true}; }
      else if(req.method === "POST" && req.url === "/abort") { await bridge.abort(body.name); value={ok:true}; }
      else if(req.method === "POST" && req.url === "/command") value = await bridge.command(body);
      else if(req.method === "POST" && req.url === "/ui") value = await bridge.reply(body);
      else throw problem(404,"Unknown session action.");
      res.end(JSON.stringify(value));
    } catch(e) { res.writeHead(e.status || 500); res.end(JSON.stringify({error:e.status ? e.message : "Pi could not complete this request."})); }
  });
  await new Promise<void>((done,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",done);});
  server.unref();
  const update = async() => {
    if(stopped)return;
    if(metadata.git && Date.now()-branchChecked>10000) {
      metadata.branch=(await git(metadata.root,['branch','--show-current']).catch(()=>'')).trim() || '(detached)';branchChecked=Date.now();
    }
    const state = bridge.snapshot(), id = state.roomId || "pid-"+process.pid, key = keyFor(id);
    const memberId = process.env.PI_TEAM_AGENT_ID || 's-'+createHash('sha256').update(id).digest('hex').slice(0,24);
    const member = await readJSON(join(process.env.PI_TEAM_ROOT || join(profile,'agent-team'),'members',memberId,'meta.json'));
    if(lastId && lastId !== id) await fs.rm(file,{force:true});
    file = join(dataDir,"sessions",key+".json"); lastId=id;
    lastRecord={id,key,pid:process.pid,port:(server.address() as any).port,token,updated:Date.now(),...metadata,
      sessionName:state.sessionName || member?.name || 'Session '+id.slice(0,8),agentId:memberId,parentId:member?.parentId,kind:member?.kind,
      createdAt:member?.createdAt || lastRecord?.createdAt || Date.now(),
      sessionFile:state.sessionFile,busy:state.busy,model:state.model,provider:state.provider};
    await writePrivate(file,lastRecord);
  };
  const schedule=()=>{pending=pending.catch(()=>{}).then(update);return pending;};
  await schedule();
  const timer=setInterval(()=>void schedule().catch(()=>{}),2000); timer.unref();
  return { async refresh(nextCwd) { metadata=await describe(nextCwd); await schedule(); },
    async stop() {
      stopped=true;clearInterval(timer);await pending.catch(()=>{});bridge.detach?.();await new Promise(done=>{server.close(done);server.closeAllConnections();});
      if(file && lastRecord?.sessionFile) {
        const {token,port,pid,...saved}=lastRecord;await writePrivate(file,{...saved,busy:false,online:false});
      } else if(file) await fs.rm(file,{force:true});
    } };
}
export async function records() {
  const dir=join(dataDir,"sessions");
  let names=[];try{names=await fs.readdir(dir);}catch{}
  const result=[];
  for(const name of names.filter(n=>/^[a-f0-9]{32}\.json$/.test(n))) {
    const row=await readJSON(join(dir,name)); if(!row?.cwd) continue;
    let alive=true;try{process.kill(row.pid,0);}catch{alive=false;}
    if(alive || row.sessionFile)result.push({...row,online:alive && Date.now()-row.updated<15000});
  }
  return result;
}
export function publicRecord(row) { const {token,port,pid,sessionFile,...safe}=row;return safe; }
