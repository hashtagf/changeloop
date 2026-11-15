import { matchesKey, truncateToWidth, visibleWidth } from '@earendil-works/pi-tui';
import { safe } from './transcript.ts';

/** One selection model for the editor, agent chats and the persistent bar. */
export class AgentDock {
  private members: any[] = [];
  private selected: string;
  private picker?: { id: string; query: string; all: boolean };
  constructor(private options: { self: string; changed: () => void; open: (id: string) => void;
    stop?: (id: string) => void }) { this.selected = options.self; }
  get activeAgentId() { return this.selected === this.options.self ? undefined : this.selected; }
  get current() { return this.members.find(item => item.id === this.selected); }
  get isPicking() { return !!this.picker; }
  private choices() {
    const query = this.picker?.query.toLowerCase() || '';
    return this.members.filter(item => (this.picker?.all || item.id === this.options.self ||
      item.id === this.selected || item.online || ['starting', 'stopping'].includes(item.status)) &&
      `${item.name} ${item.task || ''} ${item.id}`.toLowerCase().includes(query));
  }
  update(members: any[]) {
    const children = new Map<string, string[]>();
    for (const member of members) {
      if (!member.parentId) continue;
      const siblings = children.get(member.parentId) || [];
      siblings.push(member.id); children.set(member.parentId, siblings);
    }
    const family = new Set([this.options.self]), pending = [this.options.self];
    for (let index = 0; index < pending.length; index++) {
      for (const id of children.get(pending[index]) || []) {
        if (!family.has(id)) { family.add(id); pending.push(id); }
      }
    }
    const rank = (item: any) => item.id === this.options.self ? 0 : item.parentId === this.options.self ? 1 : 2;
    this.members = members.filter(item => family.has(item.id)).sort((a, b) => rank(a) - rank(b) || a.createdAt - b.createdAt);
    if (!family.has(this.selected)) { this.selected = this.options.self; this.options.open(this.selected); }
    if (this.picker && !family.has(this.picker.id)) this.picker.id = this.options.self;
    this.options.changed();
  }
  beginPick(all = false) {
    this.picker = { id: this.selected, query: '', all };
    this.options.changed();
  }
  navigate(data: string) {
    if (!this.picker) return false;
    const items = this.choices(), index = Math.max(0, items.findIndex(item => item.id === this.picker!.id));
    if (matchesKey(data, 'down')) this.picker.id = items[Math.min(items.length - 1, index + 1)]?.id || '';
    else if (matchesKey(data, 'up')) {
      if (index) this.picker.id = items[index - 1].id;
      else this.picker = undefined;
    } else if (matchesKey(data, 'enter')) {
      if (items[index]) this.select(items[index].id);
    } else if (matchesKey(data, 'ctrl+x')) this.options.stop?.(items[index]?.id || this.selected);
    else if (matchesKey(data, 'ctrl+o')) this.picker.all = !this.picker.all;
    else if (matchesKey(data, 'escape') || matchesKey(data, 'ctrl+c')) this.picker = undefined;
    else if (matchesKey(data, 'backspace')) this.picker.query = this.picker.query.slice(0, -1);
    else if (/^[^\x00-\x1f\x7f]+$/u.test(data)) this.picker.query += data;
    else { this.picker = undefined; this.options.changed(); return false; }
    this.options.changed(); return true;
  }
  select(id: string) {
    if (!this.members.some(item => item.id === id)) return;
    this.picker = undefined; this.selected = id;
    this.options.open(id); this.options.changed();
  }
  cycle(direction = 1, includeMain = true) {
    const items = this.choices().filter(item => includeMain || item.id !== this.options.self);
    if (!items.length) return;
    const index = items.findIndex(item => item.id === this.selected);
    this.select(items[(index + direction + items.length) % items.length].id);
  }
  home() { this.select(this.options.self); }
  render(width: number, theme: any, rows = 24): string[] {
    const items = this.choices(), fit = (line: string) => truncateToWidth(line, width);
    const name = (item: any) => item.id === this.options.self ? 'Main' : safe(item.name || item.id).replace(/\n/g, ' ');
    if (this.picker) {
      const index = Math.max(0, items.findIndex(item => item.id === this.picker!.id));
      const count = Math.max(2, Math.min(6, Math.floor(rows / 3)));
      const first = Math.max(0, Math.min(index - Math.floor(count / 2), items.length - count));
      return [theme.fg('accent', this.picker.query ? `Find: ${this.picker.query}` : 'Select agent'),
        ...items.slice(first, first + count).map((item, offset) => theme.fg(first + offset === index ? 'accent' : 'muted',
          `${first + offset === index ? '› ' : '  '}${item.id === this.selected ? `[${name(item)}]` : name(item)} · ${item.status}`)),
        ...(!items.length ? ['No matching agents.'] : []),
        theme.fg('dim', '↑↓ choose · Enter open · type to find · Ctrl+O offline · Esc cancel'),
      ].map(fit);
    }
    const index = Math.max(0, items.findIndex(item => item.id === this.selected));
    const labels = items.map(item => {
      const status = ['working', 'starting'].includes(item.status) ? ' ●' : item.status === 'idle' ? ' ○' : ` ${item.status}`;
      const label = truncateToWidth(name(item), Math.max(3, Math.min(item.id === this.selected ? 22 : 18, width - 12))) +
        (item.id === this.options.self ? '' : status);
      return item.id === this.selected ? `[${label}]` : label;
    });
    let first = index, last = index, used = visibleWidth(labels[index] || '[Main]') + 4;
    while (first > 0 && used + visibleWidth(labels[first - 1]) + 3 < width - 8) { first--; used += visibleWidth(labels[first]) + 3; }
    while (last + 1 < labels.length && used + visibleWidth(labels[last + 1]) + 3 < width - 8) { last++; used += visibleWidth(labels[last]) + 3; }
    const chips = labels.slice(first, last + 1).map((label, offset) => theme.fg(first + offset === index ? 'accent' : 'muted', label));
    return [fit(`To: ${first ? `+${first}  ` : ''}${chips.join('  ·  ')}${last + 1 < labels.length ? `  +${labels.length - last - 1}` : ''}`),
      ...(!this.activeAgentId ? [fit(theme.fg('dim', '↓ agents · Ctrl+Q next · Enter send'))] : [])];
  }
}

/** Let native multiline/history/completion handling run until Down cannot move. */
export function wrapAgentNavigation(editor: any, currentDock: () => AgentDock | undefined) {
  const original = editor.handleInput.bind(editor);
  editor.handleInput = (data: string) => {
    const dock = currentDock();
    if (dock?.navigate(data)) { editor.focused = !dock.isPicking; return; }
    editor.focused = true;
    if (dock && matchesKey(data, 'down') && !editor.isShowingAutocomplete?.()) {
      const before = editor.getCursor?.(), text = editor.getText();
      original(data);
      const after = editor.getCursor?.();
      if (editor.getText() === text && (before && after ? before.line === after.line && before.col === after.col : !text)) {
        dock.beginPick(); editor.focused = !dock.isPicking;
      }
    } else original(data);
  };
  return editor;
}
