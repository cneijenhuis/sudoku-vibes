import './style.css';
import { startApp } from './ui/app';

const root = document.getElementById('app');
if (root) startApp(root);

// Dev-only smoke hook: `?smoke` runs one puzzle per level through the real worker.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('smoke')) {
  void import('./generator/smoke').then((m) => m.runSmoke());
}
