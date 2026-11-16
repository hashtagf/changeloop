import { randomUUID } from 'node:crypto';
import { taskStatuses } from './task-store.ts';
import { TaskPanel } from './task-panel.ts';
import { records } from './registry.ts';

export async function saveTaskEdit(store, project, task, patch, ctx) {
  try { return store.update(project, task.id, { ...patch, version: task.version }, 'user:terminal').task; }
  catch (error) {
    if (error.status !== 409) throw error;
    // Do not refresh the version and overwrite automatically. Preserve the draft
    // in the visible comparison until the user explicitly chooses to apply it.
    const latest = store.get(project, task.id).task;
    if(latest.version===task.version)throw error; // A cycle or other conflict is not a stale edit.
    const comparison = Object.keys(patch).map(key => `${key}\nSaved now: ${latest[key] || '—'}\nYour edit: ${patch[key] || '—'}`).join('\n\n');
    const choice = await ctx.ui.select(`Task changed in another session.\n${comparison}`, ['Keep latest saved task', 'Apply my edit to the latest version']);
    if (choice !== 'Apply my edit to the latest version') return latest;
    return saveTaskEdit(store, project, latest, patch, ctx);
  }
}
export function createTaskTUI(store, changeLoop) {
  let open = false, disposed = false, closePanel;
  const states = new Map<any, any>();
  return {
    async show(project, ctx) {
      if (open || disposed) return;
      open = true;
      let state = states.get(project) || { stage:0, selected:'', search:'', offset:0 };
      try {
        while (!disposed) {
          const sync=changeLoop?.sync(project);
          if(sync?.warnings.length)ctx.ui.notify(sync.warnings.join('\n'),'warning');
          const data = store.list(project, { search: state.search, offset: state.offset, deleted:Boolean(state.deleted) });
          const graph=store.graph(project),byId=new Map<any, any>(graph.nodes.map(t=>[t.id,t]));
          data.tasks=data.tasks.map(t=>({...t,blockedBy:byId.get(t.id)?.blockedBy}));
          const action = await ctx.ui.custom((tui, theme, _keys, done) => {
            closePanel = () => done(undefined);
            const panel = new TaskPanel({ tui, theme, project, state, done }); panel.update(data); return panel;
          }, { overlay:true, overlayOptions:{ width:'100%', maxHeight:'100%', row:0, col:0, margin:0 } });
          closePanel = undefined;
          if (!action || disposed) break;
          state = action.state; states.set(project,state);
          try {
            if(action.action==='trash'){state.deleted=!state.deleted;state.offset=0;state.selected='';}
            else if(action.action==='refresh')changeLoop?.sync(project,{force:true});
            else if(action.action==='graph') {
              const nodes=graph.layers.flatMap((ids,level)=>ids.map(id=>({node:byId.get(id),level})));
              const labels=nodes.map(({node,level})=>`${level+1}. ${node.title} · ${node.status} · ${node.blockedBy.length?'waiting for '+node.blockedBy.map(e=>e.title+' → '+e.status).join(', '):'dependencies ready'} [${node.id}]`);
              const choice=await ctx.ui.select('Dependency graph · prerequisite → dependent · choose a task',labels);
              const selected=nodes[labels.indexOf(choice)]?.node;
              if(selected){state.selected=selected.id;state.stage=taskStatuses.indexOf(selected.status);state.search='';state.offset=0;
                const all=graph.nodes;state.offset=Math.floor(all.findIndex(n=>n.id===selected.id)/200)*200;}
            }
            else if (action.action === 'search') {
              const search = await ctx.ui.input('Find tasks by title, description or owner (empty clears)', state.search);
              if (search !== undefined) { state.search=search; state.offset=0; state.selected=''; }
            } else if (action.action === 'new') {
              const title=await ctx.ui.input('New task title'); if (!title?.trim() || disposed) continue;
              const nextStep=await ctx.ui.input('Next step (optional)'); if (disposed) continue;
              const task=store.create(project,{ key:randomUUID(),title,nextStep:nextStep||'',ownerSessionId:ctx.sessionManager.getSessionId(),ownerName:ctx.sessionManager.getSessionName?.()||'Pi' },'user:terminal').task;
              state.stage=0;state.offset=0;state.search='';state.selected=task.id;state.deleted=false;
            } else if (action.task) {
              const task=store.get(project,action.task.id).task;
              if(action.action==='delete' || action.action==='restore') {
                const restore=action.action==='restore';
                if(await ctx.ui.confirm(restore?'Restore task':'Move task to trash',task.title+(restore?'':' · history is kept; you can restore it.'))){
                  store[action.action](project,task.id,{version:action.task.version},'user:terminal');state.selected='';
                }
              } else if(task.deletedAt && action.action!=='history'){ctx.ui.notify('Restore this task before editing it.','warning');}
              else if(action.action==='handoff') {
                const sessions=await records(),labels=sessions.map(s=>`${s.sessionName||s.id} · ${s.online?'online':'offline'} [${s.id}]`);
                const choice=await ctx.ui.select('Hand off to an existing session · no spawn or callback',labels);
                const target=sessions[labels.indexOf(choice)];if(!target || disposed)continue;
                const nextStep=await ctx.ui.editor('Handoff: next step for recipient',task.nextStep);if(!nextStep?.trim() || disposed)continue;
                await saveTaskEdit(store,project,task,{ownerSessionId:target.id,ownerName:target.sessionName||target.id,nextStep},ctx);
                ctx.ui.notify('Task assigned. Tell the recipient to open their task inbox.','info');
              } else if(action.action==='dependencies') {
                const mode=await ctx.ui.select('Dependencies',['Add or change prerequisite','Remove prerequisite']);if(!mode || disposed)continue;
                const candidates=graph.nodes.filter(n=>n.id!==task.id && (mode.startsWith('Add')||(task.dependsOn||[]).some(e=>e.id===n.id)));
                const labels=candidates.map(n=>`${n.title} · ${n.status} [${n.id}]`),choice=await ctx.ui.select('Choose prerequisite task',labels),target=candidates[labels.indexOf(choice)];
                if(!target || disposed)continue;
                let edges=(task.dependsOn||[]).filter(e=>e.id!==target.id);
                if(mode.startsWith('Add')){const status=await ctx.ui.select('Required milestone before dependent work',taskStatuses);if(!status || disposed)continue;edges.push({id:target.id,status});}
                await saveTaskEdit(store,project,task,{dependsOn:edges},ctx);
              } else if (action.action === 'history') {
                const history=store.get(project,task.id).history;
                await ctx.ui.select('Task history · latest 100 changes',history.map(e=>`${new Date(e.at).toLocaleString()} · ${e.actor} · ${e.from?e.from+' → ':''}${e.to} · ${JSON.stringify(e.changed)}`));
              } else if (action.action === 'move') {
                const status=await ctx.ui.select('Move task to status',taskStatuses);
                if (!status || disposed) continue;
                let evidence=task.evidence;
                if (['pr','merge','tag','deployed'].includes(status)) {
                  evidence=await ctx.ui.editor('Evidence / reference (status only; no Git or deploy action)',evidence);
                  if (evidence===undefined || disposed) continue;
                }
                const saved=await saveTaskEdit(store,project,task,{status,evidence},ctx);
                state.stage=taskStatuses.indexOf(saved.status);state.selected=saved.id;
              } else if (action.action === 'edit') {
                const labels=['Title','Description','Next step','Blocker','Evidence / references','Assign to this session','Unassign owner',...(changeLoop?['Link Change Loop change']:[])];
                const field=await ctx.ui.select('Edit task',labels); if (!field || disposed) continue;
                if(field==='Link Change Loop change') {
                  const id=await ctx.ui.input('Existing Change Loop change ID');
                  if(id?.trim()&&!disposed)changeLoop.link(project,task.id,id.trim());
                  continue;
                }
                let patch;
                if(field==='Assign to this session')patch={ownerSessionId:ctx.sessionManager.getSessionId(),ownerName:ctx.sessionManager.getSessionName?.()||'Pi'};
                else if(field==='Unassign owner')patch={ownerSessionId:'',ownerName:''};
                else {
                  const key=['title','description','nextStep','blocker','evidence'][labels.indexOf(field)];
                  const value=await ctx.ui.editor(`Edit ${field}`,task[key]); if(value===undefined || disposed)continue;
                  patch={ [key]:value };
                }
                await saveTaskEdit(store,project,task,patch,ctx);
              }
            }
          } catch(error) { ctx.ui.notify(error.message,'error'); }
        }
      } finally { states.set(project,state); open=false;closePanel=undefined; }
    },
    close() { disposed=true;closePanel?.(); },
  };
}
