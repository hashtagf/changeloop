import { basename } from "node:path";
import { createExtensionUI } from "./extension-ui.ts";
import { problem } from "./workspace.ts";
import {projectActivity,activitySummary,callKind,safeArgs,resultView} from './activity.ts';

const TEAM = /^\[Team Web UI: (.+); request ([a-zA-Z0-9_-]{8,80})\]\n\n/;
export function messageText(message) {
  if (typeof message.content === "string") return message.content;
  return (message.content || []).filter((part) => part.type === "text").map((part) => part.text).join("\n");
}
export function projectMessage(message, id) {
  if (!["user", "assistant"].includes(message?.role)) return null;
  let text = messageText(message), author = message.role === "assistant" ? "Pi" : "Terminal", requestId, files;
  const match = message.role === "user" && text.match(TEAM);
  if (match) { author = match[1]; requestId = match[2]; text = text.slice(match[0].length); }
  const attached = match && text.match(/\n\n\[Pi attached files\]\n([\s\S]*)\n\[\/Pi attached files\]$/);
  if(attached) {
    try { files=JSON.parse(attached[1]).map(({id,name,size})=>({id,name,size}));text=text.slice(0,attached.index); } catch {}
  }
  const images = (Array.isArray(message.content) ? message.content : []).filter(p => p.type === 'image' && /^image\/(png|jpeg|gif|webp)$/.test(p.mimeType) && typeof p.data === 'string' && p.data.length <= 28000000)
    .map(p => ({ mimeType: p.mimeType, data: p.data }));
  const thinking=Array.isArray(message.content)&&message.content.some(p=>p.type==='thinking');
  if (!text.trim() && !images.length && !files?.length && !thinking) return null;
  return { id, role: message.role, author, requestId, text: text.slice(0, 32768),
    ...(images.length ? { images } : {}), ...(files?.length ? {files} : {}), ...(thinking?{thinking:true}:{}), truncated: text.length > 32768, timestamp: message.timestamp || Date.now(), streaming: false };
}
export function createBridge(pi) {
  let ctx, busy = false, notice = "", publish = () => {};
  let sequence = 0, revision = Date.now();
  const announce = () => { revision++; publish(); };
  const messages = new Map<any, any>(), keys = new Map<any, any>(), queued = new Map<any, any>(), tools = new Map<any, any>();
  const receipts = new Map<any, any>();
  const activity=new Map<any, any>();
  const recordCall=entry=>{
    activity.set(entry.id,{...entry,updatedAt:Date.now()});
    let bytes=[...activity.values()].reduce((n,c)=>n+(c.args?.length||0)+(c.text?.length||0)+(c.images||[]).reduce((a,i)=>a+i.data.length,0),0);
    while(activity.size>1&&(activity.size>100||bytes>16*1024*1024)){
      const id=activity.keys().next().value,c=activity.get(id);bytes-=(c.args?.length||0)+(c.text?.length||0)+(c.images||[]).reduce((a,i)=>a+i.data.length,0);activity.delete(id);
    }
  };
  const extensionUI = createExtensionUI(announce);
  const key = (message) => `${message.role}:${message.timestamp}`;
  const trim = () => {
    while (messages.size > 120) messages.delete(messages.keys().next().value);
    for (const [k, id] of keys) if (!messages.has(id)) keys.delete(k);
  };
  const add = (message, streaming = false) => {
    const k = key(message), id = keys.get(k) || `live-${++sequence}`;
    const projected = projectMessage(message, id);
    if (projected) { keys.set(k, id); messages.set(id, { ...projected, streaming }); }
    const match = message.role === "user" && messageText(message).match(TEAM);
    if (match) queued.delete(match[2]);
    trim();
    announce();
  };
  return {
    attach(context) {
      ctx = context; busy = !ctx.isIdle(); messages.clear(); keys.clear(); tools.clear(); queued.clear(); notice = "";
      extensionUI.attach(ctx);
      activity.clear();for(const call of projectActivity(ctx.sessionManager.getBranch()))recordCall(call);
      for (const entry of ctx.sessionManager.getBranch()) {
        if (entry.type !== "message") continue;
        const projected = projectMessage(entry.message, entry.id);
        if (projected) { messages.set(entry.id, projected); keys.set(key(entry.message), entry.id); }
      }
      trim();
    },
    onPublish(callback) { publish = callback; },
    snapshot() {
      const selected = [];
      let budget = 131072;
      for (const message of [...messages.values()].reverse()) {
        if (budget < message.text.length) break;
        selected.unshift(message); budget -= message.text.length;
        if (selected.length >= 120) break;
      }
      return { revision, roomId: ctx?.sessionManager.getSessionId() || "", project: ctx ? basename(ctx.cwd) : "Pi",
        cwd: ctx?.cwd, sessionFile: ctx?.sessionManager.getSessionFile?.(),
        commands: (pi.getCommands?.() || []).map(({name,description,source}) => ({name,description,source})),
        availableTools: (pi.getAllTools?.() || []).map(({name,description}) => ({name,description})),
        extensionUI: extensionUI.snapshot(),
        sessionName: ctx?.sessionManager.getSessionName?.() || "",
        model: ctx?.model?.name || ctx?.model?.id || "Not selected", provider: ctx?.model?.provider || "",
        busy, queued: [...queued.values()], tools: [...tools.values()], activity:[...activity.values()].map(activitySummary), messages: selected, notice };
    },
    async send({ id, name, text, attachments = [], deliverAs = 'followUp' }) {
      if (!ctx) throw new Error("Pi session is unavailable");
      const digest = JSON.stringify({name,text,attachments:attachments.map(a=>a.id),deliverAs});
      if (receipts.has(id)) { if(receipts.get(id)!==digest) throw problem(409,'Message ID was already used.'); return; }
      if(queued.size>=8) throw problem(429,'The session queue is full.');
      extensionUI.activate();
      queued.set(id, { id, name }); announce();
      try {
        const files = attachments.filter(a => !a.mimeType.startsWith('image/')).map(({id,name,path,size,mimeType,text,truncated,extraction})=>({id,name,path,size,mimeType,text,truncated,extraction}));
        const prompt = `[Team Web UI: ${name}; request ${id}]\n\n${text}${files.length ? '\n\n[Pi attached files]\n' + JSON.stringify(files) + '\n[/Pi attached files]' : ''}`;
        const images = attachments.filter(a => a.mimeType.startsWith('image/')).map(a => ({type:'image',data:a.data,mimeType:a.mimeType}));
        pi.sendUserMessage(images.length ? [{type:'text',text:prompt},...images] : prompt, { deliverAs });
        receipts.set(id,digest); while(receipts.size>2048)receipts.delete(receipts.keys().next().value);
      } catch (error) { queued.delete(id); announce(); throw error; }
    },
    async command({text}) {
      if(typeof text !== 'string' || text.length > 16000 || !text.startsWith('/')) throw problem(400,'Enter a slash command.');
      const name = text.slice(1).split(/\s/)[0];
      if(!(pi.getCommands?.() || []).some(c=>c.name===name))throw problem(400,'This command is not registered in this session.');
      extensionUI.activate();
      pi.sendUserMessage(text,{expandPromptTemplates:true,deliverAs:'steer'});
      recordCall({id:'command-'+(++sequence),name:'/'+name,kind:(pi.getCommands?.()||[]).find(c=>c.name===name)?.source==='skill'?'skill':'command',status:'dispatched',args:safeArgs({text}),text:'Command dispatched to Pi; completion is not inferred.',timestamp:Date.now()});announce();
      return {ok:true};
    },
    reply(body) { return extensionUI.reply(body); },
    activity(id) {
      return {entries:id?[activity.get(id)].filter(Boolean):[...activity.values()].map(activitySummary)};
    },
    input(event) {
      if(event.source === 'interactive')extensionUI.deactivate();
      const match=typeof event.text === 'string' && event.text.match(TEAM);
      if(match && queued.delete(match[2]))announce();
    },
    detach() { extensionUI.detach(); },
    async abort(name) {
      if (!ctx) throw new Error("Pi session is unavailable");
      notice = `${name} requested a stop. The Pi terminal remains in control of pending work.`;
      await ctx.abort(); announce();
    },
    event(type, event, context) {
      ctx = context;
      if (type === "agent_start") { busy = true; notice = ""; }
      if (type === "agent_settled") { busy = false; tools.clear();for(const call of activity.values())if(call.status==='running')call.status='interrupted'; }
      if (type === "message_start" || type === "message_end" || type === "message_update")
        add(event.message, type === "message_update" || (type === "message_start" && event.message.role === "assistant"));
      if (type === "message_end" && event.message.role === "assistant" && event.message.stopReason === "error")
        notice = "Pi could not finish this response. Check the Pi terminal for the provider or tool error.";
      if(type==='message_end' && ['toolResult','bashExecution'].includes(event.message?.role))for(const call of projectActivity([{type:'message',id:event.message.toolCallId||'shell-'+(++sequence),message:event.message}])){
        const old=activity.get(call.id);recordCall({...old,...call,kind:old?.kind||call.kind,args:old?.args||call.args,timestamp:old?.timestamp||call.timestamp});
      }
      if (type === "tool_execution_start") {
        tools.set(event.toolCallId, { id: event.toolCallId, name: event.toolName });
        recordCall({id:event.toolCallId,name:event.toolName,kind:callKind(event.toolName,event.args),status:'running',args:safeArgs(event.args),text:'',timestamp:Date.now(),parentToolCallId:event.parentToolCallId});
      }
      if(type==='tool_execution_update'){
        const call=activity.get(event.toolCallId);if(call)recordCall({...call,...resultView(event.partialResult),status:'running'});
      }
      if (type === "tool_execution_end") {
        tools.delete(event.toolCallId);const call=activity.get(event.toolCallId);
        if(call)recordCall({...call,...resultView({...event.result,isError:event.isError||event.result?.isError}),status:event.isError||event.result?.isError?'error':'completed',finishedAt:Date.now(),durationMs:event.durationMs});
      }
      announce();
    },
  };
}
