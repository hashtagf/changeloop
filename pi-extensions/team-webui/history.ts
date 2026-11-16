import { promises as fs } from "node:fs";
import { join } from "node:path";
import { profile, keyFor } from "./registry.ts";
import { describe } from "./workspace.ts";
import {projectActivity,activitySummary} from "./activity.ts";
import { projectMessage } from "./bridge.ts";

let cache=[],lastScan=0;
const metadata=new Map<any, any>();
async function head(file) {
  const handle=await fs.open(file,"r");
  try {const b=Buffer.alloc(16384);const {bytesRead}=await handle.read(b,0,b.length,0);return JSON.parse(b.subarray(0,bytesRead).toString().split("\n")[0]);}
  finally{await handle.close();}
}
export async function savedSessions() {
  if(Date.now()-lastScan<15000)return cache;
  const roots=[join(profile,"sessions")];
  // Agent workers can store sessions outside the standard session tree.
  const members=join(profile,"agent-team","members");
  try {
    for(const id of await fs.readdir(members)){
      try{
        const presence=JSON.parse(await fs.readFile(join(members,id,"presence.json"),"utf8"));
        if(presence.sessionFile)roots.push(presence.sessionFile);
      }catch{}
    }
  }catch{}
  const files=[];
  for(const root of roots) {
    if(root.endsWith(".jsonl")){files.push(root);continue;}
    try {
      for(const dir of await fs.readdir(root,{withFileTypes:true})) {
        if(!dir.isDirectory())continue;
        for(const name of await fs.readdir(join(root,dir.name)))if(name.endsWith(".jsonl"))files.push(join(root,dir.name,name));
      }
    }catch{}
  }
  const result=[];
  for(const file of new Set(files)) {
    try {
      const info=await head(file);if(info.type!=="session"||!info.id||!info.cwd)continue;
      if(!metadata.has(info.cwd))metadata.set(info.cwd,await describe(info.cwd));
      const stat=await fs.stat(file);
      result.push({id:info.id,key:keyFor(info.id),...metadata.get(info.cwd),sessionFile:file,sessionName:"Session "+info.id.slice(0,8),
        createdAt:Date.parse(info.timestamp)||0,online:false,updated:stat.mtimeMs,busy:false,model:"Saved session"});
    }catch{}
  }
  cache=result.sort((a,b)=>b.updated-a.updated);lastScan=Date.now();return cache;
}
export async function savedState(row, activity = false, activityId?) {
  const handle=await fs.open(row.sessionFile,"r");
  let entries=[],offset=0;
  try {
    const stat=await handle.stat(),size=Math.min(stat.size,8*1024*1024);offset=stat.size-size;
    const b=Buffer.alloc(size);await handle.read(b,0,size,offset);
    let lines=b.toString().split("\n");if(offset)lines.shift();
    entries=lines.flatMap(line=>{try{return [JSON.parse(line)];}catch{return [];}});
  }finally{await handle.close();}
  const index=new Map<any, any>(entries.filter(e=>e.id).map(e=>[e.id,e]));
  let leaf=entries.findLast(e=>e.id&&e.type!=="session"),chain=[],seen=new Set<any>();
  while(leaf&&!seen.has(leaf.id)){seen.add(leaf.id);chain.unshift(leaf);leaf=index.get(leaf.parentId);}
  const calls=projectActivity(chain);
  if(activity)return {entries:activityId?calls.filter(c=>c.id===activityId):calls.map(activitySummary)};
  const messages=chain.filter(e=>e.type==="message").map(e=>projectMessage(e.message,e.id)).filter(Boolean).slice(-120);
  return {roomId:row.id,project:row.project,sessionName:entries.findLast(e=>e.type==="session_info")?.name||row.sessionName,
    model:row.model,busy:false,queued:[],tools:[],activity:calls.map(activitySummary),messages,commands:[],availableTools:[],extensionUI:{},
    notice:"Saved history · resume this session in Pi and /reload to send messages."+ (offset?" Older history is omitted.":"")};
}
