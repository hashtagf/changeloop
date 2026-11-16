import * as THREE from '/vendor/three.module.js';
import {districts} from '/city-state.js';

export function buildCity(scene) {
  const materials=new Map(),groups=new Map(),geometry=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
  const material=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.8}));return materials.get(color);};
  const box=(w,h,d,x,y,z,color)=>{if(!groups.has(color))groups.set(color,[]);groups.get(color).push({w,h,d,x,y,z});};
  box(64,.6,61,0,-.5,1,'#8caaa0');box(63.5,.12,60.5,0,-.13,1,'#c9d7b9');
  for(const z of [-19,-1,17,22]){box(63,.05,1.8,0,0,z,'#647c7b');for(let x=-30;x<31;x+=3)box(1,.02,.08,x,.05,z,'#dfdfbb');}
  for(const x of [-30,-18,-6,6,18,30])box(1.5,.06,59,x,.01,1,'#718584');
  for(const d of districts){
    box(10.3,.12,13,d.x,.06,d.z-1.6,'#e2deca');
    box(8.7,.1,7,d.x,.15,d.z+2.7,'#d4d9c6');
    box(7.7,2.6,3.4,d.x,1.4,d.z-4.1,d.color);box(8.1,.2,3.8,d.x,2.8,d.z-4.1,'#faf3d9');
    box(1.1,1.7,.1,d.x,.9,d.z-2.35,'#365e60');
    for(const x of [-2.7,-1.6,1.6,2.7])box(.7,.9,.08,d.x+x,1.65,d.z-2.35,'#c9e8d7');
    box(6.2,.42,.1,d.x,2.42,d.z-2.32,'#345854');
    // Visible equipment distinguishes each work district.
    for(const x of [-3,3]){
      box(1.4,.12,.8,d.x+x,.85,d.z-1,d.color);box(.15,.8,.15,d.x+x,.4,d.z-1,'#61786b');
      if(['build','verify','deployed'].includes(d.id)){box(.85,.65,.12,d.x+x,1.28,d.z-1.2,'#38585f');box(.7,.45,.03,d.x+x,1.3,d.z-1.12,'#91d5bb');}
      else if(['plan','design','review'].includes(d.id)){box(1.1,1.15,.12,d.x+x,1.6,d.z-1.2,'#f5efd5');box(.7,.08,.04,d.x+x,1.8,d.z-1.1,d.color);}
      else {box(.65,.55,.6,d.x+x,1.2,d.z-1,'#bc9369');}
    }
    // Low greenery keeps the working forecourts visible.
    for(const x of [-5,5]){box(.2,1,.2,d.x+x,.5,d.z-5.6,'#89705a');box(1.1,1.2,1.1,d.x+x,1.4,d.z-5.6,'#829f72');}
  }
  for(const z of [-25,26]){box(10,.15,7,0,.1,z+2,'#dfd9c3');for(const x of [-5,5]){box(1.8,.18,.5,x,.5,z+2,'#a48259');box(.15,.5,.4,x,.25,z+2,'#6a806c');}}
  box(4,1.7,2,-9,.9,-24,'#b7c49b');box(4.5,.2,2.6,-9,1.9,-24,'#f3e5b8');
  box(9,.2,2,0,2.2,25,'#729894');for(const x of [-4,4])box(.15,2.1,.15,x,1.1,25,'#486d67');
  for(const [color,items] of groups){const mesh=new THREE.InstancedMesh(geometry,material(color),items.length);items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.rotation.set(0,0,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.receiveShadow=true;scene.add(mesh);}
  // Labels are textures, not one DOM update per agent per frame.
  const labels=[...districts.map(d=>({...d,label:d.name})),{x:0,z:-26,label:'PARK / READY',color:'#668b76'},{x:0,z:25,label:'STATION / OFFLINE',color:'#889397'}];
  for(const d of labels){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#f6f3df';ctx.fillRect(0,0,512,96);ctx.fillStyle='#2f514c';ctx.textAlign='center';ctx.font='bold 42px sans-serif';ctx.fillText(d.label,256,64);const map=new THREE.CanvasTexture(canvas),sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,depthTest:false}));sprite.position.set(d.x,3.7,d.z-4);sprite.scale.set(7,1.3,1);scene.add(sprite);}
  return material;
}

export function citizenBatch(scene,material) {
  const parts={},box=new THREE.BoxGeometry(1,1,1),head=new THREE.IcosahedronGeometry(1,1),root=new THREE.Object3D(),local=new THREE.Object3D(),matrix=new THREE.Matrix4();
  for(const name of ['body','head','hair','leftArm','rightArm','leftLeg','rightLeg','prop']){
    const mesh=new THREE.InstancedMesh(['head','hair'].includes(name)?head:box,material(name==='head'?'#e6bb95':name==='hair'?'#493f39':name.includes('Leg')?'#35535c':name==='prop'?'#e9ddb8':'#ffffff'),64);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;scene.add(mesh);parts[name]=mesh;
  }
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.53,.055,6,24),material('#efb457'));ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
  let keys=[];
  function pose(list,time,motion,focused){
    keys=list.map(c=>c.key);for(const mesh of Object.values(parts))mesh.count=list.length;
    ring.visible=false;
    list.forEach((c,i)=>{
      const walk=motion&&c.moving,work=motion&&c.online&&c.busy&&!c.assignment.blocked,t=time*2.8+c.slot*1.7;
      const swing=walk?Math.sin(t*3)*.75:0,breathe=motion&&c.online?Math.sin(t)*.018:0;
      root.position.set(c.x,.18+(walk?Math.abs(Math.sin(t*3))*.055:breathe),c.z);root.rotation.set(0,c.yaw,0);root.scale.setScalar(.8);root.updateMatrix();
      const activity=c.assignment.pose;
      const arm=work?activity==='point'?.8+Math.sin(t)*.4:activity==='pack'||activity==='assemble'?.55+Math.sin(t*2)*.45:activity==='read'?.5+Math.sin(t*.5)*.05:activity==='handoff'?.7+Math.sin(t)*.5:.6+Math.sin(t*4)*.2:motion&&c.online?.1+Math.sin(t)*.08:0;
      const scan=work&&['monitor','inspect'].includes(activity)?Math.sin(t*.6)*.55:0;
      const set=(name,x,y,z,sx,sy,sz,rx=0,rz=0,ry=0)=>{local.position.set(x,y,z);local.rotation.set(rx,ry,rz);local.scale.set(sx,sy,sz);local.updateMatrix();matrix.multiplyMatrices(root.matrix,local.matrix);parts[name].setMatrixAt(i,matrix);};
      set('body',0,.85,0,.45,.6,.32);set('head',0,1.35,0,.23,.23,.23,activity==='read'?.12:0,0,scan);set('hair',0,1.47,-.04,.24,.17,.24,0,0,scan);
      set('leftLeg',-.13,.31,0,.16,.5,.18,swing);set('rightLeg',.13,.31,0,.16,.5,.18,-swing);
      set('leftArm',-.3,.85,work?.13:0,.14,.5,.15,walk?-swing:-arm,work&&c.assignment.pose==='draw'?-.25:0);
      set('rightArm',.3,.85,work?.13:0,.14,.5,.15,walk?swing:-arm-(work?Math.sin(t)*.12:0));
      set('prop',0,.88,.34,work?.43:.01,work?.09:.01,work?.3:.01,work?.2:0);
      const color=new THREE.Color(!c.online?'#8c9595':c.assignment.blocked?'#c86158':c.busy?(districts.find(d=>d.id===c.assignment.district)?.color||'#c58759'):'#3e8076');
      for(const name of ['body','leftArm','rightArm'])parts[name].setColorAt(i,color);
      if(c.key===focused){ring.visible=true;ring.position.set(c.x,.16,c.z);}
    });
    for(const mesh of Object.values(parts)){mesh.instanceMatrix.needsUpdate=true;mesh.boundingSphere=null;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
  }
  return {pose,meshes:Object.values(parts),key:instanceId=>keys[instanceId]};
}
