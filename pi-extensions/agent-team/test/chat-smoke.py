"""Real Pi TUI navigation/native rendering; disposable transcript, no inference."""
import fcntl,json,os,pty,re,select,shutil,struct,subprocess,tempfile,termios,time
from pathlib import Path
extension=Path(__file__).resolve().parent.parent
install=Path.home()/'.pi/agent/install'; version=(install/'current-version').read_text().strip()
cli=install/f'releases/{version}/node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js'
with tempfile.TemporaryDirectory(prefix='pi-native-chat-') as folder:
 master,slave=pty.openpty();fcntl.ioctl(slave,termios.TIOCSWINSZ,struct.pack('HHHH',42,115,0,0))
 env={key:value for key,value in os.environ.items() if not key.startswith(('ORCA_','PI_TEAM_'))}
 env.update(TERM='xterm-256color',PI_CODING_AGENT_DIR=folder+'/profile',PI_TEAM_ROOT=folder+'/team',PI_OFFLINE='1')
 process=subprocess.Popen(['node',str(cli),'--no-extensions','--no-mcp','--no-skills','--no-context-files',
  '-e',str(extension/'index.ts'),'-e',str(extension/'test/chat-fixture.ts'),'--provider','chat-ui-fixture','--model','fixture',
  '--session-dir',folder+'/sessions'],cwd=folder,env=env,stdin=slave,stdout=slave,stderr=slave,start_new_session=True)
 os.close(slave);output=b''
 def text(start=0):return re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]','',output[start:].decode('utf8','replace'))
 def wait_for(value,start=0,timeout=15):
  global output
  deadline=time.monotonic()+timeout
  while time.monotonic()<deadline:
   if value in text(start):return
   if process.poll() is not None:raise AssertionError('Pi exited: '+text()[-2500:])
   if select.select([master],[],[],.1)[0]:
    chunk=os.read(master,65536);output+=chunk
    if b'\x1b[c' in chunk or b'\x1b[0c' in chunk:os.write(master,b'\x1b[?1;2c')
  raise AssertionError('Missing '+value+': '+text()[-2500:])
 try:
  wait_for('Native chat fixture ready');wait_for('Chat fixture')
  os.write(master,b'main preserved draft');os.write(master,b'\x1b[B');wait_for('Select agent')
  os.write(master,b'\x1b[B');os.write(master,b'\r');wait_for('Native chat result');wait_for('const answer = 42');wait_for('fixture-command-only')
  assert 'PRIVATE FIXTURE REASONING' not in text()
  os.write(master,b'\x1b[200~line one\nline two\x1b[201~');os.write(master,b'\r')
  wait_for('Sent')
  inbox=list((Path(folder)/'team/members/chat-fixture-worker/inbox').glob('*.json'))
  assert len(inbox)==1 and json.loads(inbox[0].read_text())['message']=='line one\nline two'
  os.write(master,b'worker saved draft');os.write(master,b'\x0f');wait_for('fixture-line-19')
  start=len(output);os.write(master,b'\x1b');wait_for('main preserved draft',start)
  assert 'Unexpected model call' not in text()
  print('PASS: real TUI uses native Markdown/code/tool rendering and multiline editor; direct send, tool expansion and Main draft return work without inference.')
 finally:
  process.terminate()
  try:process.wait(timeout=4)
  except subprocess.TimeoutExpired:process.kill();process.wait()
  os.close(master)
