import asyncio,json,time,os,tempfile,hashlib,statistics,sys,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent/'reports/cli-throughput'
OPUS=sys.argv[1:]==['opus']
if OPUS:ROOT=ROOT/'opus55'
ROOT.mkdir(parents=True,exist_ok=True);ROOT.chmod(0o700)
WORK=tempfile.mkdtemp(prefix='pi-cli-throughput-',dir='/private/tmp')
PROMPT='Output exactly 60 lines and nothing else. Number them 001 through 060. Every line must contain its three-digit number followed by a space and this exact sentence: The quiet river flows past the old stone bridge every morning. Do not use any tools, explanations, headings or code fences.'
SYSTEM='Follow the user request exactly. Return only the requested text. Do not use tools.'
PI=['pi','--mode','json','--print','--no-session','--no-tools','--no-extensions','--no-mcp','--no-skills','--no-prompt-templates','--no-themes','--no-context-files','--thinking','low','--system-prompt',SYSTEM]
PLUGIN=str(Path.home()/'.pi/agent/git/github.com/inhumanxd/pi-claude-subscription/index.ts')
COMMANDS={
 'pi-gpt':PI+['--provider','openai-codex','--model','gpt-6.1-sol',PROMPT],
 'codex': ['codex','exec','--ignore-user-config','--ignore-rules','--ephemeral','--skip-git-repo-check','--json','--sandbox','read-only','--model','gpt-6.1-sol','-c','model_reasoning_effort="low"','-c','project_doc_max_bytes=0','-c','features.skip_host_skill_discovery=true','-c','features.omit_skill_descriptions=true','-c','features.apps=false','-c','features.plugins=false','-c','features.hooks=false','-c','features.shell_tool=false','-c','features.multi_agent=false','-c','web_search="disabled"',PROMPT],
 'pi-claude':PI+['--extension',PLUGIN,'--provider','claude-subscription','--model','claude-sonnet-4-6',PROMPT],
 'claude':['claude','--print','--safe-mode','--no-session-persistence','--no-chrome','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--tools','','--model','claude-sonnet-4-6','--effort','low','--system-prompt',SYSTEM,'--output-format','stream-json','--verbose','--include-partial-messages',PROMPT]
}
if OPUS:
 for name in ['pi-claude','claude']:
  COMMANDS[name]=['claude-opus-5-5' if x=='claude-sonnet-4-6' else x for x in COMMANDS[name]]
async def run(name,iteration):
 start=time.perf_counter();events=[];errors=[]
 env=dict(os.environ);env['PI_TELEMETRY']='0'
 proc=await asyncio.create_subprocess_exec(*COMMANDS[name],cwd=WORK,env=env,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE,limit=4*1024*1024)
 async def output():
  async for line in proc.stdout:
   text=line.decode(errors='replace')
   try:events.append({'seconds':time.perf_counter()-start,'event':json.loads(text)})
   except:errors.append(text)
 async def err():
  async for line in proc.stderr:errors.append(line.decode(errors='replace'))
 try:await asyncio.wait_for(asyncio.gather(output(),err(),proc.wait()),timeout=150)
 except asyncio.TimeoutError:
  proc.kill();await proc.wait();errors.append('BENCHMARK_TIMEOUT')
 elapsed=time.perf_counter()-start
 data={'name':name,'round':iteration,'elapsed_s':elapsed,'exit_code':proc.returncode,'events':events,'stderr':errors,'workingDirectory':WORK}
 path=ROOT/f'{name}-{iteration}.json';path.write_text(json.dumps(data));path.chmod(0o600)
 summary={'name':name,'round':iteration,'elapsed_s':round(elapsed,3),'exit_code':proc.returncode,'event_types':sorted(set(x['event'].get('type','?') for x in events))}
 print(json.dumps(summary),flush=True)
 return data
async def main():
 import sys
 if OPUS:
  expected='\n'.join(f'{i:03d} The quiet river flows past the old stone bridge every morning.' for i in range(1,61))
  for iteration,names in [(0,['pi-claude','claude']),(1,['claude','pi-claude']),(2,['pi-claude','claude'])]:
   for name in names:
    d=await run(name,iteration);text='';model='';failed=d['exit_code']!=0
    for row in d['events']:
     e=row['event'];m=e.get('message',{})
     if name=='pi-claude' and e.get('type')=='message_end' and m.get('role')=='assistant':
      model=m.get('model','');text=''.join(v.get('text','') for v in m.get('content',[]) if v.get('type')=='text');failed=failed or m.get('stopReason') in ['error','aborted']
     if name=='claude' and e.get('type')=='assistant':model=m.get('model','')
     if name=='claude' and e.get('type')=='result':text=e.get('result','');failed=failed or e.get('is_error',False)
    if failed or text.strip()!=expected or model!='claude-opus-5-5':
     print(json.dumps({'validation_failed':True,'client':name,'model':model,'round':iteration}),flush=True);return
 elif sys.argv[1:]==['repeat']:
  for iteration,names in [(1,['codex','pi-gpt','claude','pi-claude']),(2,['pi-gpt','codex','pi-claude','claude'])]:
   for name in names:await run(name,iteration)
 else:
  names=sys.argv[1:] or ['pi-gpt','codex','pi-claude','claude']
  for name in names:await run(name,0)
(ROOT/'method.json').write_text(json.dumps({'prompt':PROMPT,'systemPrompt':SYSTEM,'workingDirectory':WORK,'models':{'gpt':'gpt-6.1-sol','claude':'claude-opus-5-5' if OPUS else 'claude-sonnet-4-6'},'effort':'low','metric':'provider output tokens / process wall seconds','commands':COMMANDS},indent=2))
try:asyncio.run(main())
finally:shutil.rmtree(WORK,ignore_errors=True)
