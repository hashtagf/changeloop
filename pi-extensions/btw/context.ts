// Builds the side-question request for /btw from the main conversation. Pure
// functions so tests can check exactly what reaches the model.

/** Characters of conversation sent with a side question; older text is dropped first. */
export const MAX_CONTEXT_CHARS = 80_000;
export const OMITTED = '[earlier conversation omitted]';

export const SYSTEM_PROMPT = [
  'You answer a quick side question the user asked while a coding agent works on their main task.',
  'The conversation so far is given for context only. You have no tools: do not offer to run commands, edit files or take actions.',
  'Answer only from the conversation and general knowledge; say so plainly when the conversation does not contain the answer.',
  'Be brief and direct. Reply in the language of the question.',
].join('\n');

function textOf(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter(part => part && typeof part === 'object' && part.type === 'text' && typeof part.text === 'string')
    .map(part => part.text)
    .join('\n');
}

function toolCallsOf(content: unknown): string[] {
  if (!Array.isArray(content)) return [];
  return content
    .filter(part => part && typeof part === 'object' && part.type === 'toolCall' && typeof part.name === 'string')
    .map(part => `(called tool ${part.name})`);
}

/** User/assistant text and summaries from context entries, oldest first. Tool output is left out. */
export function conversationText(entries: readonly any[]): string {
  const sections: string[] = [];
  for (const entry of entries || []) {
    if (!entry || typeof entry !== 'object') continue;
    if ((entry.type === 'compaction' || entry.type === 'branch_summary') && typeof entry.summary === 'string' && entry.summary.trim()) {
      sections.push(`Summary of earlier conversation:\n${entry.summary.trim()}`);
      continue;
    }
    if (entry.type !== 'message') continue;
    const role = entry.message?.role;
    if (role !== 'user' && role !== 'assistant') continue;
    const lines: string[] = [];
    const text = textOf(entry.message.content).trim();
    if (text) lines.push(`${role === 'user' ? 'User' : 'Assistant'}: ${text}`);
    if (role === 'assistant') lines.push(...toolCallsOf(entry.message.content));
    if (lines.length) sections.push(lines.join('\n'));
  }
  return sections.join('\n\n');
}

/** Keeps the newest `max` characters, marking the cut. */
export function keepTail(text: string, max = MAX_CONTEXT_CHARS): string {
  if (text.length <= max) return text;
  const budget = Math.max(0, max - OMITTED.length - 1);
  return `${OMITTED}\n${text.slice(text.length - budget)}`;
}

/** The model context for a side question: system prompt and one user message, never tools. */
export function buildRequest(entries: readonly any[], question: string, max = MAX_CONTEXT_CHARS) {
  const conversation = keepTail(conversationText(entries), max);
  const text = conversation
    ? `<conversation>\n${conversation}\n</conversation>\n\nSide question: ${question}`
    : `Side question: ${question}`;
  return {
    systemPrompt: SYSTEM_PROMPT,
    messages: [{ role: 'user' as const, content: [{ type: 'text' as const, text }], timestamp: Date.now() }],
  };
}

/** Answer text from the final assistant message; throws the provider error when the call failed. */
export function answerOf(message: any): string {
  if (message?.stopReason === 'error') throw new Error(message.errorMessage || 'the model returned an error');
  const text = textOf(message?.content).trim();
  if (!text) throw new Error('the model returned no answer');
  return text;
}
