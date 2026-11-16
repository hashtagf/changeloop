import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createTaskStore} from '../task-store.ts';
import {taskContext,taskContextPolicy} from '../task-context.ts';

test('prompt contains bounded assigned pointers, exact counts and no unrelated card details',t=>{
 const root=mkdtempSync(join(tmpdir(),'task-context-'));t.after(()=>rmSync(root,{recursive:true,force:true}));const s=createTaskStore(root);
 for(let i=0;i<12;i++)s.create('/project',{key:'other-'+i,title:'UNRELATED PRIVATE TASK '+i,description:'unrelated details'});
 for(let i=0;i<7;i++)s.create(i===6?'/other-project':'/project',{key:'own-'+i,title:'Own task '+i,ownerSessionId:'me',nextStep:'n'.repeat(4000),blocker:'b'.repeat(4000),evidence:'e'.repeat(12000)});
 const summary=taskContext(s,'/project','me',['warning '.repeat(100),'second','third']);
 assert.equal(summary.projectActive,18);assert.equal(summary.assignedActive,7);assert.equal(summary.tasks.length,3);assert.equal(summary.moreAssigned,4);
 assert.equal(summary.moreWarnings,1);assert.ok(summary.warnings.every(w=>w.length<=160));
 assert.ok(summary.tasks.every(t=>t.nextStep.length<=160&&t.blocker.length<=120));
 assert.ok(JSON.stringify(summary).length<=2800);assert.ok(!JSON.stringify(summary).includes('UNRELATED'));assert.ok(!JSON.stringify(summary).includes('eeee'));
 const unassigned=taskContext(s,'/project','nobody');assert.deepEqual(unassigned.tasks,[]);assert.equal(unassigned.projectActive,18);
 assert.ok(taskContextPolicy.length<450);
 const cross=taskContext(s,'/other-project','me');assert.equal(cross.tasks[0].title,'Own task 6');
 const a=s.list('/project',{search:'Own task'}).tasks[0];s.delete('/project',a.id,{version:a.version});assert.equal(taskContext(s,'/project','me').assignedActive,6);
});
test('prompt cap handles pathological paths/escaping and reports omitted assignments',()=>{
 const tasks=Array.from({length:3},(_,i)=>({id:String(i),project:'x'.repeat(5000),title:'"'.repeat(240)}));
 const summary=taskContext({contextSummary:()=>({projectActive:3,assignedActive:3,tasks,moreAssigned:0})},'/p','me');
 assert.ok(JSON.stringify(summary).length<=2800);assert.equal(summary.moreAssigned,3);
});
test('inbox pages cover all assigned work without losing or duplicating cards',t=>{
 const root=mkdtempSync(join(tmpdir(),'task-page-'));t.after(()=>rmSync(root,{recursive:true,force:true}));const s=createTaskStore(root);
 for(let i=0;i<45;i++)s.create('/p',{key:String(i),title:'Task '+i,ownerSessionId:'me'});
 const ids=[0,20,40].flatMap(offset=>s.inbox('me',{offset,limit:20}).map(t=>t.id));assert.equal(ids.length,45);assert.equal(new Set(ids).size,45);
 assert.throws(()=>s.inbox('me',{offset:-1}),/Invalid inbox/);
});
