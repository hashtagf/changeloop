import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('bench',Path(__file__).resolve().parents[1]/'scripts/benchmark-multidimensional.py')
bench=importlib.util.module_from_spec(spec)
spec.loader.exec_module(bench)


class BenchmarkTests(unittest.TestCase):
    def test_claude_non_stream_event_and_usage(self):
        events=[
            {'seconds':1,'event':{'type':'rate_limit_event','event':'warning'}},
            {'seconds':2,'event':{'type':'stream_event','event':{'type':'content_block_delta','delta':{'type':'thinking_delta','thinking':'x'}}}},
            {'seconds':3,'event':{'type':'stream_event','event':{'type':'content_block_delta','delta':{'type':'text_delta','text':'{}'}}}},
            {'seconds':4,'event':{'type':'result','result':'{}','usage':{'output_tokens':12,'input_tokens':3,'cache_read_input_tokens':9,'output_tokens_details':{'thinking_tokens':10}}}},
        ]
        r=bench.parse('claude',events)
        self.assertEqual((r['first_text_s'],r['first_thinking_s']),(3,2))
        self.assertEqual((r['input_tokens'],r['output_tokens'],r['reasoning_tokens']),(12,12,10))

    def test_code_grading(self):
        good='''def merge_intervals(intervals):
 out=[]
 for a,b in sorted((min(a,b),max(a,b)) for a,b in intervals):
  if out and a<=out[-1][1]:out[-1][1]=max(out[-1][1],b)
  else:out.append([a,b])
 return out
'''
        self.assertTrue(bench.check_code(good))
        self.assertFalse(bench.check_code('def merge_intervals(intervals):\n return intervals\n'))
        self.assertFalse(bench.check_code('import os\ndef merge_intervals(intervals):\n return []\n'))

    def test_modes_and_tool_scope(self):
        args,env,effort=bench.command('sonnet','claude','normal','tool-read','fixture')
        self.assertEqual(effort,'off')
        self.assertEqual(env['MAX_THINKING_TOKENS'],'0')
        self.assertEqual(args[args.index('--tools')+1],'Read')
        args,env,effort=bench.command('opus','pi','normal','reasoning','task')
        self.assertEqual(effort,'low')
        self.assertIn('--no-tools',args)


if __name__=='__main__':unittest.main()
