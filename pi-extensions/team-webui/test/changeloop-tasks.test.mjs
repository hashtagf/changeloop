import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,symlinkSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {createTaskStore} from '../task-store.ts';
import {createChangeLoopSync,readChangeLoop} from '../changeloop-tasks.ts';
function fixture(t){
  const root=mkdtempSync(join(tmpdir(),'pi-cl-tasks-')),project=join(root,'project');mkdirSync(project);
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  const store=createTaskStore(join(root,'db')),sync=createChangeLoopSync(store);
  const write=(path,value)=>{const file=join(project,'.foundation',path);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(value));return file;};
  const state=status=>write('runtime/example.json',{id:'example',intent:'Example change',status});
  return {root,project,store,sync,write,state};
}
test('Change Loop lifecycle projects into one durable task without mutating source or inventing release completion',t=>{
  const f=fixture(t);let id;
  for(const [status,phase,board] of [['change','change','change'],['resolved','change','change'],['building','build','build'],['proven','prove','prove'],['applied','land','land'],['archived','land','land']]){
    const file=f.state(status),before=readFileSync(file,'utf8');
    f.sync.sync(f.project,{force:true});const task=f.store.list(f.project).tasks[0];
    assert.equal(task.workflow.phase,phase);assert.equal(task.status,board);assert.equal(task.id,id||task.id);id=task.id;
    assert.equal(readFileSync(file,'utf8'),before);assert.equal(f.store.list(f.project).total,1);
    assert.equal(f.sync.sync(f.project,{force:true}).changed,0);
    assert.equal(f.store.get(f.project,id).task.version,task.version);
  }
  assert.equal(f.store.get(f.project,id).history.length,6);
});
test('started Deliver maps to deliver; only a verified receipt records a PR; mismatched records cannot claim success',t=>{
  const f=fixture(t);f.state('archived');
  assert.equal(readChangeLoop(f.project,'example').boardStatus,'land');
  f.write('deliveries/example/state.json',{changeId:'example',status:'branch-pushed'});
  assert.equal(readChangeLoop(f.project,'example').boardStatus,'deliver');assert.deepEqual(readChangeLoop(f.project,'example').pullRequests,[]);
  f.write('deliveries/example/state.json',{changeId:'example',status:'verified'});
  f.write('deliveries/example/receipt.json',{changeId:'example',verifiedAt:'2026-11-16',pullRequest:{url:'https://example.invalid/pull/1',state:'OPEN',headCommit:'a'.repeat(40)}});
  const source=readChangeLoop(f.project,'example');assert.equal(source.phase,'deliver');assert.equal(source.boardStatus,'deliver');assert.equal(source.pullRequests.length,1);
  f.write('deliveries/example/receipt.json',{changeId:'other',verifiedAt:'2026-11-16'});
  assert.throws(()=>readChangeLoop(f.project,'example'),/identity mismatch/);
});
test('missing, corrupt and unsupported sources retain tasks and recover; manual handoffs survive sync',t=>{
  const f=fixture(t),file=f.state('building');f.sync.sync(f.project,{force:true});
  let task=f.store.list(f.project).tasks[0];
  f.store.update(f.project,task.id,{version:task.version,nextStep:'My handoff',ownerName:'Agent',status:'land'});
  for(const value of ['{broken',JSON.stringify({id:'example',status:'unknown'})]){
    writeFileSync(file,value);assert.equal(f.sync.sync(f.project,{force:true}).warnings.length,1);
    task=f.store.get(f.project,task.id).task;assert.equal(task.workflow.unavailable,true);assert.equal(task.status,'land');
    assert.equal(f.sync.sync(f.project,{force:true}).changed,0);
  }
  rmSync(file);f.sync.sync(f.project,{force:true});assert.equal(f.store.list(f.project).total,1);
  f.state('proven');f.sync.sync(f.project,{force:true});task=f.store.get(f.project,task.id).task;
  assert.equal(task.workflow.unavailable,false);assert.equal(task.workflow.phase,'prove');assert.equal(task.nextStep,'My handoff');assert.equal(task.ownerName,'Agent');
});
test('link reuses a manual card, rejects duplicate bindings and stale edits, imports investigations',t=>{
  const f=fixture(t);f.state('change');
  const manual=f.store.create(f.project,{key:'manual',title:'My title',nextStep:'My plan'}).task;
  const linked=f.sync.link(f.project,manual.id,'example').task;
  assert.equal(linked.id,manual.id);assert.equal(linked.title,'My title');assert.equal(linked.nextStep,'My plan');
  assert.throws(()=>f.store.update(f.project,manual.id,{version:1,title:'Stale'}),/changed/);
  const other=f.store.create(f.project,{key:'other',title:'Other'}).task;
  assert.throws(()=>f.sync.link(f.project,other.id,'example'),/already linked/);
  f.write('investigations/question.json',{kind:'investigation',id:'question',status:'active',changeIntent:'Investigate this'});
  f.sync.sync(f.project,{force:true});const investigation=f.store.linked(f.project).find(t=>t.workflow.recordKind==='investigation');
  assert.equal(investigation.workflow.phase,'investigate');assert.equal(investigation.status,'investigate');assert.equal(f.store.list(f.project).total,3);
});
test('legacy board statuses migrate once, including dependencies and landed Change Loop cards',async t=>{
  const {DatabaseSync}=await import('node:sqlite');
  const root=mkdtempSync(join(tmpdir(),'pi-cl-migrate-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  const store=createTaskStore(root),a=store.create('/p',{key:'a',title:'A'}).task,b=store.create('/p',{key:'b',title:'B',dependsOn:[{id:a.id,status:'prove'}]}).task,c=store.create('/p',{key:'c',title:'C'}).task;
  const db=new DatabaseSync(join(root,'tasks.sqlite')),put=(task,patch)=>{const data={...task,...patch};db.prepare('UPDATE tasks SET status=?,data=? WHERE id=?').run(data.status,JSON.stringify(data),task.id);};
  put(a,{status:'review'});put(b,{status:'deployed',evidence:'x',dependsOn:[{id:a.id,status:'verify'}]});put(c,{status:'review',workflow:{lifecycleStatus:'archived',boardStatus:'review'}});
  db.exec('PRAGMA user_version=0');db.close();
  const after=id=>store.get('/p',id).task;
  assert.equal(after(a.id).status,'prove');assert.equal(after(b.id).status,'deploy');assert.deepEqual(after(b.id).dependsOn,[{id:a.id,status:'prove'}]);
  assert.equal(after(c.id).status,'land');assert.equal(after(c.id).workflow.boardStatus,'land');
  assert.equal(store.list('/p',{status:'deploy'}).tasks.length,1);
  const again=new DatabaseSync(join(root,'tasks.sqlite')),stale={...after(a.id),status:'pr',evidence:'x'};
  again.prepare('UPDATE tasks SET status=?,data=? WHERE id=?').run('pr',JSON.stringify(stale),a.id);again.close();
  assert.equal(after(a.id).status,'deliver');
});
test('source traversal and escaped symlinks are rejected',t=>{
  const f=fixture(t);f.state('building');
  assert.throws(()=>readChangeLoop(f.project,'../example'),/Invalid/);assert.throws(()=>readChangeLoop(f.project,undefined),/Invalid/);
  const outside=join(f.root,'outside.json');writeFileSync(outside,JSON.stringify({id:'escape',status:'archived'}));
  symlinkSync(outside,join(f.project,'.foundation/runtime/escape.json'));
  assert.throws(()=>readChangeLoop(f.project,'escape'),/unavailable/);
  assert.equal(f.sync.sync(f.project,{force:true}).warnings.length,1);assert.equal(f.store.list(f.project).total,1);
});
