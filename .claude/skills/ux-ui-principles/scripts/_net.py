"""Shared network helpers for the skill's scripts (icons, photo_search, showcase_fetch). Standard library only.

curl does the fetching: it uses the system certificates (Python's own store is often missing on macOS).

  get(url, ua=None, timeout=60)        -> bytes; raises NetError (HTTP error, empty body) or NotRun (no network, no curl)
  get_text(url, ...)                   -> str (utf-8, invalid bytes replaced)
  cached(url, name, dir, valid=None)   -> str; the file under dir, fetched once. Writes atomically (temp file +
                                          os.replace) only after a good fetch; an empty or invalid cached file
                                          (bad JSON for *.json, or valid(text) False) counts as missing.
  write_atomic(path, data)             str or bytes via temp file + os.replace; normal permissions (0666 & ~umask)
  EXIT_NOT_RUN = 3                     exit code for NotRun (shared contract: 0 ok, 1 check failed, 2 usage, 3 not run)
"""
import json
import os
import shutil
import subprocess
import tempfile

UA = "ux-ui-principles-skill/1.0 (design study)"
EXIT_NOT_RUN = 3
# curl exit codes that mean "could not reach the network", not "the server said no"
_OFFLINE = {5, 6, 7, 28, 35, 52, 55, 56}


class NetError(RuntimeError):
    """The fetch failed: HTTP error (curl --fail), empty body, invalid content."""


class NotRun(NetError):
    """The fetch could not run: curl is missing or the host could not be reached (map to exit 3)."""


def get(url, ua=None, timeout=60):
    """Fetch url with curl --fail; return the body as bytes. Raises NotRun / NetError with a one-line reason."""
    if not shutil.which("curl"):
        raise NotRun("curl not found (install curl)")
    try:
        r = subprocess.run(["curl", "-sSL", "--fail", "--max-time", str(int(timeout)), "-A", ua or UA, url],
                           capture_output=True)
    except OSError as e:
        raise NotRun("curl could not start: %s" % e)
    if r.returncode:
        why = r.stderr.decode("utf-8", "replace").strip() or "curl exit %d" % r.returncode
        raise (NotRun if r.returncode in _OFFLINE else NetError)("%s: %s" % (url, why))
    if not r.stdout:
        raise NetError("%s: empty body" % url)
    return r.stdout


def get_text(url, ua=None, timeout=60):
    return get(url, ua, timeout).decode("utf-8", "replace")


def _valid(text, name, valid=None):
    if not text.strip():
        return False
    if name.endswith(".json"):
        try:
            json.loads(text)
        except ValueError:
            return False
    return valid(text) if valid else True


def cached(url, name, dir, valid=None, ua=None, timeout=60):
    """Return the text at url, cached as dir/name. A failed or interrupted fetch never leaves a file behind;
    an empty or invalid cached file is fetched again."""
    os.makedirs(dir, exist_ok=True)
    p = os.path.join(dir, name)
    if os.path.exists(p):
        try:
            with open(p, encoding="utf-8") as f:
                text = f.read()
            if _valid(text, name, valid):
                return text
        except (OSError, UnicodeDecodeError):
            pass
    text = get(url, ua, timeout).decode("utf-8")
    if not _valid(text, name, valid):
        raise NetError("%s: empty or invalid response" % url)
    write_atomic(p, text)
    return text


def file_mode():
    """0o666 minus the process umask: the mode a plain open(path, "w") would give a new file."""
    m = os.umask(0)
    os.umask(m)
    return 0o666 & ~m


def write_atomic(path, data):
    """Write str or bytes to path via a temp file in the same folder + os.replace."""
    d = os.path.dirname(os.path.abspath(path))
    os.makedirs(d, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".part-")
    try:
        with os.fdopen(fd, "wb" if isinstance(data, bytes) else "w", **({} if isinstance(data, bytes) else {"encoding": "utf-8"})) as f:
            f.write(data)
        os.chmod(tmp, file_mode())  # mkstemp makes 0600; give the file normal permissions (umask respected)
        os.replace(tmp, path)
    except BaseException:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise
