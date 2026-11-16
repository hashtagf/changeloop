"""Open Pi interactively in a pseudo-terminal until the model catalog is saved.

Usage: interactive.py <pi-bin> <extension> <models-store.json> <provider> [timeout]
Exits 0 once <models-store.json> mentions <provider>, 1 on timeout or early exit.
The caller supplies an isolated HOME/PI_CODING_AGENT_DIR and cwd."""
import os, pty, select, subprocess, sys, time

pi, extension, store, provider = sys.argv[1:5]
timeout = float(sys.argv[5]) if len(sys.argv) > 5 else 45
master, slave = pty.openpty()
env = {**os.environ, 'TERM': 'xterm-256color'}
child = subprocess.Popen([pi, '--no-extensions', '-e', extension, '--no-session'], env=env,
                         stdin=slave, stdout=slave, stderr=slave, start_new_session=True)
os.close(slave)
output = b''
deadline = time.monotonic() + timeout
try:
    while time.monotonic() < deadline:
        if os.path.exists(store) and f'"{provider}"' in open(store, encoding='utf8').read():
            sys.exit(0)
        if child.poll() is not None:
            break
        if select.select([master], [], [], 0.1)[0]:
            try:
                chunk = os.read(master, 65536)
            except OSError:
                break
            output += chunk
            if b'\x1b[c' in chunk or b'\x1b[0c' in chunk:
                os.write(master, b'\x1b[?1;2c')
    sys.stderr.write('catalog not saved; terminal tail:\n' + output[-3000:].decode('utf8', 'replace'))
    sys.exit(1)
finally:
    if child.poll() is None:
        child.kill()
        child.wait()
