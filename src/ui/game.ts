import { DIFFICULTY_LABELS } from '../engine/grading';
import type { GeneratedPuzzle } from '../generator/generate';
import { h } from './dom';
import type { MountedScreen } from './router';

/** Placeholder until the board is built: shows the level and the givens string. */
export function gameScreen(game: GeneratedPuzzle, onBack: () => void): MountedScreen<HTMLElement> {
  const back = h('button', { class: 'btn secondary', text: 'Back to menu', attrs: { type: 'button', 'data-action': 'back' } });
  back.addEventListener('click', onBack);
  const el = h(
    'main',
    { class: `screen game-screen accent-${game.difficulty}` },
    h('h2', { class: 'game-level', text: DIFFICULTY_LABELS[game.difficulty] }),
    h('p', { class: 'givens-label', text: 'Givens' }),
    h('code', { class: 'givens', text: game.puzzle, attrs: { 'data-testid': 'givens' } }),
    back,
  );
  return { el };
}
