import {renderMarkdown,imagePreview} from "/render.js";
import { buildSessionTree, sessionLabel, visibleSessionTree } from "/navigation.js";
import { createTaskBoard } from '/tasks.js';
import { shortPath, selectAttachments, skippedMessage, branchNameError } from '/ui-helpers.js';
import { setLocale, detectLocale, locale, t } from '/i18n.js';
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn,cls="")=>{const n=el("button",cls,text);n.type="button";n.addEventListener("click",()=>run(fn));return n;};
let selectionGeneration=0;
let projectFingerprint="",showSaved=localStorage.getItem("pi-nav-history")==="1";
let catalog=[],selected=localStorage.getItem("pi-session")||"",state,stream,tab="files",inspecting=false,loading=false,revision,dialogId="",customSession="";
let treePath=".",openFile,gitState,lastMessages="",toastTimer,lastNotice="";
const drafts=new Map();
let city,cityLoading,viewMode="chat",cityConnected=true,tasks,role="member",lastReply="";
const readOnly=()=>role==="viewer";
function syncView(){
  const active=viewMode==="city";
  $("main").classList.toggle("city-mode",active);$("city").hidden=!active;
  $("view-chat").setAttribute("aria-pressed",String(viewMode==='chat'));$("view-city").setAttribute("aria-pressed",String(active));
  $("main").classList.toggle('tasks-mode',viewMode==='tasks');
  $("view-tasks")?.setAttribute('aria-pressed',String(viewMode==='tasks'));
  tasks?.setVisible(viewMode==='tasks'&&!$("workspace").hidden);
  city?.setVisible(active&&!$("workspace").hidden);
}
async function setView(mode){
  viewMode=mode;localStorage.setItem("pi-view-mode",mode);syncView();
  if(mode!=="city")return;
  if(!cityLoading)cityLoading=import("/city.js").then(({createCity})=>{
    city=createCity($("city"),async key=>{await switchSession(key);if(selected===key)await setView("chat");},()=>api("/api/city"));
    city.update(catalog,selected);city.setConnected(cityConnected);syncView();
    $("city-loading").hidden=true;
  }).catch(()=>{$("city-loading").hidden=true;$("city-error").hidden=false;$("city-error").textContent="3D is unavailable in this browser. Use Chat to continue.";});
  await cityLoading;
}
$("view-chat").addEventListener("click",()=>void setView("chat"));
$("view-city").addEventListener("click",()=>void setView("city"));

let collapsed;try{collapsed=new Set(JSON.parse(localStorage.getItem("pi-nav-collapsed")||"[]"));}catch{collapsed=new Set();}
const draft=key=>{if(!drafts.has(key))drafts.set(key,{text:"",files:[],id:crypto.randomUUID()});return drafts.get(key);};
const current=()=>catalog.find(s=>s.key===selected);
const toast=message=>{$("toast").textContent=message;$("toast").hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").hidden=true,6000);};
const banner=message=>{$("banner").textContent=message||"";$("banner").hidden=!message;};
async function api(path,body){
  const response=await fetch(path,{method:body===undefined?"GET":"POST",headers:body===undefined?{}:{"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});
  let value;try{value=await response.json();}catch{throw Error("Server returned an unreadable response.");}
  if(response.status===401){
    // A failed login explains the code problem; elsewhere 401 means the access ended.
    if(path==="/api/login")throw Error(value.error||"Access code is invalid or expired. Ask the host for a new invite.");
    const message=value.error||"Your access ended. Sign in again.";join();$("login-error").textContent=t(message);throw Error(message);
  }
  if(!response.ok)throw Error(value.error||"Request failed.");
  return value;
}
async function run(fn){try{await fn();}catch(e){toast(e.message);}}
const endpoint=(action,key=selected)=>"/api/sessions/"+key+"/"+action;
const request=(action,body,key=selected)=>api(endpoint(action,key),body);
function join(){city?.setVisible(false);tasks?.setVisible(false);stream?.close();$("join").hidden=false;$("workspace").hidden=true;}
tasks=createTaskBoard({api,catalog:()=>catalog,preferredProject:()=>current()?.projectRoot,toast});
const tasksButton=el('button','','Tasks');tasksButton.id='view-tasks';tasksButton.setAttribute('aria-pressed','false');tasksButton.onclick=()=>{setInspector(false);void setView('tasks');};$("view-chat").after(tasksButton);
function applyRole(next){
  role=next==="viewer"?"viewer":"member";document.body.classList.toggle("read-only",readOnly());
  $("role-badge").hidden=!readOnly();$("invite").hidden=readOnly();tasks?.setReadOnly(readOnly());updateAvailability();
}
function authenticated(name,nextRole){$("member").textContent=name;applyRole(nextRole);$("login-error").textContent="";
  if(localStorage.getItem("pi-tips-done")!=="1")$("welcome-tips").hidden=false;$("join").hidden=true;$("workspace").hidden=false;connect();const mode=localStorage.getItem('pi-view-mode');void setView(['city','tasks'].includes(mode)?mode:'chat');}
async function connect(){
  stream?.close();stream=new EventSource("/api/events");
  stream.addEventListener("state",e=>{
    const snapshot=JSON.parse(e.data);
    catalog=snapshot.sessions||[];cityConnected=true;city?.update(catalog,selected);city?.setConnected(true);
    $("connection").textContent="● Connected";$("connection").classList.add("online");
    if(!catalog.some(s=>s.key===selected)||(!state&&!showSaved&&!current()?.online)){
      const first=catalog.find(s=>s.online)||(showSaved?catalog[0]:undefined);
      if(first)void switchSession(first.key);else emptyWorkspace();
    }
    else if(!state&&!loading)void switchSession(selected);
    renderProjects();updateAvailability();
  });
  stream.onerror=()=>{cityConnected=false;city?.setConnected(false);$("connection").textContent="Reconnecting";$("connection").classList.remove("online");};
}
function renderProjects(){
  const query=$("search").value.trim().toLowerCase();
  const next=JSON.stringify([selected,showSaved,query,[...collapsed],catalog.map(s=>[showSaved?null:Boolean(s.online),s.key,s.id,s.agentId,s.parentId,s.sessionName,s.root,s.projectRoot,s.branch,s.createdAt,s.kind,s.project,s.worktree,s.cwd]).sort((a,b)=>a[1].localeCompare(b[1]))]);
  const status=s=>s.unavailable?"Parent session unavailable":s.online?(s.busy?"Working":"Idle"):"Saved · offline";
  const updateStatus=(button,s)=>{
    button.querySelector(".dot").className="dot "+(s.online?(s.busy?"busy":"idle"):"");
    button.querySelector(".session-state").textContent=status(s);
  };
  $("session-count").textContent=catalog.filter(s=>s.online).length+" live";
  $("toggle-history").textContent=(showSaved?"Hide saved":"Show saved")+" · "+catalog.filter(s=>!s.online).length;
  $("toggle-history").setAttribute("aria-pressed",String(showSaved));
  if(next===projectFingerprint) {
    const rows=new Map(catalog.map(s=>[s.key,s]));
    for(const b of $("projects").querySelectorAll("[data-session-key]")){const s=rows.get(b.dataset.sessionKey);if(s)updateStatus(b,s);}
    return;
  }
  projectFingerprint=next;
  const container=$("projects"),scroll=container.scrollTop,focused=document.activeElement?.dataset.sessionKey;
  const fragment=document.createDocumentFragment();
  const selfMatch=node=>!query||[node.session.project,node.session.worktree,node.session.sessionName,node.session.cwd,sessionLabel(node.session)].join(" ").toLowerCase().includes(query);
  const matches=node=>selfMatch(node)||node.children.some(matches);
  const renderNode=(node,depth=0,showFamily=false)=>{
    const s=node.session,item=el("div","session-node"),row=el("div","session-wrap");
    const opened=query||!collapsed.has(s.key);
    if(node.children.length) {
      const toggle=button(opened?"▾":"▸",()=>{
        opened?collapsed.add(s.key):collapsed.delete(s.key);
        localStorage.setItem("pi-nav-collapsed",JSON.stringify([...collapsed]));renderProjects();
      },"tree-toggle");
      toggle.setAttribute("aria-label",(opened?"Collapse ":"Expand ")+sessionLabel(s));
      toggle.setAttribute("aria-expanded",String(Boolean(opened)));row.append(toggle);
    } else row.append(el("span","tree-toggle-spacer"));
    const b=button("",()=>switchSession(s.key),"session"+(s.key===selected?" selected":""));
    b.dataset.sessionKey=s.key;b.disabled=Boolean(s.unavailable);
    b.setAttribute("aria-current",s.key===selected?"page":"false");b.title=sessionLabel(s)+"\n"+(s.cwd?shortPath(s.cwd):"Parent session unavailable");
    const text=el("span","session-text"),name=el("span","session-name-line");
    name.append(el("span","session-name",sessionLabel(s)),el("span","session-role",depth?"Sub":"Main"));
    text.append(name,el("small","session-state",status(s)));
    if(depth && s.root!==node.parent?.session.root)text.append(el("small","session-worktree","⑂ "+(s.branch==="(detached)"?s.worktree:s.branch||s.worktree||"worktree")));
    b.append(el("span","dot"),text);updateStatus(b,s);row.append(b);item.append(row);
    if(node.children.length && opened) {
      const children=el("div","session-children");
      for(const child of node.children)if(showFamily||selfMatch(node)||matches(child))children.append(renderNode(child,depth+1,showFamily||selfMatch(node)));
      item.append(children);
    }
    return item;
  };
  for(const group of visibleSessionTree(buildSessionTree(catalog),showSaved,selected)){
    const roots=group.roots.filter(matches);if(!roots.length)continue;
    const section=el("section","project-group"),name=el("div","project-name");
    name.append(el("span","project-icon","▧"),el("span","",group.name));section.append(name);
    for(const node of roots){
      const family=el("div","session-family"),s=node.session;
      if(!s.unavailable)family.append(el("div","worktree-label","⑂ "+(s.branch==="(detached)"?s.worktree:s.branch||s.worktree||"main")));
      family.append(renderNode(node));section.append(family);
    }
    fragment.append(section);
  }
  if(!fragment.childNodes.length)fragment.append(el("div","empty",query?"No matching sessions.":showSaved?"No saved or connected sessions.":"No live sessions. Use Show saved to open past conversations."));
  container.replaceChildren(fragment);container.scrollTop=scroll;
  if(focused)[...container.querySelectorAll("[data-session-key]")].find(b=>b.dataset.sessionKey===focused)?.focus({preventScroll:true});
}
function emptyWorkspace(){state=undefined;selected="";$("welcome").hidden=false;$("conversation").hidden=true;$("composer-area").hidden=true;}
function persistDraft(){if(selected)draft(selected).text=$("prompt").value;}
async function switchSession(key){
  if(key===selected&&(loading||state)){$("sidebar").classList.remove("open");return;}
  if(openFile&&$("file-text")?.value!==openFile.text&&!confirm("Discard unsaved file edits?"))return;
  const generation=++selectionGeneration;
  persistDraft();
  const reveal=node=>{if(node.session.key===key)return true;const found=node.children.some(reveal);if(found)collapsed.delete(node.session.key);return found;};
  for(const group of buildSessionTree(catalog))group.roots.forEach(reveal);
  selected=key;lastReply="";$("background-count").textContent="…";jobRequestVersion++;jobsSession="";jobsFingerprint="";localStorage.setItem("pi-session",key);state=undefined;revision=undefined;lastMessages="";treePath=".";openFile=undefined;
  loading=true;city?.update(catalog,selected);renderProjects();$("sidebar").classList.remove("open");$("welcome").hidden=true;$("conversation").hidden=false;$("composer-area").hidden=false;
  $("messages").replaceChildren(el("div","empty","Loading conversation…"));$("prompt").value=draft(key).text;renderAttachments();
  if(inspecting)$("inspector-body").replaceChildren(el("div","empty","Loading session…"));
  try{await loadState(key,generation);if(generation===selectionGeneration&&inspecting)await renderInspector();}
  catch(e){if(generation===selectionGeneration&&selected===key){banner(e.message);$("messages").replaceChildren(el("div","empty","Conversation unavailable. Reconnect the Pi session or choose another session."));}}
  finally{if(generation===selectionGeneration)loading=false;}
}
async function loadState(key=selected,generation=selectionGeneration){
  if(!key)return;
  const result=await request("state"+(revision&&key===selected?"?since="+revision:""),undefined,key);
  if(key!==selected||generation!==selectionGeneration||result.unchanged)return;
  state=result;revision=result.revision;
  const row=current();$("project-title").textContent=row?.project||state.project;$("session-title").textContent=state.sessionName||row?.sessionName||"Untitled session";
  $("chat-title").textContent=state.sessionName||row?.sessionName||"Untitled session";$("worktree-title").textContent=(row?.branch||row?.worktree||"main")+" / "+(row?.online?"LIVE SESSION":"SAVED SESSION");
  $("model").textContent=[state.provider,state.model].filter(Boolean).join(" · ");
  $("agent-status").textContent=row?.online?(state.busy?"Working":"Idle"):"Offline";$("agent-status").className="pill"+(state.busy?" busy":"");
  banner(state.notice||(!row?.online?"Saved history. Resume this session in Pi and /reload to reconnect.":""));
  renderMessages();updateAvailability();renderExtensionUI();
}
function updateAvailability(){
  const row=current(),online=Boolean(row?.online&&state),writable=online&&!readOnly();
  const empty=!$("prompt").value.trim()&&!(selected&&draft(selected).files.length);
  $("send").disabled=!writable||empty;$("attach").disabled=!writable;$("stop").hidden=!writable||!state?.busy;
  $("prompt").readOnly=readOnly();$("delivery").disabled=readOnly();
  $("prompt").placeholder=readOnly()?"Read-only access · you can view but not send or change anything.":online?"Message Pi, or use an extension /command…":"Resume this session in Pi to send messages…";
}
const messageNodes=new Map(),callNodes=new Map();
function localImageLoader(key) {return async path=>{
  const row=catalog.find(s=>s.key===key);let file=decodeURIComponent(path);
  if(file.startsWith('/')){if(!file.startsWith(row.root+'/'))throw Error('Outside worktree');file=file.slice(row.root.length+1);}
  const value=await request('file?'+new URLSearchParams({path:file}),undefined,key);
  if(!value.image)throw Error('Not an image');return 'data:'+value.image.mimeType+';base64,'+value.image.data;
};}
function richText(text,parent,options={}){renderMarkdown(text,parent,{loadLocalImage:localImageLoader(selected),...options});}
function callCard(entry,key=selected,scope="chat"){
  const cacheKey=scope+':'+key+':'+entry.id,signature=JSON.stringify(entry),old=callNodes.get(cacheKey);
  if(old?.signature===signature)return old.node;
  const details=el('details','activity-entry call-card'),summary=el('summary'),body=el('div','call-body');
  summary.append(el('span','call-kind',(entry.kind||'tool').toUpperCase()),el('strong','',entry.name),el('span','call-status',entry.status||'recorded'));
  if(Number.isFinite(entry.durationMs))summary.append(el('span','call-status',(entry.durationMs/1000).toFixed(1)+'s'));
  details.dataset.callId=entry.id;details.dataset.status=entry.status||'recorded';details.append(summary,body);
  let loaded=false;
  async function load(){
    if(loaded)return;loaded=true;body.textContent='Loading call details…';
    try {
      const result=await request('activity?id='+encodeURIComponent(entry.id),undefined,key),full=result.entries?.find(item=>item.id===entry.id);
      if(!full){body.textContent='Details are outside the retained history window.';return;}
      body.replaceChildren();
      if(full.parentToolCallId)body.append(el('p','file-hint','Nested call · parent '+full.parentToolCallId));
      if(full.kind==='skill')body.append(el('p','file-hint','Skill invocation or SKILL.md read recorded by Pi; loading a skill is not proof of completing its workflow.'));
      if(full.args){let args=full.args;try{args=JSON.stringify(JSON.parse(args),null,2);}catch{}body.append(el('h4','','Input'),el('pre','call-input',args));}
      body.append(el('h4','','Output'));const output=el('div','message-body call-output');
      richText(full.text|| (full.status==='running'?'Waiting for output…':'No text output recorded.'),output,{streaming:full.status==='running',loadLocalImage:localImageLoader(key)});body.append(output);
      for(const image of full.images||[])body.append(imagePreview('data:'+image.mimeType+';base64,'+image.data,'Tool result image'));
      if(full.truncated)body.append(el('p','file-hint','Output truncated to the last 32 KB.'));
    }catch(e){body.replaceChildren(el('p','render-error',e.message),button('Retry',()=>{loaded=false;return load();}));}
  }
  details.addEventListener('toggle',()=>{if(details.open)void load();});
  if(old?.node.open){details.open=true;void load();}
  callNodes.set(cacheKey,{signature,node:details});while(callNodes.size>150)callNodes.delete(callNodes.keys().next().value);
  return details;
}
function renderMessages(){
  const fingerprint=JSON.stringify([state.messages,state.activity,state.busy,state.tools,state.queued]);
  if(fingerprint===lastMessages)return;lastMessages=fingerprint;
  const view=$("conversation"),atEnd=view.scrollHeight-view.scrollTop-view.clientHeight<110,fragment=document.createDocumentFragment();
  const timeline=[...(state.messages||[]).map(m=>({m,timestamp:m.timestamp})),...(state.activity||[]).map(call=>({call,timestamp:call.timestamp}))].sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));
  for(const item of timeline){
    if(item.call){fragment.append(callCard(item.call));continue;}
    const m=item.m,cacheKey=selected+':'+m.id,signature=JSON.stringify(m),cached=messageNodes.get(cacheKey);
    if(cached?.signature===signature){fragment.append(cached.node);continue;}
    const article=el("article","message "+m.role),head=el("div","message-head"),body=el("div","message-body");
    head.append(el("span","avatar",m.role==="assistant"?"π":(m.author||"U").slice(0,1)),el("strong","",m.author||m.role));
    if(m.timestamp){const time=el("time","",new Date(m.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));head.append(time);}
    if(m.streaming)head.append(el("span","","· streaming"));
    if(m.thinking){const thinking=el('details','thinking-state');thinking.append(el('summary','',m.streaming?'Thinking…':'Thinking completed'),el('p','file-hint','Pi recorded a thinking block. Private reasoning text is not exposed in this view.'));body.append(thinking);}
    richText(m.text||"",body,{streaming:m.streaming});
    if(m.truncated)body.append(el('p','file-hint','Message truncated to 32 KB.'));
    for(const image of m.images||[])body.append(imagePreview("data:"+image.mimeType+";base64,"+image.data,"Image attached to this message"));
    for(const file of m.files||[]){
      const link=el("a","sent-file","▤ "+file.name+" · "+Math.ceil((file.size||0)/1024)+" KB");
      link.href=endpoint("attachment?id="+encodeURIComponent(file.id));link.download=file.name;body.append(link);
    }
    article.append(head,body);messageNodes.set(cacheKey,{signature,node:article});while(messageNodes.size>150)messageNodes.delete(messageNodes.keys().next().value);fragment.append(article);
  }
  if(!timeline.length)fragment.append(el("div","empty","Start a conversation. Messages go to this Pi session with its existing context and extensions."));
  $("messages").replaceChildren(fragment);
  // Announce a finished assistant reply once; the initial load of a session is not announced.
  const reply=[...(state.messages||[])].reverse().find(m=>m.role==="assistant"&&!m.streaming);
  const replyKey=reply?selected+":"+reply.id:"";
  if(lastReply&&replyKey&&replyKey!==lastReply)$("announcer").textContent=(locale()==="th"?"คำตอบใหม่จาก ":"New reply from ")+(current()?.sessionName||"Pi")+": "+String(reply.text||"").slice(0,160);
  lastReply=replyKey||lastReply||selected+":none";
  $("activity-line").textContent=(state.tools||[]).length?"◌ "+state.tools.map(t=>t.name).join(" · "):state.busy?(state.activitySource==='session-log'?"◌ Pi is working · activity from saved session log":"◌ Pi is working…"):state.queued?.length?state.queued.length+" message(s) queued":"";
  if(atEnd||!view.dataset.loaded){view.scrollTop=view.scrollHeight;view.dataset.loaded="yes";}
}
function renderAttachments(){
  const key=selected,area=$("attachments");area.replaceChildren();
  for(const file of draft(key).files){
    const item=el("div","attachment");
    if(file.preview){const img=el("img");img.src=file.preview;img.alt=file.name;item.append(img);}
    const remove=button("×",()=>{draft(key).files=draft(key).files.filter(f=>f!==file);if(file.preview)URL.revokeObjectURL(file.preview);renderAttachments();},"icon");remove.setAttribute("aria-label","Remove "+file.name);
    item.append(el("span","",file.name),remove);
    area.append(item);
  }
  updateAvailability();
}
async function attachFiles(files){
  const key=selected,d=draft(key);if(!current()?.online)throw Error("Connect a session before attaching files.");
  const {accepted,skipped}=selectAttachments(d.files.length,files),note=skippedMessage(skipped);
  if(!accepted.length){if(note)throw Error(note);return;}
  for(const file of accepted){
    const preview=file.type.startsWith("image/")?URL.createObjectURL(file):null;
    const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(",")[1]);r.onerror=reject;r.readAsDataURL(file);});
    toast("Uploading "+file.name+"…");
    try{const stored=await request("upload",{name:file.name,mimeType:file.type,data},key);d.files.push({...stored,preview});}
    catch(e){if(preview)URL.revokeObjectURL(preview);throw e;}
    if(key===selected)renderAttachments();
  }
  toast(note?"Attached "+accepted.length+". "+note:"Attachments ready.");
}
async function sendMessage(){
  const key=selected,d=draft(key),text=$("prompt").value.trim();if(!text&&!d.files.length)return;
  $("send").disabled=true;$("send").setAttribute("aria-busy","true");$("composer").dataset.state="submitting";
  try{
    if(text.startsWith("/")) {
      if(d.files.length)throw Error("Send attachments as a chat message.");
      await request("command",{text},key);
    }else await request("message",{id:d.id,text,attachments:d.files.map(f=>f.id),deliverAs:$("delivery").value},key);
    for(const f of d.files)if(f.preview)URL.revokeObjectURL(f.preview);
    d.text="";d.files=[];d.id=crypto.randomUUID();
    if(key===selected){$("prompt").value="";renderAttachments();}
    toast(text.startsWith("/")?"Command sent.":"Message sent to "+(current()?.sessionName||"Pi")+".");
    await loadState(key);
  }finally{$("send").removeAttribute("aria-busy");$("composer").dataset.state="ready";updateAvailability();}
}
// In-app branch/worktree dialog; validates names before any request is sent.
function gitDialog(kind){
  const dialog=$("git-dialog"),input=$("git-branch-name"),error=$("git-dialog-error");
  $("git-dialog-title").textContent=t(kind==="worktree"?"New worktree":"New branch");
  $("git-dialog-hint").textContent=kind==="worktree"?t("Creates a sibling worktree on a new branch."):"";
  input.value="";error.textContent="";dialog.showModal();input.focus();
  return new Promise(resolve=>{
    const finish=value=>{$("git-form").onsubmit=null;$("git-cancel").onclick=null;dialog.oncancel=null;dialog.close();resolve(value);};
    $("git-form").onsubmit=e=>{e.preventDefault();const problem=branchNameError(input.value);if(problem){error.textContent=problem;input.focus();return;}finish(input.value.trim());};
    $("git-cancel").onclick=()=>finish("");dialog.oncancel=e=>{e.preventDefault();finish("");};
  });
}
function setInspector(open){if(!open&&tab==="jobs"){jobSelections.delete(selected);jobsFingerprint="";}inspecting=open;$("inspector").hidden=!open;$("toggle-inspector").setAttribute("aria-expanded",String(open));if(open)void run(renderInspector);}
async function renderInspector(){
  const key=selected,container=$("inspector-body");
  if(!key){container.replaceChildren(el("div","empty","Choose a session first."));return;}
  container.replaceChildren(el("div","empty","Loading…"));
  document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===tab)));
  try{
    container.setAttribute("aria-labelledby","tab-"+tab);
  if(tab==="files")await renderFiles(key);
    else if(tab==="git")await renderGit(key);
    else if(tab==="extensions")renderExtensions();
    else if(tab==="jobs")await refreshJobs(true);
    else await renderActivity(key);
  }catch(e){if(selected===key)container.replaceChildren(el("div","empty",e.message),button("Retry",renderInspector));}
}
const expandedFolders=new Map();
async function renderFiles(key){
  const expanded=expandedFolders.get(key)||new Set();expandedFolders.set(key,expanded);
  const container=$("inspector-body"),toolbar=el("div","inspector-toolbar"),tree=el("div","file-tree");
  tree.setAttribute('role','tree');tree.setAttribute('aria-label','Worktree files');
  toolbar.append(el("strong","","WORKTREE FILES"),button("Collapse all",()=>{expanded.clear();return renderFiles(key);},"quiet"),button("↻",()=>renderFiles(key),"quiet"));
  container.replaceChildren(toolbar,tree);
  async function populate(parent,path,depth){
    parent.textContent='Loading…';
    try{
      const result=await request("tree?path="+encodeURIComponent(path),undefined,key);
      if(key!==selected||!tree.isConnected)return;
      parent.replaceChildren();
      for(const entry of result.entries){
        const item=el('div','tree-item'),row=el('div','file-list-row'),children=el('div','tree-children');
        children.setAttribute('role','group');children.hidden=true;let loaded=false;
        const b=button('',async()=>{
          if(!entry.directory){await showFile(key,entry.path);return;}
          const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));icon.textContent=open?'▾':'▸';children.hidden=!open;
          if(open){expanded.add(entry.path);if(!loaded){loaded=true;await populate(children,entry.path,depth+1);}}else expanded.delete(entry.path);
        },'tree-row');
        b.dataset.path=entry.path;b.setAttribute('role','treeitem');b.setAttribute('aria-level',String(depth+1));b.style.paddingLeft=(depth*14+4)+'px';
        const icon=el('span','file-icon',entry.directory?'▸':entry.symlink?'↗':'·');b.append(icon,el('span','tree-name',entry.name));row.append(b);item.append(row);parent.append(item);
        if(entry.directory){b.setAttribute('aria-expanded','false');item.append(children);if(expanded.has(entry.path)){b.setAttribute('aria-expanded','true');icon.textContent='▾';children.hidden=false;loaded=true;await populate(children,entry.path,depth+1);}}
        else{const link=el('a','file-download','↓');link.href=endpoint('download?path='+encodeURIComponent(entry.path),key);link.download=entry.name;link.setAttribute('aria-label','Download '+entry.name);row.append(link);}
        b.addEventListener('keydown',e=>{
          const visible=[...tree.querySelectorAll('[role=treeitem]')].filter(n=>n.getClientRects().length),i=visible.indexOf(b);
          if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();visible[Math.max(0,Math.min(visible.length-1,i+(e.key==='ArrowDown'?1:-1)))]?.focus();}
          if(e.key==='ArrowRight'&&entry.directory){e.preventDefault();if(b.getAttribute('aria-expanded')==='false')b.click();else children.querySelector('[role=treeitem]')?.focus();}
          if(e.key==='ArrowLeft'){e.preventDefault();if(entry.directory&&b.getAttribute('aria-expanded')==='true')b.click();else parent.closest('.tree-item')?.querySelector('[role=treeitem]')?.focus();}
        });
      }
      if(!result.entries.length)parent.append(el('div','file-hint','Empty folder'));
    }catch(e){parent.replaceChildren(el('div','render-error',e.message),button('Retry',()=>populate(parent,path,depth)));}
  }
  await populate(tree,'.',0);
  container.append(el('p','file-hint','Secrets, .git and dependency folders are hidden.'));
}
async function showFile(key,path){
  const file=await request("file?path="+encodeURIComponent(path),undefined,key);if(selected!==key)return;openFile=file;
  const container=$("inspector-body"),toolbar=el("div","inspector-toolbar");
  toolbar.append(button("← Files",()=>{if($("file-text")&&$("file-text").value!==file.text&&!confirm("Discard unsaved edits?"))return;openFile=undefined;return renderFiles(key);},"quiet"),el("strong","",path));
  container.replaceChildren(toolbar);
  if(file.image){const img=el("img","file-preview");img.src="data:"+file.image.mimeType+";base64,"+file.image.data;img.alt=path;container.append(img);return;}
  const editor=el("textarea","file-editor");editor.id="file-text";editor.setAttribute("aria-label","Edit "+path);editor.value=file.text;editor.spellcheck=false;
  const save=button("Save changes",async()=>{
    const next=await request("save",{path,text:editor.value,hash:openFile.hash},key);
    openFile={...openFile,text:editor.value,hash:next.hash};toast("Saved "+path);save.disabled=true;
  },"primary mutates");editor.readOnly=readOnly();save.disabled=true;editor.addEventListener("input",()=>save.disabled=editor.value===openFile.text);
  container.append(editor,el("p","file-hint","Save writes to this worktree. External changes are checked before writing."),save);
}
async function renderGit(key){
  const result=await request("git",undefined,key);if(key!==selected||tab!=="git")return;gitState=result;
  const c=$("inspector-body");c.replaceChildren();
  const toolbar=el("div","inspector-toolbar");toolbar.append(el("strong","","SOURCE CONTROL"),button("↻",()=>renderGit(key),"quiet"));c.append(toolbar);
  const branch=el("div","git-branch"),select=el("select");select.setAttribute("aria-label","Git branch");
  select.disabled=readOnly();
  for(const name of result.branches){const option=el("option","",name);option.value=name;option.selected=name===result.branch;select.append(option);}
  if(!result.branches.length)select.append(el("option","",result.branch));
  select.addEventListener("change",()=>run(async()=>{await request("switch",{branch:select.value},key);toast("Switched branch.");await renderGit(key);}));
  branch.append(select,button("+ Branch",async()=>{const name=await gitDialog("branch");if(!name)return;await request("switch",{branch:name,create:true},key);await renderGit(key);},"mutates"));c.append(branch);
  const changeHead=el("div","inspector-toolbar");changeHead.append(el("div","section-label","CHANGES · "+result.changes.length));
  if(result.changes.length)changeHead.append(button("Stage all",async()=>{await request("stage",{paths:result.changes.map(x=>x.path)},key);await renderGit(key);},"quiet mutates"));
  c.append(changeHead);
  if(!result.changes.length)c.append(el("div","empty","Working tree is clean."));
  for(const item of result.changes){
    const row=el("div","git-file"),staged=item.status[0]!==" "&&item.status!=="??";
    row.append(el("span","status",item.status),button(item.path,async()=>{
      const diff=await request("diff?path="+encodeURIComponent(item.path)+(staged?"&staged=true":""),undefined,key);
      const pre=el("pre","diff",diff.text||"No tracked diff. New files appear in Files.");row.after(pre);
    },"file-name"));
    const toggle=button(staged?"−":"+",async()=>{await request(staged?"unstage":"stage",{paths:[item.path]},key);await renderGit(key);},"mutates");
    toggle.setAttribute("aria-label",(staged?"Unstage ":"Stage ")+item.path);row.append(toggle);
    c.append(row);
  }
  const commit=el("form","commit-box mutates"),message=el("input");message.placeholder="Commit message";message.setAttribute("aria-label","Commit message");
  const submit=el("button","primary","Commit");submit.type="submit";
  commit.append(message,submit);commit.addEventListener("submit",e=>{e.preventDefault();void run(async()=>{submit.disabled=true;try{const r=await request("commit",{message:message.value},key);toast(r.text||"Committed.");await renderGit(key);}finally{submit.disabled=false;}});});c.append(commit);
  c.append(el("div","section-label","WORKTREES"));
  for(const w of result.worktrees){
    const card=el("div","worktree-card");card.append(el("strong","",w.branch),el("small","",w.path));
    if(w.path!==current()?.root&&w.path!==result.worktrees[0]?.path&&!catalog.some(s=>s.online&&s.root===w.path))card.append(button("Remove",async()=>{if(!confirm("Remove clean worktree "+w.path+"?"))return;await request("worktree-remove",{path:w.path},key);await renderGit(key);},"quiet mutates"));
    c.append(card);
  }
  c.append(button("+ New worktree",async()=>{const name=await gitDialog("worktree");if(!name)return;const r=await request("worktree-add",{branch:name},key);toast("Created "+shortPath(r.path));await renderGit(key);},"quiet mutates"),el("div","section-label","RECENT COMMITS"));
  for(const line of result.log)c.append(el("div","log-row",line));
}
const jobSelections=new Map(),stoppingJobs=new Set();
let jobsData,jobsSession="",jobsFingerprint="",jobsPolling=false,showJobHistory=false,jobRequestVersion=0;
const runningJob=job=>["starting","running","stop_requested"].includes(job.status);
function jobStatus(job){return stoppingJobs.has(selected+":"+job.id)&&runningJob(job)?"stopping":job.status==="completed"&&job.exitCode!=null&&job.exitCode!==0?"failed":job.status;}
function jobDuration(job){
  const ms=Math.max(0,(job.finishedAt||Date.now())-(job.startedAt||job.createdAt));
  return Math.floor(ms/60000)+"m "+Math.floor(ms/1000)%60+"s";
}
async function refreshJobs(force=false){
  const key=selected;if(!key)return;
  const version=++jobRequestVersion;
  const viewing=inspecting&&tab==="jobs",id=viewing?jobSelections.get(key):undefined;
  const data=await request("jobs"+(id?"?id="+encodeURIComponent(id):viewing?"":"?summary=1"),undefined,key);
  if(key!==selected||version!==jobRequestVersion)return;
  jobsData=data;jobsSession=key;
  for(const job of data.jobs||[])if(!runningJob(job))stoppingJobs.delete(key+":"+job.id);
  if(data.detail)jobSelections.set(key,data.detail.id);
  const count=(data.jobs||[]).filter(runningJob).length;
  $("background-count").textContent=count;
  $("open-background").classList.toggle("has-jobs",count>0);
  $("open-background").setAttribute("aria-label","Open background jobs · "+count+" running");
  if(inspecting&&tab==="jobs")renderJobs(force);
}
function renderJobs(force=false){
  const key=selected,data=jobsSession===key?jobsData:undefined,c=$("inspector-body");
  if(!data){c.replaceChildren(el("div","empty","Loading background jobs…"));return;}
  const detail=data.detail,rows=(data.jobs||[]).filter(j=>showJobHistory||runningJob(j)||j.id===detail?.id);
  const fingerprint=JSON.stringify([key,showJobHistory,data.available,rows.map(j=>[j.id,jobStatus(j),j.exitCode]),detail?.id]);
  if(force||fingerprint!==jobsFingerprint||!c.querySelector(".background-view")){
    jobsFingerprint=fingerprint;
    const oldLog=c.querySelector(".job-output"),oldScroll=oldLog?.scrollTop,outerScroll=c.scrollTop;
    const focus=document.activeElement?.dataset.jobId,view=el("div","background-view");
    const toolbar=el("div","inspector-toolbar");toolbar.append(el("strong","","BACKGROUND JOBS"),button(showJobHistory?"Hide finished":"Show finished",()=>{showJobHistory=!showJobHistory;renderJobs(true);},"quiet"));view.append(toolbar);
    view.append(el("p","file-hint","Jobs for this session · logs update automatically. Opening this view makes no model request."));
    const list=el("div","job-list");
    for(const job of rows){
      const b=button("",async()=>{jobSelections.set(key,job.id);await refreshJobs(true);},"job-row"+(job.id===detail?.id?" selected":""));
      b.dataset.jobId=job.id;b.title=job.command;
      b.append(el("span","dot "+(runningJob(job)?"busy":"")),el("span","job-command-label",job.command),el("small","job-state",jobStatus(job)+(job.exitCode!=null?" · "+job.exitCode:"")));list.append(b);
    }
    view.append(list);
    if(!rows.length)view.append(el("div","empty",data.notice|| (showJobHistory?"No saved jobs in this session.":"No running background jobs. Use Show finished to review past logs.")));
    if(detail){
      view.append(el("div","section-label","SELECTED JOB"),el("pre","job-command",detail.command));
      view.append(el("div","job-meta",jobStatus(detail)+" · "+jobDuration(detail)+(detail.exitCode!=null?" · exit "+detail.exitCode:"")));
      const controls=el("div","job-controls");
      if(runningJob(detail)){
        const stop=button(stoppingJobs.has(key+":"+detail.id)?"Stopping…":"■ Stop job",async()=>{
          stoppingJobs.add(key+":"+detail.id);renderJobs(true);
          try{await request("job-stop",{id:detail.id},key);toast("Job stop requested.");await refreshJobs();}
          catch(e){stoppingJobs.delete(key+":"+detail.id);throw e;}
        },"stop mutates");stop.disabled=stoppingJobs.has(key+":"+detail.id);controls.append(stop);
      }
      const download=el("a","quiet","Download log ↓");download.href=endpoint("jobs?id="+encodeURIComponent(detail.id)+"&download=1",key);download.download="background-"+detail.id+".log";controls.append(download);view.append(controls);
      const output=el("pre","job-output");output.tabIndex=0;output.setAttribute("aria-label","Background job output");output.textContent=detail.output||"(no output yet)";
      view.append(output,el("p","file-hint","Showing the latest 500 lines / 32 KB. Download the log for the full output."));
    }
    c.replaceChildren(view);c.scrollTop=outerScroll;
    if(detail&&oldScroll!=null)c.querySelector(".job-output").scrollTop=oldScroll;
    if(focus)[...c.querySelectorAll("[data-job-id]")].find(b=>b.dataset.jobId===focus)?.focus({preventScroll:true});
  }
  if(detail){
    const output=c.querySelector(".job-output");
    if(output){const follow=output.scrollHeight-output.scrollTop-output.clientHeight<24;
      if(output.textContent!==(detail.output||"(no output yet)")){output.textContent=detail.output||"(no output yet)";if(follow)output.scrollTop=output.scrollHeight;}}
    const meta=c.querySelector(".job-meta");if(meta)meta.textContent=jobStatus(detail)+" · "+jobDuration(detail)+(detail.exitCode!=null?" · exit "+detail.exitCode:"");
  }
}
function selectInspectorTab(next){
  if(openFile&&$("file-text")?.value!==openFile.text&&!confirm("Discard unsaved edits?"))return;
  openFile=undefined;tab=next;setInspector(true);
}

function renderExtensions(){
  const c=$("inspector-body");c.replaceChildren(el("div","section-label","SESSION COMMANDS"));
  c.append(el("p","file-hint","Commands, skills and tools run in the connected Pi process. Custom terminal panels appear as a keyboard-driven view; terminal-specific features may require Pi TUI."));
  for(const command of state?.commands||[]){
    const row=button("",()=>{$("prompt").value="/"+command.name+" ";draft(selected).text=$("prompt").value;$("prompt").focus();if(innerWidth<1050)setInspector(false);},"command-row");
    row.append(el("strong","","/"+command.name),el("small","",command.description||command.source));c.append(row);
  }
  if(!state?.commands?.length)c.append(el("div","empty","No extension commands available for this session."));
  c.append(el("div","section-label","AVAILABLE TOOLS · "+(state?.availableTools?.length||0)));
  for(const tool of state?.availableTools||[]){const row=el("div","command-row");row.append(el("strong","",tool.name),el("small","",(tool.description||"").slice(0,180)));c.append(row);}
}
async function renderActivity(key){
  const result=await request("activity",undefined,key);if(key!==selected||tab!=="activity")return;
  const c=$("inspector-body"),toolbar=el("div","inspector-toolbar");toolbar.append(el("strong","","TOOL & SHELL HISTORY"),button("↻",()=>renderActivity(key),"quiet"));c.replaceChildren(toolbar);
  for(const entry of result.entries||[]){
    c.append(callCard(entry,key,"inspector"));
  }
  if(!result.entries?.length)c.append(el("div","empty","No recorded tool or shell activity."));
}
function renderExtensionUI(){
  const ui=state?.extensionUI||{};
  const notice=ui.notices?.at(-1);
  if(notice&&selected+notice.at!==lastNotice){lastNotice=selected+notice.at;toast(notice.message);}
  const lines=[...Object.values(ui.statuses||{}),...Object.values(ui.widgets||{}).flat()];
  $("extension-widgets").textContent=lines.join("\n");
  const pending=ui.dialogs?.[0],custom=ui.custom;
  if(!pending&&!custom){if($("extension-dialog").open)$("extension-dialog").close();dialogId="";return;}
  const id=pending?.id||"custom";
  if(id===dialogId&&custom){const frame=$("custom-frame");if(frame)frame.textContent=custom.join("\n");return;}
  if(id===dialogId)return;
  if($("extension-dialog").open)$("extension-dialog").close();
  dialogId=id;customSession=selected;
  const c=$("dialog-content");c.replaceChildren();
  $("dialog-submit").hidden=Boolean(custom);$("dialog-cancel").textContent=custom?"Close panel":"Cancel";
  if(custom){
    c.append(el("h2","","Extension panel"));
    const frame=el("pre","terminal-frame",custom.join("\n"));frame.id="custom-frame";frame.tabIndex=0;frame.setAttribute("aria-label","Extension terminal panel; use arrow keys and Enter");
    const special={ArrowUp:"\x1b[A",ArrowDown:"\x1b[B",ArrowRight:"\x1b[C",ArrowLeft:"\x1b[D",Enter:"\r",Escape:"\x1b",Tab:"\t",Backspace:"\x7f",PageUp:"\x1b[5~",PageDown:"\x1b[6~",Home:"\x1b[H",End:"\x1b[F"};
    frame.addEventListener("keydown",e=>{
      let key=special[e.key]||(e.key.length===1?e.key:"");
      if(e.ctrlKey&&e.key.length===1)key=String.fromCharCode(e.key.toUpperCase().charCodeAt(0)-64);
      if(e.shiftKey&&e.key==="Tab")key="\x1b[Z";
      if(!key)return;e.preventDefault();void run(async()=>{await request("ui",{key},customSession);await loadState(customSession);});
    });
    c.append(frame,el("p","custom-hint","Focus this view, then use ↑ ↓, Enter and Escape. Other agents keep running."));
  }else{
    c.append(el("h2","",pending.title));
    if(pending.message)c.append(el("p","",pending.message));
    if(pending.method==="select"){const select=el("select");select.id="dialog-value";select.setAttribute("aria-label",pending.title);for(const option of pending.options)select.append(el("option","",option));c.append(select);}
    else if(pending.method==="input"||pending.method==="editor"){
      const input=el(pending.method==="editor"?"textarea":"input");input.id="dialog-value";input.value=pending.prefill||"";input.placeholder=pending.placeholder||"";input.setAttribute("aria-label",pending.title);c.append(input);
    }
  }
  $("extension-dialog").showModal();
  if(custom)$("custom-frame").focus();else $("dialog-value")?.focus();
}
async function replyDialog(cancel=false){
  await request("ui",{id:dialogId,cancel,value:cancel?undefined:($("dialog-value")?.value??true)},customSession);
  $("extension-dialog").close();dialogId="";await loadState(customSession);
}
$("login-form").addEventListener("submit",e=>{e.preventDefault();void run(async()=>{
  const submit=e.currentTarget.querySelector("button");submit.disabled=true;$("login-error").textContent="";
  try{const r=await api("/api/login",{name:$("name").value,token:$("token").value});$("token").value="";authenticated(r.name,r.role);}
  catch(e){$("login-error").textContent=t(e.message);$("token").select();}finally{submit.disabled=false;}
});});
$("search").addEventListener("input",renderProjects);
$("toggle-history").addEventListener("click",()=>{
  showSaved=!showSaved;localStorage.setItem("pi-nav-history",showSaved?"1":"0");renderProjects();
  if(showSaved&&!selected&&catalog.length)void switchSession(catalog[0].key);
});
$("composer").addEventListener("submit",e=>{e.preventDefault();void run(sendMessage);});
$("prompt").addEventListener("input",()=>{persistDraft();draft(selected).id=crypto.randomUUID();updateAvailability();});
$("prompt").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!$("send").disabled)void run(sendMessage);}});
$("prompt").addEventListener("paste",e=>{const files=[...e.clipboardData.files];if(files.length){e.preventDefault();void run(()=>attachFiles(files));}});
$("attach").addEventListener("click",()=>$("file-input").click());
$("file-input").addEventListener("change",e=>{const files=[...e.target.files];e.target.value="";void run(()=>attachFiles(files));});
$("composer-area").addEventListener("dragover",e=>{e.preventDefault();$("composer-area").classList.add("dragging");});
$("composer-area").addEventListener("dragleave",()=>$("composer-area").classList.remove("dragging"));
$("composer-area").addEventListener("drop",e=>{e.preventDefault();$("composer-area").classList.remove("dragging");void run(()=>attachFiles([...e.dataTransfer.files]));});
$("stop").addEventListener("click",()=>void run(async()=>{await request("abort",{});toast("Stop requested.");}));
$("toggle-inspector").addEventListener("click",()=>setInspector(!inspecting));
$("close-inspector").addEventListener("click",()=>setInspector(false));
$("show-sidebar").addEventListener("click",()=>$("sidebar").classList.add("open"));
$("close-sidebar").addEventListener("click",()=>$("sidebar").classList.remove("open"));
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>selectInspectorTab(b.dataset.tab)));
$("open-background").addEventListener("click",()=>{if(inspecting&&tab==="jobs")setInspector(false);else selectInspectorTab("jobs");});
$("inspector-body").addEventListener("keydown",e=>{
 if(tab!=="jobs"||!["ArrowDown","ArrowUp"].includes(e.key))return;
 const rows=[...$("inspector-body").querySelectorAll(".job-row")],i=rows.indexOf(document.activeElement);if(i<0)return;
 e.preventDefault();rows[(i+(e.key==="ArrowDown"?1:-1)+rows.length)%rows.length]?.focus();
});
$("invite").addEventListener("click",()=>void run(openAccess));
async function copy(text){try{await navigator.clipboard.writeText(text);toast(t("Invite link copied."));}catch{window.prompt("Copy this invite link",text);}}
async function renderAccess(){
  const body=$("access-body");body.replaceChildren(el("p","","Loading access…"));
  const data=await api("/api/access");body.replaceChildren();
  body.append(button("Copy main invite",async()=>{const r=await api("/api/invite");await copy(r.url);},"quiet"));
  const form=el("form","access-form"),roleSelect=el("select"),hours=el("select"),submit=el("button","primary","Create invite");
  roleSelect.id="invite-role";hours.id="invite-hours";submit.type="submit";
  for(const [v,label] of [["viewer","Viewer · read only"],["member","Member · full access"]]){const o=el("option","",label);o.value=v;roleSelect.append(o);}
  for(const [v,label] of [[1,"1 hour"],[24,"24 hours"],[168,"7 days"]]){const o=el("option","",label);o.value=String(v);o.selected=v===24;hours.append(o);}
  const roleLabel=el("label","","Role"),hoursLabel=el("label","","Expires after");roleLabel.htmlFor="invite-role";hoursLabel.htmlFor="invite-hours";
  form.append(roleLabel,roleSelect,hoursLabel,hours,submit);
  form.onsubmit=e=>{e.preventDefault();void run(async()=>{const r=await api("/api/access",{action:"create",role:roleSelect.value,hours:Number(hours.value)});await copy(r.url);await renderAccess();});};
  body.append(el("div","section-label","ACTIVE INVITES"));
  if(!data.invites.length)body.append(el("p","file-hint","No extra invites. Create one below."));
  for(const invite of data.invites){
    const row=el("div","access-row");row.dataset.inviteId=invite.id;
    row.append(el("span","",t(invite.role)+" · "+invite.createdBy),el("small","",t("Expires {s}").replace("{s}","")+new Date(invite.expires).toLocaleString()),
      button("Revoke",async()=>{await api("/api/access",{action:"revoke",id:invite.id});toast(t("Invite revoked."));await renderAccess();},"quiet"));
    body.append(row);
  }
  body.append(form,el("div","section-label","SIGNED-IN PEOPLE"));
  for(const m of data.members)body.append(el("div","access-row",m.name+" · "+t(m.role)));
  body.append(el("div","section-label","RECENT ACTIVITY"));
  const log=el("ol","audit-list");log.setAttribute("aria-label","Recent activity");
  for(const e of data.audit.slice(0,50))log.append(el("li","",new Date(e.at).toLocaleTimeString()+" · "+e.name+" ("+t(e.role)+") · "+e.action+" · "+e.status));
  if(!data.audit.length)body.append(el("p","file-hint","No recorded changes yet."));else body.append(log);
  body.append(el("p","file-hint","Invites and activity are kept in hub memory and cleared by /serve stop."));
}
async function openAccess(){if(readOnly())return;$("access-dialog").showModal();try{await renderAccess();}catch(e){$("access-body").replaceChildren(el("p","render-error",e.message));}}
$("access-close").addEventListener("click",()=>$("access-dialog").close());
$("help").addEventListener("click",()=>$("help-dialog").showModal());
$("tips-help").addEventListener("click",()=>$("help-dialog").showModal());
$("help-close").addEventListener("click",()=>$("help-dialog").close());
$("tips-done").addEventListener("click",()=>{localStorage.setItem("pi-tips-done","1");$("welcome-tips").hidden=true;});
$("locale").addEventListener("change",()=>setLocale($("locale").value));
$("skip-link").addEventListener("click",e=>{e.preventDefault();const target=$("conversation").hidden?$("welcome"):$("prompt");if(target===$("welcome"))target.tabIndex=-1;target.focus();});
$("logout").addEventListener("click",()=>void run(async()=>{await api("/api/logout",{});drafts.clear();state=undefined;join();}));
$("dialog-form").addEventListener("submit",e=>{e.preventDefault();void run(()=>replyDialog());});
$("dialog-cancel").addEventListener("click",()=>void run(()=>replyDialog(true)));
$("extension-dialog").addEventListener("cancel",e=>{e.preventDefault();void run(()=>replyDialog(true));});
document.addEventListener("keydown",e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();$("sidebar").classList.add("open");$("search").focus();}
  if(e.key==="Escape"&&!$("extension-dialog").open){setInspector(false);$("sidebar").classList.remove("open");}
});
$("projects").addEventListener("keydown",e=>{
  if(!["ArrowDown","ArrowUp"].includes(e.key))return;
  const rows=[...$("projects").querySelectorAll(".session:not(:disabled)")],i=rows.indexOf(document.activeElement);
  if(i<0)return;e.preventDefault();rows[(i+(e.key==="ArrowDown"?1:-1)+rows.length)%rows.length]?.focus();
});
let polling=false;
setInterval(()=>{
 if(selected&&!loading&&!$("workspace").hidden){
  if(!polling){polling=true;loadState().catch(e=>banner(e.message)).finally(()=>polling=false);}
  if(!jobsPolling){jobsPolling=true;refreshJobs().catch(e=>{if(inspecting&&tab==="jobs")$("inspector-body").replaceChildren(el("div","empty",e.message),button("Retry",()=>refreshJobs(true)));}).finally(()=>jobsPolling=false);}
 }
},1200);
const fragment=location.hash.slice(1);
if(fragment){$("token").value=fragment;history.replaceState(null,"",location.pathname);}
{const lang=detectLocale(localStorage.getItem("pi-locale"),navigator.language);$("locale").value=lang;setLocale(lang);}
void (async()=>{try{const result=await api("/api/state");authenticated(result.member,result.role);}catch{join();$("login-error").textContent="";}})();
