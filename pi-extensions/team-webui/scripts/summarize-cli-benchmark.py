import json,statistics,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent/'reports/cli-throughput'
if sys.argv[1:]==['opus']:ROOT=ROOT/'opus55'
CLAUDE_MODEL=json.loads((ROOT/'method.json').read_text())['models']['claude']
EXPECTED='\n'.join(f'{i:03d} The quiet river flows past the old stone bridge every morning.' for i in range(1,61))
rows=[]
for path in sorted(ROOT.glob('*-[012].json')):
 d=json.loads(path.read_text());name=d['name'];text='';output=None;reasoning=None;model=None;inputs=None;cached=None;chunks=[];tools=0;final_time=None;failed=False
 for item in d['events']:
  e=item['event'];t=item['seconds'];m=e.get('message',{})
  if name.startswith('pi-'):
   a=e.get('assistantMessageEvent',{})
   if a.get('type')=='text_delta':chunks.append(t)
   if e['type']=='tool_execution_start':tools+=1
   if e['type']=='message_end' and m.get('role')=='assistant':
    text=''.join(v.get('text','') for v in m.get('content',[]) if v.get('type')=='text');u=m.get('usage',{});output=u.get('output');reasoning=u.get('reasoning');inputs=u.get('input',0)+u.get('cacheRead',0)+u.get('cacheWrite',0);cached=u.get('cacheRead',0);model=m.get('model');final_time=t;failed=m.get('stopReason') in ['error','aborted']
  elif name=='codex':
   if e['type']=='item.completed':
    it=e['item']
    if it.get('type')=='agent_message':text=it.get('text','');final_time=t
    elif it.get('type') not in ['error','reasoning']:tools+=1
   if e['type']=='turn.completed':
    u=e['usage'];output=u.get('output_tokens');reasoning=u.get('reasoning_output_tokens');inputs=u.get('input_tokens');cached=u.get('cached_input_tokens');model='gpt-6.1-sol (requested; exec does not emit model ID)'
   if e['type']=='turn.failed':failed=True
  else:
   a=e.get('event',{})
   if isinstance(a,dict) and a.get('type')=='content_block_delta' and a.get('delta',{}).get('type')=='text_delta':chunks.append(t)
   if e['type']=='assistant':
    tools+=sum(v.get('type')=='tool_use' for v in m.get('content',[]))
    model=m.get('model');final_time=t
   if e['type']=='result':
    text=e.get('result','');u=e.get('usage',{});output=u.get('output_tokens');reasoning=u.get('output_tokens_details',{}).get('thinking_tokens');inputs=u.get('input_tokens',0)+u.get('cache_creation_input_tokens',0)+u.get('cache_read_input_tokens',0);cached=u.get('cache_read_input_tokens',0);failed=e.get('is_error',False)
 expected_model=CLAUDE_MODEL if 'claude' in name else 'gpt-6.1-sol'
 valid=d['exit_code']==0 and not failed and text.strip()==EXPECTED and tools==0 and output and isinstance(model,str) and model.startswith(expected_model)
 row={'client':name,'round':d['round'],'model':model,'valid':bool(valid),'output_tokens':output,'reasoning_tokens':reasoning,'input_tokens_including_cache':inputs,'cache_read_tokens':cached,'tool_calls':tools,'wall_s':round(d['elapsed_s'],3),'output_tokens_per_wall_second':round(output/d['elapsed_s'],2) if valid else None,'answer_complete_s':round(final_time,3) if final_time else None,'first_text_s':round(chunks[0],3) if chunks else None,'stream_window_s':round(chunks[-1]-chunks[0],3) if len(chunks)>1 else None}
 rows.append(row)
aggregates=[]
for name in ['pi-gpt','codex','pi-claude','claude']:
 sample=[r for r in rows if r['client']==name and r['valid']]
 if not sample:continue
 speeds=[r['output_tokens_per_wall_second'] for r in sample]
 aggregates.append({'client':name,'n':len(sample),'median_tokens_per_second':round(statistics.median(speeds),2),'range_tokens_per_second':[min(speeds),max(speeds)],'median_wall_seconds':round(statistics.median(r['wall_s'] for r in sample),3),'output_tokens':sorted(set(r['output_tokens'] for r in sample)),'reasoning_tokens':sorted(set(r['reasoning_tokens'] for r in sample),key=str),'input_tokens':sorted(set(r['input_tokens_including_cache'] for r in sample)),'cache_read_tokens':sorted(set(r['cache_read_tokens'] for r in sample))})
result={'metric':'provider output tokens / process wall seconds (not decode-only throughput)','account_match':({'Claude':True} if CLAUDE_MODEL=='claude-opus-5-5' else {'OpenAI':True,'Claude':True}),'rows':rows,'summary':aggregates,'limitations':['Same model within each pair only; no model common to all three configured native clients.','System prompts differ: native Codex retains internal instructions and tools; no tool calls executed.','Subscription quota, network and provider load are not isolated.','Three samples per client, no separate warm-up; cache usage recorded.','Codex exec JSON exposes complete messages, not token deltas; its TTFT is unavailable.']}
(ROOT/'summary.json').write_text(json.dumps(result,indent=2));print(json.dumps({'summary':aggregates,'invalid':[r for r in rows if not r['valid']]}))
