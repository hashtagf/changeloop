// Pure question/answer model shared by the store, dialogs and the event bus.
// Legacy records ({ question, options: string[] }) stay readable through questionsOf().

export type Option = { label: string; description?: string; recommended?: boolean; preview?: string };
export type Question = { question: string; header?: string; multiSelect: boolean; options: Option[] };
export type AnswerItem = { questionIndex: number; kind: 'option' | 'custom' | 'multi'; answer: string | null; selected?: string[]; notes?: string };
export type Response = { answers: AnswerItem[]; globalNote?: string; freeform?: string };

export const MAX_QUESTIONS = 4, MAX_OPTIONS = 8, CUSTOM_LABEL = 'Type something.';
const RESERVED = new Set([CUSTOM_LABEL.toLowerCase(), 'next']);
const text = (value, field, max, required = true) => {
  if (value === undefined && !required) return undefined;
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > max) throw new Error(`Invalid ${field}: expected ${required ? 'non-empty ' : ''}text up to ${max} characters`);
  return value.trim() || undefined;
};

function normalizeOption(option, where: string): Option {
  if (typeof option === 'string') return { label: text(option, `${where} label`, 500) };
  if (!option || typeof option !== 'object') throw new Error(`Invalid ${where}: expected text or { label, description?, recommended?, preview? }`);
  const result: Option = { label: text(option.label, `${where} label`, 500) };
  const description = text(option.description, `${where} description`, 1000, false);
  const preview = text(option.preview, `${where} preview`, 8000, false);
  if (description) result.description = description;
  if (option.recommended === true) result.recommended = true;
  if (preview) result.preview = preview;
  return result;
}

function normalizeQuestion(input, index: number): Question {
  const where = `question ${index + 1}`;
  if (!input || typeof input !== 'object') throw new Error(`Invalid ${where}`);
  const options = input.options ?? [];
  if (!Array.isArray(options) || options.length > MAX_OPTIONS) throw new Error(`Invalid ${where} options: at most ${MAX_OPTIONS}`);
  const q: Question = { question: text(input.question, where, 6000), multiSelect: input.multiSelect === true,
    options: options.map((o, i) => normalizeOption(o, `${where} option ${i + 1}`)) };
  const header = text(input.header, `${where} header`, 24, false);
  if (header) q.header = header;
  const labels = q.options.map(o => o.label.toLowerCase());
  if (labels.some(l => RESERVED.has(l))) throw new Error(`Invalid ${where} options: "${CUSTOM_LABEL}" and "Next" are reserved; the dialog appends them`);
  if (new Set(labels).size !== labels.length) throw new Error(`Invalid ${where} options: duplicate labels`);
  if (q.multiSelect && !q.options.length) throw new Error(`Invalid ${where}: multiSelect needs options`);
  if (q.options.filter(o => o.recommended).length > (q.multiSelect ? q.options.length : 1)) throw new Error(`Invalid ${where}: only one recommended option for single-select`);
  return q;
}

/** Accepts either the legacy single form or `questions: [...]` (1-4). */
export function normalizeQuestions(params): Question[] {
  const hasList = params.questions !== undefined, hasSingle = params.question !== undefined;
  if (hasList === hasSingle) throw new Error('Provide exactly one of question or questions');
  const list = hasList ? params.questions : [{ question: params.question, header: params.header, options: params.options, multiSelect: params.multiSelect }];
  if (!Array.isArray(list) || !list.length || list.length > MAX_QUESTIONS) throw new Error(`Provide 1-${MAX_QUESTIONS} questions`);
  const questions = list.map(normalizeQuestion);
  if (new Set(questions.map(q => q.question)).size !== questions.length) throw new Error('Duplicate question text');
  return questions;
}

export const questionsOf = (record): Question[] => record.questions
  || [{ question: record.question, multiSelect: false, options: (record.options || []).map(label => ({ label })) }];
export const summaryOf = (questions: Question[]) => questions.length === 1 ? questions[0].question
  : questions.map((q, i) => `${i + 1}. ${q.header ? `[${q.header}] ` : ''}${q.question}`).join('\n');
export const titleOf = (record) => {
  const qs = questionsOf(record);
  const first = qs[0].header ? `${qs[0].header}: ${qs[0].question}` : qs[0].question;
  return first.replace(/\s+/g, ' ') + (qs.length > 1 ? ` (+${qs.length - 1})` : '');
};

/** Validates a structured response; every question must be answered once. */
export function validateResponse(questions: Question[], input): Response {
  if (!input || typeof input !== 'object' || !Array.isArray(input.answers)) throw new Error('Invalid response');
  const seen = new Set<number>();
  const answers = input.answers.map(item => {
    const q = questions[item?.questionIndex];
    if (!q || seen.has(item.questionIndex)) throw new Error('Each question must be answered exactly once');
    seen.add(item.questionIndex);
    const notes = typeof item.notes === 'string' && item.notes.trim() ? item.notes.trim().slice(0, 20000) : undefined;
    const labels = q.options.map(o => o.label);
    let result: AnswerItem;
    if (q.multiSelect) {
      const selected = Array.isArray(item.selected) ? item.selected : [];
      if (selected.some(s => !labels.includes(s)) || new Set(selected).size !== selected.length) throw new Error(`Unknown option for question ${item.questionIndex + 1}`);
      const custom = typeof item.answer === 'string' && item.answer.trim() ? item.answer.trim() : null;
      if (!selected.length && !custom) throw new Error(`Question ${item.questionIndex + 1} is unanswered`);
      result = { questionIndex: item.questionIndex, kind: 'multi', answer: custom, selected: labels.filter(l => selected.includes(l)) };
    } else {
      const answer = typeof item.answer === 'string' ? item.answer.trim() : '';
      if (!answer || answer.length > 20000) throw new Error(`Question ${item.questionIndex + 1} is unanswered`);
      const kind = item.kind === 'custom' || !labels.includes(answer) ? 'custom' : 'option';
      result = { questionIndex: item.questionIndex, kind, answer };
    }
    if (notes) result.notes = notes;
    return result;
  });
  if (seen.size !== questions.length) throw new Error(`Unanswered: ${questions.map((q, i) => seen.has(i) ? '' : q.header || `Q${i + 1}`).filter(Boolean).join(', ')}`);
  const response: Response = { answers: answers.sort((a, b) => a.questionIndex - b.questionIndex) };
  if (typeof input.globalNote === 'string' && input.globalNote.trim()) response.globalNote = input.globalNote.trim().slice(0, 20000);
  return response;
}

/** Plain text answers keep legacy behaviour: one text resolves the whole record. */
export function responseFromText(questions: Question[], value: string): Response {
  const answer = value.trim();
  if (questions.length !== 1) return { answers: [], freeform: answer };
  const q = questions[0];
  if (q.multiSelect) return { answers: [{ questionIndex: 0, kind: 'multi', answer, selected: [] }] };
  return { answers: [{ questionIndex: 0, kind: q.options.some(o => o.label === answer) ? 'option' : 'custom', answer }] };
}

/** Converts an index-based external answer (event bus / RPC) into a structured response. */
export function responseFromIndexes(questions: Question[], input): Response {
  if (!input || typeof input !== 'object' || !Array.isArray(input.answers)) throw new Error('Invalid response');
  return validateResponse(questions, { globalNote: input.globalNote, answers: input.answers.map(a => {
    const q = questions[a?.questionIndex];
    if (!q) throw new Error('Question index out of range');
    const indexes = a.optionIndexes ?? [];
    if (!Array.isArray(indexes) || indexes.some(i => !Number.isInteger(i) || !q.options[i]) || new Set(indexes).size !== indexes.length) throw new Error(`Option index out of range for question ${a.questionIndex + 1}`);
    const custom = typeof a.text === 'string' && a.text.trim() ? a.text : undefined;
    if (q.multiSelect) return { questionIndex: a.questionIndex, selected: indexes.map(i => q.options[i].label), answer: custom, notes: a.notes };
    if (indexes.length + (custom ? 1 : 0) !== 1) throw new Error(`Question ${a.questionIndex + 1} needs exactly one option or text`);
    return { questionIndex: a.questionIndex, kind: custom ? 'custom' : 'option', answer: custom ?? q.options[indexes[0]].label, notes: a.notes };
  }) });
}

export function formatResponse(questions: Question[], response: Response): string {
  if (response.freeform) return response.freeform;
  const describe = (a: AnswerItem) => a.kind === 'multi' ? [...(a.selected || []), ...(a.answer ? [`(wrote) ${a.answer}`] : [])].join(', ') : a.kind === 'custom' ? `(wrote) ${a.answer}` : a.answer;
  const only = response.answers[0];
  if (questions.length === 1 && !only.notes && !response.globalNote && only.kind !== 'multi') return only.answer;
  const lines = response.answers.flatMap(a => {
    const q = questions[a.questionIndex];
    return [`${questions.length > 1 ? `${a.questionIndex + 1}. ` : ''}${q.header ? `[${q.header}] ` : ''}${q.question}`, `→ ${describe(a)}`, ...(a.notes ? [`  notes: ${a.notes}`] : [])];
  });
  if (response.globalNote) lines.push(`Global note: ${response.globalNote}`);
  return lines.join('\n');
}

/** Event payload without preview bodies, safe to forward across processes. */
export const publicQuestions = (questions: Question[]) => questions.map(q => ({ question: q.question, header: q.header, multiSelect: q.multiSelect,
  options: q.options.map(o => ({ label: o.label, description: o.description, recommended: o.recommended === true, hasPreview: !!o.preview })) }));
