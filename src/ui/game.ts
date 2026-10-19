import { DIFFICULTY_LABELS } from '../engine/grading';
import {
  CELLS,
  canUndo,
  completedDigits,
  createGame,
  effectiveHighlight,
  isComplete,
  isMistakeCell,
  pressDigit,
  select,
  undo,
  type GameState,
} from '../game/state';
import { createStopwatch, formatTime } from '../game/timer';
import type { GeneratedPuzzle } from '../generator/generate';
import { h } from './dom';
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
}

/** Injection points for tests; production uses the defaults. */
export interface GameEnv {
  now?: () => number;
  doc?: Document;
}

const TICK_MS = 250;

const UNDO_ICON =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>';
const PAUSE_ICON =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>';

function iconButton(cls: string, label: string, svg: string): HTMLButtonElement {
  const b = h('button', { class: `icon-btn ${cls}`, attrs: { type: 'button', 'aria-label': label } });
  b.innerHTML = svg; // static markup defined above
  return b;
}

/** The playing screen: top bar, board and number pad, plus the pause overlay. */
export function gameScreen(
  game: GeneratedPuzzle,
  handlers: GameHandlers,
  env: GameEnv = {},
): MountedScreen<HTMLElement> {
  const doc = env.doc ?? document;
  const sw = createStopwatch(env.now);
  let state: GameState = createGame(game.puzzle, game.solution);
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
    h('div', { class: 'clock' }, timeEl, subEl),
    pauseBtn,
  );

  const cells: HTMLButtonElement[] = [];
  const cache: string[] = [];
  const board = h('div', { class: 'board', attrs: { role: 'group', 'aria-label': 'Sudoku board' } });
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
  for (let d = 1; d <= 9; d++) {
    const b = h('button', { class: 'digit', text: String(d), attrs: { type: 'button', 'data-digit': String(d), 'aria-label': `${d}`, 'aria-pressed': 'false' } });
    digitBtns.push(b);
    pad.append(b);
  }

  const pausedTime = h('p', { class: 'paused-time', attrs: { 'data-testid': 'paused-time' } });
  const resumeBtn = h('button', { class: 'btn primary', text: 'Resume', attrs: { type: 'button', 'data-action': 'resume' } });
  const quitBtn = h('button', { class: 'btn secondary', text: 'Quit to menu', attrs: { type: 'button', 'data-action': 'quit' } });
  const overlay = h(
    'div',
    { class: 'overlay', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Paused' } },
    h('div', { class: 'overlay-card' }, h('h2', { text: 'Paused' }), pausedTime, h('div', { class: 'actions' }, resumeBtn, quitBtn)),
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
      b.classList.toggle('active', !complete && d === hl);
      b.setAttribute('aria-pressed', String(!complete && d === hl));
      b.setAttribute('aria-label', complete ? `${d}, all placed` : String(d));
    });
    undoBtn.disabled = paused || finished || !canUndo(state);
    const n = state.mistakes;
    subEl.textContent = `${DIFFICULTY_LABELS[game.difficulty]} · ${n} ${n === 1 ? 'mistake' : 'mistakes'}`;
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

  function pause(): void {
    if (paused || finished || disposed) return;
    paused = true;
    sw.pause();
    stopTick();
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
    state = next;
    if (isComplete(state)) {
      finished = true;
      sw.stop();
      stopTick();
      render();
      handlers.onComplete({ elapsedMs: sw.elapsed(), mistakes: state.mistakes });
      return;
    }
    render();
  }

  board.addEventListener('click', (e) => {
    if (!active()) return;
    const target = (e.target as Element).closest<HTMLElement>('[data-i]');
    if (target) apply(select(state, Number(target.dataset.i)));
  });
  pad.addEventListener('click', (e) => {
    if (!active()) return;
    const target = (e.target as Element).closest<HTMLElement>('[data-digit]');
    if (target) apply(pressDigit(state, Number(target.dataset.digit)));
  });
  undoBtn.addEventListener('click', () => {
    if (active()) apply(undo(state));
  });
  pauseBtn.addEventListener('click', pause);
  resumeBtn.addEventListener('click', resume);
  quitBtn.addEventListener('click', () => {
    if (!disposed) handlers.onQuit();
  });

  const onVisibility = (): void => {
    if (doc.visibilityState === 'hidden') pause();
  };
  doc.addEventListener('visibilitychange', onVisibility);

  sw.start();
  startTick();
  render();

  return {
    el,
    dispose() {
      disposed = true;
      stopTick();
      sw.stop();
      doc.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
