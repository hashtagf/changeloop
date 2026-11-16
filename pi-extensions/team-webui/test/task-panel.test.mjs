import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { createTaskStore, taskStatuses } from '../task-store.ts';

async function library() {
  const version=readFileSync(join(homedir(),'.pi/agent/install/current-version'),'utf8').trim();
  const require=createRequire(join(homedir(),`.pi/agent/install/releases/${version}/node_modules/@earendil-works/pi-coding-agent/dist/index.js`));
  const {createJiti}=require('jiti');
  const loader=createJiti(import.meta.url,{moduleCache:false,alias:{'@earendil-works/pi-tui':require.resolve('@earendil-works/pi-tui')}});
  return {...await loader.import(new URL('../task-panel.ts',import.meta.url).pathname),...await loader.import(new URL('../task-tui.ts',import.meta.url).pathname),...await loader.import(require.resolve('@earendil-works/pi-tui'))};
}
test('TUI board navigates all stages, selects exact tasks, paginates and fits narrow terminals',async()=>{
  const {TaskPanel,visibleWidth}=await library(),actions=[],tui={terminal:{rows:28},requestRender(){}};
  const panel=new TaskPanel({tui,theme:{fg:(_,s)=>s},project:'/fixture',done:a=>actions.push(a)});
  const tasks=taskStatuses.map((status,i)=>({id:String(i),status,title:'Task '+status,ownerName:'Agent',nextStep:'Next',description:'Detail\n'.repeat(80),version:1}));
  panel.update({tasks,total:201,offset:0,nextOffset:200});
  for(let i=0;i<10;i++) {
    assert.equal(panel.selected().status,taskStatuses[i]);
    assert.ok(panel.render(100).join('\n').includes(taskStatuses[i].toUpperCase()));
    panel.handleInput('\x1b[C');
  }
  panel.handleInput('m');assert.equal(actions.at(-1).task.id,'0');
  panel.handleInput('\r');assert.ok(panel.render(100).join('\n').includes('Description'));
  panel.handleInput('\x1b');assert.equal(panel.viewing,false);
  for(const rows of [8,16,32])for(const width of [18,40,80,140]) {
    tui.terminal.rows=rows;const lines=panel.render(width);
    assert.equal(lines.length,rows);assert.ok(lines.every(line=>visibleWidth(line)<=width));
  }
  panel.handleInput(']');assert.equal(actions.at(-1).state.offset,200);
  panel.handleInput('[');assert.equal(actions.at(-1).state.offset,0);
  panel.handleInput('\x1b');assert.equal(actions.at(-1),undefined);
  tasks[0].workflow={phase:'land',lifecycleStatus:'archived',changeId:'example',sourcePath:'.foundation/runtime/example.json'};
  panel.update({tasks,total:10,offset:0,nextOffset:null});
  assert.ok(panel.render(140).join('\n').includes('CL: land'));
  panel.handleInput('\r');assert.ok(panel.render(140).join('\n').includes('Change Loop: land · archived'));
});
test('TUI conflict resolution never overwrites without an explicit choice',async t=>{
  const {saveTaskEdit}=await library(),root=mkdtempSync(join(tmpdir(),'pi-tui-conflict-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));const store=createTaskStore(root);
  const original=store.create('/project',{key:'one',title:'Original'}).task;
  store.update('/project',original.id,{version:1,title:'Other session'});
  await saveTaskEdit(store,'/project',original,{title:'My draft'},{ui:{select:async()=>undefined}});
  assert.equal(store.get('/project',original.id).task.title,'Other session');
  let prompt='';
  await saveTaskEdit(store,'/project',original,{title:'My draft'},{ui:{select:async text=>{prompt=text;return 'Apply my edit to the latest version';}}});
  assert.ok(prompt.includes('Other session')&&prompt.includes('My draft'));
  assert.equal(store.get('/project',original.id).task.title,'My draft');
});
test('TUI actions create, edit, move and assign through the shared persistent store',async t=>{
  const {createTaskTUI}=await library(),root=mkdtempSync(join(tmpdir(),'pi-tui-actions-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));const store=createTaskStore(root);
  let step=0,select=0;
  const board=createTaskTUI(store);
  const ctx={sessionManager:{getSessionId:()=> 'main',getSessionName:()=> 'Main'},ui:{
    async custom(factory){
      let done;const p=new Promise(resolve=>done=resolve);
      const panel=factory({terminal:{rows:28},requestRender(){}},{fg:(_,s)=>s},{},done);
      const key=['n','e','m','e','\x1b'][step++];panel.handleInput(key);return p;
    },
    async input(title){return title.startsWith('New')?'Native task':'Write a test';},
    async select(){return ['Next step','prove','Unassign owner'][select++];},
    async editor(){return 'Run the verification';},notify(message,type){if(type==='error')throw Error(message);},
  }};
  await board.show('/project',ctx);board.close();
  const saved=createTaskStore(root).list('/project').tasks[0];
  assert.equal(saved.title,'Native task');assert.equal(saved.status,'prove');assert.equal(saved.nextStep,'Run the verification');assert.equal(saved.ownerSessionId,'');
  assert.equal(store.get('/project',saved.id).history.length,4);
});
test('TUI dependency editing and graph selection use the same DAG and reject cycles without retrying as stale edits',async t=>{
  const {createTaskTUI,saveTaskEdit}=await library(),root=mkdtempSync(join(tmpdir(),'pi-tui-graph-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));const store=createTaskStore(root);
  const prerequisite=store.create('/project',{key:'a',title:'Design',status:'investigate'}).task;
  const dependent=store.create('/project',{key:'b',title:'Build',status:'open'}).task;
  let step=0,selection=0,graphSeen=false;
  const ctx={sessionManager:{getSessionId:()=> 'main'},ui:{
    async custom(factory){let done;const result=new Promise(resolve=>done=resolve);const panel=factory({terminal:{rows:28},requestRender(){}},{fg:(_,s)=>s},{},done);panel.handleInput(['d','g','\x1b'][step++]);return result;},
    async select(title,labels){selection++;if(selection===1)return labels[0];if(selection===2)return labels.find(s=>s.includes(prerequisite.id));if(selection===3)return 'land';graphSeen=title.includes('Dependency graph')&&labels.some(s=>s.includes('waiting for Design → land'));return labels.find(s=>s.includes(dependent.id));},
    notify(message,type){if(type==='error')throw Error(message);}
  }};
  await createTaskTUI(store).show('/project',ctx);assert.ok(graphSeen);
  assert.deepEqual(store.get('/project',dependent.id).task.dependsOn,[{id:prerequisite.id,status:'land'}]);
  await assert.rejects(()=>saveTaskEdit(store,'/project',prerequisite,{dependsOn:[{id:dependent.id,status:'build'}]},{ui:{select(){throw Error('must not offer stale edit recovery');}}}),/cycle/);
});

test('TUI delete confirmation, trash and restore preserve task identity',async t=>{
 const {createTaskTUI}=await library(),root=mkdtempSync(join(tmpdir(),'pi-tui-trash-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 const store=createTaskStore(root),task=store.create('/project',{key:'a',title:'Trash fixture'}).task;let step=0,confirmations=0;
 const ctx={ui:{
  async custom(factory){let done;const p=new Promise(r=>done=r);const panel=factory({terminal:{rows:28},requestRender(){}},{fg:(_,s)=>s},{},done);
   if(step===2)assert.equal(panel.data.total,1);
   panel.handleInput(['x','t','x','t','\x1b'][step++]);return p;},
  async confirm(){confirmations++;return true;},notify(m,type){if(type==='error')throw Error(m);}
 }};
 await createTaskTUI(store).show('/project',ctx);
 assert.equal(confirmations,2);assert.equal(store.list('/project').total,1);assert.equal(store.get('/project',task.id).task.version,3);
 assert.deepEqual(store.get('/project',task.id).history.map(e=>e.action),['restored','deleted','created']);
});
