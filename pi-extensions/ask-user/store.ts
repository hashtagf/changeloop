import fs from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { normalizeQuestions, questionsOf, summaryOf, validateResponse, responseFromText, formatResponse } from './schema.ts';

export const defaultRoot = () => process.env.PI_QUESTIONS_ROOT || join(homedir(), '.pi', 'agent', 'user-questions');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const validId = (id: string) => { if (!/^[a-f0-9]{64}$/.test(id)) throw new Error('Invalid question ID'); return id; };
const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const exists = (file: string) => fs.existsSync(file);
function putOnce(file: string, value: unknown) {
  fs.mkdirSync(join(file, '..'), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(value), { mode: 0o600 });
    // Atomic first writer wins, including replies from two open UIs.
    try { fs.linkSync(tmp, file); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  } finally { fs.rmSync(tmp, { force: true }); }
  return read(file);
}
export function createQuestionStore(root = defaultRoot()) {
  const record = (id: string) => join(root, 'records', validId(id) + '.json');
  const answerFile = (id: string) => join(root, 'answers', validId(id) + '.json');
  const pendingDir = (session: string) => join(root, 'pending', hash(session));
  const outboxDir = (session: string) => join(root, 'outbox', hash(session));
  const files = (dir: string) => { try { return fs.readdirSync(dir).filter(n => /^[a-f0-9]{64}\.json$/.test(n)); } catch (error) { if (error.code === 'ENOENT') return []; throw error; } };
  const draftFile = (session: string, id: string) => join(root, 'drafts', hash(session), validId(id) + '.json');
  const removePending = q => {
    for (const session of new Set([q.sessionId, q.recipientSessionId])) {
      fs.rmSync(join(pendingDir(session), q.id + '.json'), { force: true });
      fs.rmSync(draftFile(session, q.id), { force: true });
    }
  };
  return {
    ask({ sessionId, recipientSessionId = sessionId, agentName = 'Pi', key, ...input }) {
      if (![sessionId, recipientSessionId, key].every(v => typeof v === 'string' && v.trim())) throw new Error('Question, key and session identity are required');
      if (key.length > 120) throw new Error('Invalid question or options: key is longer than 120 characters');
      let questions;
      try { questions = normalizeQuestions(input); } catch (error) { throw new Error(`Invalid question or options: ${error.message}`); }
      const id = hash(sessionId + '\0' + key);
      // Legacy fields stay populated so older readers can still present the record.
      const question = summaryOf(questions), options = questions.length === 1 ? questions[0].options.map(o => o.label) : [];
      const q = putOnce(record(id), { id, sessionId, recipientSessionId, agentName, key, question, options, questions, createdAt: Date.now() });
      const same = q.questions ? JSON.stringify(q.questions) === JSON.stringify(questions)
        : q.question === question && JSON.stringify(q.options) === JSON.stringify(options) && JSON.stringify(questionsOf(q)) === JSON.stringify(questions);
      if (!same) throw new Error('This question key already exists with different content. Reuse it unchanged or use a new key.');
      const answer = exists(answerFile(id)) ? read(answerFile(id)) : undefined;
      if (!answer) for (const session of new Set([q.sessionId, q.recipientSessionId])) putOnce(join(pendingDir(session), id + '.json'), q);
      return { ...q, status: answer ? 'answered' : 'pending', answer: answer?.value, response: answer?.response };
    },
    pending(session: string) {
      return files(pendingDir(session)).flatMap(name => {
        let q;
        try { q = read(join(pendingDir(session), name)); }
        catch (error) { if (error.code === 'ENOENT') return []; throw error; }
        if (exists(answerFile(q.id))) { removePending(q); return []; }
        return [q];
      }).sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
    },
    hasPending(session: string) { return files(pendingDir(session)).length > 0; },
    /** Unsent dialog drafts; never an answer. Last write wins, removed when the question is answered. */
    draft(id: string, session: string) {
      try { return read(draftFile(session, id)); } catch (error) { if (error.code === 'ENOENT' || error instanceof SyntaxError) return undefined; throw error; }
    },
    saveDraft(id: string, session: string, value) {
      if (exists(answerFile(id))) return;
      const file = draftFile(session, id), tmp = `${file}.${randomUUID()}.tmp`;
      fs.mkdirSync(join(file, '..'), { recursive: true, mode: 0o700 });
      try { fs.writeFileSync(tmp, JSON.stringify(value), { mode: 0o600 }); fs.renameSync(tmp, file); } finally { fs.rmSync(tmp, { force: true }); }
      if (exists(answerFile(id))) fs.rmSync(file, { force: true }); // answered concurrently
    },
    clearDraft(id: string, session: string) { fs.rmSync(draftFile(session, id), { force: true }); },
    get(id: string) { try { return read(record(id)); } catch (error) { if (error.code === 'ENOENT') return undefined; throw error; } },
    answered(id: string) { return exists(answerFile(id)) ? read(answerFile(id)) : undefined; },
    /** value: plain text (legacy, resolves the whole record) or a structured response. */
    answer(id: string, session: string, value) {
      const q = read(record(id));
      if (![q.sessionId, q.recipientSessionId].includes(session)) throw new Error('Question belongs to another session');
      const questions = questionsOf(q);
      let response;
      if (typeof value === 'string') {
        if (!value.trim() || value.length > 20000) throw new Error('Enter a non-empty answer (maximum 20,000 characters)');
        response = responseFromText(questions, value);
      } else response = validateResponse(questions, value);
      const text = formatResponse(questions, response);
      // Create the durable delivery pointer before committing the answer. A crash
      // between these writes leaves an ignored pointer, never a lost answer.
      putOnce(join(outboxDir(q.sessionId), id + '.json'), { id });
      const answer = putOnce(answerFile(id), { id, value: text, response, answeredBy: session, answeredAt: Date.now() });
      removePending(q);
      return answer;
    },
    deliveries(session: string) {
      return files(outboxDir(session)).flatMap(name => {
        const id = name.slice(0, -5);
        return exists(answerFile(id)) ? [{ ...read(record(id)), answer: read(answerFile(id)) }] : [];
      });
    },
    delivered(session: string, id: string) {
      const q = read(record(id));
      if (q.sessionId !== session) throw new Error('Answer belongs to another session');
      fs.rmSync(join(outboxDir(session), validId(id) + '.json'), { force: true });
    },
  };
}
