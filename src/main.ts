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
