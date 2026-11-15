import fs from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';

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
  const removePending = q => {
    for (const session of new Set([q.sessionId, q.recipientSessionId])) fs.rmSync(join(pendingDir(session), q.id + '.json'), { force: true });
  };
  return {
    ask({ sessionId, recipientSessionId = sessionId, agentName = 'Pi', key, question, options = [] }) {
      if (![sessionId, recipientSessionId, key, question].every(v => typeof v === 'string' && v.trim())) throw new Error('Question, key and session identity are required');
      if (key.length > 120 || question.length > 6000 || !Array.isArray(options) || options.length > 8 || options.some(o => typeof o !== 'string' || !o.trim() || o.length > 500) || new Set(options).size !== options.length) throw new Error('Invalid question or options');
      const id = hash(sessionId + '\0' + key);
      const q = putOnce(record(id), { id, sessionId, recipientSessionId, agentName, key, question, options, createdAt: Date.now() });
      if (q.question !== question || JSON.stringify(q.options) !== JSON.stringify(options)) throw new Error('This question key already exists with different content. Reuse it unchanged or use a new key.');
      const answer = exists(answerFile(id)) ? read(answerFile(id)) : undefined;
      if (!answer) for (const session of new Set([q.sessionId, q.recipientSessionId])) putOnce(join(pendingDir(session), id + '.json'), q);
      return { ...q, status: answer ? 'answered' : 'pending', answer: answer?.value };
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
    answer(id: string, session: string, value: string) {
      const q = read(record(id));
      if (![q.sessionId, q.recipientSessionId].includes(session)) throw new Error('Question belongs to another session');
      if (typeof value !== 'string' || !value.trim() || value.length > 20000) throw new Error('Enter a non-empty answer (maximum 20,000 characters)');
      // Create the durable delivery pointer before committing the answer. A crash
      // between these writes leaves an ignored pointer, never a lost answer.
      putOnce(join(outboxDir(q.sessionId), id + '.json'), { id });
      const answer = putOnce(answerFile(id), { id, value: value.trim(), answeredBy: session, answeredAt: Date.now() });
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
