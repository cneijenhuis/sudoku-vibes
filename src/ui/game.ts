import { DIFFICULTY_LABELS } from '../engine/grading';
import {
  CELLS,
  activeMode,
  canUndo,
  completedDigits,
  createGame,
  effectiveHighlight,
  isComplete,
  isMistakeCell,
  longPressDigit,
  pressDigit,
  restoreGame,
  tapCell,
  undo,
  type GameState,
} from '../game/state';
import { createStopwatch, formatTime } from '../game/timer';
import type { GeneratedPuzzle } from '../generator/generate';
import type { SavedGame } from '../storage/save';
import { h } from './dom';
import { haptics as defaultHaptics, type Haptics } from './haptics';
import { createLongPress, LONG_PRESS_MS, type LongPress } from './longpress';
import type { MountedScreen } from './router';

export interface GameResult {
  elapsedMs: number;
  mistakes: number;
}

export interface GameHandlers {
  /** Quit to menu from the pause overlay. */
  onQuit: () => void;
  /** The last cell was filled correctly. */
  onComplete: (result: GameResult) => void;
  /**
   * The game should be persisted now: after each entry or undo, on pause, when the page is
   * hidden or closing and when the screen is left mid-game. Never called once finished.
   */
  onSave?: (state: GameState, elapsedMs: number) => void;
}

/** What the screen starts from: a fresh puzzle, or a saved game to resume (opens paused). */
export interface GameStart {
  game: GeneratedPuzzle;
  resume?: SavedGame;
}

/** Injection points for tests; production uses the defaults. */
export interface GameEnv {
  now?: () => number;
  doc?: Document;
  haptics?: Haptics;
}

const TICK_MS = 250;
/** How far outside a pad button (px) a held finger may drift before the press is cancelled. */
const SLOP_PX = 10;

const LOCK_ICON =
  '<svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M5 7V5a3 3 0 0 1 6 0v2h.5A1.5 1.5 0 0 1 13 8.5v5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5v-5A1.5 1.5 0 0 1 4.5 7H5Zm1.8 0h2.4V5a1.2 1.2 0 0 0-2.4 0v2Z"/></svg>';

const UNDO_ICON =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>';
const PAUSE_ICON =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>';

function iconButton(cls: string, label: string, svg: string): HTMLButtonElement {
  const b = h('button', { class: `icon-btn glass ${cls}`, attrs: { type: 'button', 'aria-label': label } });
  b.innerHTML = svg; // static markup defined above
  return b;
}

/** The playing screen: top bar, board and number pad, plus the pause overlay. */
export function gameScreen(
  { game, resume: saved }: GameStart,
  handlers: GameHandlers,
  env: GameEnv = {},
): MountedScreen<HTMLElement> {
  const doc = env.doc ?? document;
  const sw = createStopwatch(env.now);
  const haptics = env.haptics ?? defaultHaptics;
  let state: GameState = saved ? restoreGame(saved) : createGame(game.puzzle, game.solution);
  let paused = false;
  let finished = false;
  let disposed = false;
  let tick: ReturnType<typeof setInterval> | null = null;

  // --- DOM ---------------------------------------------------------------
  const undoBtn = iconButton('undo', 'Undo', UNDO_ICON);
  undoBtn.dataset.action = 'undo';
  const pauseBtn = iconButton('pause', 'Pause', PAUSE_ICON);
  pauseBtn.dataset.action = 'pause';
  const timeEl = h('span', { class: 'time', text: '0:00', attrs: { 'data-testid': 'time' } });
  const subEl = h('span', { class: 'sub', attrs: { 'data-testid': 'sub' } });
  const bar = h(
    'header',
    { class: 'topbar' },
    undoBtn,
    h('div', { class: 'clock glass' }, timeEl, subEl),
    pauseBtn,
  );

  const cells: HTMLButtonElement[] = [];
  const cache: string[] = [];
  const board = h('div', { class: 'board glass', attrs: { role: 'group', 'aria-label': 'Sudoku board' } });
  for (let i = 0; i < CELLS; i++) {
    const r = Math.floor(i / 9);
    const c = i % 9;
    const edge = (c === 2 || c === 5 ? ' box-r' : '') + (r === 2 || r === 5 ? ' box-b' : '');
    const b = h('button', { class: `cell${edge}`, attrs: { type: 'button', 'data-i': String(i) } });
    cells.push(b);
    board.append(b);
  }
  const region = h('section', { class: 'board-region' }, board);

  const digitBtns: HTMLButtonElement[] = [];
  const pad = h('div', { class: 'pad', attrs: { role: 'group', 'aria-label': 'Number pad' } });
  pad.style.setProperty('--hold-ms', `${LONG_PRESS_MS}ms`);
  for (let d = 1; d <= 9; d++) {
    const b = h('button', { class: 'digit glass', text: String(d), attrs: { type: 'button', 'data-digit': String(d), 'aria-label': `${d}`, 'aria-pressed': 'false' } });
    const lock = h('span', { class: 'lock', attrs: { 'aria-hidden': 'true' } });
    lock.innerHTML = LOCK_ICON; // static markup defined above
    b.append(lock);
    digitBtns.push(b);
    pad.append(b);
  }

  const pausedTime = h('p', { class: 'paused-time', attrs: { 'data-testid': 'paused-time' } });
  const resumeBtn = h('button', { class: 'btn primary', text: 'Resume', attrs: { type: 'button', 'data-action': 'resume' } });
  const quitBtn = h('button', { class: 'btn secondary glass', text: 'Quit to menu', attrs: { type: 'button', 'data-action': 'quit' } });
  const overlay = h(
    'div',
    { class: 'overlay', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Paused' } },
    h('div', { class: 'overlay-card glass' }, h('h2', { text: 'Paused' }), pausedTime, h('div', { class: 'actions' }, resumeBtn, quitBtn)),
  );
  overlay.hidden = true;

  const el = h('main', { class: `screen game-screen accent-${game.difficulty}` }, bar, region, pad, overlay);

  // --- rendering ---------------------------------------------------------
  function paintTime(): void {
    const text = formatTime(sw.elapsed());
    if (timeEl.textContent !== text) timeEl.textContent = text;
  }

  function render(): void {
    const sel = state.selected;
    const hl = effectiveHighlight(state) ?? 0;
    const done = completedDigits(state);
    const numberFirst = activeMode(state) === 'number-first';
    el.dataset.mode = numberFirst ? 'number-first' : 'cell-first';
    pad.dataset.mode = el.dataset.mode;
    for (let i = 0; i < CELLS; i++) {
      const v = state.cells[i] ?? 0;
      const given = (state.givens[i] ?? 0) !== 0;
      const mistake = isMistakeCell(state, i);
      const isSel = i === sel;
      const same = !isSel && hl !== 0 && v === hl;
      const key = `${v}|${given ? 'g' : ''}${mistake ? 'm' : ''}${isSel ? 's' : ''}${same ? 'h' : ''}`;
      if (cache[i] === key) continue;
      cache[i] = key;
      const b = cells[i]!;
      b.textContent = v === 0 ? '' : String(v);
      b.classList.toggle('given', given);
      b.classList.toggle('entry', !given && v !== 0);
      b.classList.toggle('mistake', mistake);
      b.classList.toggle('selected', isSel);
      b.classList.toggle('hl', same);
      b.setAttribute('aria-pressed', String(isSel));
      const where = `Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}`;
      const what = v === 0 ? 'empty' : String(v);
      b.setAttribute('aria-label', `${where}, ${what}${given ? ', given' : ''}${mistake ? ', mistake' : ''}`);
    }
    digitBtns.forEach((b, k) => {
      const d = k + 1;
      const complete = done[d] === true;
      b.disabled = complete;
      b.classList.toggle('done', complete);
      const isActive = !complete && d === hl;
      const locked = isActive && numberFirst;
      b.classList.toggle('active', isActive && !numberFirst);
      b.classList.toggle('locked', locked);
      b.setAttribute('aria-pressed', String(isActive));
      b.setAttribute('aria-label', complete ? `${d}, all placed` : locked ? `${d}, number mode on. Long press to leave` : String(d));
    });
    undoBtn.disabled = paused || finished || !canUndo(state);
    const n = state.mistakes;
    // Level and mistakes are separate spans so landscape can stack them without the dot.
    subEl.replaceChildren(
      h('span', { text: DIFFICULTY_LABELS[game.difficulty] }),
      h('span', { class: 'sep', text: ' · ' }),
      h('span', { text: `${n} ${n === 1 ? 'mistake' : 'mistakes'}` }),
    );
    subEl.classList.toggle('has-mistakes', n > 0);
    paintTime();
  }

  // --- timer plumbing ----------------------------------------------------
  function startTick(): void {
    if (tick === null) tick = setInterval(paintTime, TICK_MS);
  }
  function stopTick(): void {
    if (tick !== null) clearInterval(tick);
    tick = null;
  }

  /** Hand the current game to the persistence callback (storage failures are its business). */
  function persist(): void {
    if (finished || disposed) return;
    handlers.onSave?.(state, sw.elapsed());
  }

  function pause(save = true): void {
    if (paused || finished || disposed) return;
    paused = true;
    cancelPresses();
    sw.pause();
    stopTick();
    if (save) persist();
    pausedTime.textContent = formatTime(sw.elapsed());
    el.classList.add('paused');
    overlay.hidden = false;
    render();
    resumeBtn.focus({ preventScroll: true });
  }

  function resume(): void {
    if (!paused || finished || disposed) return;
    paused = false;
    el.classList.remove('paused');
    overlay.hidden = true;
    sw.resume();
    startTick();
    render();
    pauseBtn.focus({ preventScroll: true });
  }

  // --- input -------------------------------------------------------------
  const active = (): boolean => !paused && !finished && !disposed;

  function apply(next: GameState): void {
    if (next === state) return;
    const boardChanged = next.cells !== state.cells;
    const modeBefore = activeMode(state);
    const mistakesBefore = state.mistakes;
    state = next;
    // Haptics only ever answer a player action (apply runs only while active, i.e. not paused).
    if (isComplete(state)) {
      finished = true;
      sw.stop();
      stopTick();
      render();
      haptics.fire('complete');
      handlers.onComplete({ elapsedMs: sw.elapsed(), mistakes: state.mistakes });
      return;
    }
    render();
    if (state.mistakes > mistakesBefore) haptics.fire('mistake');
    else if (activeMode(state) !== modeBefore) haptics.fire('mode');
    if (boardChanged) persist();
  }

  board.addEventListener('click', (e) => {
    if (!active()) return;
    const target = (e.target as Element).closest<HTMLElement>('[data-i]');
    if (target) apply(tapCell(state, Number(target.dataset.i)));
  });

  // Pad buttons use pointer events through the long-press controller. The `click` that follows
  // a pointer gesture has detail >= 1 and is ignored; keyboard / assistive activation has
  // detail 0 and counts as a tap, so nothing fires twice.
  const presses: LongPress[] = [];
  digitBtns.forEach((btn, k) => {
    const digit = k + 1;
    const lp = createLongPress({
      onProgress: (holding) => btn.classList.toggle('holding', holding),
      onTap: () => {
        if (active()) apply(pressDigit(state, digit));
      },
      onLongPress: () => {
        if (active()) apply(longPressDigit(state, digit));
      },
    });
    presses.push(lp);
    const inside = (e: PointerEvent): boolean => {
      const r = btn.getBoundingClientRect();
      return (
        e.clientX >= r.left - SLOP_PX &&
        e.clientX <= r.right + SLOP_PX &&
        e.clientY >= r.top - SLOP_PX &&
        e.clientY <= r.bottom + SLOP_PX
      );
    };
    btn.addEventListener('pointerdown', (e) => {
      if (!active() || !e.isPrimary || e.button !== 0 || btn.disabled) return;
      try {
        btn.setPointerCapture(e.pointerId);
      } catch {
        /* capture is best effort */
      }
      lp.down(e.pointerId);
    });
    btn.addEventListener('pointermove', (e) => {
      if (lp.pressed && !inside(e)) lp.cancel(e.pointerId);
    });
    btn.addEventListener('pointerup', (e) => {
      if (inside(e)) lp.up(e.pointerId);
      else lp.cancel(e.pointerId);
    });
    btn.addEventListener('pointercancel', (e) => lp.cancel(e.pointerId));
    btn.addEventListener('lostpointercapture', (e) => lp.cancel(e.pointerId));
    btn.addEventListener('click', (e) => {
      if (e.detail === 0 && active()) apply(pressDigit(state, digit));
    });
  });
  function cancelPresses(): void {
    for (const lp of presses) lp.cancel();
  }
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  undoBtn.addEventListener('click', () => {
    if (active()) apply(undo(state));
  });
  pauseBtn.addEventListener('click', () => pause());
  resumeBtn.addEventListener('click', resume);
  quitBtn.addEventListener('click', () => {
    if (!disposed) handlers.onQuit();
  });

  const win = doc.defaultView;
  const onVisibility = (): void => {
    if (doc.visibilityState !== 'hidden') return;
    if (paused) persist();
    else pause(); // saves
  };
  const onPageHide = (): void => persist();
  doc.addEventListener('visibilitychange', onVisibility);
  win?.addEventListener('pagehide', onPageHide);

  if (saved) {
    // Resuming opens paused with the saved time; the save on disk is already current.
    sw.start(saved.elapsedMs);
    pause(false);
  } else {
    sw.start();
    startTick();
    persist(); // a fresh game replaces any older save straight away
  }
  render();

  return {
    el,
    dispose() {
      persist(); // leaving mid-game (Quit, Back) keeps the latest state and time
      disposed = true;
      cancelPresses();
      stopTick();
      sw.stop();
      doc.removeEventListener('visibilitychange', onVisibility);
      win?.removeEventListener('pagehide', onPageHide);
    },
  };
}
