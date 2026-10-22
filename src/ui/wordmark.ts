import { h } from './dom';

/** The "Sudoku Vibes" wordmark: "Sudoku" in ink and "Vibes" in the accent colour (see `.wordmark` in style.css). */
export function wordmark(tag: 'span' | 'h1' = 'span'): HTMLElement {
  return h(tag, { class: 'wordmark' }, h('span', { class: 'sudoku', text: 'Sudoku' }), ' ', h('span', { class: 'vibes', text: 'Vibes' }));
}
