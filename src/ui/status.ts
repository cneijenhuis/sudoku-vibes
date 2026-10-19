import { DIFFICULTY_LABELS, type Difficulty } from '../engine/grading';
import { h } from './dom';
import type { MountedScreen } from './router';

export function loadingScreen(difficulty: Difficulty, onCancel: () => void): MountedScreen<HTMLElement> {
  const cancel = h('button', { class: 'btn secondary', text: 'Cancel', attrs: { type: 'button', 'data-action': 'cancel' } });
  cancel.addEventListener('click', onCancel);
  const el = h(
    'main',
    { class: `screen loading-screen accent-${difficulty}` },
    h('div', { class: 'spinner', attrs: { 'aria-hidden': 'true' } }),
    h(
      'div',
      { class: 'status-text', attrs: { role: 'status' } },
      h('h2', { text: 'Generating puzzle' }),
      h('p', { class: 'status-level', text: DIFFICULTY_LABELS[difficulty] }),
    ),
    cancel,
  );
  return { el };
}

export function errorScreen(
  difficulty: Difficulty,
  message: string,
  onRetry: () => void,
  onBack: () => void,
): MountedScreen<HTMLElement> {
  const retry = h('button', { class: 'btn primary', text: 'Retry', attrs: { type: 'button', 'data-action': 'retry' } });
  const back = h('button', { class: 'btn secondary', text: 'Back to menu', attrs: { type: 'button', 'data-action': 'back' } });
  retry.addEventListener('click', onRetry);
  back.addEventListener('click', onBack);
  const el = h(
    'main',
    { class: 'screen error-screen' },
    h(
      'div',
      { class: 'status-text', attrs: { role: 'alert' } },
      h('h2', { text: "Couldn't create a puzzle" }),
      h('p', { class: 'status-level', text: `${DIFFICULTY_LABELS[difficulty]} puzzle` }),
      h('p', { class: 'error-message', text: message }),
    ),
    h('div', { class: 'actions' }, retry, back),
  );
  return { el };
}
