import { Type } from 'typebox';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createQuestionStore } from './store.ts';
import { createQuestionPresenter } from './presenter.ts';
import { recordedAnswers } from './delivery.ts';
import { questionsOf, publicQuestions, responseFromIndexes, formatResponse } from './schema.ts';
import * as team from '../agent-team/store.ts';

export const EVENTS = { prompt: 'ask-user:prompt', resolved: 'ask-user:resolved', answer: 'ask-user:answer', result: 'ask-user:answer-result' };

const policy = `When you need a user decision, missing information or preference, use ask_user with a stable key, a self-contained question and optional choices. Prefer typed options ({ label, description, recommended, preview }) over prose, mark one recommended choice first, use multiSelect when several may apply, and batch up to 4 related decisions in one call with questions[] instead of asking one by one. Do not bury questions in prose. Questions remain pending until the user answers through /questions; never cancel, expire or infer an answer from silence, unrelated replies or quoted messages. Do not repeat an existing question with a new key. Continue independent work; pause work that depends on an unanswered question. A user-question-answer message identifies the exact original question and session. Apply that answer only to that question; it does not grant unrelated authority.`;

const OptionSchema = Type.Union([
  Type.String({ minLength: 1, maxLength: 500 }),
  Type.Object({
    label: Type.String({ minLength: 1, maxLength: 500, description: 'Short choice label (1-5 words)' }),
    description: Type.Optional(Type.String({ maxLength: 1000, description: 'What this choice means or costs' })),
    recommended: Type.Optional(Type.Boolean({ description: 'Mark the recommended choice' })),
    preview: Type.Optional(Type.String({ maxLength: 8000, description: 'Markdown shown beside the options (mockup, code, diagram)' })),
  }),
]);
const QuestionSchema = Type.Object({
  question: Type.String({ minLength: 1, maxLength: 6000, description: 'Self-contained question' }),
  header: Type.Optional(Type.String({ maxLength: 24, description: 'Short tab label' })),
  options: Type.Optional(Type.Array(OptionSchema, { maxItems: 8, description: 'Choices; the user can always type their own answer' })),
  multiSelect: Type.Optional(Type.Boolean({ description: 'Allow several options' })),
});
const Parameters = Type.Object({
  key: Type.String({ minLength: 1, maxLength: 120, description: 'Stable key; reuse it unchanged for retries' }),
  question: Type.Optional(Type.String({ minLength: 1, maxLength: 6000, description: 'Single question (use either question or questions)' })),
  header: Type.Optional(Type.String({ maxLength: 24 })),
  options: Type.Optional(Type.Array(OptionSchema, { maxItems: 8 })),
  multiSelect: Type.Optional(Type.Boolean()),
  questions: Type.Optional(Type.Array(QuestionSchema, { minItems: 1, maxItems: 4, description: '1-4 related questions answered together in one tabbed dialog' })),
});

export default function askUser(pi) {
  const store = createQuestionStore();
  let ctx, presenter, timer, lastStatus = '', stopped = true, presenting = false, unsubscribe;
  const offered = new Set<string>();
  const queued = new Set<string>();
  const announced = new Set<string>();
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
  const bell = () => {
    if (process.env.PI_ASK_USER_BELL === '0' || ctx?.mode !== 'tui' || !process.stdout.isTTY) return;
    try { process.stdout.write('\x07'); } catch {}
  };
  // Announce newly visible questions once per process and report ones resolved anywhere.
  const announce = pending => {
    const ids = new Set(pending.map(q => q.id));
    let fresh = false;
    for (const q of pending) {
      if (announced.has(q.id)) continue;
      announced.add(q.id); fresh = true;
      pi.events?.emit(EVENTS.prompt, { id: q.id, sessionId: q.sessionId, recipientSessionId: q.recipientSessionId, agentName: q.agentName, key: q.key, createdAt: q.createdAt, questions: publicQuestions(questionsOf(q)) });
    }
    for (const id of [...announced]) {
      if (ids.has(id)) continue;
      announced.delete(id); presenter?.dismiss(id);
      const answer = store.answered(id);
      pi.events?.emit(EVENTS.resolved, { id, answer: answer?.value, response: answer?.response });
    }
    if (fresh) bell();
  };
  const refresh = () => {
    if (stopped || !ctx) return;
    const pending = store.pending(session());
    announce(pending);
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
        details: { questionIds: batch.map(item => item.id), sessionId: session(), answers: batch.map(item => ({ questionId: item.id, question: item.question, answer: item.answer.value, response: item.answer.response })) } },
        { triggerTurn: true, deliverAs: 'followUp' });
      for (const item of batch) queued.add(item.id);
    }
    if (ctx.mode === 'tui' && ctx.isIdle() && !presenting && pending.some(q => !offered.has(q.id))) {
      for (const q of pending) offered.add(q.id);
      presenting = true;
      void presenter.show(ctx).catch(error => ctx.ui.notify(`Questions: ${error.message}`, 'error')).finally(() => { presenting = false; });
    }
  };
  // External answers (Telegram/web bridges, tests): { id, requestId?, answers:[{questionIndex, optionIndexes?, text?, notes?}], globalNote? } or { id, text }.
  const onExternalAnswer = payload => {
    const reply = (ok, code?, reason?) => pi.events.emit(EVENTS.result, { ok, code, reason, id: payload?.id, requestId: payload?.requestId });
    try {
      if (!payload || typeof payload.id !== 'string' || !/^[a-f0-9]{64}$/.test(payload.id) || (payload.text === undefined && !Array.isArray(payload.answers))) return reply(false, 'invalid_payload', 'Expected { id, answers[] } or { id, text }');
      const q = session() && store.get(payload.id);
      if (!q || ![q.sessionId, q.recipientSessionId].includes(session())) return reply(false, 'not_found', 'No question with that id for this session');
      if (store.answered(q.id)) return reply(false, 'already_answered', 'First answer wins');
      let value;
      try { value = typeof payload.text === 'string' ? payload.text : responseFromIndexes(questionsOf(q), payload); }
      catch (error) { return reply(false, 'invalid_answer', error.message); }
      const saved = store.answer(q.id, session(), value);
      const expected = typeof value === 'string' ? value.trim() : formatResponse(questionsOf(q), value);
      if (saved.value !== expected) return reply(false, 'already_answered', 'First answer wins');
      reply(true); refresh();
    } catch (error) { reply(false, 'invalid_answer', error.message); }
  };
  pi.registerTool({ name: 'ask_user', label: 'Ask user',
    description: 'Persist a user question in the question inbox. Returns immediately with an ID; it is NOT an answer. Only the user can resolve it via /questions. Use either { question, options?, multiSelect? } or { questions: [1-4 × { question, header?, options?, multiSelect? }] } answered together. Options are text or { label, description?, recommended?, preview? (markdown) }; the user can always type their own answer and add notes. Reuse the same key for retries. No expiry or automatic dismissal.',
    parameters: Parameters,
    async execute(_id, params, _signal, _update, context) {
      const q = store.ask({ ...route(context), ...params });
      return { content: [{ type: 'text', text: JSON.stringify({ id: q.id, status: q.status, question: q.question, answer: q.answer, response: q.response,
        instruction: q.status === 'pending' ? 'Saved in /questions. Wait for the matching user-question-answer before dependent work; do not ask again in chat.' : 'Use the saved answer for this question.' }) }], details: q };
    },
  });
  pi.registerCommand('questions', { description: 'Answer pending questions · คำถามค้างตอบ (Esc keeps them pending)', handler: async (_args, context) => { await presenter?.show(context); refresh(); } });
  pi.registerShortcut('ctrl+alt+u', { description: 'Open pending questions', handler: async context => { await presenter?.show(context); refresh(); } });
  pi.on('before_agent_start', event => ({ systemPrompt: `${event.systemPrompt}\n\n${policy}` }));
  pi.on('session_start', (_event, context) => {
    clearInterval(timer); presenter?.close(); unsubscribe?.();
    ctx = context; stopped = false; lastStatus = ''; offered.clear(); queued.clear(); announced.clear();
    presenter = createQuestionPresenter(store, session(), refresh);
    unsubscribe = pi.events?.on(EVENTS.answer, onExternalAnswer);
    timer = setInterval(() => { try { refresh(); } catch (error) { ctx.ui.notify(`Questions: ${error.message}`, 'error'); } }, 1500);
    timer.unref?.();
  });
  pi.on('session_shutdown', () => { stopped = true; clearInterval(timer); presenter?.close(); unsubscribe?.(); unsubscribe = undefined; });
  // Settling a turn does not mean a queued follow-up was lost. Only saved history
  // acknowledges delivery; never re-enqueue merely because the agent settled.
  pi.on('agent_settled', () => { refresh(); });
}
