import * as THREE from "/vendor/three.module.js";
import {cityRows,cityStatus,cityStatusLabel,cityDestination,cityAssignment,cityRoute,districts} from "/city-state.js";
import {buildCity,citizenBatch} from "/city-scene.js";
import {t} from "/i18n.js";

export function createCity(host,onOpen,loadAssignments=async()=>({assignments:[]})) {
  const $=id=>host.querySelector('#'+id),scene=new THREE.Scene();scene.background=new THREE.Color('#dce7df');
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const canvas=renderer.domElement;canvas.setAttribute('aria-label','64-agent workflow city; choose districts or agent names to focus');$('city-stage').prepend(canvas);
  scene.add(new THREE.HemisphereLight(0xffffff,0x71816a,1.8));const sun=new THREE.DirectionalLight(0xffedcf,2.2);sun.position.set(-20,40,15);scene.add(sun);
  const material=buildCity(scene),batch=citizenBatch(scene,material),camera=new THREE.PerspectiveCamera(42,1,.1,250),look=new THREE.Vector3(0,0,1);
  let angle=.28,distance=68,visible=false,connected=true,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,frame=0,last=0,lastDraw=0,clock=0;
  let catalog=[],selected='',focused='',assignments=[],assignmentError='',polling=false,pollTimer,lastFetch=0,rosterSignature='',projectSignature='';
  const citizens=new Map(),slots=new Map(),make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
  const legend=make('div','city-districts');legend.setAttribute('aria-label','Kanban districts');$('city-stage').before(legend);
  const note=make('p','city-data-note');legend.after(note);
  const districtButtons=new Map();
  for(const d of districts){const b=make('button','',d.name);b.type='button';b.title=t(d.description);b.dataset.district=d.id;b.onclick=()=>focusDistrict(d.id);legend.append(b);districtButtons.set(d.id,b);}
  function focusDistrict(id){const d=districts.find(d=>d.id===id);look.set(d?.x||0,0,d?.z??(id==='offline'?26:-23));distance=24;updateCamera();draw();}
  function focusAgent(key){focused=key;const c=citizens.get(key);if(c){look.set(c.x,0,c.z);distance=20;}refresh();updateCamera();draw();}
  function refresh(){
    if(!visible)return;
    const projects=[...new Map(catalog.map(r=>[r.projectRoot||r.project,r.project])).entries()].sort((a,b)=>String(a[1]).localeCompare(String(b[1]))),ps=JSON.stringify(projects);
    if(ps!==projectSignature){projectSignature=ps;const value=$('city-project').value;$('city-project').replaceChildren(new Option(t('All projects'),''),...projects.map(([k,n])=>new Option(n,k)));if(projects.some(([k])=>k===value))$('city-project').value=value;}
    const rows=cityRows(catalog,$('city-project').value,$('city-search').value,$('city-saved').checked),shown=rows.slice(0,64),keys=new Set(shown.map(r=>r.key));
    for(const [key]of citizens)if(!keys.has(key)){citizens.delete(key);slots.delete(key);}
    for(const row of shown){
      if(!slots.has(row.key)){let i=0;const used=new Set(slots.values());while(used.has(i))i++;slots.set(row.key,i);}
      const slot=slots.get(row.key),assignment=cityAssignment(row,assignments),home=cityDestination(assignment.district,slot);let c=citizens.get(row.key);
      if(!c){c={key:row.key,slot,x:home.x,z:home.z,yaw:Math.PI,path:[],nextWander:clock+1+(slot%7)*.3,assignment,home};citizens.set(row.key,c);}
      if(c.assignment.district!==assignment.district){
        if(paused){c.x=home.x;c.z=home.z;c.path=[];}else c.path=cityRoute({x:c.x,z:c.z},home);
        c.nextWander=clock+8;
      }
      c.assignment=assignment;c.home=home;c.online=row.online;c.busy=row.busy;
      if(!row.online){c.x=home.x;c.z=home.z;c.path=[];c.moving=false;}
    }
    const counts={working:0,idle:0,offline:0};rows.forEach(r=>counts[cityStatus(r)]++);for(const key of Object.keys(counts))$('city-'+key).textContent=counts[key];
    $('city-empty').hidden=rows.length>0;$('city-total').textContent=rows.length>64?`Showing 64 of ${rows.length} · filter by project to see more`:`${shown.length} / 64 agents`;
    $('city-summary').textContent=t(`${rows.length} agents · 10 districts · choose a district or person to focus`);
    for(const d of districts){const count=shown.filter(r=>cityAssignment(r,assignments).district===d.id).length;districtButtons.get(d.id).textContent=d.name+' · '+count;}
    note.textContent=assignmentError||t('Real status from sessions + Kanban · latest active task assigned to each agent · poses and walking are illustrative');
    const signature=JSON.stringify(rows.map(r=>{const a=cityAssignment(r,assignments);return[r.key,r.sessionName,cityStatus(r),a.district,a.task?.id,a.task?.title,a.blocked,r.key===focused];}));
    if(signature!==rosterSignature){rosterSignature=signature;const focusKey=document.activeElement?.dataset.cityKey;
      $('city-roster').replaceChildren(...rows.map(row=>{const a=cityAssignment(row,assignments),d=districts.find(d=>d.id===a.district),b=make('button','city-person'+(row.key===focused?' selected':''));b.type='button';b.dataset.cityKey=row.key;b.setAttribute('aria-pressed',String(row.key===focused));b.title=a.task?.title||t(cityStatusLabel[cityStatus(row)]);b.append(make('span','city-person-dot '+cityStatus(row)),make('span','',row.sessionName||'Untitled session'),make('small','',d?.name|| (a.district==='offline'?'Station':'Park')));b.onclick=()=>focusAgent(row.key);return b;}));
      if(focusKey)[...$('city-roster').children].find(b=>b.dataset.cityKey===focusKey)?.focus({preventScroll:true});
    }
    const row=catalog.find(r=>r.key===focused);$('city-detail').hidden=!row;
    if(row){const a=cityAssignment(row,assignments),d=districts.find(d=>d.id===a.district);$('city-agent-name').textContent=row.sessionName||'Untitled session';$('city-agent-meta').textContent=[row.project,t(cityStatusLabel[cityStatus(row)]),t(d?.description||'Resting / waiting to connect'),a.task?'Kanban: '+a.task.title:t(row.busy?'General work · no assigned task':'No assigned task'),a.blocked?t('Blocked: ')+a.task.blocker:''].filter(Boolean).join(' · ');}
    batch.pose([...citizens.values()],clock,false,focused||selected);draw();
  }
  function updateCamera(){camera.position.set(look.x+Math.sin(angle)*distance,distance*.86,look.z+Math.cos(angle)*distance);camera.lookAt(look);}
  function resize(){const w=$('city-stage').clientWidth,h=$('city-stage').clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);updateCamera();draw();}
  function draw(){if(visible&&!document.hidden){renderer.render(scene,camera);canvas.dataset.agents=String(citizens.size);canvas.dataset.drawCalls=String(renderer.info.render.calls);}}
  function tick(time){frame=0;if(!visible||document.hidden||paused||!connected)return;
    // Cap animation at 30fps (20fps on mobile); static geometry and people are instanced.
    if(time-lastDraw<(innerWidth<700?50:33)){frame=requestAnimationFrame(tick);return;}lastDraw=time;
    const dt=Math.min((time-last)/1000,.1);last=time;clock+=dt;
    for(const c of citizens.values()){
      if(!c.online){c.moving=false;continue;}
      if(!c.path.length&&clock>=c.nextWander&&!c.assignment.blocked){
        const phase=Math.floor(clock/3)+c.slot*2.399,range=c.busy?.45:1.1;
        c.path=[{x:c.home.x+Math.sin(phase)*range,z:c.home.z+Math.cos(phase)*range}];c.nextWander=clock+(c.busy?6:2)+(c.slot%5)*.3;
      }
      const target=c.path[0];c.moving=Boolean(target);
      if(target){const dx=target.x-c.x,dz=target.z-c.z,len=Math.hypot(dx,dz),step=Math.min(len,dt*(c.busy?3.1:2.1));if(len<.035){c.path.shift();c.moving=false;}else{c.x+=dx/len*step;c.z+=dz/len*step;c.yaw=Math.atan2(dx,dz);}}
      else c.yaw=Math.PI+Math.sin(clock*.7+c.slot)*.12;
    }
    batch.pose([...citizens.values()],clock,true,focused||selected);draw();canvas.dataset.motion=clock.toFixed(2);frame=requestAnimationFrame(tick);
  }
  async function fetchTasks(){if(polling||!visible||document.hidden||!connected)return;polling=true;try{const result=await loadAssignments();assignments=result.assignments||[];assignmentError='';if(!lastFetch)citizens.clear();lastFetch=Date.now();refresh();}catch{assignmentError='Kanban could not load · showing last known data without guessing task status';refresh();}finally{polling=false;}}
  function start(){cancelAnimationFrame(frame);clearInterval(pollTimer);last=performance.now();if(visible&&!document.hidden){if(!paused&&connected)frame=requestAnimationFrame(tick);if(Date.now()-lastFetch>4000)void fetchTasks();pollTimer=setInterval(()=>void fetchTasks(),5000);}}
  new ResizeObserver(resize).observe($('city-stage'));document.addEventListener('visibilitychange',start);
  for(const id of ['city-project','city-search','city-saved'])$(id).addEventListener(id==='city-search'?'input':'change',refresh);
  $('city-open-chat').onclick=()=>{if(focused)onOpen(focused);};
  function syncPause(){$('city-pause').textContent=t(paused?'Play motion':'Pause motion');$('city-pause').setAttribute('aria-pressed',String(paused));}
  $('city-pause').onclick=()=>{paused=!paused;syncPause();start();};syncPause();
  for(const [id,action]of [['city-left',()=>angle-=.25],['city-right',()=>angle+=.25],['city-zoom-in',()=>distance=Math.max(12,distance-7)],['city-zoom-out',()=>distance=Math.min(120,distance+7)],['city-reset',()=>{angle=.28;distance=innerWidth<700?106:68;look.set(0,0,1);} ]])$(id).onclick=()=>{action();updateCamera();draw();};
  const raycaster=new THREE.Raycaster();let pointer;
  canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,angle};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(pointer){angle=pointer.angle-(e.clientX-pointer.x)*.007;updateCamera();draw();}});
  canvas.addEventListener('pointercancel',()=>pointer=undefined);
  canvas.addEventListener('pointerup',e=>{if(!pointer)return;const moved=Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y);pointer=undefined;if(moved>6)return;const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=raycaster.intersectObjects(batch.meshes)[0];if(hit)focusAgent(batch.key(hit.instanceId));});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;start();$('city-error').hidden=false;$('city-error').textContent='3D stopped · use the agent list or return to Chat and refresh';});
  if(innerWidth<700)distance=106;
  return {update(rows,key){catalog=rows;selected=key;refresh();},setConnected(value){if(connected===value)return;connected=value;$('city-live').textContent=t(value?'LIVE · real status':'Disconnected · last known data');start();},setVisible(value){if(visible===value)return;visible=value;refresh();resize();start();}};
}
