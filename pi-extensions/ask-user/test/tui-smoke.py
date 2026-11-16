"""Local installed Pi: persistent question UI, no model requests."""
import fcntl,json,os,pty,re,select,shutil,struct,subprocess,tempfile,termios,time,unicodedata
from pathlib import Path
extension=Path(__file__).resolve().parent.parent
install=Path.home()/'.pi/agent/install'
version=(install/'current-version').read_text().strip()
cli=install/'releases'/version/'node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js'
with tempfile.TemporaryDirectory(prefix='pi-questions-tui-') as folder:
 root=Path(folder)/'questions'; master,slave=pty.openpty()
 fcntl.ioctl(slave,termios.TIOCSWINSZ,struct.pack('HHHH',32,110,0,0))
 env={**os.environ,'TERM':'xterm-256color','PI_CODING_AGENT_DIR':str(Path(folder)/'profile'),'PI_QUESTIONS_ROOT':str(root),'PI_TEAM_ROOT':str(Path(folder)/'team')}
 for key in list(env):
  if key.startswith('ORCA_') or key in ('PI_TEAM_AGENT_ID','PI_TEAM_SUPERVISOR_PID'):del env[key]
 process=subprocess.Popen([shutil.which('node'),str(cli),'--no-extensions','--no-mcp','--no-skills','--no-context-files',
  '-e',str(extension/'index.ts'),'-e',str(extension/'test/tui-fixture.ts'),
  '--provider','questions-test','--model','fixture','--thinking','off','--session-dir',str(Path(folder)/'sessions')],cwd=folder,env=env,stdin=slave,stdout=slave,stderr=slave,start_new_session=True)
 os.close(slave);output=b''
 def await_text(text,start=0,timeout=15):
  global output
  deadline=time.monotonic()+timeout
  while time.monotonic()<deadline:
   if unicodedata.normalize('NFKD',text) in unicodedata.normalize('NFKD',output[start:].decode('utf8','replace')):return
   if process.poll() is not None:raise AssertionError('Pi exited: '+repr(output[-4000:]))
   if select.select([master],[],[],.1)[0]:
    chunk=os.read(master,65536);output+=chunk
    if b'\x1b[c' in chunk or b'\x1b[0c' in chunk:os.write(master,b'\x1b[?1;2c')
  raise AssertionError('Missing '+text+' '+re.sub(r'\x1b\[[0-9;?]*[A-Za-z]', '', output[-5000:].decode('utf8','replace')))
 def send(data):
  # Bare Escape is resolved after the terminal input decoder's escape timeout.
  time.sleep(.25)
  start=len(output);os.write(master,data);return start
 try:
  await_text('Esc = พักไว้')
  assert b'\x07' in output,'terminal BEL on new questions'
  start=send(b'\x1b');await_text('/questions',start)
  assert len(list((root/'pending').glob('*/*.json')))==4
  start=send(b'/questions\r');await_text('Esc = พักไว้',start)
  start=send(b'\r');await_text('Type something.',start)
  # Escape inside the questionnaire goes back, without marking anything answered.
  start=send(b'\x1b');await_text('Esc = พักไว้',start)
  assert not list((root/'answers').glob('*.json'))
  start=send(b'\r');await_text('Type something.',start)
  start=send(b'\x1b[B\x1b[B\r');await_text('คำตอบของคุณ',start)
  start=send(b'Singapore\r');await_text('บันทึกคำตอบแล้ว',start)
  assert len(list((root/'answers').glob('*.json')))==1
  # The list returns with the remaining batch; Esc keeps it pending.
  await_text('(+1)',start)
  start=send(b'\x1b');await_text('/questions',start)
  start=send(b'/reload\r');await_text('Reloaded',start);await_text('Which format?',start)
  assert len(list((root/'pending').glob('*/*.json')))==2
  await_text('Plain JSON',start);await_text('Preview',start)
  start=send(b'\r');await_text('Which checks?',start)
  # Draft persistence: the Format choice survives /reload before submitting.
  send(b'\x1b');deadline=time.monotonic()+5
  while not list((root/'drafts').glob('*/*.json')):
   assert time.monotonic()<deadline,'draft saved on Esc'
   if select.select([master],[],[],.1)[0]:output+=os.read(master,65536)
  start=send(b'/reload\r');await_text('Reloaded',start);await_text('■ Format',start)
  send(b'1');start=send(b'\t');await_text('ทบทวนคำตอบ',start)
  start=send(b'n');await_text('โน้ตรวมทั้งชุด',start)
  start=send(b'ship it\r');await_text('ship it',start)
  start=send(b'\r');await_text('No pending questions',start)
  answers=[json.loads(f.read_text()) for f in (root/'answers').glob('*.json')]
  assert len(answers)==2
  batch=[a for a in answers if a['response'].get('globalNote')][0]
  assert batch['response']['answers'][1]['selected']==['Lint'],batch
  assert not list((root/'pending').glob('*/*.json'))
  assert not list((root/'drafts').glob('*/*.json')),'drafts removed after answering'
  assert len(list((root/'outbox').glob('*/*.json')))==2,'Offline owner retains both answer deliveries'
  assert b'Unexpected model call' not in output
  print('PASS: BEL, question list, tabbed questionnaire with preview/multi-select/global note, Escape retention, draft persistence across reload, custom answer, reload persistence, offline-owner delivery; no model call.')
 finally:
  process.terminate()
  try:process.wait(timeout=4)
  except subprocess.TimeoutExpired:process.kill();process.wait(timeout=2)
  os.close(master)
