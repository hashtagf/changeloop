"""Drive the real Pi /login UI with a disposable 9router endpoint and key."""
import json
import os
import pty
import select
import subprocess
import sys
import time
from pathlib import Path

pi, extension, store, base_url, key = sys.argv[1:]
master, slave = pty.openpty()
child = subprocess.Popen([pi, '--no-extensions', '-e', extension, '--no-session'],
                         env={**os.environ, 'TERM': 'xterm-256color'},
                         stdin=slave, stdout=slave, stderr=slave, start_new_session=True)
os.close(slave)
steps = iter([(b'  nine-router', b'/login 9router\r'),
              (b'9Router Base URL', base_url.encode() + b'\r'),
              (b'API key for ' + base_url.encode(), key.encode() + b'\r')])
step = next(steps)
output = b''
deadline = time.monotonic() + 15
try:
    while child.poll() is None and time.monotonic() < deadline:
        if step is None and Path(store).exists() and '9router' in json.loads(Path(store).read_text()):
            sys.exit(0)
        if not select.select([master], [], [], 0.1)[0]:
            continue
        chunk = os.read(master, 65536)
        output += chunk
        if b'\x1b[c' in chunk or b'\x1b[0c' in chunk:
            os.write(master, b'\x1b[?1;2c')
        if step is not None and step[0] in output:
            os.write(master, step[1])
            step = next(steps, None)
    sys.exit('Login did not refresh the catalog; terminal tail:\n' +
             output[-3000:].decode('utf8', 'replace').replace(key, '[test key]'))
finally:
    if child.poll() is None:
        child.kill()
        child.wait()
    os.close(master)
