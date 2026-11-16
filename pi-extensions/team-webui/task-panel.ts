import { matchesKey, truncateToWidth, visibleWidth, wrapTextWithAnsi } from '@earendil-works/pi-tui';
import { stripVTControlCharacters } from 'node:util';
import { taskStatuses } from './task-store.ts';

const clean = value => stripVTControlCharacters(String(value ?? '')).replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '');
export class TaskPanel {
  capturesViewportInput = true;
  focused = false;
  data = { tasks: [], total: 0, offset: 0, nextOffset: null };
  state;
  viewing = false;
  scroll = 0;
  options;
  constructor(options) {
    this.options = options;
    this.state = options.state || { stage: 0, selected: '', search: '', offset: 0 };
  }
  items(stage = this.state.stage) { return this.data.tasks.filter(t => t.status === taskStatuses[stage]); }
  selected() { return this.data.tasks.find(t => t.id === this.state.selected); }
  update(data) {
    this.data = data;
    const current = this.selected();
    if (current) this.state.stage = taskStatuses.indexOf(current.status);
    if (!this.items().some(t => t.id === this.state.selected)) this.state.selected = this.items()[0]?.id || '';
    this.options.tui.requestRender();
  }
  action(action) { this.options.done({ action, task: this.selected(), state: this.state }); }
  handleInput(key) {
    if (matchesKey(key, 'escape') || matchesKey(key, 'ctrl+c')) {
      if (this.viewing) { this.viewing = false; this.scroll = 0; }
      else this.options.done(undefined);
    } else if (key === 'n') this.action('new');
    else if (key === 't') this.action('trash');
    else if (key === 'x' && this.selected()) this.action(this.state.deleted?'restore':'delete');
    else if (key === '/') this.action('search');
    else if (key === 'r') this.action('refresh');
    else if (key === 'e' && this.selected()) this.action('edit');
    else if (key === 'm' && this.selected()) this.action('move');
    else if (key === 'h' && this.selected()) this.action('history');
    else if (key === 'g') this.action('graph');
    else if (key === 'a' && this.selected()) this.action('handoff');
    else if (key === 'd' && this.selected()) this.action('dependencies');
    else if (key === ']' && this.data.nextOffset !== null) { this.state.offset = this.data.nextOffset; this.state.selected = ''; this.action('refresh'); }
    else if (key === '[' && this.state.offset) { this.state.offset = Math.max(0, this.state.offset - 200); this.state.selected = ''; this.action('refresh'); }
    else if (matchesKey(key, 'enter')) { if (this.selected()) { this.viewing = true; this.scroll = 0; } }
    else if (matchesKey(key, 'left') || matchesKey(key, 'right') || matchesKey(key, 'tab') || matchesKey(key, 'shift+tab')) {
      const back = matchesKey(key, 'left') || matchesKey(key, 'shift+tab');
      this.state.stage = (this.state.stage + (back ? 9 : 1)) % 10;
      this.state.selected = this.items()[0]?.id || ''; this.viewing = false; this.scroll = 0;
    } else if (matchesKey(key, 'up') || matchesKey(key, 'down')) {
      const delta = matchesKey(key, 'up') ? -1 : 1;
      if (this.viewing) this.scroll = Math.max(0, this.scroll + delta);
      else {
        const items = this.items(), index = Math.max(0, items.findIndex(t => t.id === this.state.selected));
        this.state.selected = items[Math.max(0, Math.min(items.length - 1, index + delta))]?.id || '';
      }
    } else if (this.viewing && (matchesKey(key, 'pageDown') || matchesKey(key, 'pageUp'))) this.scroll = Math.max(0, this.scroll + (matchesKey(key, 'pageUp') ? -1 : 1) * Math.max(1, this.options.tui.terminal.rows - 7));
    this.options.tui.requestRender();
  }
  render(width) {
    const height = Math.max(4, this.options.tui.terminal.rows), fg = (color, text) => this.options.theme.fg(color, text);
    const fit = value => truncateToWidth(value, Math.max(1, width));
    const pad = (value, size) => { const text = truncateToWidth(value, size); return text + ' '.repeat(Math.max(0, size - visibleWidth(text))); };
    let lines = [fg('accent', (this.state.deleted?'Trash · ':'Kanban · ') + clean(this.options.project)), fg('muted', 'Open → Investigate → Change → Build → Prove → Land → Deliver → Merge → Tag → Deploy')];
    if (this.viewing && this.selected()) {
      const task = this.selected();
      const body = [`${task.status.toUpperCase()} · ${task.title}`, `Owner: ${task.ownerName || 'Unassigned'} · version ${task.version}`,
        ...(task.workflow?[`Change Loop: ${task.workflow.phase} · ${task.workflow.lifecycleStatus}${task.workflow.unavailable?' · SOURCE UNAVAILABLE':''}`,`Change ID: ${task.workflow.changeId}`,`Source: ${task.workflow.sourcePath}`]:[]), '',
        'Dependencies',...(task.dependsOn||[]).map(e=>`${e.id} → ${e.status}`),...(task.blockedBy||[]).map(e=>`Waiting: ${e.title} (${e.currentStatus} → ${e.status})`), '', 'Description', task.description || '—', '', 'Next step', task.nextStep || '—', '', 'Blocker', task.blocker || 'None', '', 'Evidence / references', task.evidence || 'Not recorded', '', `ID: ${task.id}`]
        .flatMap(line => wrapTextWithAnsi(clean(line), Math.max(1,width)));
      const count = Math.max(1,height-5); this.scroll = Math.min(this.scroll, Math.max(0,body.length-count));
      lines.push(...body.slice(this.scroll,this.scroll+count));
    } else {
      const count = Math.max(1, Math.min(4, Math.floor(width/27))), size = Math.max(1,Math.floor((width-(count-1))/count));
      const start = Math.max(0,Math.min(this.state.stage-Math.floor(count/2),10-count));
      const cardRows = Math.max(1, Math.floor((height-7)/4));
      const columns = Array.from({ length:count }, (_,i) => {
        const stage=start+i, items=this.items(stage), selected=Math.max(0,items.findIndex(t=>t.id===this.state.selected));
        const first=stage===this.state.stage?Math.max(0,selected-cardRows+1):0;
        const header=`${stage===this.state.stage?'› ':''}${taskStatuses[stage].toUpperCase()} (${items.length})`;
        const rows=[fg(stage===this.state.stage?'accent':'muted',pad(header,size)),fg('dim','─'.repeat(size))];
        for (const task of items.slice(first,first+cardRows)) {
          const active=task.id===this.state.selected && stage===this.state.stage;
          rows.push(fg(active?'accent':'text',pad(`${active?'› ':'  '}${clean(task.title).replace(/\n/g,' ')}`,size)));
          rows.push(fg('muted',pad(`  ${task.workflow?'CL: '+task.workflow.phase+(task.workflow.unavailable?' (unavailable)':''):clean(task.ownerName || 'Unassigned')}`,size)));
          rows.push(fg(task.blocker||task.blockedBy?.length?'warning':'dim',pad(`  ${task.blockedBy?.length?'Waiting: '+task.blockedBy.length+' dependencies':task.blocker?'Blocked: '+clean(task.blocker):clean(task.nextStep||'No next step recorded')}`,size)));
          rows.push(' '.repeat(size));
        }
        if (!items.length) rows.push(fg('dim',pad('No tasks in this stage',size)));
        return rows;
      });
      const rows=Math.min(height-5, Math.max(...columns.map(col=>col.length)));
      for(let i=0;i<rows;i++) lines.push(columns.map(col=>col[i]||' '.repeat(size)).join(' '));
    }
    while(lines.length<height-3)lines.push('');
    lines=lines.slice(0,height-3);
    lines.push(fg('muted',`${this.data.total ? this.data.offset+1 : 0}–${this.data.offset+this.data.tasks.length} / ${this.data.total} tasks${this.state.search?' · Search: '+clean(this.state.search):''}`));
    lines.push(fg('dim',this.viewing?'↑↓/PgUp/PgDn scroll · e edit · m move · h history · Esc board':'←→/Tab stages · ↑↓ tasks · Enter details · n new · e edit · m move'));
    lines.push(fg('dim',`${this.state.deleted?'x restore':'x delete'} · t trash/board · g graph · d dependencies · a handoff · / search · [ ] pages · r refresh · Esc close`));
    return lines.map(line=>pad(fit(line),Math.max(1,width)));
  }
}
