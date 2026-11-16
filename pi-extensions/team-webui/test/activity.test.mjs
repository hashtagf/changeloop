import test from 'node:test';
import assert from 'node:assert/strict';
import {projectActivity,callKind} from '../activity.ts';
import {createBridge} from '../bridge.ts';
test('activity pairs tool/MCP/skill calls with results, redacts credential fields and never exports thinking text',()=>{
 const calls=projectActivity([{type:'message',id:'a',message:{role:'assistant',timestamp:1,content:[{type:'thinking',thinking:'hidden thought'},{type:'toolCall',id:'c',name:'mcp__x__get',arguments:{token:'secret',query:'hello'}},{type:'toolCall',id:'s',name:'read',arguments:{path:'/skills/test/SKILL.md'}}]}},{type:'message',id:'b',message:{role:'toolResult',toolCallId:'c',toolName:'mcp__x__get',timestamp:2,content:[{type:'text',text:'Visible result'},{type:'thinking',thinking:'hidden thought'}]}}]);
 assert.equal(calls.length,2);assert.equal(calls[0].kind,'mcp');assert.equal(calls[0].status,'completed');assert.equal(calls[0].text,'Visible result');assert.equal(calls[1].kind,'skill');
 assert.ok(!JSON.stringify(calls).includes('hidden thought'));assert.ok(!JSON.stringify(calls).includes('secret'));assert.match(calls[0].args,/redacted/);assert.equal(callKind('unknown'),'tool');
});
test('live calls retain bounded output after completion, clear across sessions, and expose details only on demand',()=>{
 const ctx={cwd:'/fixture',isIdle:()=>true,sessionManager:{getBranch:()=>[],getSessionId:()=> 'fixture'}};
 const bridge=createBridge({});bridge.attach(ctx);
 bridge.event('tool_execution_start',{toolCallId:'one',toolName:'bash',args:{command:'example'},parentToolCallId:'parent'},ctx);
 assert.equal(bridge.snapshot().activity[0].status,'running');assert.equal(bridge.snapshot().activity[0].args,undefined);assert.ok(!JSON.stringify(bridge.snapshot()).includes('example'));
 bridge.event('tool_execution_update',{toolCallId:'one',partialResult:{content:[{type:'text',text:'partial'}]}},ctx);
 assert.equal(bridge.activity('one').entries[0].text,'partial');
 bridge.event('tool_execution_end',{toolCallId:'one',isError:true,durationMs:123,result:{content:[{type:'text',text:'x'.repeat(40000)}]}},ctx);
 assert.equal(bridge.activity('one').entries[0].parentToolCallId,'parent');assert.equal(bridge.snapshot().activity[0].durationMs,123);
 assert.equal(bridge.snapshot().activity[0].status,'error');assert.equal(bridge.activity('one').entries[0].text.length,32768);assert.equal(bridge.activity('one').entries[0].truncated,true);
 bridge.event('agent_settled',{},ctx);assert.equal(bridge.activity().entries.length,1);bridge.attach(ctx);assert.equal(bridge.activity().entries.length,0);
});
