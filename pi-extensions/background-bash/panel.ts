import { matchesKey, truncateToWidth } from '@earendil-works/pi-tui';
import { stripVTControlCharacters } from 'node:util';

const clean = (value: unknown) => stripVTControlCharacters(String(value ?? '')).replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '');
const statusName = (job: any) => job.status === 'completed' && job.exitCode != null && job.exitCode !== 0 ? 'failed' : job.status;
export const activeJob = (job: any) => ['starting', 'running', 'stop_requested'].includes(job.status);

export class BackgroundPanel {
  readonly capturesViewportInput = true;
  focused = false;
  private all: any[] = [];
  private selected?: string;
  private history = false;
  private query = '';
  private viewing = false;
  private scroll = 0;
  private notice = '';
  private stopping?: string;
  constructor(private options: { tui: any; theme: any; log: (id: string) => string;
    stop: (id: string) => any; done: () => void; initial?: string }) {
    this.selected = options.initial; this.viewing = Boolean(options.initial);
  }
  private choices() {
    return this.all.filter(job => (this.history || activeJob(job) || this.viewing && job.id === this.selected) &&
      `${job.command} ${job.id}`.toLowerCase().includes(this.query.toLowerCase()));
  }
  update(jobs: any[]) {
    this.all = [...jobs].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
    const stopped = this.all.find(job => job.id === this.stopping);
    if (stopped && !activeJob(stopped)) { this.notice = `Job ${stopped.status}.`; this.stopping = undefined; }
    if (!this.choices().some(job => job.id === this.selected)) this.selected = this.choices()[0]?.id;
    this.options.tui.requestRender();
  }
  handleInput(data: string) {
    const items = this.choices(), index = Math.max(0, items.findIndex(job => job.id === this.selected));
    if (matchesKey(data, 'escape') || matchesKey(data, 'ctrl+c')) {
      if (this.viewing) { this.viewing = false; this.scroll = 0; this.update(this.all); }
      else this.options.done();
    } else if (matchesKey(data, 'ctrl+o')) {
      this.history = !this.history; this.viewing = false; this.scroll = 0; this.update(this.all);
    } else if (matchesKey(data, 'ctrl+x')) {
      if (this.selected && activeJob(this.all.find(job => job.id === this.selected) || {})) {
        try { this.options.stop(this.selected); this.stopping = this.selected; this.notice = 'Stop requested. Waiting for the process to exit.'; }
        catch (error) { this.notice = clean(error); }
      }
    } else if (matchesKey(data, 'enter')) { if (this.selected) { this.viewing = true; this.scroll = 0; } }
    else if (matchesKey(data, 'pageUp')) this.scroll += Math.max(1, this.options.tui.terminal.rows - 14);
    else if (matchesKey(data, 'pageDown')) this.scroll = Math.max(0, this.scroll - Math.max(1, this.options.tui.terminal.rows - 14));
    else if (matchesKey(data, 'end')) this.scroll = 0;
    else if (matchesKey(data, 'up') || matchesKey(data, 'down')) {
      if (this.viewing) this.scroll = Math.max(0, this.scroll + (matchesKey(data, 'up') ? 1 : -1));
      else { this.selected = items[Math.max(0, Math.min(items.length - 1, index + (matchesKey(data, 'up') ? -1 : 1)))]?.id; this.scroll = 0; this.notice = ''; }
    } else if (!this.viewing && matchesKey(data, 'backspace')) { this.query = this.query.slice(0, -1); this.update(this.all); }
    else if (!this.viewing && /^[^\x00-\x1f\x7f]+$/u.test(data)) { this.query += data; this.update(this.all); }
    this.options.tui.requestRender();
  }
  render(width: number) {
    const { theme, tui } = this.options, height = Math.max(5, Math.min(32, tui.terminal.rows - 10));
    const fit = (line: string) => truncateToWidth(line, width);
    const items = this.choices(), index = Math.max(0, items.findIndex(job => job.id === this.selected));
    const job = this.all.find(job => job.id === this.selected);
    const lines = [theme.fg('accent', `Background jobs · ${this.all.filter(activeJob).length} running${this.history ? ' · history' : ''}`)];
    if (!this.viewing) {
      if (this.query) lines.push(fit(`Find: ${clean(this.query)}`));
      const count = Math.min(5, Math.max(1, Math.floor((height - 4) / 2)));
      const first = Math.max(0, Math.min(index - Math.floor(count / 2), items.length - count));
      for (const item of items.slice(first, first + count)) lines.push(theme.fg(item.id === this.selected ? 'accent' : 'muted',
        fit(`${item.id === this.selected ? '›' : ' '} ${statusName(item)} · ${clean(item.command).replace(/\n/g, ' ')}`)));
    }
    if (job) {
      if (this.viewing) lines.push(fit(clean(job.command).replace(/\n/g, ' ')));
      const elapsed = Math.max(0, Math.floor(((job.finishedAt || Date.now()) - (job.startedAt || job.createdAt)) / 1000));
      lines.push(theme.fg('dim', fit(`${statusName(job)} · ${Math.floor(elapsed / 60)}m ${elapsed % 60}s${job.exitCode != null ? ' · exit ' + job.exitCode : ''}`)));
      try {
        const output = clean(this.options.log(job.id)).split('\n'), count = Math.max(1, height - lines.length - 2);
        this.scroll = Math.min(this.scroll, Math.max(0, output.length - count));
        const end = Math.max(count, output.length - this.scroll);
        lines.push(...output.slice(Math.max(0, end - count), end).map(fit));
      } catch (error) { lines.push(fit(clean(error))); }
    } else lines.push(theme.fg('muted', this.query ? 'No matching jobs.' : this.history ? 'No saved jobs.' : 'No running jobs. Ctrl+O shows history.'));
    if (this.notice) lines.splice(Math.min(lines.length, height - 2), 0, fit(this.notice));
    const help = this.viewing ? '↑↓/PgUp/PgDn log · End follow · Ctrl+X stop · Esc list' : '↑↓ choose · Enter log · type to find · Ctrl+O history · Ctrl+X stop · Esc back';
    return [...lines.slice(0, height - 1), theme.fg('dim', fit(help))].map(fit);
  }
}
