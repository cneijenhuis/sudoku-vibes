import { DIFFICULTY_LABELS, type Difficulty } from '../engine/grading';
import { formatTime } from '../game/timer';
import type { GeneratedPuzzle } from '../generator/generate';
import { h } from './dom';
import { nextDifficulty } from './levels';
import type { MountedScreen } from './router';

export interface ResultsActions {
  /** Start another game at the level just played. */
  onSame: (d: Difficulty) => void;
  /** Start a game one level harder (only offered below the hardest level). */
  onNext: (d: Difficulty) => void;
  onMenu: () => void;
}

/** Headline and supporting line; a flawless run gets its own message. */
export function resultsCopy(mistakes: number): { title: string; message: string } {
  return mistakes === 0
    ? { title: 'Flawless!', message: 'Not a single mistake. Beautiful solving.' }
    : { title: 'Puzzle solved!', message: 'Nicely done. Ready for another?' };
}

const PARTICLES = 12;
/**
 * The final digit tap completes the game on pointer-up and the browser then sends its click to
 * whatever is under the finger, which is now one of these buttons. Ignore clicks this soon after
 * the screen appears.
 */
const GHOST_CLICK_MS = 400;

const STAR_SVG =
  '<svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';

function stat(label: string, value: string, testid: string): HTMLElement {
  return h(
    'div',
    { class: 'stat' },
    h('span', { class: 'stat-label', text: label }),
    h('span', { class: 'stat-value', text: value, attrs: { 'data-testid': testid } }),
  );
}

function celebration(): HTMLElement {
  const badge = h('div', { class: 'badge' });
  badge.innerHTML = STAR_SVG;
  const burst = h('div', { class: 'burst', attrs: { 'aria-hidden': 'true' } }, h('i', { class: 'ring' }), h('i', { class: 'ring r2' }));
  for (let i = 0; i < PARTICLES; i++) {
    const p = h('i', { class: i % 3 === 0 ? 'spark big' : 'spark' });
    p.style.setProperty('--a', `${(360 / PARTICLES) * i + (i % 2 ? 8 : -4)}deg`);
    p.style.setProperty('--d', `${i % 2 ? 84 : 66}px`);
    p.style.setProperty('--delay', `${(i % 4) * 40}ms`);
    burst.append(p);
  }
  return h('div', { class: 'celebrate' }, burst, badge);
}

export function resultsScreen(
  game: GeneratedPuzzle,
  elapsedMs: number,
  mistakes: number,
  actions: ResultsActions,
): MountedScreen<HTMLElement> {
  const played = game.difficulty;
  const next = nextDifficulty(played);
  const copy = resultsCopy(mistakes);

  const shownAt = performance.now();
  const button = (cls: string, text: string, action: string, run: () => void): HTMLButtonElement => {
    const b = h('button', { class: `btn ${cls}`, text, attrs: { type: 'button', 'data-action': action } });
    b.addEventListener('click', (e) => {
      if (e.timeStamp - shownAt < GHOST_CLICK_MS) return;
      // Lock every action at once; the router also ignores starts while loading.
      for (const x of all) x.disabled = true;
      run();
    });
    return b;
  };
  const nextBtn = next === null ? null : button('cta', 'Next difficulty', 'next', () => actions.onNext(next));
  const sameBtn = button(next === null ? 'cta' : 'ghost', 'Same difficulty', 'same', () => actions.onSame(played));
  const menuBtn = button('text', 'Menu', 'menu', actions.onMenu);
  const all = [nextBtn, sameBtn, menuBtn].filter((b): b is HTMLButtonElement => b !== null);

  const el = h(
    'main',
    { class: `screen results-screen accent-${played}` },
    h(
      'section',
      { class: 'results-hero' },
      celebration(),
      h(
        'div',
        { class: 'status-text' },
        h('h2', { text: copy.title, attrs: { 'data-testid': 'result-title' } }),
        h('p', { class: 'results-message', text: copy.message }),
        h('p', { class: 'level-chip', text: DIFFICULTY_LABELS[played], attrs: { 'data-testid': 'result-level' } }),
      ),
    ),
    h(
      'section',
      { class: 'results-body' },
      h('div', { class: 'stats' }, stat('Time', formatTime(elapsedMs), 'result-time'), stat('Mistakes', String(mistakes), 'result-mistakes')),
      h('div', { class: 'actions' }, ...(nextBtn ? [nextBtn] : []), sameBtn, menuBtn),
    ),
  );
  return { el };
}
