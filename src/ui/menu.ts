import { DIFFICULTY_LABELS, type Difficulty } from '../engine/grading';
import { formatTime } from '../game/timer';
import type { SavedGame } from '../storage/save';
import { h } from './dom';
import { LEVELS } from './levels';
import type { MountedScreen } from './router';

export interface MenuOptions {
  /** The valid saved game, if any; offers Resume and makes starting a new game ask first. */
  saved: SavedGame | null;
  onChoose: (d: Difficulty) => void;
  onResume: (saved: SavedGame) => void;
}

const PLAY_ICON =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>';

export function menuScreen({ saved, onChoose, onResume }: MenuOptions): MountedScreen<HTMLElement> {
  const lockAll = (): void => {
    for (const b of buttons) b.disabled = true;
    if (resumeBtn) resumeBtn.disabled = true;
  };

  const buttons = LEVELS.map(({ difficulty, label, hint }) => {
    const pips = h('span', { class: 'pips', attrs: { 'aria-hidden': 'true' } });
    for (let i = 0; i < LEVELS.length; i++) {
      pips.append(h('i', { class: i <= difficulty ? 'on' : '' }));
    }
    const btn = h(
      'button',
      { class: `level level-${difficulty}`, attrs: { type: 'button', 'data-difficulty': String(difficulty) } },
      h('span', { class: 'level-text' }, h('span', { class: 'level-name', text: label }), h('span', { class: 'level-hint', text: hint })),
      pips,
    );
    btn.addEventListener('click', () => {
      if (saved) {
        openSheet(btn, difficulty);
        return;
      }
      // Lock the menu immediately; the router also ignores starts while loading.
      lockAll();
      onChoose(difficulty);
    });
    return btn;
  });

  let resumeBtn: HTMLButtonElement | null = null;
  if (saved) {
    const time = formatTime(saved.elapsedMs);
    const level = DIFFICULTY_LABELS[saved.difficulty];
    const play = h('span', { class: 'resume-play', attrs: { 'aria-hidden': 'true' } });
    play.innerHTML = PLAY_ICON; // static markup defined above
    resumeBtn = h(
      'button',
      {
        class: `resume accent-${saved.difficulty}`,
        attrs: { type: 'button', 'data-action': 'resume-saved', 'aria-label': `Resume ${level} game, ${time}` },
      },
      play,
      h('span', { class: 'resume-text' }, h('span', { class: 'resume-title', text: 'Resume' }), h('span', { class: 'resume-sub', text: `${level} · ${time}`, attrs: { 'data-testid': 'resume-sub' } })),
    );
    resumeBtn.addEventListener('click', () => {
      lockAll();
      onResume(saved);
    });
  }

  // --- replace confirmation (in-app sheet, not window.confirm) ----------------
  const keepBtn = h('button', { class: 'btn secondary', text: 'Keep saved game', attrs: { type: 'button', 'data-action': 'keep-saved' } });
  const replaceBtn = h('button', { class: 'btn danger', text: 'Start new game', attrs: { type: 'button', 'data-action': 'replace-saved' } });
  const sheetText = h('p', { class: 'sheet-text' });
  const sheet = h(
    'div',
    { class: 'sheet-backdrop', attrs: { 'data-testid': 'confirm-sheet' } },
    h(
      'div',
      { class: 'sheet', attrs: { role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'sheet-title', 'aria-describedby': 'sheet-desc' } },
      h('h2', { text: 'Replace saved game?', attrs: { id: 'sheet-title' } }),
      sheetText,
      h('div', { class: 'actions' }, replaceBtn, keepBtn),
    ),
  );
  sheetText.id = 'sheet-desc';
  sheet.hidden = true;

  let pending: { opener: HTMLElement; difficulty: Difficulty } | null = null;

  function setInert(on: boolean): void {
    for (const child of Array.from(el.children)) if (child !== sheet) (child as HTMLElement).inert = on;
  }

  function openSheet(opener: HTMLElement, difficulty: Difficulty): void {
    if (!saved) return;
    pending = { opener, difficulty };
    sheetText.textContent = `Your ${DIFFICULTY_LABELS[saved.difficulty]} game at ${formatTime(saved.elapsedMs)} will be discarded if you start a new ${DIFFICULTY_LABELS[difficulty]} game.`;
    setInert(true);
    sheet.hidden = false;
    keepBtn.focus({ preventScroll: true });
  }

  function closeSheet(): void {
    if (!pending) return;
    const { opener } = pending;
    pending = null;
    sheet.hidden = true;
    setInert(false);
    opener.focus({ preventScroll: true });
  }

  keepBtn.addEventListener('click', closeSheet);
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) closeSheet();
  });
  sheet.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSheet();
  });
  replaceBtn.addEventListener('click', () => {
    if (!pending) return;
    const { difficulty } = pending;
    pending = null;
    lockAll();
    replaceBtn.disabled = true;
    keepBtn.disabled = true;
    onChoose(difficulty);
  });

  const el = h(
    'main',
    { class: `screen menu-screen${saved ? ' has-saved' : ''}` },
    h('header', { class: 'menu-head' }, h('h1', { text: 'Sudoku' }), h('p', { class: 'tagline', text: 'Choose a difficulty' })),
    ...(resumeBtn ? [resumeBtn] : []),
    h('nav', { class: 'menu-list', attrs: { 'aria-label': 'Difficulty' } }, ...buttons),
    sheet,
  );
  return { el };
}
