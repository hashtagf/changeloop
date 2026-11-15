const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
async function library(){
 const version=fs.readFileSync(path.join(os.homedir(),'.pi/agent/install/current-version'),'utf8').trim();
 const modules=path.join(os.homedir(),'.pi/agent/install/releases',version,'node_modules');
 const {createJiti}=require(path.join(modules,'jiti')),tuiPath=path.join(modules,'@earendil-works/pi-tui/dist/index.js');
 return {...await createJiti(__filename,{moduleCache:false,alias:{'@earendil-works/pi-tui':tuiPath}}).import(path.join(__dirname,'panel.ts')),...await import(tuiPath)};
}
test('background panel selects jobs, reads sanitized live logs, stops only the selected job and preserves history',async()=>{
 const {BackgroundPanel,visibleWidth}=await library();let closed=0;const stopped=[];
 const tui={terminal:{rows:32},requestRender(){}},theme={fg:(_c,text)=>text};
 const all=[{id:'a',command:'alpha active',status:'running',createdAt:1},{id:'b',command:'beta active',status:'running',createdAt:2},{id:'c',command:'old completed',status:'completed',createdAt:3,exitCode:7}];
 const panel=new BackgroundPanel({tui,theme,done:()=>closed++,stop:id=>stopped.push(id),log:id=>id+' live log\n'+'line\n'.repeat(40)+'\x1b]52;c;bad\x07safe end'});
 panel.update([...all].reverse());
 assert.ok(!panel.render(100).join('\n').includes('old completed'));
 panel.handleInput('\x1b[B');panel.handleInput('\r');
 assert.ok(panel.render(100).join('\n').includes('beta active'));
 panel.handleInput('\x18');assert.deepEqual(stopped,['b']);
 panel.update(all.map(j=>j.id==='b'?{...j,status:'stopped',finishedAt:Date.now()}:j));
 assert.ok(panel.render(100).join('\n').includes('Job stopped.'));
 assert.ok(!panel.render(100).join('\n').includes('52;c;'));
 panel.handleInput('\x1b');assert.equal(closed,0,'Esc from log returns to list');
 panel.handleInput('\x0f');assert.ok(panel.render(100).join('\n').includes('old completed'));
 panel.handleInput('old');panel.handleInput('\r');
 assert.ok(panel.render(100).join('\n').includes('exit 7'));
 panel.handleInput('\x18');assert.deepEqual(stopped,['b'],'completed jobs cannot be stopped');
 for(const rows of [12,24,50])for(const width of [25,40,80,120]){
  tui.terminal.rows=rows;const lines=panel.render(width);
  assert.ok(lines.length<=Math.max(5,Math.min(32,rows-10)));
  assert.ok(lines.every(line=>visibleWidth(line)<=width));
 }
 panel.handleInput('\x1b');panel.handleInput('\x1b');assert.equal(closed,1);
});
test('background panel keeps its selected log when that job finishes and hides finished jobs on return to the list',async()=>{
 const {BackgroundPanel}=await library();
 const panel=new BackgroundPanel({tui:{terminal:{rows:24},requestRender(){}},theme:{fg:(_c,t)=>t},done(){},stop(){},log:()=>'final output'});
 panel.update([{id:'a',command:'only job',status:'running',createdAt:1}]);panel.handleInput('\r');
 panel.update([{id:'a',command:'only job',status:'completed',exitCode:0,createdAt:1}]);
 assert.ok(panel.render(100).join('\n').includes('final output'));
 panel.handleInput('\x1b');assert.ok(panel.render(100).join('\n').includes('No running jobs.'));
 panel.handleInput('\x0f');assert.ok(panel.render(100).join('\n').includes('only job'));
});
