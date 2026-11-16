import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createTaskStore} from '../task-store.ts';
function fixture(t){const root=mkdtempSync(join(tmpdir(),'pi-task-graph-'));t.after(()=>rmSync(root,{recursive:true,force:true}));const s=createTaskStore(root);return {s,root,add:(key,input={})=>s.create('/project',{key,title:key,...input}).task};}
test('dependency DAG orders prerequisites, calculates readiness and reblocks after regression',t=>{
 const {s,add}=fixture(t),a=add('Design'),b=add('Build',{dependsOn:[{id:a.id,status:'review'}]}),c=add('Verify',{dependsOn:[{id:b.id,status:'verify'}]});
 let g=s.graph('/project');assert.deepEqual(g.layers,[[a.id],[b.id],[c.id]]);assert.deepEqual(g.ready,[a.id]);
 assert.equal(g.nodes.find(n=>n.id===b.id).blockedBy[0].title,'Design');
 s.update('/project',a.id,{version:1,status:'review'});g=s.graph('/project');assert.ok(g.ready.includes(b.id));
 s.update('/project',a.id,{version:2,status:'build'});assert.ok(!s.graph('/project').ready.includes(b.id));
});
test('cycle, self-reference, duplicate and cross-project edges fail atomically',t=>{
 const {s,add}=fixture(t),a=add('A'),b=add('B',{dependsOn:[{id:a.id,status:'build'}]});
 for(const dependsOn of [[{id:b.id,status:'review'}],[{id:a.id,status:'review'}],[{id:b.id,status:'build'},{id:b.id,status:'review'}]])assert.throws(()=>s.update('/project',a.id,{version:1,dependsOn}));
 const foreign=s.create('/other',{key:'x',title:'Other'}).task;
 assert.throws(()=>s.update('/project',a.id,{version:1,dependsOn:[{id:foreign.id,status:'review'}]}),/same project/);
 assert.equal(s.get('/project',a.id).task.version,1);assert.equal(s.get('/project',a.id).history.length,1);
});
test('handoff persists to existing-session inbox without running agents, messages or callbacks',t=>{
 const {s,root,add}=fixture(t),a=add('Handoff');
 s.update('/project',a.id,{version:1,ownerSessionId:'existing-agent',ownerName:'Reviewer',nextStep:'Review the patch'});
 assert.equal(createTaskStore(root).inbox('existing-agent')[0].id,a.id);assert.deepEqual(s.inbox('other-agent'),[]);
 assert.throws(()=>s.update('/project',a.id,{version:1,ownerSessionId:'other-agent'}),/changed/);
 s.update('/project',a.id,{version:2,ownerSessionId:'other-agent'});assert.deepEqual(s.inbox('existing-agent'),[]);
});
