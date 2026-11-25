// /btw <question>: a quick side question answered from the current
// conversation, like Claude Code's /btw. The current model answers without
// tools; the answer shows in a dismissible overlay and is never written to the
// session, so the main agent neither sees it nor spends context on it. Pi runs
// extension commands immediately while the agent streams, so it works mid-task.
import type { ExtensionAPI, ExtensionCommandContext } from '@earendil-works/pi-coding-agent';
import { getMarkdownTheme } from '@earendil-works/pi-coding-agent';
import { Markdown, matchesKey, wrapTextWithAnsi } from '@earendil-works/pi-tui';
import { answerOf, buildRequest } from './context.ts';

export const USAGE = 'Usage: /btw <question>';
export const NO_MODEL = 'Select a model first (/model), then ask /btw again.';

type State = { kind: 'loading' } | { kind: 'answer'; text: string } | { kind: 'error'; text: string };

/** Answers one side question. Resolves to the answer, or throws the failure; aborts quietly through `signal`. */
export async function ask(ctx: Pick<ExtensionCommandContext, 'model' | 'modelRegistry' | 'sessionManager'>, question: string, signal?: AbortSignal) {
  const request = buildRequest(ctx.sessionManager.buildContextEntries(), question);
  // streamSimple is the provider-neutral route: it serves providers that
  // implement only streamSimple and routes virtual models such as `auto`.
  const message = await ctx.modelRegistry.streamSimple(ctx.model, request, { signal }).result();
  return answerOf(message);
}

/** Overlay panel: loading, answer (scrollable markdown) or error. Esc closes; while loading it cancels. */
export function createPanel(question: string, tui: any, theme: any, onClose: (cancelled: boolean) => void) {
  let state: State = { kind: 'loading' };
  let offset = 0;
  let bodyLines: string[] = [];
  const color = (name: string, s: string) => (theme?.fg ? theme.fg(name, s) : s);
  const bold = (s: string) => (theme?.bold ? theme.bold(s) : s);
  const viewHeight = () => Math.max(3, Math.floor((tui?.terminal?.rows || 24) * 0.7) - 6);

  const body = (width: number): string[] => {
    const inner = Math.max(10, width - 2);
    if (state.kind === 'loading') return [' ' + color('dim', 'Thinking… (Esc to cancel)')];
    if (state.kind === 'error') return wrapTextWithAnsi(color('error', `btw failed: ${state.text}`), inner).map(l => ' ' + l);
    try {
      return new Markdown(state.text, 1, 0, getMarkdownTheme()).render(width);
    } catch {
      return state.text.split('\n').flatMap(line => wrapTextWithAnsi(line, inner)).map(l => ' ' + l);
    }
  };

  return {
    get state() { return state; },
    setState(next: State) { state = next; offset = 0; tui?.requestRender?.(); },
    render(width: number) {
      const rule = color('accent', '─'.repeat(Math.max(1, width)));
      bodyLines = body(width);
      const height = viewHeight();
      offset = Math.min(offset, Math.max(0, bodyLines.length - height));
      const visible = bodyLines.slice(offset, offset + height);
      const more = bodyLines.length > height;
      const hint = state.kind === 'loading' ? 'Esc cancel'
        : `${more ? `↑↓ scroll ${offset + 1}-${offset + visible.length}/${bodyLines.length} · ` : ''}Esc/Enter close · not saved to the session`;
      const title = wrapTextWithAnsi(bold(color('accent', 'btw: ')) + question, Math.max(10, width - 2)).map(l => ' ' + l);
      return [rule, ...title, '', ...visible, ' ' + color('dim', hint), rule];
    },
    invalidate() {},
    handleInput(data: string) {
      if (matchesKey(data, 'escape') || (state.kind !== 'loading' && (matchesKey(data, 'enter') || data === 'q'))) {
        onClose(state.kind === 'loading');
        return;
      }
      const height = viewHeight();
      const max = Math.max(0, bodyLines.length - height);
      if (matchesKey(data, 'up')) offset = Math.max(0, offset - 1);
      else if (matchesKey(data, 'down')) offset = Math.min(max, offset + 1);
      else if (matchesKey(data, 'pageUp')) offset = Math.max(0, offset - height);
      else if (matchesKey(data, 'pageDown')) offset = Math.min(max, offset + height);
      else return;
      tui?.requestRender?.();
    },
  };
}

export default function btw(pi: ExtensionAPI) {
  pi.registerCommand('btw', {
    description: 'Ask a quick side question about this conversation; the answer is not added to the session',
    handler: async (args, ctx) => {
      const question = (args || '').trim();
      if (!question) { ctx.ui.notify(USAGE, 'warning'); return; }
      if (!ctx.model) { ctx.ui.notify(NO_MODEL, 'warning'); return; }
      // Its own signal: cancelling the side question never touches the main run.
      const controller = new AbortController();
      const answer = ask(ctx, question, controller.signal);

      if (!ctx.hasUI || ctx.mode !== 'tui') {
        try { ctx.ui.notify(await answer, 'info'); }
        catch (error) { if (!controller.signal.aborted) ctx.ui.notify(`btw failed: ${error?.message || error}`, 'error'); }
        return;
      }

      await ctx.ui.custom<void>((tui, theme, _keybindings, done) => {
        const panel = createPanel(question, tui, theme, cancelled => {
          if (cancelled) controller.abort();
          done(undefined);
        });
        answer.then(
          text => { if (!controller.signal.aborted) panel.setState({ kind: 'answer', text }); },
          error => { if (!controller.signal.aborted) panel.setState({ kind: 'error', text: String(error?.message || error) }); },
        );
        return panel;
      }, { overlay: true, overlayOptions: { anchor: 'center', width: '80%', maxHeight: '80%' } });
    },
  });
}
