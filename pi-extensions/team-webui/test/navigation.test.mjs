import test from "node:test";
import assert from "node:assert/strict";
import { buildSessionTree,sessionLabel,visibleSessionTree } from "../web/navigation.js";
const base={project:"Project",projectRoot:"/repo",cwd:"/repo",root:"/repo",online:true};
const rows=[
 {...base,id:"uuid-main",key:"main",agentId:"s-main",sessionName:"Planning",createdAt:1},
 {...base,id:"uuid-child",key:"child",agentId:"a-child",parentId:"s-main",sessionName:"Review",createdAt:2},
 {...base,id:"uuid-grandchild",key:"nested",agentId:"a-nested",parentId:"a-child",createdAt:4},
 {...base,id:"uuid-worktree",key:"worktree",agentId:"a-worktree",parentId:"s-main",root:"/other-worktree",createdAt:3},
 {...base,id:"uuid-other",key:"other",agentId:"s-other",createdAt:5},
];
const flatten=groups=>groups.flatMap(g=>g.roots.flatMap(function walk(n){return [n.session.key,...n.children.flatMap(walk)];}));
test("sub agents follow their parent across worktrees, including nested agents",()=>{
 const groups=buildSessionTree(rows);
 assert.deepEqual(flatten(groups),["main","child","nested","worktree","other"]);
 assert.equal(groups[0].roots[0].children[1].session.root,"/other-worktree");
 assert.equal(groups[0].roots.length,2);
});
test("heartbeat order, online state and working status cannot reorder the navigation",()=>{
 const expected=flatten(buildSessionTree(rows));
 for(let i=0;i<20;i++){
  const changed=rows.map((r,n)=>({...r,busy:(i+n)%2===0,online:(i+n)%3===0,updated:Date.now()+i*1000+n})).reverse();
  if(i%2)changed.push(changed.shift());
  assert.deepEqual(flatten(buildSessionTree(changed)),expected);
 }
});
test("missing parents keep their children together and malformed cycles lose no sessions",()=>{
 const orphan=buildSessionTree(rows.filter(r=>r.key!=="main"));
 assert.deepEqual(flatten(orphan),["parent:s-main","child","nested","worktree","other"]);
 assert.equal(orphan[0].roots[0].session.unavailable,true);
 const cycles=buildSessionTree(rows.map(r=>({...r,parentId:r.agentId==="s-main"?"a-child":r.parentId})));
 const ids=flatten(cycles);
 assert.equal(new Set(ids).size,ids.length);
 for(const row of rows)assert.ok(ids.includes(row.key));
});
test("generic main labels are readable and user agent names are preserved",()=>{
 assert.equal(sessionLabel({...rows[0],agentId:"s-101f9ce28bf7ec3cc050412b",sessionName:"s-101f9ce28bf7ec3cc050412b"}),"Main · 101f9c");
 assert.equal(sessionLabel(rows[1]),"Review");
 assert.equal(sessionLabel({...rows[1],sessionName:"Team room"}),"Agent · child");
});
test("saved agents are hidden by default; live descendants, selected history and saved toggle retain ancestry",()=>{
 const sessions=rows.map(r=>({...r,online:r.key==="nested"}));
 const tree=buildSessionTree(sessions);
 assert.deepEqual(flatten(visibleSessionTree(tree)),["main","child","nested"]);
 assert.deepEqual(flatten(visibleSessionTree(tree,false,"worktree")),["main","child","nested","worktree"]);
 assert.deepEqual(flatten(visibleSessionTree(tree,true)),flatten(tree));
 assert.deepEqual(visibleSessionTree(buildSessionTree(sessions.map(r=>({...r,online:false})))),[]);
 assert.deepEqual(flatten(tree),["main","child","nested","worktree","other"],"Filtering never mutates the full history tree");
});
