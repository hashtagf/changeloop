// Names each Pi session after its work so terminal tabs (Orca's titlebar shows
// the session name) can be told apart. The first user prompt names an unnamed
// session; the agent can then keep the name current with `session_title`.
// A name the user set with /name is never replaced.
import { Type } from 'typebox';

export const MAX_AUTO = 48, MAX_TITLE = 60;
const ENTRY = 'session-title-auto';
const guidance = 'Terminal tabs show this session\'s name. When your main task changes (not for small steps), call session_title with a short 2-6 word label of the current work, in the user\'s language. It never overrides a name the user set.';

const graphemes = (text: string) => [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(s => s.segment);

/** First meaningful line of a prompt, or undefined for commands and text without letters or digits. */
export function titleFromPrompt(prompt: unknown): string | undefined {
  if (typeof prompt !== 'string') return undefined;
  const line = prompt.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).find(Boolean);
  if (!line || line.startsWith('/') || !/[\p{L}\p{N}]/u.test(line)) return undefined;
  const parts = graphemes(line);
  return parts.length <= MAX_AUTO ? line : parts.slice(0, MAX_AUTO - 1).join('').trimEnd() + '…';
}

export function normalizeTitle(title: unknown): string {
  const value = typeof title === 'string' ? title.replace(/\s+/g, ' ').trim() : '';
  if (!value || graphemes(value).length > MAX_TITLE) throw new Error(`title must be 1-${MAX_TITLE} characters`);
  return value;
}

export default function sessionTitle(pi) {
  // The name this extension last set; any other non-empty name came from the user.
  let autoName: string | undefined;
  const current = () => pi.getSessionName?.() || undefined;
  const isAuto = () => !current() || current() === autoName;
  const apply = (name: string) => {
    autoName = name;
    pi.setSessionName(name);
    pi.appendEntry(ENTRY, { name }); // remembers ownership across /reload and resume
  };

  pi.on('session_start', (_event, ctx) => {
    autoName = undefined;
    for (const entry of ctx.sessionManager.getEntries?.() || []) {
      if (entry.type === 'custom' && entry.customType === ENTRY && typeof entry.data?.name === 'string') autoName = entry.data.name;
    }
  });

  pi.on('before_agent_start', event => {
    if (!current()) {
      const name = titleFromPrompt('prompt' in event ? event.prompt : undefined);
      if (name) apply(name);
    }
    return { systemPrompt: `${event.systemPrompt}\n\n${guidance}` };
  });

  pi.registerTool({
    name: 'session_title', label: 'Session title',
    description: `Set the short label shown in this session's terminal tab (1-${MAX_TITLE} characters). Call it when the main task changes. Refused when the user named the session with /name.`,
    parameters: Type.Object({ title: Type.String({ minLength: 1, maxLength: MAX_TITLE, description: '2-6 words naming the current work' }) }),
    async execute(_id, params) {
      const title = normalizeTitle(params.title);
      if (!isAuto()) {
        return { content: [{ type: 'text', text: `Not changed: the user named this session "${current()}" with /name.` }], details: { changed: false, name: current() } };
      }
      if (title !== current()) apply(title);
      return { content: [{ type: 'text', text: `Session title: ${title}` }], details: { changed: true, name: title } };
    },
  });
}
