---
name: sudoku-e2e
description: Run browser end-to-end checks of the built Sudoku Vibes site (Playwright + Chromium) - smoke test, seeded puzzles, long-press, board measurements, safe-area and iOS-standalone simulation, offline and installability checks. Use whenever a UI, layout, PWA or service worker change needs verifying in a real browser.
---

# Browser checks (tools/e2e)

Helpers live in `tools/e2e/lib.mjs`; `tools/e2e/smoke.mjs` is a working example
(`npm run build && npm run e2e:smoke`). Playwright and Chromium are pre-installed; paths default to
`/opt/node-tools/node_modules/playwright` and `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
(override with `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`). Never run `playwright install`. Put throwaway
scripts and screenshots in the scratchpad, not the repo, and view screenshots with the Read tool.

## Recipes
- **Serve like Pages:** `serveDist()` serves `dist/` under `/sudoku-vibes/` and returns `{url, close}`.
- **Phone context:** `phone(browser, {width, height, dpr})` is touch-emulated; add `trackErrors(page)`.
- **Fixed puzzle:** `seedPuzzle(ctx, {puzzle})` overrides `Worker` before load (and records
  `navigator.vibrate` in `window.__vib`). `makePuzzle([indexes])` blanks cells of the built-in solution;
  digits whose nine instances are all placed are complete and their keys disabled, so wrong-digit tests
  need a digit that still has an empty cell. Never add test hooks to production code.
- **Interaction:** selectors are `[data-difficulty]`, `[data-i]` (cell), `[data-digit]`,
  `[data-action=undo|redo|eraser|notes|pause|resume|quit]`. `tap()` uses real touch taps; `hold()` is a CDP touch hold
  (number-first needs at least 450 ms, 650 is safe). After undo the cleared cell is already selected.
- **Layout:** `boardMetrics(page)` gives board size, scroll check and, in portrait, the three gaps (`gapAbove`: bar to
  board, `gapBelow`: board to digit row, `gapPad`: digit row to action row; equal by design), the pencil, undo, redo (null
  while hidden) and 9 key sizes (`pencil`, `undo`, `redo`, `key9`), edges (`pencilRight`/`key9Right`, `undoLeft`/`key1Left`,
  `redoLeft`/`key2Left`, `eraserLeft`/`key8Left`, `eraserRight`/`key8Right`; `eraser` is null while hidden), `pillOffset` (timer pill centre minus top-bar centre, 0 = centred), and `hit43` (a point 43px left of the pencil's
  right edge hits the pencil: touch target >= 44px). Check 390x844, 375x667, 320x568, 768x1024 and landscape 844x390, 667x375, 568x320,
  1024x768. `sweepKeys(page, fromSel, toSel)` / `sweepUndoRedo(page)` walk the action row in 0.25px steps and
  return what each point hits (expect `['eraser', 'pencil']`: no dead gap, no overlap). The eraser only exists once a
  note does: tap the pencil, a cell and a digit with a missing instance first.
- **Notch:** `simulateSafeArea(ctx, {left: 47, right: 47, bottom: 21})` rewrites `env(safe-area-inset-*)`
  in the CSS (injecting padding on `#app` is misleading). Do it before opening pages.
- **iOS home-screen mode:** `simulateStandalone(ctx, {})` mimics inner 793 vs outer 852 that shrinks after
  launch without a resize event; check `--canvas-h` on `<html>`.
- **Offline:** load once online, then `await server.close()` and reload. Playwright's `setOffline` does not
  reach service worker fetches, so it would pass trivially. Update test: two builds on the same origin.
- **Installability:** `installability(url)` uses a persistent context (an ordinary one reports in-incognito).

A check that was not run on a real device is unverified: say so in the report.
