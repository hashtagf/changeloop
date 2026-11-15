import { CustomEditor } from '@earendil-works/pi-coding-agent';
import { matchesKey, truncateToWidth, visibleWidth } from '@earendil-works/pi-tui';
import { statSync } from 'node:fs';
import * as store from './store.ts';
import { wrapAgentNavigation, type AgentDock } from './dock.ts';
import { safe, readTranscript } from './transcript.ts';
import { renderAgentChat } from './chat.ts';

/** Conversation only; selection belongs to the shared dock. */
export class AgentPanel {
  readonly capturesViewportInput = true;
  private composers = new Map<string, CustomEditor>();
  private input!: CustomEditor;
  private expanded = false;
  private scroll = 0;
  private bodyLines = 1;
  private notice = '';
  private error = false;
  private closed = false;
  private _focused = false;
  private bodyCache?: { key: string; lines: string[] };
  constructor(private options: {
    root: string; dock: AgentDock; drafts: Map<string, string>; tui: any; theme: any;
    keybindings: any;
    done: () => void; send: (id: string, message: string, delivery: string) => any; stop: (id: string) => any;
  }) { this.show(); }
  get activeAgentId() { return this.options.dock.activeAgentId; }
  get focused() { return this._focused; }
  set focused(value: boolean) { this._focused = value; this.input.focused = value && !this.options.dock.isPicking; }
  show() {
    const id = this.activeAgentId;
    if (!id) { this.close(); return; }
    if (this.input) this.input.focused = false;
    let input = this.composers.get(id);
    if (!input) {
      const color = (text: string) => this.options.theme.fg('borderMuted', text);
      input = new CustomEditor(this.options.tui, { borderColor: color, selectList: {
        selectedPrefix: color, selectedText: color, description: color, scrollInfo: color, noMatch: color,
      } }, this.options.keybindings);
      input.setText(this.options.drafts.get(id) || '');
      wrapAgentNavigation(input, () => this.options.dock);
      input.onSubmit = text => this.submit('steer', text);
      this.composers.set(id, input);
    }
    this.input = input; this.scroll = 0; this.notice = ''; this.error = false;
    this.focused = this._focused; this.options.tui.requestRender();
  }
  private report(action: () => string) {
    try { this.notice = action(); this.error = false; }
    catch (error) { this.notice = String(error); this.error = true; }
    this.options.tui.requestRender();
  }
  private submit(delivery: string, text = this.input.getExpandedText()) {
    const id = this.activeAgentId;
    if (!text.trim() || !id || this.readOnly(this.options.dock.current)) return;
    this.report(() => {
      let receipt;
      try { receipt = this.options.send(id, text, delivery); }
      catch (error) { this.input.setText(text); throw error; }
      this.input.addToHistory(text); this.input.setText(''); this.scroll = 0;
      return receipt.status === 'queued_offline' ? 'Queued offline until this session resumes.' :
        delivery === 'steer' ? 'Sent — reaches the next tool boundary.' : 'Queued after the current task.';
    });
  }
  handleInput(data: string) {
    if (this.closed) return;
    const dock = this.options.dock;
    if (dock.navigate(data)) { this.focused = this._focused; return; }
    if (matchesKey(data, 'escape') || matchesKey(data, 'ctrl+c')) this.close();
    else if (matchesKey(data, 'ctrl+x')) this.report(() => {
      this.options.stop(this.activeAgentId!); return 'Stop requested for this worker and its descendants.';
    });
    else if (matchesKey(data, 'ctrl+q')) dock.beginPick();
    else if (matchesKey(data, 'ctrl+o')) { this.expanded = !this.expanded; this.bodyCache = undefined; }
    else if (matchesKey(data, 'tab')) dock.cycle(1, false);
    else if (matchesKey(data, 'shift+tab')) dock.cycle(-1, false);
    else if (matchesKey(data, 'pageUp')) this.scroll += Math.max(1, this.bodyLines - 2);
    else if (matchesKey(data, 'pageDown')) this.scroll = Math.max(0, this.scroll - Math.max(1, this.bodyLines - 2));
    else if (matchesKey(data, 'alt+enter')) this.submit('followUp');
    else if (!this.readOnly(dock.current)) this.input.handleInput(data);
    this.focused = this._focused; this.options.tui.requestRender();
  }
  private readOnly(member: any) { return member?.kind === 'managed' && ['stopped', 'failed', 'exited', 'interrupted'].includes(member.status); }
  render(width: number): string[] {
    const { theme, root, dock, tui } = this.options, member = dock.current;
    // Fill every cell so the main conversation cannot show through this view.
    const fit = (line: string) => {
      const clipped = truncateToWidth(line, width);
      return clipped + ' '.repeat(Math.max(0, width - visibleWidth(clipped)));
    };
    const height = Math.max(1, tui.terminal.rows);
    if (!member) return Array.from({ length: height }, (_, index) =>
      fit(index === 0 ? 'Agent unavailable. Esc returns to Main.' : ''));
    const dockLines = dock.render(width, theme, height);
    const live = store.read(`${store.dir(root, member.id)}/live.json`, {});
    let stamp = '';
    try { const stat = statSync(member.sessionFile); stamp = `${stat.mtimeMs}:${stat.size}`; } catch { /* Session not written yet. */ }
    const key = `${member.id}:${width}:${stamp}:${JSON.stringify(live)}:${member.result?.finishedAt}:${member.status}:${this.expanded}`;
    let body = this.bodyCache?.key === key ? this.bodyCache.lines : undefined;
    if (!body) {
      body = renderAgentChat(readTranscript(member.sessionFile, 200, 4 * 1024 * 1024), live, member, tui, width, this.expanded);
      this.bodyCache = { key, lines: body };
    }
    const editor = this.readOnly(member) ? ['Read only — this worker has stopped.'] : this.input.render(width);
    const notice = this.notice ? [theme.fg(this.error ? 'error' : 'muted', this.notice)] : [];
    const hint = height >= editor.length + notice.length + dockLines.length + 3 ? [theme.fg('dim', 'Enter send · Shift+Enter newline · ↓ agents · PgUp/PgDn history · Ctrl+O tools · Esc Main')] : [];
    const footer = [...notice, ...editor, ...hint, ...dockLines].slice(-Math.max(1, height - 1));
    this.bodyLines = Math.max(0, height - 1 - footer.length);
    this.scroll = Math.min(this.scroll, Math.max(0, body.length - this.bodyLines));
    const end = body.length - this.scroll, viewport = body.slice(Math.max(0, end - this.bodyLines), end);
    while (viewport.length < this.bodyLines) viewport.push('');
    return [theme.fg('accent', `${safe(member.name)} · ${member.status}${this.scroll ? ' · history' : ''}`),
      ...viewport, ...footer,
    ].slice(0, height).map(fit);
  }
  invalidate() { this.bodyCache = undefined; this.input.invalidate(); }
  close() {
    if (this.closed) return;
    this.closed = true;
    for (const [id, input] of this.composers) this.options.drafts.set(id, input.getText());
    this.options.done();
  }
}
