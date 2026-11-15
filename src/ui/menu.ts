import { DIFFICULTY_LABELS, type Difficulty } from '../engine/grading';
import { formatTime } from '../game/timer';
import type { BestTimes } from '../storage/best';
import type { SavedGame } from '../storage/save';
import { digitSrc } from './digit-sticker';
import { h } from './dom';
import type { Haptics } from './haptics';
import { LEVELS } from './levels';
import type { MountedScreen } from './router';
import { wordmark } from './wordmark';

export interface MenuOptions {
  /** The valid saved game, if any; offers Resume and makes starting a new game ask first. */
  saved: SavedGame | null;
  /** Best time per level (null = none yet); a level with one is shown as solved. */
  best: BestTimes;
  onChoose: (d: Difficulty) => void;
  onResume: (saved: SavedGame) => void;
  /** Vibration setting; its toggle is shown only where vibration is supported. */
  haptics?: Pick<Haptics, 'supported' | 'enabled' | 'setEnabled' | 'fire'>;
}

const PLAY_ICON =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>';

export function menuScreen({ saved, best, onChoose, onResume, haptics }: MenuOptions): MountedScreen<HTMLElement> {
  const lockAll = (): void => {
    for (const b of buttons) b.disabled = true;
    if (resumeBtn) resumeBtn.disabled = true;
  };

  const buttons = LEVELS.map(({ difficulty, label }) => {
    const bestMs = best[difficulty] ?? null;
    const number = difficulty + 1;
    const shown = bestMs === null ? label : `Best ${formatTime(bestMs)}`;
    const btn = h(
      'button',
      {
        class: `level-cell${bestMs === null ? '' : ' solved'}`,
        attrs: {
          type: 'button',
          'data-difficulty': String(difficulty),
          'aria-label': bestMs === null ? `Level ${number}, ${label}` : `Level ${number}, ${label}, best ${formatTime(bestMs)}`,
        },
      },
      h('img', { class: 'level-digit', attrs: { src: digitSrc(number), alt: '', draggable: 'false' } }),
      h('span', { class: 'level-label', text: shown }),
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
        class: 'resume glass',
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
  const keepBtn = h('button', { class: 'btn secondary glass', text: 'Keep saved game', attrs: { type: 'button', 'data-action': 'keep-saved' } });
  const replaceBtn = h('button', { class: 'btn danger glass', text: 'Start new game', attrs: { type: 'button', 'data-action': 'replace-saved' } });
  const sheetText = h('p', { class: 'sheet-text' });
  const sheet = h(
    'div',
    { class: 'sheet-backdrop', attrs: { 'data-testid': 'confirm-sheet' } },
    h(
      'div',
      { class: 'sheet glass', attrs: { role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'sheet-title', 'aria-describedby': 'sheet-desc' } },
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

  let foot: HTMLElement | null = null;
  if (haptics?.supported) {
    const toggle = h('button', {
      class: 'toggle glass',
      attrs: { type: 'button', role: 'switch', 'data-action': 'haptics' },
    });
    const label = h('span', { class: 'toggle-label', text: 'Vibration' });
    const state = h('span', { class: 'toggle-state' });
    const track = h('span', { class: 'toggle-track', attrs: { 'aria-hidden': 'true' } }, h('i', {}));
    toggle.append(label, state, track);
    const paint = (): void => {
      const on = haptics.enabled();
      toggle.setAttribute('aria-checked', String(on));
      state.textContent = on ? 'On' : 'Off';
    };
    paint();
    toggle.addEventListener('click', () => {
      haptics.setEnabled(!haptics.enabled());
      paint();
      haptics.fire('mode'); // a little tick when turned on (silent when turned off)
    });
    foot = h('footer', { class: 'menu-foot' }, toggle);
  }

  const el = h(
    'main',
    { class: `screen menu-screen${saved ? ' has-saved' : ''}` },
    h('header', { class: 'menu-head glass' }, wordmark('h1'), h('p', { class: 'tagline', text: 'Choose a difficulty' })),
    ...(resumeBtn ? [resumeBtn] : []),
    h('div', { class: 'level-wrap' }, h('nav', { class: 'level-box glass', attrs: { 'aria-label': 'Difficulty' } }, ...buttons)),
    ...(foot ? [foot] : []),
    sheet,
  );
  return { el };
}
