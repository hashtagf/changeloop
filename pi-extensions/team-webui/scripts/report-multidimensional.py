"""Regrade saved coding answers without another model call, then render the report."""
import importlib.util
import json
from pathlib import Path

spec=importlib.util.spec_from_file_location('bench',Path(__file__).with_name('benchmark-multidimensional.py'))
bench=importlib.util.module_from_spec(spec)
spec.loader.exec_module(bench)
cases=bench.cases()
for path in bench.OUT.glob('*.json'):
    if path.name in ['summary.json','method.json']:continue
    data=json.loads(path.read_text());r=data['result']
    if not r['models']:r['model_verified']=None
    if r['timeout'] and not r['output_tokens']:
        r['output_tokens']=None;r['input_tokens']=None;r['tokens_per_wall_s']=None
    answer=data['answer'];name=r['case']
    r['content_correct']=r['correct'];r['format_ok']=r['correct']
    if name=='coding':
        r['correct']=bench.check_code(answer)
        clean=answer.strip()
        if clean.startswith('```') and clean.endswith('```'):clean='\n'.join(clean.splitlines()[1:-1])
        r['content_correct']=bench.check_code(clean)
        r['format_ok']=clean==answer.strip()
    elif name in ['context-json','reasoning','tool-read']:
        expected=cases.get(name,{}).get('expected')
        if name=='tool-read':
            rng=bench.random.Random(196+r['round']);nonce=f'bench-{rng.getrandbits(96):024x}'
            amounts=[rng.randrange(1000) for _ in range(40)]
            expected={'nonce':nonce,'total':sum(a for i,a in enumerate(amounts) if i%3)}
        try:json.loads(answer);r['format_ok']=True
        except ValueError:r['format_ok']=False
        candidates=[]
        decoder=json.JSONDecoder()
        for i,char in enumerate(answer):
            if char=='{':
                try:candidates.append(decoder.raw_decode(answer[i:])[0])
                except ValueError:pass
        r['content_correct']=bool(candidates and candidates[-1]==expected)
    r['success']=bool(r['correct'] and r['model_verified'] is not False and r['tool_policy_ok'] and not r['failed'] and r['exit_code']==0)
    path.write_text(json.dumps(data,indent=2))
summary=bench.summarize()
data=json.loads((bench.OUT/'summary.json').read_text())
rows=data['rows']
lines=['# Multidimensional CLI benchmark','',
'Date: 2026-11-16. Local installed clients: Pi 1.5.2, Claude Code 2.1.325, Codex CLI 0.169.0. Existing subscription authentication was used; credentials were never copied to the benchmark fixtures.','',
'## Scope and controls','',
'Five synthetic workloads per client/mode/model. One exploratory sample per workload; no statistical significance claim. Alternate client order and effort order between workloads. Fresh temporary directories/sessions, optional customizations disabled, identical prompts and fixtures within each pair. Native internal prompts and tool schemas still differ. No model fallback requested.','',
'| Family | Same model in each client pair | Normal | Thinking |',
'|---|---|---|---|',
'| Pi / Claude Code | claude-opus-5-5 | low | high |',
'| Pi / Claude Code | claude-sonnet-4-6 | off | high |',
'| Pi / Codex | gpt-6.1-sol | low | high |','',
'Opus 5.5 does not support disabling thinking in Claude Code; low is not off. GPT model metadata also advertises low as its minimum supported effort. Sonnet uses Pi `--thinking off` and Claude `MAX_THINKING_TOKENS=0` plus `alwaysThinkingEnabled=false`. High uses adaptive thinking: models may elect not to think on an easy task. See [Claude model configuration](https://code.claude.com/docs/en/model-config#where-you-cant-turn-thinking-off). Requested settings are recorded; internal provider behavior is not independently observable.','',
'## Workloads','',
'- Throughput: exact 60-line response; fixed output length.','- Context/JSON: filter 180 synthetic records and sum matching amounts; require JSON only.','- Reasoning: exact 12-item 0/1 knapsack with tie-breaking; oracle exhaustively enumerates 4,096 subsets.','- Coding: implement interval merging, including reversed endpoints, touching endpoints and no input mutation. AST-allowlisted Python is checked against 5 edge cases and 100 seeded randomized cases in an isolated subprocess with CPU/wall timeout. These tiny macOS checks ran locally; no VM workload or production data was involved.','- Tool use: read a synthetic fixture, return its nonce and selected sum; require at least one actual tool call. Pi/Claude use read tools; Codex uses its native shell under read-only sandbox. Tool schemas are not identical.','',
'## Results','',
'Pass requires correct answer, exact requested output format, correct tool behavior, successful exit and no reported model failure. Model ID is checked where emitted; Codex exec does not emit it. Totals combine five different tasks and are not token-generation speed rankings.','',
'| Model | Client | Mode | Strict pass | Correct content | Total seconds | Input tokens incl. cache | Cache read tokens | Output tokens incl. thinking | Thinking observed |',
'|---|---|---|---:|---:|---:|---:|---:|---:|---:|']
for r in summary:
    content=sum(x.get('content_correct',False) for x in rows if all(x[k]==r[k] for k in ['family','client','mode']))
    cached=sum(x.get('cache_read_tokens',0) for x in rows if all(x[k]==r[k] for k in ['family','client','mode']))
    partial=' + unknown' if r['usage_incomplete_runs'] else ''
    lines.append(f"| {r['family']} | {r['client']} | {r['mode']} | {r['passed']}/{r['runs']} | {content}/{r['runs']} | {r['total_wall_s']:.2f} | {r['input_tokens']}{partial} | {cached}{partial} | {r['output_tokens']}{partial} | {r['thinking_observed_runs']}/{r['runs']} |")
lines += ['', '## Per-workload measurements','',
'Wall time includes CLI startup, network/provider wait, tools and exit. First text is time to the first text delta (not first thinking delta). Codex only exposes completed messages, so its first-text measurement is unavailable. Provider output tokens can include thinking: output tokens/wall second is not visible-answer decode speed. No observed thinking event is not proof that the model did no reasoning, especially in Codex. Timeout usage without a final provider summary is unknown, not zero.','',
'| Model | Client | Mode | Workload | Strict pass | Content correct | Format OK | Wall s | First text s | Output tokens | Thinking tokens | Tool calls |',
'|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|']
for r in sorted(rows,key=lambda r:(r['family'],r['case'],r['mode'],r['client'])):
    ft='N/A' if r['first_text_s'] is None else f"{r['first_text_s']:.2f}"
    thinking='N/A' if r['reasoning_tokens'] is None else r['reasoning_tokens']
    output='N/A' if r['output_tokens'] is None else r['output_tokens']
    lines.append(f"| {r['family']} | {r['client']} | {r['mode']} | {r['case']} | {'yes' if r['success'] else 'NO'} | {r.get('content_correct')} | {r.get('format_ok')} | {r['wall_s']:.2f} | {ft} | {output} | {thinking} | {r['tool_calls']} |")
lines += ['', '## Interpretation limits','',
'This is a smoke benchmark, not a standard public capability benchmark. A single failure is a finding to investigate, not proof of general inferiority. Repeated trials are required for reliability estimates. Rate limits, provider load, cache warming and native instructions are uncontrolled. Compare clients within a model and effort setting; tokenizers differ across models. No actual subscription cost is inferred from estimated token prices. Four initial Claude tool trials failed in CLI argument parsing before inference; these are retained separately under excluded-harness-attempts and replaced by corrected-command trials, run later than the other trials. The coding oracle defines touching as equal endpoints; adjacent integer endpoints separated by one are not touching under this specification. UI rendering performance, production repository editing, long sessions, cancellation and concurrent agents were not measured.','',
'The code validator was corrected for macOS resource-limit support and all saved coding answers were regraded without rerunning the model. On macOS the grader uses CPU/wall limits and an AST allowlist; address-space limits are only applied on Linux.','',
'[Machine-readable results](summary.json) · [Prompts, oracles and configuration](method.json). Each restricted raw JSON file stores the command, timestamps, output, usage and exit status. Rerun with `python3 scripts/benchmark-multidimensional.py --rounds 3`; saved trials are reused and only missing rounds run. Run `python3 scripts/report-multidimensional.py` after collection to regenerate this report.','']
(bench.OUT/'README.md').write_text('\n'.join(lines))
print(json.dumps({'completed':len(rows),'summary':summary,'failures':[r['id'] for r in rows if not r['success']]}))
