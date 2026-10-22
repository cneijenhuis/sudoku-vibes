import { BUILD_ID } from '../build-info';
import { h } from './dom';

const px = (n: number | undefined): string => (n === undefined ? '?' : `${Math.round(n * 100) / 100}`);

function safeAreaInsets(doc: Document): string {
  const probe = doc.createElement('div');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  doc.body.append(probe);
  const cs = getComputedStyle(probe);
  const out = `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`;
  probe.remove();
  return out;
}

/** A plain-text snapshot of the viewport, display mode and service worker state, for bug reports. */
export async function collectDiagnostics(win: Window = window): Promise<string> {
  const doc = win.document;
  const vv = win.visualViewport;
  const app = doc.getElementById('app');
  const nav = win.navigator as Navigator & { standalone?: boolean };
  const lines = [
    `build: ${BUILD_ID}`,
    `standalone: ${win.matchMedia('(display-mode: standalone)').matches} (navigator.standalone ${nav.standalone ?? 'n/a'})`,
    `inner: ${win.innerWidth} x ${win.innerHeight}`,
    `outer: ${win.outerWidth} x ${win.outerHeight}`,
    `screen: ${win.screen.width} x ${win.screen.height} (avail ${win.screen.availWidth} x ${win.screen.availHeight})`,
    `visualViewport: ${px(vv?.width)} x ${px(vv?.height)} offsetTop ${px(vv?.offsetTop)} pageTop ${px(vv?.pageTop)}`,
    `html client: ${doc.documentElement.clientWidth} x ${doc.documentElement.clientHeight}`,
    `#app: ${px(app?.getBoundingClientRect().height)} high`,
    `html: ${px(doc.documentElement.getBoundingClientRect().height)} high, --canvas-h ${doc.documentElement.style.getPropertyValue('--canvas-h') || 'unset'}`,
    `safe-area (t r b l): ${safeAreaInsets(doc)}`,
    `dpr: ${win.devicePixelRatio}`,
  ];
  try {
    const reg = await win.navigator.serviceWorker?.getRegistration();
    lines.push(`sw controller: ${win.navigator.serviceWorker?.controller?.scriptURL ?? 'none'}`);
    lines.push(`sw active/waiting: ${reg?.active ? 'yes' : 'no'}/${reg?.waiting ? 'yes' : 'no'}`);
    lines.push(`caches: ${(await win.caches.keys()).join(', ') || 'none'}`);
  } catch {
    lines.push('sw: unavailable');
  }
  lines.push(`ua: ${win.navigator.userAgent}`);
  return lines.join('\n');
}

/** A tiny build label for the menu; tapping it opens the diagnostics panel. */
export function buildTag(): HTMLElement {
  const tag = h('button', { class: 'build-tag', text: BUILD_ID, attrs: { type: 'button', 'aria-label': `Build ${BUILD_ID}. Show diagnostics` } });
  tag.addEventListener('click', () => {
    const pre = h('pre', { class: 'diag-text', text: 'Collecting...' });
    const close = h('button', { class: 'btn secondary glass', text: 'Close', attrs: { type: 'button' } });
    // Paints the page canvas red over the photo: shows whether the page can paint at all
    // in the strip below the layout viewport (iOS home-screen mode).
    const test = h('button', { class: 'btn secondary glass', text: 'Test: red canvas (tap again to undo)', attrs: { type: 'button' } });
    const panel = h('div', { class: 'diag glass', attrs: { role: 'dialog', 'aria-label': 'Diagnostics' } }, h('h2', { text: 'Diagnostics' }), pre, test, close);
    test.addEventListener('click', () => document.documentElement.classList.toggle('diag-canvas-test'));
    close.addEventListener('click', () => {
      document.documentElement.classList.remove('diag-canvas-test');
      panel.remove();
    });
    document.body.append(panel);
    void collectDiagnostics().then((t) => {
      pre.textContent = t;
    });
  });
  return tag;
}
