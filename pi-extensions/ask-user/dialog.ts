// Tabbed terminal questionnaire for one persistent question record.
// Esc never resolves anything: the draft is kept in memory and the record stays pending.
import { Editor, Key, Markdown, matchesKey, truncateToWidth, visibleWidth, wrapTextWithAnsi } from '@earendil-works/pi-tui';
import { getMarkdownTheme } from '@earendil-works/pi-coding-agent';
import { CUSTOM_LABEL, questionsOf, validateResponse, type Question, type Response } from './schema.ts';

type QState = { choice?: number; selected: Set<number>; custom: string; useCustom: boolean; notes: string };
export type Draft = { tab: number; cursor: number[]; qs: QState[]; globalNote: string };
type Mode = 'browse' | 'custom' | 'note' | 'global';
export const SIDE_BY_SIDE_MIN = 100;

export const createDraft = (questions: Question[]): Draft => ({ tab: 0, cursor: questions.map(() => 0), globalNote: '',
  qs: questions.map(q => ({ selected: new Set<number>(), custom: '', useCustom: false, notes: '', choice: undefined })) });

export const serializeDraft = (draft: Draft) => ({ v: 1, tab: draft.tab, cursor: draft.cursor, globalNote: draft.globalNote,
  qs: draft.qs.map(s => ({ choice: s.choice, selected: [...s.selected], custom: s.custom, useCustom: s.useCustom, notes: s.notes })) });

/** Restores a saved draft; anything that no longer fits the questions falls back to a fresh draft. */
export function restoreDraft(questions: Question[], saved): Draft {
  const fresh = createDraft(questions);
  if (!saved || saved.v !== 1 || !Array.isArray(saved.qs) || saved.qs.length !== questions.length) return fresh;
  const str = v => typeof v === 'string' ? v.slice(0, 20000) : '';
  const idx = (v, n) => Number.isInteger(v) && v >= 0 && v < n;
  return { tab: idx(saved.tab, questions.length + 1) ? saved.tab : 0, globalNote: str(saved.globalNote),
    cursor: questions.map((q, i) => idx(saved.cursor?.[i], q.options.length + 2) ? saved.cursor[i] : 0).concat(idx(saved.cursor?.[questions.length], 2) ? [saved.cursor[questions.length]] : []),
    qs: questions.map((q, i) => { const s = saved.qs[i] || {};
      return { choice: !q.multiSelect && idx(s.choice, q.options.length) ? s.choice : undefined,
        selected: new Set<number>(q.multiSelect && Array.isArray(s.selected) ? s.selected.filter(n => idx(n, q.options.length)) : []),
        custom: str(s.custom), useCustom: s.useCustom === true && !!str(s.custom).trim(), notes: str(s.notes) }; }) };
}

export function isAnswered(q: Question, s: QState) {
  return q.multiSelect ? s.selected.size > 0 || !!s.custom.trim() : s.choice !== undefined || (s.useCustom && !!s.custom.trim());
}

export function draftResponse(questions: Question[], draft: Draft): Response {
  return validateResponse(questions, { globalNote: draft.globalNote, answers: questions.flatMap((q, i): any[] => {
    const s = draft.qs[i];
    if (!isAnswered(q, s)) return [];
    if (q.multiSelect) return [{ questionIndex: i, selected: [...s.selected].sort((a, b) => a - b).map(n => q.options[n].label), answer: s.custom.trim() || null, notes: s.notes }];
    return [s.choice !== undefined ? { questionIndex: i, kind: 'option', answer: q.options[s.choice].label, notes: s.notes }
      : { questionIndex: i, kind: 'custom', answer: s.custom, notes: s.notes }];
  }) });
}

export function createQuestionnaire({ tui, theme, keybindings, record, draft, done }) {
  const questions = questionsOf(record);
  const multi = questions.length > 1, submitTab = questions.length;
  let mode: Mode = 'browse', message = '', focused = false;
  const markdown = new Map<string, string[]>();
  const editor = new Editor(tui, { borderColor: s => theme.fg('accent', s), selectList: {
    selectedPrefix: t => theme.fg('accent', t), selectedText: t => theme.fg('accent', t), description: t => theme.fg('muted', t),
    scrollInfo: t => theme.fg('dim', t), noMatch: t => theme.fg('warning', t) } });
  const q = () => questions[draft.tab], s = () => draft.qs[draft.tab];
  const rowCount = () => draft.tab === submitTab ? 2 : q().options.length + 1 + (q().multiSelect ? 1 : 0);
  const customRow = () => q().options.length;
  const refresh = () => tui.requestRender();
  const label = (i: number) => questions[i].header || `Q${i + 1}`;

  function edit(next: Mode, value: string) { mode = next; editor.setText(value); editor.focused = focused; message = ''; refresh(); }
  function browse() { mode = 'browse'; editor.focused = false; refresh(); }
  function goTab(tab: number) { draft.tab = (tab + questions.length + 1) % (questions.length + 1); message = ''; refresh(); }
  function submit() {
    try { done({ response: draftResponse(questions, draft) }); }
    catch (error) { message = error.message; if (multi) draft.tab = submitTab; refresh(); }
  }
  function confirmQuestion() {
    if (!multi) return submit();
    const next = questions.findIndex((qq, i) => i > draft.tab && !isAnswered(qq, draft.qs[i]));
    const anyMissing = questions.findIndex((qq, i) => !isAnswered(qq, draft.qs[i]));
    goTab(next >= 0 ? next : anyMissing >= 0 && anyMissing !== draft.tab ? anyMissing : submitTab);
  }
  function activate(row: number) {
    const question = q(), state = s();
    if (draft.tab === submitTab) return row === 0 ? submit() : done(undefined);
    if (row < question.options.length) {
      if (question.multiSelect) { state.selected.has(row) ? state.selected.delete(row) : state.selected.add(row); message = ''; return refresh(); }
      state.choice = row; state.useCustom = false; return confirmQuestion();
    }
    if (row === customRow()) return edit('custom', state.custom);
    if (isAnswered(question, state)) return confirmQuestion();
    message = 'เลือกอย่างน้อย 1 ข้อ หรือพิมพ์คำตอบเอง'; refresh();
  }
  editor.onSubmit = (value: string) => {
    const state = s();
    if (mode === 'global') draft.globalNote = value.trim();
    else if (mode === 'note') state.notes = value.trim();
    else if (mode === 'custom') {
      state.custom = value.trim();
      if (!q().multiSelect) {
        if (!state.custom) { state.useCustom = false; return browse(); }
        state.useCustom = true; state.choice = undefined; browse(); return confirmQuestion();
      }
    }
    browse();
  };

  function handleInput(data: string) {
    if (mode !== 'browse') {
      if (matchesKey(data, Key.escape)) {
        if (mode === 'custom') s().custom = editor.getText(); // keep the draft, do not choose it
        return browse();
      }
      editor.handleInput(data); return refresh();
    }
    const rows = rowCount(), cursor = draft.cursor;
    const at = () => draft.tab === submitTab ? (cursor[submitTab] ?? 0) : cursor[draft.tab];
    const move = (row: number) => { cursor[draft.tab] = Math.max(0, Math.min(rows - 1, row)); refresh(); };
    if (multi && (matchesKey(data, Key.tab) || matchesKey(data, Key.right))) return goTab(draft.tab + 1);
    if (multi && (matchesKey(data, Key.shift('tab')) || matchesKey(data, Key.left))) return goTab(draft.tab - 1);
    if (keybindings.matches(data, 'tui.select.up')) return move(at() - 1);
    if (keybindings.matches(data, 'tui.select.down')) return move(at() + 1);
    if (keybindings.matches(data, 'tui.select.cancel')) return done(undefined);
    if (keybindings.matches(data, 'tui.select.confirm')) return activate(at());
    if (data === 'n' || data === 'N') return draft.tab === submitTab ? edit('global', draft.globalNote) : edit('note', s().notes);
    if (data === ' ' && draft.tab !== submitTab && q().multiSelect && at() < q().options.length) return activate(at());
    if (/^[1-9]$/.test(data) && draft.tab !== submitTab && Number(data) <= q().options.length) { move(Number(data) - 1); return activate(Number(data) - 1); }
  }

  function wrap(text: string, width: number, indent = '') {
    const inner = Math.max(1, width - visibleWidth(indent));
    return wrapTextWithAnsi(text, inner).map(line => indent + line);
  }
  function previewLines(text: string, width: number) {
    const key = `${width}\0${text}`;
    if (!markdown.has(key)) markdown.set(key, new Markdown(text, 0, 0, getMarkdownTheme()).render(Math.max(10, width)));
    return markdown.get(key);
  }
  function editorLines(width: number, title: string) {
    return [theme.fg('muted', title), ...editor.render(Math.max(10, width - 2)).map(l => ' ' + l),
      theme.fg('dim', 'Enter บันทึก · Shift+Enter ขึ้นบรรทัดใหม่ · Esc ยกเลิก')];
  }
  function optionLines(width: number) {
    const question = q(), state = s(), lines: string[] = [], cur = draft.cursor[draft.tab];
    question.options.forEach((o, i) => {
      const focusedRow = cur === i && mode === 'browse';
      const mark = question.multiSelect ? (state.selected.has(i) ? '[x] ' : '[ ] ') : state.choice === i ? '● ' : '';
      const rec = o.recommended ? theme.fg('success', ' (แนะนำ)') : '';
      const preview = o.preview ? theme.fg('dim', ' ◧') : '';
      const head = `${focusedRow ? theme.fg('accent', '> ') : '  '}${theme.fg(focusedRow ? 'accent' : 'text', `${i + 1}. ${mark}${o.label}`)}${rec}${preview}`;
      lines.push(...wrap(head, width));
      if (o.description) lines.push(...wrap(theme.fg('muted', o.description), width, '      '));
    });
    const cr = customRow(), focusedCustom = cur === cr && mode === 'browse';
    const chosen = question.multiSelect ? !!state.custom.trim() : state.useCustom;
    lines.push(...wrap(`${focusedCustom ? theme.fg('accent', '> ') : '  '}${theme.fg(focusedCustom || mode === 'custom' ? 'accent' : 'text', `${cr + 1}. ${chosen ? (question.multiSelect ? '[x] ' : '● ') : ''}${CUSTOM_LABEL}`)}`, width));
    if (mode === 'custom') lines.push(...editorLines(width, '  คำตอบของคุณ:'));
    else if (state.custom) lines.push(...wrap(theme.fg('muted', state.custom), width, '      ✎ '));
    if (question.multiSelect) {
      const focusedNext = cur === cr + 1 && mode === 'browse';
      lines.push(`${focusedNext ? theme.fg('accent', '> ') : '  '}${theme.fg(focusedNext ? 'accent' : 'success', 'Next →')}`);
    }
    return lines;
  }
  function questionBody(width: number) {
    const question = q(), state = s(), lines: string[] = [];
    lines.push(...wrap(theme.bold(question.question), width, ' '));
    if (question.multiSelect) lines.push(theme.fg('dim', ' เลือกได้หลายข้อ (Space/Enter สลับ)'));
    lines.push('');
    const focusedOption = question.options[draft.cursor[draft.tab]];
    const preview = mode === 'browse' || mode === 'note' ? focusedOption?.preview : undefined;
    if (preview && width >= SIDE_BY_SIDE_MIN) {
      const left = Math.floor(width * 0.45), right = width - left - 3;
      const a = optionLines(left), b = [theme.fg('accent', 'Preview'), ...previewLines(preview, right).slice(0, 24)];
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const l = truncateToWidth(a[i] ?? '', left);
        lines.push(l + ' '.repeat(Math.max(0, left - visibleWidth(l))) + theme.fg('dim', ' │ ') + truncateToWidth(b[i] ?? '', right));
      }
    } else {
      lines.push(...optionLines(width));
      if (preview) lines.push(theme.fg('dim', '── preview ' + '─'.repeat(Math.max(0, width - 11))), ...previewLines(preview, width).slice(0, 12));
    }
    if (mode === 'note') lines.push('', ...editorLines(width, ' โน้ตสำหรับข้อนี้:'));
    else if (state.notes) lines.push(...wrap(theme.fg('muted', state.notes), width, ' 📝 '));
    return lines;
  }
  function submitBody(width: number) {
    const lines = [theme.fg('accent', theme.bold(' ทบทวนคำตอบ')), ''];
    questions.forEach((question, i) => {
      const st = draft.qs[i];
      let value = theme.fg('warning', 'ยังไม่ตอบ');
      if (isAnswered(question, st)) value = question.multiSelect
        ? [...[...st.selected].sort((a, b) => a - b).map(n => question.options[n].label), ...(st.custom.trim() ? [`✎ ${st.custom.trim()}`] : [])].join(', ')
        : st.choice !== undefined ? question.options[st.choice].label : `✎ ${st.custom.trim()}`;
      lines.push(...wrap(`${theme.fg('muted', label(i) + ':')} ${value}`, width, ' '));
      if (st.notes) lines.push(...wrap(theme.fg('muted', st.notes), width, '    📝 '));
    });
    if (mode === 'global') lines.push('', ...editorLines(width, ' โน้ตรวมทั้งชุด:'));
    else if (draft.globalNote) lines.push(...wrap(theme.fg('muted', draft.globalNote), width, ' 🗒 '));
    const missing = questions.map((qq, i) => isAnswered(qq, draft.qs[i]) ? '' : label(i)).filter(Boolean);
    lines.push('');
    if (missing.length) lines.push(...wrap(theme.fg('warning', `ยังไม่ตอบ: ${missing.join(', ')}`), width, ' '));
    const cur = draft.cursor[submitTab] ?? 0;
    ['ส่งคำตอบ', 'กลับไปก่อน (คำถามยังค้างไว้)'].forEach((text, i) => {
      const active = cur === i && mode === 'browse';
      lines.push(`${active ? theme.fg('accent', '> ') : '  '}${theme.fg(active ? 'accent' : i === 0 && !missing.length ? 'success' : 'text', text)}`);
    });
    return lines;
  }
  function render(width: number): string[] {
    width = Math.max(20, width);
    const answered = questions.filter((qq, i) => isAnswered(qq, draft.qs[i])).length;
    const lines = [theme.fg('accent', '─'.repeat(width)),
      ` ${theme.fg('accent', theme.bold(record.agentName || 'Pi'))} ${theme.fg('dim', `ถาม · ตอบแล้ว ${answered}/${questions.length}`)}`];
    if (multi) {
      const tabs = questions.map((qq, i) => {
        const done = isAnswered(qq, draft.qs[i]), text = ` ${done ? '■' : '□'} ${label(i)} `;
        return i === draft.tab ? theme.bg('selectedBg', theme.fg('text', text)) : theme.fg(done ? 'success' : 'muted', text);
      });
      const st = ' ✓ Submit ';
      tabs.push(draft.tab === submitTab ? theme.bg('selectedBg', theme.fg('text', st)) : theme.fg(answered === questions.length ? 'success' : 'dim', st));
      lines.push(...wrap(tabs.join(' '), width, ' '));
    }
    lines.push('', ...(draft.tab === submitTab ? submitBody(width) : questionBody(width)));
    if (message) lines.push('', ...wrap(theme.fg('warning', message), width, ' '));
    if (mode === 'browse') {
      const keys = [multi ? 'Tab/←→ สลับข้อ' : '', '↑↓ เลือก', 'Enter ยืนยัน', 'n โน้ต', 'Esc พักไว้'].filter(Boolean).join(' · ');
      lines.push('', ...wrap(theme.fg('dim', keys), width, ' '));
    }
    lines.push(theme.fg('accent', '─'.repeat(width)));
    return lines.map(l => truncateToWidth(l, width));
  }
  return {
    /** Copy text still being edited into the draft (reload/close while typing). */
    flush() {
      if (mode === 'browse') return;
      const value = editor.getText();
      if (mode === 'custom') s().custom = value; else if (mode === 'note') s().notes = value; else draft.globalNote = value;
    },
    render, handleInput, invalidate() { markdown.clear(); editor.invalidate?.(); },
    get focused() { return focused; },
    set focused(value: boolean) { focused = value; editor.focused = value && mode !== 'browse'; },
  };
}
