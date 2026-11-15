const jobs = require('./manager.cjs');

// Runs the same supervisor from the start. Detaching changes only the wait;
// it never kills or restarts the command.
async function foreground(root, options, { signal, onOutput, onReady, yieldMs = 10000 } = {}) {
  if (signal?.aborted) throw new Error('Command aborted');
  const job = await jobs.start(root, { ...options, notify: false });
  return new Promise((resolve, reject) => {
    let poll, deadline, done = false, previous = '';
    const cleanup = () => {
      clearInterval(poll);
      clearTimeout(deadline);
      signal?.removeEventListener('abort', abort);
    };
    const finish = background => {
      if (done) return;
      try {
        const state = jobs.read(root, job.id);
        const running = ['starting', 'running'].includes(state.status);
        if (background && running) jobs.promote(root, job.id);
        else jobs.acknowledge(root, job.id);
        done = true;
        cleanup();
        resolve({ job: jobs.read(root, job.id), background: background && running, output: jobs.tail(root, job.id, 500) });
      } catch (error) { fail(error); }
    };
    const fail = error => { if (done) return; done = true; cleanup(); jobs.stop(root, job.id); reject(error); };
    const abort = () => { fail(new Error('Command aborted')); };
    const tick = () => {
      if (done) return;
      try {
        const state = jobs.read(root, job.id);
        const output = jobs.tail(root, job.id, 500);
        if (output !== previous) { previous = output; onOutput?.(output, state); }
        if (!['starting', 'running'].includes(state.status)) finish(false);
      } catch (error) { fail(error); }
    };
    poll = setInterval(tick, 100);
    deadline = setTimeout(() => finish(true), yieldMs);
    signal?.addEventListener('abort', abort, { once: true });
    onReady?.({ id: job.id, detach: () => finish(true) });
    if (signal?.aborted) abort();
    else tick();
  });
}
module.exports = { foreground };
