const LIMIT=32768;
export const contentText=value=>typeof value==='string'?value:(Array.isArray(value)?value.filter(p=>p.type==='text').map(p=>p.text).join('\n'):'');
export function safeArgs(value) {
  return JSON.stringify(value, (key,item)=>/^(?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|password|secret|authorization|private[_-]?key)$/i.test(key)?'[redacted]':item)?.slice(0,LIMIT)||'';
}
export function callKind(name,args: any = {}) {
  if(/mcp/i.test(name))return 'mcp';
  if(/(?:^|[/\\])SKILL\.md$/i.test(args?.path||args?.file_path||'') || /^skill(?:_|:|$)/i.test(name))return 'skill';
  if(['bash','shell','exec_command','bashExecution'].includes(name))return 'shell';
  return 'tool';
}
export function resultView(result: any = {}) {
  const text=String(result.output??contentText(result.content));
  const images=(Array.isArray(result.content)?result.content:[]).filter(p=>p.type==='image'&&/^image\/(png|jpeg|gif|webp)$/.test(p.mimeType)&&typeof p.data==='string'&&p.data.length<=7000000).slice(0,4).map(p=>({mimeType:p.mimeType,data:p.data}));
  return {text:text.slice(-LIMIT),truncated:text.length>LIMIT,...(images.length?{images}:{}),error:Boolean(result.isError||result.exitCode)};
}
export const activitySummary=entry=>{const {id,name,kind,status,timestamp,finishedAt,updatedAt,error,parentToolCallId,durationMs}=entry;return {id,name,kind,status,timestamp,finishedAt,updatedAt,error,parentToolCallId,durationMs};};
export function projectActivity(entries) {
  const calls=new Map<any, any>();
  for(const entry of entries){
    if(entry.type!=='message')continue;
    const m=entry.message;
    if(m?.role==='assistant')for(const part of Array.isArray(m.content)?m.content:[]){
      if(part.type==='toolCall'&&part.id&&part.name)calls.set(part.id,{id:part.id,name:part.name,kind:callKind(part.name,part.arguments),args:safeArgs(part.arguments),status:'recorded',timestamp:m.timestamp,text:''});
    }
    if(m?.role==='toolResult'){
      const id=m.toolCallId||entry.id,old=calls.get(id);
      calls.set(id,{...old,id,name:old?.name||m.toolName||'tool',kind:old?.kind||callKind(m.toolName||''),timestamp:old?.timestamp||m.timestamp,finishedAt:m.timestamp,status:m.isError?'error':'completed',...resultView(m)});
    }
    if(m?.role==='bashExecution')calls.set(entry.id,{id:entry.id,name:'bash',kind:'shell',args:safeArgs({command:m.command}),status:m.cancelled?'cancelled':m.exitCode?'error':'completed',timestamp:m.timestamp,...resultView(m)});
    while(calls.size>100)calls.delete(calls.keys().next().value);
  }
  return [...calls.values()];
}
