export function createQuestionPresenter(store, session: string, changed = () => {}) {
  let busy = false, disposed = false, controller: AbortController | undefined;
  return {
    async show(ctx) {
      if (busy || disposed) return;
      busy = true; controller = new AbortController();
      const opts = { signal: controller.signal };
      try {
        while (!disposed) {
          const pending = store.pending(session);
          if (!pending.length) { ctx.ui.notify('ตอบคำถามครบแล้ว · No pending questions', 'info'); return; }
          const labels = pending.map((q, i) => `${i + 1}. ${q.agentName}: ${q.question.replace(/\s+/g, ' ')}`);
          const selected = await ctx.ui.select(`รอคำตอบ · ${pending.length} · Esc = พักไว้`, labels, opts);
          if (disposed || selected === undefined) return;
          const q = pending[labels.indexOf(selected)];
          if (!q) return;
          let answer: string | undefined;
          if (q.options.length) {
            const options = q.options.map((o, i) => `${i + 1}. ${o}`);
            const custom = '✎ พิมพ์คำตอบเอง / Write an answer';
            const choice = await ctx.ui.select(`${q.agentName}: ${q.question}`, [...options, custom], opts);
            if (disposed) return;
            if (choice === undefined) continue;
            if (choice === custom) answer = await ctx.ui.input(q.question, 'คำตอบของคุณ / Your answer', opts);
            else answer = q.options[options.indexOf(choice)];
          } else answer = await ctx.ui.input(`${q.agentName}: ${q.question}`, 'คำตอบของคุณ / Your answer', opts);
          if (disposed) return;
          if (!answer?.trim()) continue; // Esc and empty input never resolve a question.
          const saved = store.answer(q.id, session, answer);
          ctx.ui.notify(saved.value === answer.trim() ? 'บันทึกคำตอบแล้ว' : 'คำถามนี้ได้รับคำตอบจากอีกหน้าจอแล้ว', 'info');
          changed();
        }
      } finally { busy = false; controller = undefined; }
    },
    close() { disposed = true; controller?.abort(); },
  };
}
