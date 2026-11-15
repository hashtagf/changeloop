"""Real Pi keyboard/renderer check; fixture jobs only, no model request."""
import fcntl,json,os,pty,select,shutil,struct,subprocess,tempfile,termios,time,urllib.request
from pathlib import Path
extension=Path(__file__).resolve().parent.parent
install=Path.home()/'.pi/agent/install'
version=(install/'current-version').read_text().strip()
cli=install/'releases'/version/'node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js'
with tempfile.TemporaryDirectory(prefix='pi-background-tui-') as folder:
 data=Path(folder)/'jobs.json';master,slave=pty.openpty()
 fcntl.ioctl(slave,termios.TIOCSWINSZ,struct.pack('HHHH',32,110,0,0))
 env={**os.environ,'TERM':'xterm-256color','BG_UI_FIXTURE_DATA':str(data),'PI_CODING_AGENT_DIR':str(Path(folder)/'profile'),'PI_TEAM_ROOT':str(Path(folder)/'team')}
 for key in list(env):
  if key.startswith('ORCA_') or key in ('PI_TEAM_AGENT_ID','PI_TEAM_SUPERVISOR_PID'):del env[key]
 process=subprocess.Popen([shutil.which('node'),str(cli),'--no-extensions','--no-mcp','--no-skills','--no-context-files',
  '-e',str(extension/'index.ts'),'-e',str(extension.parent/'agent-team/index.ts'),*(['-e',os.environ['PI_WEBUI_EXTENSION']] if os.environ.get('PI_WEBUI_EXTENSION') else []),'-e',str(extension/'test/tui-fixture.ts'),'--provider','background-ui-test','--model','fixture','--thinking','off',
  '--session-dir',str(Path(folder)/'sessions')],cwd=folder,env=env,stdin=slave,stdout=slave,stderr=slave,start_new_session=True)
 os.close(slave);output=b''
 def await_text(text,start=0,timeout=15):
  global output
  deadline=time.monotonic()+timeout
  while time.monotonic()<deadline:
   if text.encode() in output[start:]:return
   if process.poll() is not None:raise AssertionError('Pi exited: '+repr(output[-4000:]))
   if select.select([master],[],[],.1)[0]:
    chunk=os.read(master,65536);output+=chunk
    if b'\x1b[c' in chunk or b'\x1b[0c' in chunk:os.write(master,b'\x1b[?1;2c')
  raise AssertionError('Missing '+text+' '+repr(output[-5000:]))
 try:
  await_text('Background · 1 running')
  registry=list((Path(folder)/'profile/web-ui/sessions').glob('*.json'))
  assert registry,'Web bridge registered'
  record=json.loads(registry[0].read_text())
  request=urllib.request.Request('http://127.0.0.1:'+str(record['port'])+'/message',data=json.dumps({'id':'tui-web-lease-test','name':'Fixture','text':'Handled without a model'}).encode(),headers={'Authorization':'Bearer '+record['token'],'Content-Type':'application/json'})
  with urllib.request.urlopen(request) as response:assert response.status==200
  os.write(master,b'main draft');time.sleep(.1)
  start=len(output);os.write(master,b'\x02')
  await_text('Background jobs',start)
  assert b'historical job log' not in output[start:]
  os.write(master,b'\r');await_text('TUI live log ready',start)
  start=len(output);os.write(master,b'\x18');await_text('Stop requested',start);await_text('Job stopped.',start)
  state=json.loads(data.read_text());final=json.loads((Path(state['root'])/state['ids'][0]/'state.json').read_text())
  assert final['status']=='stopped' and final.get('finishedAt')
  start=len(output);os.write(master,b'\x0f');await_text('historical job log',start)
  start=len(output);os.write(master,b'\x1b');await_text('main draft',start)
  assert b'Unexpected model call' not in output
  print('PASS: combined Agent/Web/BG extensions, native focus after a Web message, persistent background bar, Ctrl+B list, live log, direct stop, history and return preserve the main draft; no model call.')
 finally:
  process.terminate()
  try:process.wait(timeout=4)
  except subprocess.TimeoutExpired:process.kill();process.wait(timeout=2)
  os.close(master)
  if data.exists():
   state=json.loads(data.read_text());root=Path(state['root'])
   for id in state['ids']:
    if (root/id).exists():(root/id/'stop').touch()
   deadline=time.monotonic()+5
   while time.monotonic()<deadline:
    try:done=all(json.loads((root/id/'state.json').read_text()).get('finishedAt') for id in state['ids'])
    except (FileNotFoundError,json.JSONDecodeError):done=False
    if done:break
    time.sleep(.1)
   if done:shutil.rmtree(root,ignore_errors=True)
