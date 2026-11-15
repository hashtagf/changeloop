"""Exercise the installed Pi TUI in a real pseudo-terminal without a model call."""
import fcntl
import json
import os
from pathlib import Path
import pty
import select
import shutil
import struct
import subprocess
import tempfile
import termios
import time

extension = Path(__file__).resolve().parent.parent
install = Path.home() / '.pi/agent/install'
version = (install / 'current-version').read_text().strip()
cli = install / 'releases' / version / 'node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js'
with tempfile.TemporaryDirectory(prefix='pi-agent-tui-smoke-') as folder:
    root = Path(folder) / 'team'
    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 32, 110, 0, 0))
    env = {**os.environ, 'PI_TEAM_ROOT': str(root), 'TERM': 'xterm-256color', 'COLORTERM': 'truecolor'}
    for key in list(env):
        if key.startswith('ORCA_') or key in ('PI_TEAM_AGENT_ID', 'PI_TEAM_SUPERVISOR_PID'):
            del env[key]
    process = subprocess.Popen([
        shutil.which('node'), str(cli), '--no-extensions',
        '--extension', str(extension / 'index.ts'),
        '--extension', str(extension / 'test/mock-provider.ts'),
        '--extension', str(extension / 'test/panel-fixture.ts'),
        '--provider', 'agent-team-test', '--model', 'echo', '--thinking', 'off',
        '--session-dir', str(Path(folder) / 'sessions'),
    ], cwd=folder, env=env, stdin=slave, stdout=slave, stderr=slave, start_new_session=True)
    os.close(slave)
    output = b''

    def await_text(text, start=0, timeout=12):
        global output
        deadline = time.monotonic() + timeout
        needle = text.encode()
        while time.monotonic() < deadline:
            if needle in output[start:]:
                return
            if process.poll() is not None:
                raise AssertionError(f'Pi exited: {process.returncode}\n{output[-6000:]!r}')
            if select.select([master], [], [], .1)[0]:
                chunk = os.read(master, 65536)
                output += chunk
                if b'\x1b[c' in chunk or b'\x1b[0c' in chunk:
                    os.write(master, b'\x1b[?1;2c')
        raise AssertionError(f'Timed out waiting for {text!r}\n{output[-6000:]!r}')

    try:
        await_text('Ctrl+Q next')
        await_text('Reviewer')  # Appears automatically; no command or picker first.
        assert b'Find >' not in output
        os.write(master, b'main draft')
        time.sleep(.1)
        start = len(output)
        os.write(master, b'\x1b[B')  # Down from the bottom of the native editor.
        await_text('Select agent', start)
        os.write(master, b'\x1b[B')
        time.sleep(.1)
        os.write(master, b'\r')  # Select Reviewer; must not send Main's draft.
        await_text('Reviewer: checking files and collecting evidence.', start)
        await_text('Saved tool output: cancellation test passed.', start)
        assert not (root / 'members/preview-reviewer/inbox').exists()
        os.write(master, b'reviewer draft')
        time.sleep(.1)
        start = len(output)
        os.write(master, b'\t')
        await_text('Tester: checking files and collecting evidence.', start)
        os.write(master, b'Check regression tests')
        time.sleep(.1)
        start = len(output)
        os.write(master, b'\r')
        await_text('Sent', start)
        tester_files = list((root / 'members/preview-tester/inbox').glob('*.json'))
        assert len(tester_files) == 1
        assert json.loads(tester_files[0].read_text())['message'] == 'Check regression tests'
        start = len(output)
        os.write(master, b'\x1b[Z')  # Shift+Tab previous, within the selected chat.
        await_text('reviewer draft', start)
        start = len(output)
        os.write(master, b'\r')
        await_text('Sent', start)
        files = list((root / 'members/preview-reviewer/inbox').glob('*.json'))
        assert len(files) == 1
        envelope = json.loads(files[0].read_text())
        assert envelope['message'] == 'reviewer draft'
        assert envelope['delivery'] == 'steer'
        start = len(output)
        os.write(master, b'\x1b')
        await_text('main draft', start)
        assert b'Find >' not in output, 'Cycling agents must not open a separate picker'
        assert process.poll() is None, 'Switching must leave the main Pi process running'
        print('PASS: full-screen agent chat opens in the same terminal; switching, direct messages and return to Main preserve drafts.')
    finally:
        process.terminate()
        try:
            process.wait(timeout=4)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=2)
        os.close(master)
