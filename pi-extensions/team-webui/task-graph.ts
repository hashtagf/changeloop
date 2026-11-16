import { problem } from './workspace.ts';

export const stages = ['open','plan','design','build','verify','review','pr','merge','tag','deployed'];
export function dependencies(value) {
  if (!Array.isArray(value) || value.length > 100) throw problem(400,'Use at most 100 dependencies.');
  const seen=new Set<any>();
  return value.map(edge=>{
    if(!edge || typeof edge.id!=='string' || !/^[a-f0-9-]{36}$/.test(edge.id) || !stages.includes(edge.status) || seen.has(edge.id))throw problem(400,'Each dependency needs a unique task ID and required status.');
    seen.add(edge.id);return {id:edge.id,status:edge.status};
  });
}
export function taskGraph(tasks) {
  const byId=new Map<any, any>(tasks.map(t=>[t.id,t])),incoming=new Map<any, any>(),children=new Map<any, any>(tasks.map(t=>[t.id,[]]));
  for(const task of tasks){
    incoming.set(task.id,(task.dependsOn||[]).length);
    for(const edge of task.dependsOn||[]){
      if(!byId.has(edge.id))throw problem(400,'Dependency must refer to an existing task in the same project.');
      children.get(edge.id).push(task.id);
    }
  }
  let frontier=tasks.filter(t=>incoming.get(t.id)===0).map(t=>t.id),visited=0;
  const layers=[];
  while(frontier.length){
    layers.push(frontier);visited+=frontier.length;const next=[];
    for(const id of frontier)for(const child of children.get(id)){incoming.set(child,incoming.get(child)-1);if(incoming.get(child)===0)next.push(child);}
    frontier=next;
  }
  if(visited!==tasks.length)throw problem(409,'Dependency cycle rejected. Tasks cannot depend on themselves or form a loop.');
  const nodes=tasks.map(t=>({id:t.id,title:t.title,status:t.status,ownerSessionId:t.ownerSessionId,ownerName:t.ownerName,version:t.version,
    dependsOn:t.dependsOn||[],blockedBy:(t.dependsOn||[]).filter(e=>stages.indexOf(byId.get(e.id).status)<stages.indexOf(e.status)).map(e=>({...e,title:byId.get(e.id).title,currentStatus:byId.get(e.id).status})),
    downstream:children.get(t.id)}));
  return {nodes,layers,edges:tasks.flatMap(t=>(t.dependsOn||[]).map(e=>({from:e.id,to:t.id,status:e.status}))),ready:nodes.filter(t=>!t.blockedBy.length).map(t=>t.id)};
}
