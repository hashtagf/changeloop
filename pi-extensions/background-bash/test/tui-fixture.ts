import {join} from 'node:path';
import {homedir} from 'node:os';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import * as jobs from '../manager.cjs';
export default function(pi:any){
 pi.on('input',(event:any)=>event.source==='extension'&&event.text.startsWith('[Team Web UI:')?{action:'handled'}:undefined);
 pi.registerProvider('background-ui-test',{api:'background-ui-test-api',apiKey:'local-test',baseUrl:'http://127.0.0.1:1',
 models:[{id:'fixture',name:'Background UI fixture',reasoning:false,input:['text'],contextWindow:128000,maxTokens:100,cost:{input:0,output:0,cacheRead:0,cacheWrite:0}}],
 streamSimple(){throw Error('Unexpected model call in UI-only test');}});
 pi.on('session_start',async(_event:any,ctx:any)=>{
  const root=join(homedir(),'.pi/agent/background-jobs',createHash('sha256').update(ctx.sessionManager.getSessionId()).digest('hex').slice(0,24));
  const active=await jobs.start(root,{command:"rtk proxy sh -c 'printf \"TUI live log ready\\n\"; sleep 60'",cwd:ctx.cwd,notify:false});
  const old=await jobs.start(root,{command:"rtk proxy printf 'historical job log\\n'",cwd:ctx.cwd,notify:false});
  writeFileSync(process.env.BG_UI_FIXTURE_DATA,JSON.stringify({root,ids:[active.id,old.id]}),{mode:0o600});
 });
}
