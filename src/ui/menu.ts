import type { Difficulty } from '../engine/grading';
import { h } from './dom';
import { LEVELS } from './levels';
import type { MountedScreen } from './router';

export function menuScreen(onChoose: (d: Difficulty) => void): MountedScreen<HTMLElement> {
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
      // Lock the menu immediately; the router also ignores starts while loading.
      for (const b of buttons) b.disabled = true;
      onChoose(difficulty);
    });
    return btn;
  });
  const el = h(
    'main',
    { class: 'screen menu-screen' },
    h('header', { class: 'menu-head' }, h('h1', { text: 'Sudoku' }), h('p', { class: 'tagline', text: 'Choose a difficulty' })),
    h('nav', { class: 'menu-list', attrs: { 'aria-label': 'Difficulty' } }, ...buttons),
  );
  return { el };
}
