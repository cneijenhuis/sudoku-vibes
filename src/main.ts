import './style.css';
import { registerServiceWorker } from './pwa/register';
import { applyBackground, pickBackground } from './theme/backgrounds';
import { watchCanvas } from './theme/canvas';
import { startApp } from './ui/app';

const background = pickBackground();
applyBackground(background);
watchCanvas();

const root = document.getElementById('app');
if (root) startApp(root, background);
registerServiceWorker();

// Dev-only smoke hook: `?smoke` runs one puzzle per level through the real worker.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('smoke')) {
  void import('./generator/smoke').then((m) => m.runSmoke());
}
