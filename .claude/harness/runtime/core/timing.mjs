// The one runtime module that schedules timers. Other modules wait for the
// real event (child exit, lock release, readiness probe) and use these named
// helpers only to bound that wait, so lint can forbid raw timers elsewhere.

// Calls onExpire once after ms unless the returned cancel runs first.
export function deadline(ms, onExpire) {
  const timer = setTimeout(onExpire, ms);
  return () => clearTimeout(timer);
}

// Resolves after ms. An unref'd delay never keeps the process alive by itself.
export function delay(ms, { unref = false } = {}) {
  return new Promise((complete) => {
    const timer = setTimeout(complete, ms);
    if (unref) timer.unref();
  });
}

// SIGTERM now, SIGKILL after the grace period if the child is still running.
export function terminateWithGrace(child, graceMs = 2000) {
  child.kill("SIGTERM");
  setTimeout(() => child.kill("SIGKILL"), graceMs).unref();
}

// Synchronous bounded retry for lock files: calls attempt() until it returns
// { acquired: true } or the deadline passes, blocking intervalMs between tries.
export function retrySync(attempt, { deadlineMs, intervalMs }) {
  const until = Date.now() + deadlineMs;
  let result = attempt();
  while (!result.acquired && Date.now() < until) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, intervalMs);
    result = attempt();
  }
  return result;
}
