import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {legacyState,legacyActivity} from '../legacy-activity.ts';
test('running legacy bridges gain persisted calls, revisions and details without a reload',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'legacy-activity-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const row={key:dir,sessionFile:join(dir,'session.jsonl')};
 const entries=[{type:'message',id:'a',message:{role:'assistant',timestamp:1,content:[{type:'toolCall',id:'tool',name:'bash',arguments:{command:'echo fixture'}}]}}];
 const save=()=>writeFile(row.sessionFile,entries.map(e=>JSON.stringify(e)).join('\n')+'\n');await save();
 const request=async()=>({revision:7,busy:true,messages:[]});
 const first=await legacyState(row,null,request);assert.equal(first.activity.length,1);assert.equal(first.busy,true);
 assert.equal(first.activity[0].args,undefined);assert.deepEqual(await legacyState(row,first.revision,request),{unchanged:true});
 entries.push({type:'message',id:'b',parentId:'a',message:{role:'toolResult',toolCallId:'tool',timestamp:2,content:[{type:'text',text:'done'}]}});await save();
 const next=await legacyState(row,first.revision,request);assert.notEqual(next.revision,first.revision);assert.equal(next.activity[0].status,'completed');
 assert.equal((await legacyActivity(row,'tool',request)).entries[0].text,'done');
 assert.deepEqual(await legacyState(row,'8',async()=>({revision:8,activity:[]})),{unchanged:true});
});
