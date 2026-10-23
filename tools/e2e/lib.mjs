// Browser test helpers for Sudoku Vibes (dev tool, not part of the build; no dependencies of its own).
// Needs the pre-installed Playwright + Chromium; override with PLAYWRIGHT_MODULE / CHROMIUM_PATH.
// Never run `playwright install`. Build first: `npm run build`.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PW = process.env.PLAYWRIGHT_MODULE ?? '/opt/node-tools/node_modules/playwright/index.mjs';
export const CHROMIUM = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
export const { chromium } = await import(pathToFileURL(PW).href);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A complete valid grid; `makePuzzle` blanks the given cell indexes to get a nearly solved puzzle. */
export const SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
export const makePuzzle = (emptyIdx) => [...SOLUTION].map((c, i) => (emptyIdx.includes(i) ? '0' : c)).join('');
export const firstIndexOf = (digit) => [...SOLUTION].findIndex((c) => c === String(digit));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

/**
 * Serve `dist/` under a sub-path (like GitHub Pages: /sudoku-vibes/). `close()` kills the server, which is
 * how to test offline: Playwright's setOffline does NOT reach service worker fetches.
 */
export async function serveDist({ dir = 'dist', base = '/sudoku-vibes/', port = 0 } = {}) {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (!path.startsWith(base)) { res.writeHead(404).end('not found'); return; }
    let file = normalize(join(root, path.slice(base.length) || 'index.html'));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' }).end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  const { port: p } = server.address();
  return { url: `http://127.0.0.1:${p}${base}`, close: () => new Promise((r) => { server.close(r); server.closeAllConnections?.(); }) };
}

export const launch = () => chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox'] });

/** Touch-emulated phone context. Call newPage() on it; attach errors with trackErrors(page). */
export const phone = (browser, { width = 375, height = 667, dpr = 2, ...rest } = {}) =>
  browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, hasTouch: true, isMobile: true, ...rest });

export function trackErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

/**
 * Make the puzzle generator return a fixed puzzle instead of generating one: overrides `Worker` before
 * the app loads (never add test hooks to production code). Also records vibrate() calls in window.__vib.
 */
export function seedPuzzle(target, { puzzle, solution = SOLUTION, delayMs = 30 }) {
  return target.addInitScript(
    ({ puzzle, solution, delayMs }) => {
      window.Worker = class {
        postMessage(m) { setTimeout(() => this.onmessage && this.onmessage({ data: { id: m.id, result: { puzzle, solution, difficulty: m.difficulty, exact: true } } }), delayMs); }
        terminate() {}
      };
      window.__vib = []; navigator.vibrate = (p) => { window.__vib.push(p); return true; };
    },
    { puzzle, solution, delayMs },
  );
}

/** Tap a start-menu level button (data-difficulty 0 = Super Easy ... 5 = Almost Impossible) and wait for the board. */
export async function startGame(page, difficulty = 0) {
  await page.tap(`[data-difficulty="${difficulty}"]`);
  await page.waitForSelector('.board');
}

export const cellSel = (i) => `[data-i="${i}"]`;
export const digitSel = (d) => `[data-digit="${d}"]`;

async function center(page, sel) {
  const r = await page.locator(sel).boundingBox();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}
export async function tap(page, sel) { const c = await center(page, sel); await page.touchscreen.tap(c.x, c.y); }

/** Real touch hold through CDP (number-first mode needs a >= 450 ms press; 650 is safe). */
export async function hold(page, sel, ms = 650) {
  const cdp = await page.context().newCDPSession(page);
  const pt = await center(page, sel);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] });
  await sleep(ms);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(80);
}

/** Snapshot of the play screen for assertions. */
export const gameState = (page) =>
  page.evaluate(() => ({
    mode: document.querySelector('.game-screen')?.dataset.mode,
    locked: [...document.querySelectorAll('.digit.locked')].map((e) => e.dataset.digit),
    disabled: [...document.querySelectorAll('.digit:disabled')].map((e) => e.dataset.digit),
    highlighted: document.querySelectorAll('.cell.hl').length,
    selected: document.querySelectorAll('.cell.selected').length,
    time: document.querySelector('[data-testid=time]')?.textContent,
    status: document.querySelector('[data-testid=sub]')?.textContent,
    vibrations: window.__vib?.length ?? 0,
  }));

/**
 * Board size and the portrait gaps: above the board (from the top bar), below it (to the pencil button) and
 * between the pencil button and the digit row, plus the pencil button and 9 key sizes and right edges.
 */
export const boardMetrics = (page) =>
  page.evaluate(() => {
    const r = (s) => document.querySelector(s)?.getBoundingClientRect();
    const rd = (n) => Math.round(n * 100) / 100;
    const b = r('.board'), t = r('.topbar'), n = r('.notes-btn'), k = r('[data-digit="9"]');
    const portrait = innerHeight >= innerWidth;
    return {
      viewport: [innerWidth, innerHeight],
      board: b && [rd(b.width), rd(b.height)],
      boardLeft: b?.left, boardTop: b?.top,
      // Portrait only (in landscape the controls sit in a side panel).
      gapAbove: portrait && b && t ? rd(b.top - t.bottom) : null,
      gapBelow: portrait && b && n ? rd(n.top - b.bottom) : null,
      gapPad: portrait && n && k ? rd(k.top - n.bottom) : null,
      pencil: n && [rd(n.width), rd(n.height)],
      key9: k && [rd(k.width), rd(k.height)],
      pencilRight: n && rd(n.right), key9Right: k && rd(k.right),
      scrolls: document.documentElement.scrollHeight > innerHeight + 1 || document.documentElement.scrollWidth > innerWidth + 1,
    };
  });

/**
 * Emulate device safe-area insets (notch / home indicator) by rewriting env(safe-area-inset-*) in the CSS
 * responses. Injecting padding on #app instead is misleading: layout maths that reads env() never sees it.
 */
export function simulateSafeArea(context, { top = 0, right = 0, bottom = 0, left = 0 }) {
  const px = { top, right, bottom, left };
  return context.route('**/*.css', async (route) => {
    const res = await route.fetch();
    const css = (await res.text()).replace(/env\(\s*safe-area-inset-(top|right|bottom|left)\s*(?:,[^)]*)?\)/g, (_, side) => `${px[side]}px`);
    await route.fulfill({ response: res, body: css });
  });
}

/**
 * Emulate iOS home-screen mode quirks: standalone, and a window whose reported inner height is shorter than
 * the screen (real iPhone 15 Pro: inner 793, outer/screen 852). `innerHeight` reads `inner` for `shrinkMs`
 * after load, then `shrunk`, with no resize event, like the real device.
 */
export function simulateStandalone(target, { outerHeight = 852, innerAfter = 793, innerAtLaunch = outerHeight, shrinkMs = 300 }) {
  return target.addInitScript(
    ({ outerHeight, innerAfter, innerAtLaunch, shrinkMs }) => {
      const t0 = performance.now();
      Object.defineProperty(window, 'innerHeight', { get: () => (performance.now() - t0 < shrinkMs ? innerAtLaunch : innerAfter) });
      Object.defineProperty(window, 'outerHeight', { get: () => outerHeight });
      Object.defineProperty(navigator, 'standalone', { get: () => true });
    },
    { outerHeight, innerAfter, innerAtLaunch, shrinkMs },
  );
}

/** Installability and manifest errors (needs a PERSISTENT context, an ordinary one reports in-incognito). */
export async function installability(url) {
  const ctx = await chromium.launchPersistentContext(join(tmpdir(), `sv-pctx-${Date.now()}`), { executablePath: CHROMIUM, args: ['--no-sandbox'] });
  try {
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await sleep(1500);
    const cdp = await ctx.newCDPSession(page);
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
    const { errors } = await cdp.send('Page.getAppManifest');
    return { installabilityErrors, manifestErrors: errors };
  } finally { await ctx.close(); }
}
