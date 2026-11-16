import { promises as fs } from 'node:fs';
import { savedState } from './history.ts';

const legacy = new Set<any>();
const cache = new Map<any, any>();
async function summaries(row) {
  if (!row.sessionFile) return {activity:[],stamp:''};
  const stat = await fs.stat(row.sessionFile);
  const stamp = `${stat.mtimeMs}:${stat.size}`;
  const old = cache.get(row.sessionFile);
  if (old?.stamp === stamp) return old;
  const value = {stamp,activity:(await savedState(row,true)).entries};
  cache.set(row.sessionFile,value);
  while(cache.size>64)cache.delete(cache.keys().next().value);
  return value;
}
// Old, already-running Pi bridges cannot gain new event hooks from a browser refresh.
// Read persisted activity without injecting prompts or restarting their work.
export async function legacyState(row,since,request) {
  const state = await request(row,'state');
  if(Array.isArray(state.activity)) {
    legacy.delete(row.key);
    return String(state.revision)===since?{unchanged:true}:state;
  }
  legacy.add(row.key);
  try {
    const data=await summaries(row);
    const revision=`${state.revision}:log:${data.stamp}`;
    if(revision===since)return {unchanged:true};
    return {...state,revision,activity:data.activity,activitySource:'session-log'};
  } catch {
    return {...state,activity:[],activitySource:'session-log',notice:[state.notice,'Tool history is temporarily unavailable.'].filter(Boolean).join(' ')};
  }
}
export async function legacyActivity(row,id,request) {
  if(!legacy.has(row.key)) {
    try{return await request(row,'activity?id='+encodeURIComponent(id||''));}
    catch(error){if(error.status!==404)throw error;}
  }
  return savedState(row,true,id);
}
