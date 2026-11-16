import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createBridge } from "./bridge.ts";
import { registerSession, readJSON, dataDir } from "./registry.ts";
import { ensureHub, stopHub } from "./hub.ts";
import { join } from "node:path";
import { installToolGuide } from './tool-guide.ts';
import { installTaskBoard } from './task-extension.ts';

export default function teamWebUI(pi: ExtensionAPI) {
  installTaskBoard(pi);
  installToolGuide(pi);
  const bridge = createBridge(pi);
  let releaseLocalUI = () => {};
  let registration: Awaited<ReturnType<typeof registerSession>> | undefined;
  let port = 4318;
  pi.registerFlag("serve", { description: "Open the shared Pi workspace hub", type: "boolean", default: false });
  pi.registerFlag("serve-lan", { description: "Allow access from LAN / VPN", type: "boolean", default: false });
  pi.registerFlag("serve-port", { description: "Shared hub port (default 4318)", type: "string", default: "4318" });
  const show = (ctx: ExtensionContext, info: any) => {
    ctx.ui.setStatus("pi-team-webui", "Web · :" + info.port);
    ctx.ui.notify("Pi Workspace · all connected sessions\n" + info.inviteUrls.join("\n") + "\nInvite links grant access to projects, files and Git.", "info");
  };
  const start = async(ctx: ExtensionContext,lan: boolean,value: string) => {
    if(!/^\d+$/.test(value) || Number(value)<1 || Number(value)>65535)throw new Error("Choose a port from 1 to 65535.");
    port=Number(value);
    const info=await ensureHub({port,host:lan?"0.0.0.0":"127.0.0.1"});port=info.port;show(ctx,info);
  };
  pi.registerCommand("serve", {
    description: "Shared workspace: /serve [--lan] [--port 4318], status, stop",
    handler: async(args,ctx) => {
      try {
        if(args.trim()==="stop"){await stopHub(port);ctx.ui.setStatus("pi-team-webui",undefined);ctx.ui.notify("Web hub stopped. Pi sessions keep running.","info");return;}
        if(args.trim()==="status"){const info=await readJSON(join(dataDir,"hub-"+port+".json"));if(info)show(ctx,info);else ctx.ui.notify("Web hub is stopped. Use /serve.","info");return;}
        const words=args.trim().split(/\s+/).filter(Boolean);
        let lan=false,value="4318";
        for(let i=0;i<words.length;i++){
          if(words[i]==="--lan")lan=true;
          else if(words[i]==="--port"&&words[i+1])value=words[++i];
          else throw new Error("Use /serve [--lan] [--port 4318], status, or stop.");
        }
        await start(ctx,lan,value);
      }catch(error){ctx.ui.notify(error instanceof Error?error.message:"Web hub could not start.","error");}
    }
  });
  pi.on("session_start", async(_event,ctx) => {
    await registration?.stop();
    bridge.attach(ctx);
    releaseLocalUI();
    releaseLocalUI = pi.events.on('pi:local-ui', () => bridge.input({source:'interactive',text:''}));
    registration=await registerSession(bridge,ctx.cwd);
    if(pi.getFlag("serve")) {
      try{await start(ctx,Boolean(pi.getFlag("serve-lan")),String(pi.getFlag("serve-port")));}
      catch(error){ctx.ui.notify(error instanceof Error?error.message:"Web hub could not start.","error");}
    }
  });
  pi.on("session_shutdown", async()=>{releaseLocalUI();await registration?.stop();registration=undefined;});
  pi.on("input", (event)=>{bridge.input(event);});
  for(const type of ["agent_start","agent_settled","message_start","message_update","message_end","tool_execution_start","tool_execution_update","tool_execution_end","model_select","session_switch","session_fork","session_tree"] as const)
    pi.on(type as any,(event: any,ctx: any)=>{bridge.event(type,event,ctx);if(type.startsWith("session_")){bridge.attach(ctx);void registration?.refresh(ctx.cwd);}});
}
