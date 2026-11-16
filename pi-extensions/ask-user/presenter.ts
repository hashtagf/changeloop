import { questionsOf, titleOf, validateResponse, formatResponse, type Question, type Response } from './schema.ts';

const WRITE = '✎ พิมพ์คำตอบเอง / Write an answer';
const optionText = (o, i: number) => `${i + 1}. ${o.label}${o.recommended ? ' (แนะนำ)' : ''}${o.description ? ` — ${o.description}` : ''}`;

/** Native select/input walk for RPC hosts and tests. Any Esc returns undefined (record stays pending). */
export async function walkQuestions(ctx, record, opts): Promise<Response | undefined> {
  const questions: Question[] = questionsOf(record), answers = [];
  for (const [i, q] of questions.entries()) {
    const prefix = `${record.agentName}${questions.length > 1 ? ` (${i + 1}/${questions.length})` : ''}: ${q.header ? `[${q.header}] ` : ''}${q.question}`;
    const previews = q.options.filter(o => o.preview).map(o => `\n[${o.label}]\n${o.preview.slice(0, 600)}`).join('');
    if (!q.options.length) {
      const text = await ctx.ui.input(prefix, 'คำตอบของคุณ / Your answer', opts);
      if (!text?.trim()) return undefined;
      answers.push({ questionIndex: i, kind: 'custom', answer: text });
    } else if (q.multiSelect) {
      const text = await ctx.ui.input(`${prefix}\n${q.options.map(optionText).join('\n')}${previews}\nพิมพ์เลขคั่นด้วย , และเพิ่มข้อความหลัง ; ได้ (เช่น 1,3; อื่น ๆ)`, '1,3', opts);
      if (!text?.trim()) return undefined;
      const [nums, ...rest] = /^[\d\s,]*(;|$)/.test(text) ? text.split(';') : ['', text];
      const selected: number[] = [...new Set<number>(nums.split(',').map(n => n.trim()).filter(Boolean).map(Number))];
      if (selected.some(n => !q.options[n - 1])) { ctx.ui.notify(`ไม่มีตัวเลือก ${selected.filter(n => !q.options[n - 1]).join(', ')}`, 'warning'); return undefined; }
      answers.push({ questionIndex: i, selected: selected.map(n => q.options[n - 1].label), answer: rest.join(';').trim() || null });
    } else {
      const labels = q.options.map(optionText);
      const choice = await ctx.ui.select(prefix + previews, [...labels, WRITE], opts);
      if (choice === undefined) return undefined;
      if (choice === WRITE) {
        const text = await ctx.ui.input(q.question, 'คำตอบของคุณ / Your answer', opts);
        if (!text?.trim()) return undefined; // Esc and empty input never resolve a question.
        answers.push({ questionIndex: i, kind: 'custom', answer: text });
      } else answers.push({ questionIndex: i, kind: 'option', answer: q.options[labels.indexOf(choice)].label });
    }
  }
  return validateResponse(questions, { answers });
}

export function createQuestionPresenter(store, session: string, changed = () => {}) {
  let busy = false, disposed = false, controller: AbortController | undefined;
  let active: { id: string; cancel: () => void; save?: () => void; dismissed?: boolean } | undefined;

  async function ask(ctx, q): Promise<Response | undefined> {
    if (ctx.mode === 'tui' && typeof ctx.ui.custom === 'function') {
      const { createQuestionnaire, restoreDraft, serializeDraft } = await import('./dialog.ts');
      // Drafts survive Esc, /reload and restarts; they are never treated as answers.
      const draft = restoreDraft(questionsOf(q), store.draft(q.id, session));
      let component, saved = false;
      const save = () => {
        if (saved || active?.dismissed) return;
        saved = true; component?.flush();
        try { store.saveDraft(q.id, session, serializeDraft(draft)); } catch {}
      };
      const result = await ctx.ui.custom((tui, theme, keybindings, done) => {
        active = { id: q.id, cancel: () => done(undefined), save };
        component = createQuestionnaire({ tui, theme, keybindings, record: q, draft, done });
        return component;
      }, { blocked: { kind: 'question', message: titleOf(q).slice(0, 200) } });
      if (!result?.response) save();
      return result?.response;
    }
    const local = new AbortController();
    active = { id: q.id, cancel: () => local.abort() };
    controller?.signal.addEventListener('abort', () => local.abort(), { once: true });
    return walkQuestions(ctx, q, { signal: local.signal });
  }

  return {
    async show(ctx) {
      if (busy || disposed) return;
      busy = true; controller = new AbortController();
      const opts = { signal: controller.signal };
      let direct = ctx.mode === 'tui' && typeof ctx.ui.custom === 'function';
      try {
        while (!disposed) {
          const pending = store.pending(session);
          if (!pending.length) { ctx.ui.notify('ตอบคำถามครบแล้ว · No pending questions', 'info'); return; }
          let q;
          if (direct && pending.length === 1) q = pending[0];
          else {
            const labels = pending.map((p, i) => `${i + 1}. ${p.agentName}: ${titleOf(p)}`);
            const selected = await ctx.ui.select(`รอคำตอบ · ${pending.length} · Esc = พักไว้`, labels, opts);
            if (disposed || selected === undefined) return;
            q = pending[labels.indexOf(selected)];
            if (!q) return;
          }
          const response = await ask(ctx, q);
          const dismissed = active?.dismissed; active = undefined;
          if (disposed) return;
          if (dismissed) { store.clearDraft(q.id, session); ctx.ui.notify('คำถามนี้ได้รับคำตอบจากที่อื่นแล้ว', 'info'); continue; }
          if (!response) { if (direct && pending.length === 1) return; direct = false; continue; }
          const saved = store.answer(q.id, session, response);
          ctx.ui.notify(saved.value === formatResponse(questionsOf(q), response) ? 'บันทึกคำตอบแล้ว' : 'คำถามนี้ได้รับคำตอบจากอีกหน้าจอแล้ว', 'info');
          changed();
        }
      } finally { busy = false; controller = undefined; active = undefined; }
    },
    /** Close the open dialog when its question was answered elsewhere (another UI or the event bus). */
    dismiss(id: string) { if (active?.id === id) { active.dismissed = true; active.cancel(); } },
    get activeId() { return active?.id; },
    // Save synchronously: shutdown does not wait for the dialog promise to settle.
    close() { disposed = true; active?.save?.(); controller?.abort(); active?.cancel(); },
  };
}
