"""Real installed Pi terminal, isolated task DB, no model or web hub needed."""
import fcntl,json,os,pty,re,select,shutil,sqlite3,struct,subprocess,tempfile,termios,time
from pathlib import Path
project=Path(__file__).resolve().parent.parent
install=Path.home()/'.pi/agent/install';version=(install/'current-version').read_text().strip()
cli=install/'releases'/version/'node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js'
with tempfile.TemporaryDirectory(prefix='pi-kanban-tui-') as folder:
 root=Path(folder)/'tasks';master,slave=pty.openpty()
 fcntl.ioctl(slave,termios.TIOCSWINSZ,struct.pack('HHHH',32,110,0,0))
 env={**os.environ,'TERM':'xterm-256color','PI_CODING_AGENT_DIR':str(Path(folder)/'profile'),'PI_TASKS_ROOT':str(root)}
 for key in list(env):
  if key.startswith('ORCA_') or key in ('PI_TEAM_AGENT_ID','PI_TEAM_SUPERVISOR_PID'):del env[key]
 process=subprocess.Popen([shutil.which('node'),str(cli),'--no-extensions','--no-mcp','--no-skills','--no-context-files',
  '-e',str(project/'test/task-tui-fixture.ts'),'--provider','task-tui-test','--model','fixture','--thinking','off','--session-dir',str(Path(folder)/'sessions')],cwd=folder,env=env,stdin=slave,stdout=slave,stderr=slave,start_new_session=True)
 os.close(slave);output=b''
 def await_text(text,start=0,timeout=15):
  global output
  deadline=time.monotonic()+timeout
  while time.monotonic()<deadline:
   if text.encode() in output[start:]:return
   if process.poll() is not None:raise AssertionError('Pi exited')
   if select.select([master],[],[],.1)[0]:
    chunk=os.read(master,65536);output+=chunk
    if b'\x1b[c' in chunk or b'\x1b[0c' in chunk:os.write(master,b'\x1b[?1;2c')
  raise AssertionError('Missing '+text+' '+re.sub(r'\x1b\[[0-9;?]*[A-Za-z]','',output[-6000:].decode('utf8','replace')))
 def send(data):
  time.sleep(.25);start=len(output);os.write(master,data);return start
 def saved():
  with sqlite3.connect(root/'tasks.sqlite') as db:return json.loads(db.execute('select data from tasks').fetchone()[0])
 try:
  await_text('(task-tui-test)')
  send(b'keep main draft')
  start=send(b'\x1b[116;7u');await_text('Kanban',start);await_text('TUI fixture task',start)
  start=send(b'\r');await_text('Description',start)
  start=send(b'\x1b');await_text('Enter details',start)
  start=send(b'm');await_text('Move task to status',start)
  start=send(b'\x1b[B\x1b[B\x1b[B\r');await_text('BUILD (1)',start)
  assert saved()['status']=='build'
  start=send(b'e');await_text('Edit task',start)
  start=send(b'\x1b[B\x1b[B\r');await_text('Edit Next step',start)
  start=send(b'\x15Verified keyboard flow\r');await_text('Verified keyboard flow',start)
  assert saved()['nextStep']=='Verified keyboard flow'
  start=send(b'\x1b');await_text('keep main draft',start)
  start=send(b'\x15/reload\r');await_text('Reloaded',start)
  start=send(b'/tasks\r');await_text('Kanban',start)
  assert saved()['status']=='build' and saved()['nextStep']=='Verified keyboard flow'
  start=send(b'\x1b[C\x1b[C\x1b[C');await_text('BUILD (1)',start)
  assert b'Unexpected model call' not in output
  print('PASS: full-screen native Kanban, shortcut, task details, status movement, editing, main draft preservation and reload persistence; no model call or web hub.')
 finally:
  process.terminate()
  try:process.wait(timeout=4)
  except subprocess.TimeoutExpired:process.kill();process.wait(timeout=2)
  os.close(master)
