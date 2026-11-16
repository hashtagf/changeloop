const time=value=>typeof value==="number"&&Number.isFinite(value)?value:Date.parse(value)||0;
const order=(a,b)=>time(a.session.createdAt)-time(b.session.createdAt)||a.session.key.localeCompare(b.session.key);

// Parent links take precedence over worktree boundaries. Heartbeats/status never affect order.
export function buildSessionTree(sessions) {
  const nodes=new Map(sessions.map(session=>[session.key,{session,children:[],parent:null}]));
  const aliases=new Map();
  for(const node of nodes.values())for(const id of [node.session.id,node.session.agentId])if(id)aliases.set(id,node);
  for(const node of [...nodes.values()]) {
    const parentId=node.session.parentId;if(!parentId)continue;
    let parent=aliases.get(parentId);
    if(!parent) {
      const key="parent:"+parentId;
      parent=nodes.get(key);
      if(!parent) {
        parent={session:{key,id:parentId,agentId:parentId,project:node.session.project,projectRoot:node.session.projectRoot,
          cwd:node.session.projectRoot||node.session.cwd,createdAt:node.session.createdAt,unavailable:true},children:[],parent:null};
        nodes.set(key,parent);aliases.set(parentId,parent);
      }
    }
    let ancestor=parent,cycle=false;
    const seen=new Set([node]);
    while(ancestor) {
      if(seen.has(ancestor)){cycle=true;break;}
      seen.add(ancestor);ancestor=aliases.get(ancestor.session.parentId);
    }
    if(cycle)continue;
    node.parent=parent;parent.children.push(node);
  }
  const groups=new Map();
  const sort=node=>{node.children.sort(order);node.children.forEach(sort);};
  for(const node of nodes.values())if(!node.parent) {
    sort(node);
    const key=node.session.projectRoot||node.session.cwd||"Pi";
    if(!groups.has(key))groups.set(key,{key,name:node.session.project||"Pi",roots:[]});
    groups.get(key).roots.push(node);
  }
  for(const group of groups.values())group.roots.sort(order);
  return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.key.localeCompare(b.key));
}
export function sessionLabel(session) {
  const name=session.sessionName||"";
  if(name && !/^(?:Team room|Session [\da-f-]+|[sa]-[\da-f-]{12,})$/i.test(name))return name;
  const short=(session.agentId||session.id||session.key).replace(/^[sa]-/,"").slice(0,6);
  return (session.parentId||session.kind==="managed"?"Agent":"Main")+" · "+short;
}

// Keep ancestors of live descendants and the conversation already being read.
export function visibleSessionTree(groups, includeSaved=false, selected="") {
  if(includeSaved)return groups;
  const prune=node=>{
    const children=node.children.map(prune).filter(Boolean);
    return node.session.online || node.session.key===selected || children.length ? {...node,children} : null;
  };
  return groups.map(group=>({...group,roots:group.roots.map(prune).filter(Boolean)})).filter(group=>group.roots.length);
}
