// End-to-end smoke test of the built site: menu -> game -> cell-first entry with a mistake and undo ->
// number-first mode -> board metrics. Run: npm run build && node tools/e2e/smoke.mjs
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { boardMetrics, cellSel, digitSel, firstIndexOf, gameState, hold, launch, makePuzzle, phone, seedPuzzle, serveDist, sleep, startGame, tap, trackErrors } from './lib.mjs';

await access('dist/index.html').catch(() => { throw new Error('dist/ not found: run `npm run build` first'); });
const server = await serveDist();
const browser = await launch();
try {
  const empty = [firstIndexOf(1), firstIndexOf(2), firstIndexOf(5), firstIndexOf(5) + 9];
  const ctx = await phone(browser, { width: 375, height: 667 });
  await seedPuzzle(ctx, { puzzle: makePuzzle(empty) });
  const page = await ctx.newPage();
  const errors = trackErrors(page);
  await page.goto(server.url, { waitUntil: 'networkidle' });
  await startGame(page, 0);

  const m = await boardMetrics(page);
  assert.equal(m.scrolls, false, 'no scrolling');
  assert.ok(m.board[0] >= 360, `board is large (${m.board})`);
  assert.ok(Math.abs(m.gapAbove - m.gapBelow) < 1.01, `board centred (${m.gapAbove} / ${m.gapBelow})`);

  // cell-first: a wrong digit (a 2 where the 1 belongs; 2 still has an empty cell, so its key is enabled)
  // is a mistake and blocks further entry until undone
  await tap(page, cellSel(empty[0]));
  await tap(page, digitSel(2));
  assert.match((await gameState(page)).status, /1 mistake/);
  await tap(page, '[data-action=undo]'); // undo re-selects the cleared cell, so no cell tap is needed
  await tap(page, digitSel(1));
  assert.equal(await page.locator(cellSel(empty[0])).textContent(), '1');

  // number-first: long-press locks the digit, tapping empty cells places it
  await hold(page, digitSel(5), 650);
  let s = await gameState(page);
  assert.equal(s.mode, 'number-first');
  assert.deepEqual(s.locked, ['5']);
  await tap(page, cellSel(empty[2]));
  assert.equal(await page.locator(cellSel(empty[2])).textContent(), '5');

  assert.deepEqual(errors, [], 'no console errors or failed requests');
  console.log('OK', JSON.stringify(m));
} finally {
  await browser.close();
  await server.close();
}
