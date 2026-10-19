import './style.css';

export type Screen = () => HTMLElement;

/** Replace the contents of the app root with the given screen. */
export function mount(screen: Screen, root: HTMLElement): void {
  root.replaceChildren(screen());
}

export function titleScreen(): HTMLElement {
  const el = document.createElement('main');
  el.className = 'screen title-screen';
  const h1 = document.createElement('h1');
  h1.textContent = 'Sudoku';
  el.append(h1);
  return el;
}

const root = document.getElementById('app');
if (root) mount(titleScreen, root);

// Dev smoke hook: `?smoke` runs one puzzle per level through the real worker.
if (new URLSearchParams(location.search).has('smoke')) {
  void import('./generator/smoke').then((m) => m.runSmoke());
}
