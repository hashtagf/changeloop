import { randomBytes } from "node:crypto";
import { stripVTControlCharacters } from "node:util";
import { problem } from "./workspace.ts";

// Mirror shared ExtensionUIContext methods. Terminal-originated interactions still use the TUI.
export function createExtensionUI(changed=()=>{}) {
  let ui, originals: any = {}, active=false, lease=0, component, finishCustom;
  const statuses=new Map<any, any>(),widgets=new Map<any, any>(),notices=[],pending=new Map<any, any>();
  let editorText="";
  const clean=value=>stripVTControlCharacters(String(value??"")).slice(0,20000);
  const request=(method,title,extra: any = {},opts: any = {})=>new Promise(resolve=>{
    const id=randomBytes(12).toString("hex");
    let timer;
    const finish=value=>{clearTimeout(timer);opts.signal?.removeEventListener("abort",cancel);pending.delete(id);resolve(value);changed();};
    const cancel=()=>finish(method==="confirm"?false:undefined);
    pending.set(id,{public:{id,method,title:clean(title),...extra},finish});
    if(opts.timeout)timer=setTimeout(cancel,opts.timeout);
    if(opts.signal?.aborted)cancel();else opts.signal?.addEventListener("abort",cancel,{once:true});
    changed();
  });
  const usingWeb=()=>active && Date.now()<lease;
  const terminal={columns:100,rows:28};
  const tui={terminal,requestRender:()=>changed(),start(){},stop(){},invalidate:()=>changed(),setFocus(c){if(component)component.focused=false;component=c;if(c)c.focused=true;changed();}};
  const render=()=>{if(!component)return null;try{return component.render(100).slice(0,100).map(clean);}catch{return ["This custom terminal component could not render. Open the command in Pi TUI."];}};
  const detach=()=>{
    if(ui)for(const[key,value]of Object.entries(originals))ui[key]=value;
    for(const item of pending.values())item.finish(undefined);
    finishCustom?.(undefined);component=undefined;ui=undefined;originals={};
  };
  return {
    attach(context) {
      if(ui===context.ui)return;
      detach();ui=context.ui;if(!ui)return;
      const wrap=(key,fn)=>{if(typeof ui[key]!=="function")return;originals[key]=ui[key];ui[key]=fn(originals[key].bind(ui));};
      wrap("notify",original=>(message,type)=>{notices.push({message:clean(message),type,at:Date.now()});if(notices.length>15)notices.shift();changed();return original(message,type);});
      wrap("setStatus",original=>(key,text)=>{text===undefined?statuses.delete(key):statuses.set(key,clean(text));changed();return original(key,text);});
      wrap("setWidget",original=>(key,value,options)=>{value===undefined?widgets.delete(key):widgets.set(key,Array.isArray(value)?value.map(clean):["Custom terminal widget: available in Pi TUI"]);changed();return original(key,value,options);});
      wrap("setEditorText",original=>text=>{editorText=String(text||"");changed();return original(text);});
      wrap("select",original=>(title,options,opts)=>usingWeb()?request("select",title,{options:options.map(clean)},opts):original(title,options,opts));
      wrap("confirm",original=>(title,message,opts)=>usingWeb()?request("confirm",title,{message:clean(message)},opts):original(title,message,opts));
      wrap("input",original=>(title,placeholder,opts)=>usingWeb()?request("input",title,{placeholder:clean(placeholder)},opts):original(title,placeholder,opts));
      wrap("editor",original=>(title,prefill)=>usingWeb()?request("editor",title,{prefill:String(prefill||"")}):original(title,prefill));
      wrap("custom",original=>(factory,options)=>{
        if(!usingWeb())return original(factory,options);
        if(component)throw problem(409,"A custom extension panel is already open.");
        return new Promise((resolve,reject)=>{
          const done=value=>{component=undefined;finishCustom=undefined;resolve(value);changed();};
          finishCustom=done;
          Promise.resolve().then(()=>factory(tui,ui.theme,{get:()=>undefined},done)).then(c=>{
            if(!finishCustom)return;
            component=c;if(c)c.focused=true;changed();
          }).catch(error=>{done(undefined);notices.push({type:"error",message:"This extension requires the Pi terminal: "+clean(error.message),at:Date.now()});changed();});
        });
      });
    },
    activate(){active=true;lease=Date.now()+30*60*1000;},
    deactivate(){active=false;},
    snapshot(){return {statuses:Object.fromEntries(statuses),widgets:Object.fromEntries(widgets),notices:[...notices],dialogs:[...pending.values()].map(p=>p.public),custom:render(),editorText};},
    reply({id,value,cancel,key}) {
      if(key!==undefined) {
        if(typeof key!=="string"||key.length>256||!component)throw problem(400,"No active custom panel.");
        component.handleInput?.(key);changed();return {ok:true};
      }
      if(id==="custom"&&cancel){finishCustom?.(undefined);return {ok:true};}
      const item=pending.get(id);if(!item)throw problem(409,"This dialog is no longer active.");
      const p=item.public;
      if(!cancel) {
        if(p.method==="select"&&!p.options.includes(value))throw problem(400,"Choose a listed option.");
        if(p.method==="confirm"&&typeof value!=="boolean")throw problem(400,"Choose confirm or cancel.");
        if(["input","editor"].includes(p.method)&&(typeof value!=="string"||value.length>100000))throw problem(400,"Invalid text.");
      }
      item.finish(cancel?(p.method==="confirm"?false:undefined):value);return {ok:true};
    },detach
  };
}
