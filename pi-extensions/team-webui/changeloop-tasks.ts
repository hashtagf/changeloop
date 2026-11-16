import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { problem } from './workspace.ts';

const ID=/^[a-z0-9](?:[a-z0-9-]{0,198}[a-z0-9])?$/;
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function read(project,path,optional=false) {
  const file=join(project,path);
  try {
    const root=realpathSync(project),actual=realpathSync(file),rel=relative(root,actual);
    if(rel==='..'||rel.startsWith('..'+sep))throw Error('Source leaves project');
    if(!statSync(actual).isFile()||statSync(actual).size>2*1024*1024)throw Error('Source is not a bounded regular file');
    return JSON.parse(readFileSync(actual,'utf8'));
  } catch(error) { if(optional&&error.code==='ENOENT')return null;throw problem(409,`Change Loop source unavailable: ${path}`); }
}
const text=(value,max=4000)=>typeof value==='string'?value.slice(0,max):'';
export function readChangeLoop(project,id,kind='change') {
  if(typeof id!=='string'||!ID.test(id)||!['change','investigation'].includes(kind))throw problem(400,'Invalid Change Loop ID or kind.');
  const sourcePath=`.foundation/${kind==='change'?'runtime':'investigations'}/${id}.json`;
  const state=read(project,sourcePath);
  if(state.id!==id || (kind==='investigation'&&state.kind!=='investigation'))throw problem(409,'Change Loop source identity mismatch.');
  let phase,boardStatus,nextStep,blocker='',deliveryStatus=null,prs=[];
  let lifecycleStatus=text(state.status,100),proofStatus=null;
  if(kind==='investigation') {
    phase='investigate';boardStatus='investigate';
    nextStep='Continue Investigate using the Change Loop resume route; create or link a change when the agreement is ready.';
  } else {
    const mapping={change:['change','change'],resolved:['change','change'],building:['build','build'],proven:['prove','prove'],landing:['prove','prove'],applied:['land','land'],archived:['land','land']};
    if(!mapping[lifecycleStatus])throw problem(409,`Unsupported Change Loop lifecycle: ${lifecycleStatus || 'missing'}`);
    [phase,boardStatus]=mapping[lifecycleStatus];
    nextStep={change:'Complete plan, design and implementation plan through Change.',build:'Continue Build in the Change Loop workspace, then run Prove.',prove:'Run the current proof checks and obtain explicit Land approval before applying.',land:lifecycleStatus==='archived'?'Land is archived. Deliver is separate and requires user authority; do not infer merge, tag or deployment.':'Continue the existing Land transaction through archive.'}[phase];
    const proof=read(project,`.foundation/receipts/${id}/proof.json`,true);
    if(proof && proof.changeId!==id)throw problem(409,'Change Loop proof identity mismatch.');
    proofStatus=proof?.status || null; // Reported evidence only: no claim of current workspace-hash validation.
    const delivery=read(project,`.foundation/deliveries/${id}/state.json`,true);
    const receipt=read(project,`.foundation/deliveries/${id}/receipt.json`,true);
    if((delivery&&delivery.changeId!==id)||(receipt&&receipt.changeId!==id))throw problem(409,'Change Loop delivery identity mismatch.');
    if(delivery && delivery.status!=='new') {
      phase='deliver';boardStatus='deliver';deliveryStatus=text(delivery.status,100);
      nextStep='Continue Deliver through its saved resume route. An opened PR is not a merge, tag or deployment.';
      if(delivery.lastError)blocker='Deliver reports an error; inspect the Change Loop delivery state before continuing.';
    }
    const rows=Array.isArray(receipt?.pullRequests)?receipt.pullRequests:(receipt?.pullRequest?[receipt.pullRequest]:[]);
    const verified=lifecycleStatus==='archived' && delivery?.status==='verified' && Boolean(receipt?.verifiedAt) && rows.length>0 &&
      rows.every(pr=>pr && /^https:\/\//.test(pr.url||'') && typeof pr.headCommit==='string' && /^[a-f0-9]{40,64}$/.test(pr.headCommit) && pr.state==='OPEN');
    if(verified) {
      phase='deliver';boardStatus='deliver';prs=rows.map(pr=>({url:text(pr.url,2000),headCommit:pr.headCommit,state:pr.state}));
      nextStep='PR recorded by Deliver. Check current PR state and obtain any required merge/release authority; do not infer merge, tag or deployment.';
    }
  }
  const title=text(state.intent || state.changeIntent || state.intake?.request || `${kind==='investigation'?'Investigate':'Change'}: ${id}`,240);
  const source={kind:'changeloop',recordKind:kind,sourceKey:`${kind}:${id}`,changeId:id,sourcePath,lifecycleStatus,phase,boardStatus,
    title,description:text(state.intent||state.changeIntent),nextStep,blocker,
    evidence:`Change Loop local record: ${sourcePath}\nReported lifecycle: ${lifecycleStatus}${prs.length?'\nRecorded PR: '+prs.map(p=>p.url).join(', '):''}\nSnapshot only; proof freshness and external state are not re-verified by the board.`,
    proofStatus,deliveryStatus,pullRequests:prs,sourceUpdatedAt:state.updatedAt||null,unavailable:false};
  return {...source,fingerprint:digest(source)};
}
export function createChangeLoopSync(store) {
  const cached=new Map<any, any>();
  function sync(project,{force=false}: any = {}) {
    project=resolve(project);
    const previous=cached.get(project);if(!force&&previous&&Date.now()-previous.at<5000)return previous.result;
    const warnings=[],sources=new Map<any, any>(),links=store.linked(project);
    for(const [kind,folder] of [['change','runtime'],['investigation','investigations']]) {
      try {
        const directory=join(project,'.foundation',folder),actual=realpathSync(directory),root=realpathSync(project);
        if(!actual.startsWith(root+sep))throw Error('Directory leaves project');
        for(const name of readdirSync(directory).filter(n=>n.endsWith('.json')&&ID.test(n.slice(0,-5))))sources.set(`${kind}:${name.slice(0,-5)}`,{kind,id:name.slice(0,-5)});
      } catch(error) { if(error.code!=='ENOENT')warnings.push(`Cannot inspect .foundation/${folder}; existing tasks are retained.`); }
    }
    for(const task of links)sources.set(task.workflow.sourceKey,{kind:task.workflow.recordKind,id:task.workflow.changeId});
    let changed=0;
    for(const [key,{kind,id}] of sources) {
      try {
        const source=readChangeLoop(project,id,kind);
        if(links.find(t=>t.workflow.sourceKey===key)?.workflow.fingerprint!==source.fingerprint && store.syncWorkflow(project,source).changed)changed++;
      }
      catch(error) {
        warnings.push(error.message);
        const old=links.find(t=>t.workflow.sourceKey===key);
        if(old) {
          const source={...old.workflow,unavailable:true,blocker:'Change Loop source is unavailable; last known phase retained. Inspect the source before continuing.'};
          delete source.observedAt;delete source.fingerprint;source.fingerprint=digest(source);
          if(store.syncWorkflow(project,source).changed)changed++;
        }
      }
    }
    const result={changed,sources:sources.size,warnings};cached.set(project,{at:Date.now(),result});return result;
  }
  return {sync,link(project,taskId,changeId,kind='change') {
    const result=store.syncWorkflow(project,readChangeLoop(project,changeId,kind),taskId);
    cached.delete(resolve(project));return result;
  }};
}
