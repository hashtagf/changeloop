import { homedir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { promises as fs } from "node:fs";
import { stripVTControlCharacters } from "node:util";
import { problem } from "./workspace.ts";

export function createBackgroundJobs({root=join(homedir(),".pi","agent","background-jobs"),manager}: any = {}) {
  if(!manager) {
    // background-bash ships beside this extension in the same package.
    try { manager=createRequire(import.meta.url)("../background-bash/manager.cjs"); }
    catch(e) { if(e.code!=="MODULE_NOT_FOUND")throw e; }
  }
  const dir=session=>{
    if(typeof session!=="string"||!session||session.length>512)throw problem(400,"Invalid session.");
    return join(root,createHash("sha256").update(session).digest("hex").slice(0,24));
  };
  const publicJob=job=>Object.fromEntries(["id","command","cwd","status","createdAt","startedAt","finishedAt","exitCode","timeoutSeconds"].filter(k=>job[k]!==undefined).map(k=>[k,job[k]]));
  const read=(session,id)=>{
    if(!/^[a-f0-9-]{36}$/.test(id||""))throw problem(400,"Invalid job ID.");
    if(!manager)throw problem(409,"Background extension is not installed.");
    try { return manager.read(dir(session),id); }
    catch(e) {if(e.code==="ENOENT")throw problem(404,"Job not found in this session.");throw e;}
  };
  return {
    snapshot(session,id,summary=false) {
      if(!manager)return {available:false,jobs:[],notice:"Background extension is not installed."};
      const jobs=manager.list(dir(session)).sort((a,b)=>a.createdAt-b.createdAt||a.id.localeCompare(b.id));
      const selected=summary?null:id?read(session,id):jobs.find(job=>["starting","running"].includes(job.status));
      return {available:true,jobs:jobs.map(publicJob),detail:selected?{...publicJob(selected),output:stripVTControlCharacters(manager.tail(dir(session),selected.id,500)),bounded:true}:null};
    },
    stop(session,id) {read(session,id);return publicJob(manager.stop(dir(session),id));},
    async download(session,id) {
      const job=read(session,id);
      try {
        if((await fs.stat(job.logPath)).size>12*1024*1024)throw problem(413,"Log exceeds the download limit.");
        return {name:"background-"+id+".log",binary:await fs.readFile(job.logPath)};
      } catch(e){if(e.code==="ENOENT")return {name:"background-"+id+".log",binary:Buffer.alloc(0)};throw e;}
    }
  };
}
