import { DIFFICULTY_LABELS } from '../engine/grading';
import { formatTime } from '../game/timer';
import type { GeneratedPuzzle } from '../generator/generate';
import { h } from './dom';
import type { MountedScreen } from './router';

function stat(label: string, value: string, testid: string): HTMLElement {
  return h(
    'div',
    { class: 'stat' },
    h('span', { class: 'stat-label', text: label }),
    h('span', { class: 'stat-value', text: value, attrs: { 'data-testid': testid } }),
  );
}

/** Minimal placeholder; the full results screen arrives in a later change. */
export function resultsScreen(
  game: GeneratedPuzzle,
  elapsedMs: number,
  mistakes: number,
  onBack: () => void,
): MountedScreen<HTMLElement> {
  const back = h('button', { class: 'btn primary', text: 'Back to menu', attrs: { type: 'button', 'data-action': 'back' } });
  back.addEventListener('click', onBack);
  const el = h(
    'main',
    { class: `screen results-screen accent-${game.difficulty}` },
    h(
      'div',
      { class: 'status-text' },
      h('h2', { text: 'Puzzle solved' }),
      h('p', { class: 'status-level', text: DIFFICULTY_LABELS[game.difficulty] }),
    ),
    h('div', { class: 'stats' }, stat('Time', formatTime(elapsedMs), 'result-time'), stat('Mistakes', String(mistakes), 'result-mistakes')),
    h('div', { class: 'actions' }, back),
  );
  return { el };
}
