// End-to-end checks of the game background toggle (photo / light / dark) on the built site.
// Run: npm run build && npm run e2e:background
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { launch, makePuzzle, phone, seedPuzzle, serveDist, simulateSafeArea, simulateStandalone, sleep, startGame, tap, trackErrors } from './lib.mjs';

await access('dist/index.html').catch(() => { throw new Error('dist/ not found: run `npm run build` first'); });
const KEY = 'sudoku-vibes:background';
const PHOTO_COLOR = '#F6E9D2';
const COLORS = { photo: PHOTO_COLOR, light: '#F4F1EA', dark: '#0F151D' };
const puzzle = makePuzzle([0]); // cell 0 (a 5) is the only empty cell
const server = await serveDist();
const browser = await launch();

const snap = (page) =>
  page.evaluate(() => ({
    scene: document.documentElement.dataset.scene ?? null,
    meta: document.querySelector('meta[name=theme-color]')?.content,
    screen: document.querySelector('main')?.className ?? '',
    label: document.querySelector('[data-action=scene]')?.getAttribute('aria-label') ?? null,
    icon: document.querySelector('[data-action=scene] svg')?.innerHTML ?? null,
    time: document.querySelector('[data-testid=time]')?.textContent ?? null,
    cells: [...document.querySelectorAll('.cell')].map((c) => c.textContent).join(''),
    selected: [...document.querySelectorAll('.cell')].findIndex((c) => c.classList.contains('selected')),
  }));
const expectScene = async (page, mode, why) => {
  const s = await snap(page);
  assert.equal(s.scene, mode === 'photo' ? null : mode, `${why}: data-scene`);
  assert.equal(s.meta, COLORS[mode], `${why}: theme-color`);
  if (s.label !== null) assert.equal(s.label, `Background: ${mode}`, `${why}: label`);
  return s;
};
const expectPhotoOutsideGame = async (page, why) => {
  const s = await snap(page);
  assert.ok(!s.screen.includes('game-screen'), `${why}: not on the game screen (${s.screen})`);
  assert.equal(s.scene, null, `${why}: no data-scene`);
  assert.equal(s.meta, PHOTO_COLOR, `${why}: theme-color restored`);
  return s;
};
const newPage = async (opts = {}) => {
  const ctx = await phone(browser, { width: 390, height: 844, ...opts.ctx });
  if (opts.setup) await opts.setup(ctx);
  await seedPuzzle(ctx, { puzzle });
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  await page.goto(server.url, { waitUntil: 'networkidle' });
  return { ctx, page, errors };
};

try {
  // --- cycling, game unaffected, persistence, scope ---
  {
    const { ctx, page, errors } = await newPage();
    await expectPhotoOutsideGame(page, 'menu');
    await startGame(page, 0);
    await tap(page, '[data-i="0"]');
    const before = await expectScene(page, 'photo', 'game start');
    assert.equal(before.selected, 0, 'cell 0 selected');
    const icons = new Set([before.icon]);
    for (const mode of ['light', 'dark', 'photo']) {
      await tap(page, '[data-action=scene]');
      const s = await expectScene(page, mode, `after tap -> ${mode}`);
      icons.add(s.icon);
      assert.equal(s.cells, before.cells, 'board unchanged');
      assert.equal(s.selected, 0, 'selection unchanged');
    }
    assert.equal(icons.size, 3, 'three distinct icons');
    await sleep(1300);
    assert.notEqual((await snap(page)).time, '0:00', 'timer keeps running');
    await tap(page, '[data-action=scene]'); await tap(page, '[data-action=scene]'); // photo -> light -> dark
    await expectScene(page, 'dark', 'dark chosen');
    assert.equal(await page.evaluate((k) => localStorage.getItem(k), KEY), 'dark', 'stored');

    await page.reload({ waitUntil: 'networkidle' });
    await expectPhotoOutsideGame(page, 'menu after reload');
    await page.tap('[data-action=resume-saved]');
    await page.waitForSelector('.board', { state: 'attached' });
    await sleep(200);
    await expectScene(page, 'dark', 'resumed game');
    await tap(page, '[data-action=resume]');
    await tap(page, '[data-action=pause]');
    await tap(page, '[data-action=quit]'); await sleep(150);
    await expectPhotoOutsideGame(page, 'quit to menu');

    // a fresh game in dark, finished: results shows the photo
    await page.evaluate((k) => { for (const key of Object.keys(localStorage)) if (key !== k) localStorage.removeItem(key); }, KEY);
    await page.reload({ waitUntil: 'networkidle' });
    await startGame(page, 0);
    await expectScene(page, 'dark', 'new game uses stored dark');
    await tap(page, '[data-i="0"]'); await tap(page, '[data-digit="5"]'); await sleep(500);
    assert.ok((await expectPhotoOutsideGame(page, 'results')).screen.includes('results-screen'), 'results screen shown');
    assert.deepEqual(errors, [], 'no console errors');
    await ctx.close();
  }

  // --- browser Back from a light game ---
  {
    const { ctx, page } = await newPage({ setup: (c) => c.addInitScript(([k, v]) => localStorage.setItem(k, v), [KEY, 'light']) });
    await startGame(page, 0);
    await expectScene(page, 'light', 'game in light');
    await page.goBack(); await sleep(400);
    await expectPhotoOutsideGame(page, 'browser Back');
    await ctx.close();
  }

  // --- garbage stored value, and blocked storage ---
  {
    const garbage = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await garbage.addInitScript(`localStorage.setItem(${JSON.stringify(KEY)}, 'sepia')`);
    await seedPuzzle(garbage, { puzzle });
    const page = await garbage.newPage();
    await page.goto(server.url, { waitUntil: 'networkidle' });
    await startGame(page, 0);
    await expectScene(page, 'photo', 'garbage value');
    await tap(page, '[data-action=scene]');
    await expectScene(page, 'light', 'garbage value, first tap');
    await garbage.close();

    const blocked = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
    await seedPuzzle(blocked, { puzzle });
    const bp = await blocked.newPage();
    const errors = trackErrors(bp);
    await bp.goto(server.url, { waitUntil: 'networkidle' });
    await startGame(bp, 0);
    await expectScene(bp, 'photo', 'blocked storage');
    for (const mode of ['light', 'dark', 'photo']) { await tap(bp, '[data-action=scene]'); await expectScene(bp, mode, `blocked storage -> ${mode}`); }
    assert.deepEqual(errors, [], 'no console errors with blocked storage');
    await blocked.close();
  }

  // --- iOS standalone with a top inset: light strip equals the inset, plain colour covers the canvas ---
  for (const mode of ['light', 'dark']) {
    const { ctx, page } = await newPage({
      setup: async (c) => { await c.addInitScript(([k, v]) => localStorage.setItem(k, v), [KEY, mode]); await simulateSafeArea(c, { top: 59, bottom: 34 }); await simulateStandalone(c, {}); },
    });
    await startGame(page, 0);
    await sleep(1200);
    const info = await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); return { h: document.documentElement.getBoundingClientRect().height, size: cs.backgroundSize, image: cs.backgroundImage, color: cs.backgroundColor }; });
    assert.equal(info.h, 852, `${mode}: root covers the whole screen`);
    if (mode === 'light') {
      assert.equal(info.size, '100% 59px', 'light: strip is as tall as the top inset');
      assert.ok(info.image.startsWith('linear-gradient'), 'light: strip drawn');
      assert.equal(info.color, 'rgb(244, 241, 234)');
    } else {
      assert.equal(info.image, 'none', 'dark: no image');
      assert.equal(info.color, 'rgb(15, 21, 29)');
    }
    await ctx.close();
  }
  console.log('background e2e: all checks passed');
} finally {
  await browser.close();
  await server.close();
}
