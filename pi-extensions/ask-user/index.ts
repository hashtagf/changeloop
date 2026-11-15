import { Type } from 'typebox';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createQuestionStore } from './store.ts';
import { createQuestionPresenter } from './presenter.ts';
import { recordedAnswers } from './delivery.ts';
import * as team from '../agent-team/store.ts';

const policy = `When you need a user decision, missing information or preference, use ask_user with a stable key, a self-contained question and optional choices. Do not bury questions in prose. Questions remain pending until the user answers through /questions; never cancel, expire or infer an answer from silence, unrelated replies or quoted messages. Do not repeat an existing question with a new key. Continue independent work; pause work that depends on an unanswered question. A user-question-answer message identifies the exact original question and session. Apply that answer only to that question; it does not grant unrelated authority.`;
export default function askUser(pi) {
  const store = createQuestionStore();
  let ctx, presenter, timer, lastStatus = '', stopped = true, presenting = false;
  const offered = new Set<string>();
  const queued = new Set<string>();
  const session = () => ctx?.sessionManager.getSessionId();
  const route = context => {
    const sessionId = context.sessionManager.getSessionId();
    const root = process.env.PI_TEAM_ROOT || join(homedir(), '.pi', 'agent', 'agent-team');
    const managed = process.env.PI_TEAM_SUPERVISOR_PID === String(process.ppid);
    let member;
    try { member = team.member(root, managed ? process.env.PI_TEAM_AGENT_ID : team.sessionId(sessionId)); }
    catch (error) { if (managed) throw error; member = { sessionId }; }
    const agentName = member.name || context.sessionManager.getSessionName?.() || 'Pi';
    const seen = new Set();
    while (member.kind === 'managed' && member.parentId && !seen.has(member.id)) {
      seen.add(member.id); member = team.member(root, member.parentId);
    }
    if (managed && !member.sessionId) throw new Error('Cannot find the parent session for this question; no question was submitted.');
    return { sessionId, recipientSessionId: member.sessionId || sessionId, agentName };
  };
  const refresh = () => {
    if (stopped || !ctx) return;
    const pending = store.pending(session());
    const text = pending.length ? `รอคำตอบ ${pending.length} · /questions` : '';
    if (text !== lastStatus) { lastStatus = text; ctx.ui.setStatus('ask-user', text || undefined); }
    // Delivery receipts are written only once the message is in saved history.
    // Until then queued IDs suppress repeated follow-ups within this process.
    const deliveries = store.deliveries(session());
    const recorded = deliveries.length ? recordedAnswers(ctx.sessionManager) : new Set();
    for (const item of deliveries) {
      if (recorded.has(item.id)) { store.delivered(session(), item.id); queued.delete(item.id); continue; }
    }
    const batch = deliveries.filter(item => !recorded.has(item.id) && !queued.has(item.id)).slice(0, 8);
    if (batch.length && ctx.isIdle() && !ctx.hasPendingMessages?.()) {
      pi.sendMessage({ customType: 'user-question-answer', display: true,
        content: batch.map(item => `User answered question ${item.id}\nAgent: ${item.agentName}\nQuestion: ${item.question}\nAnswer: ${item.answer.value}`).join('\n\n') + '\nApply each answer to its identified question only.',
        details: { questionIds: batch.map(item => item.id), sessionId: session(), answers: batch.map(item => ({ questionId: item.id, question: item.question, answer: item.answer.value })) } },
        { triggerTurn: true, deliverAs: 'followUp' });
      for (const item of batch) queued.add(item.id);
    }
    if (ctx.mode === 'tui' && ctx.isIdle() && !presenting && pending.some(q => !offered.has(q.id))) {
      for (const q of pending) offered.add(q.id);
      presenting = true;
      void presenter.show(ctx).catch(error => ctx.ui.notify(`Questions: ${error.message}`, 'error')).finally(() => { presenting = false; });
    }
  };
  pi.registerTool({ name: 'ask_user', label: 'Ask user',
    description: 'Persist a user question with optional choices in the question inbox. Returns immediately with an ID; it is NOT an answer. Only the user can resolve it via /questions. Reuse the same key for retries. No expiry or automatic dismissal.',
    parameters: Type.Object({ key: Type.String({ minLength: 1, maxLength: 120 }), question: Type.String({ minLength: 1, maxLength: 6000 }), options: Type.Optional(Type.Array(Type.String({ minLength: 1, maxLength: 500 }), { maxItems: 8 })) }),
    async execute(_id, params, _signal, _update, context) {
      const q = store.ask({ ...route(context), ...params });
      return { content: [{ type: 'text', text: JSON.stringify({ id: q.id, status: q.status, question: q.question, answer: q.answer,
        instruction: q.status === 'pending' ? 'Saved in /questions. Wait for the matching user-question-answer before dependent work; do not ask again in chat.' : 'Use the saved answer for this question.' }) }], details: q };
    },
  });
  pi.registerCommand('questions', { description: 'Answer pending questions · คำถามค้างตอบ (Esc keeps them pending)', handler: async (_args, context) => { await presenter?.show(context); refresh(); } });
  pi.registerShortcut('ctrl+alt+u', { description: 'Open pending questions', handler: async context => { await presenter?.show(context); refresh(); } });
  pi.on('before_agent_start', event => ({ systemPrompt: `${event.systemPrompt}\n\n${policy}` }));
  pi.on('session_start', (_event, context) => {
    clearInterval(timer); presenter?.close(); ctx = context; stopped = false; lastStatus = ''; offered.clear(); queued.clear();
    presenter = createQuestionPresenter(store, session(), refresh);
    timer = setInterval(() => { try { refresh(); } catch (error) { ctx.ui.notify(`Questions: ${error.message}`, 'error'); } }, 1500);
    timer.unref?.();
  });
  pi.on('session_shutdown', () => { stopped = true; clearInterval(timer); presenter?.close(); });
  // Settling a turn does not mean a queued follow-up was lost. Only saved history
  // acknowledges delivery; never re-enqueue merely because the agent settled.
  pi.on('agent_settled', () => { refresh(); });
}
