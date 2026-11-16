import { installTaskBoard } from '../task-extension.ts';
import { createTaskStore } from '../task-store.ts';
export default function(pi) {
  installTaskBoard(pi);
  pi.registerProvider('task-tui-test',{api:'task-tui-test-api',apiKey:'local-test',baseUrl:'http://127.0.0.1:1',
    models:[{id:'fixture',name:'Task TUI fixture',reasoning:false,input:['text'],contextWindow:128000,maxTokens:100,cost:{input:0,output:0,cacheRead:0,cacheWrite:0}}],
    streamSimple(){throw Error('Unexpected model call');}});
  pi.on('session_start',(_event,ctx)=>{
    createTaskStore().create(ctx.cwd,{key:'fixture',title:'TUI fixture task',description:'A full-screen task board',nextStep:'Check the keyboard',ownerSessionId:ctx.sessionManager.getSessionId(),ownerName:'Fixture'},'fixture');
  });
}
