// End-to-end smoke test of the built site: menu -> game -> cell-first entry with a mistake and undo ->
// number-first mode -> board metrics. Run: npm run build && node tools/e2e/smoke.mjs
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { sweepKeys, sweepUndoRedo, boardMetrics, cellSel, digitSel, firstIndexOf, gameState, hold, launch, makePuzzle, phone, seedPuzzle, serveDist, sleep, startGame, tap, trackErrors } from './lib.mjs';

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
  assert.ok(Math.abs(m.gapAbove - m.gapBelow) < 1.01 && Math.abs(m.gapBelow - m.gapPad) < 1.01, `three equal gaps (${m.gapAbove} / ${m.gapBelow} / ${m.gapPad})`);
  assert.ok(Math.abs(m.pencil[0] - m.key9[0]) < 1 && Math.abs(m.pencil[1] - m.key9[1]) < 1, `pencil is key-sized (${m.pencil} / ${m.key9})`);
  assert.ok(Math.abs(m.pencilRight - m.key9Right) < 1, 'pencil right edge matches the 9 key');

  assert.ok(Math.abs(m.undo[0] - m.key9[0]) < 1 && Math.abs(m.undo[1] - m.key9[1]) < 1, `undo is key-sized (${m.undo})`);
  assert.ok(Math.abs(m.undoLeft - m.key1Left) < 1, `undo sits under the 1 (${m.undoLeft} / ${m.key1Left})`);
  assert.equal(m.redo, null, 'no redo before an undo');
  assert.ok(Math.abs(m.pillOffset) < 1, `timer pill centred (${m.pillOffset})`);
  assert.equal(m.hit43, true, 'pencil touch target is at least 44px wide');

  // narrowest phone: the key-sized pencil is narrower than 44px, its hit area must still reach 44px
  const narrow = await phone(browser, { width: 320, height: 568 });
  await seedPuzzle(narrow, { puzzle: makePuzzle(empty) });
  const np = await narrow.newPage();
  await np.goto(server.url, { waitUntil: 'networkidle' });
  await startGame(np, 0);
  const nm = await boardMetrics(np);
  assert.ok(nm.pencil[0] < 44 && nm.hit43 === true, `320 wide: pencil ${nm.pencil}, hit43 ${nm.hit43}`);
  assert.equal(await np.evaluate(() => { const r = document.querySelector('[data-digit="8"]').getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + 5)?.closest('[data-digit]')?.dataset.digit; }), '8', 'the 8 key is not overlapped');
  await np.tap(cellSel(empty[0]));
  await np.tap(digitSel(1));
  await np.tap('[data-action=undo]');
  assert.deepEqual(await sweepUndoRedo(np), ['undo', 'redo'], 'undo and redo touch areas meet with no dead gap');
  await np.tap('[data-action=notes]'); // a note makes the eraser appear next to the pencil
  await np.tap(digitSel(1));
  await np.tap('[data-action=notes]');
  assert.deepEqual(await sweepKeys(np, '.act-btn.eraser', '.notes-btn'), ['eraser', 'pencil'], 'eraser and pencil touch areas meet with no dead gap');
  await narrow.close();

  // cell-first: a wrong digit (a 2 where the 1 belongs; 2 still has an empty cell, so its key is enabled)
  // is a mistake and blocks further entry until undone
  await tap(page, cellSel(empty[0]));
  await tap(page, digitSel(2));
  assert.match((await gameState(page)).status, /1 mistake/);
  await tap(page, '[data-action=undo]'); // undo re-selects the cleared cell, so no cell tap is needed
  const um = await boardMetrics(page);
  assert.ok(um.redo && Math.abs(um.redoLeft - um.key2Left) < 1 && Math.abs(um.redo[0] - um.key9[0]) < 1, `redo appears under the 2 (${um.redoLeft} / ${um.key2Left})`);
  await tap(page, '[data-action=redo]'); // the wrong 2 comes back; the mistake is not counted again
  assert.match((await gameState(page)).status, /1 mistake/);
  assert.equal(await page.locator(cellSel(empty[0])).textContent(), '2');
  assert.equal((await boardMetrics(page)).redo, null, 'redo hidden when nothing is left');
  await tap(page, '[data-action=undo]');
  await tap(page, digitSel(1));
  assert.equal((await boardMetrics(page)).redo, null, 'a new entry clears redo');
  assert.equal(await page.locator(cellSel(empty[0])).textContent(), '1');

  // number-first: long-press locks the digit, tapping empty cells places it
  await hold(page, digitSel(5), 650);
  let s = await gameState(page);
  assert.equal(s.mode, 'number-first');
  assert.deepEqual(s.locked, ['5']);
  await tap(page, cellSel(empty[2]));
  assert.equal(await page.locator(cellSel(empty[2])).textContent(), '5');

  // eraser: hidden until a note exists, then key-sized under the 8 without moving anything; clears a cell's notes
  await hold(page, '.digit.locked', 650); // leave number-first (completing the 5 advanced the locked digit)
  assert.equal((await boardMetrics(page)).eraser, null, 'no eraser without notes');
  const rowBefore = await page.evaluate(() => [...document.querySelectorAll('.action-row .act-btn:not([hidden])')].map((b) => b.getBoundingClientRect().left));
  await tap(page, '[data-action=notes]');
  await tap(page, cellSel(empty[1]));
  await tap(page, digitSel(2));
  await tap(page, '[data-action=notes]');
  const em = await boardMetrics(page);
  assert.ok(em.eraser && Math.abs(em.eraser[0] - em.key9[0]) < 1 && Math.abs(em.eraser[1] - em.key9[1]) < 1, `eraser is key-sized (${em.eraser})`);
  assert.ok(Math.abs(em.eraserLeft - em.key8Left) < 1 && Math.abs(em.eraserRight - em.key8Right) < 1, 'eraser sits under the 8');
  const rowAfter = await page.evaluate(() => [...document.querySelectorAll('.action-row .act-btn:not([hidden])')].map((b) => b.getBoundingClientRect().left));
  assert.deepEqual(rowAfter.slice(0, rowBefore.length - 1), rowBefore.slice(0, -1), 'the eraser shifts nothing');
  await tap(page, '[data-action=eraser]'); // cell-first: clears the selected cell's notes
  assert.equal((await boardMetrics(page)).eraser, null, 'eraser hides with the last note');
  await tap(page, '[data-action=notes]'); // the cell is still selected after erasing
  await tap(page, digitSel(2));
  await tap(page, '[data-action=notes]');
  await hold(page, '[data-action=eraser]', 650); // number-first: locked like a digit
  assert.equal(await page.locator('[data-action=eraser]').evaluate((e) => e.classList.contains('locked')), true, 'eraser locks on hold');
  await tap(page, cellSel(empty[1])); // erasing the last note ends the mode
  s = await gameState(page);
  assert.equal(s.mode, 'cell-first');
  assert.equal((await boardMetrics(page)).eraser, null, 'eraser hides after erasing the last note');

  assert.deepEqual(errors, [], 'no console errors or failed requests');
  console.log('OK', JSON.stringify(m));
} finally {
  await browser.close();
  await server.close();
}
