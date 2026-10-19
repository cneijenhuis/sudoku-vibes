# Sudoku Vibes

Mobile-first Sudoku game in TypeScript (Vite, plain DOM). No runtime dependencies.

## Screens

The app opens on a start menu with the six difficulty levels (Super Easy, Easy, Medium,
Hard, Extreme, Almost Impossible). Choosing one shows a loading screen (with Cancel) while a
puzzle is generated in a Web Worker, then the game screen: top bar (undo, timer, pause),
the board and a 1-9 number pad. Input is cell-first: tap a cell, then a digit. Tapping a digit with no empty cell selected
highlights every cell holding it (tap again to clear); entering a digit keeps that digit
highlighted, and once all nine are placed correctly its pad button is greyed out. Wrong digits
show immediately as mistakes, block further entry until undone, and are counted; undo is
unlimited.

**Number-first mode:** long-press a digit button (about half a second; the button fills up
from the bottom while you hold) to lock that digit in. Every cell holding it is highlighted
and tapping an empty cell places it right away, no selection needed. Tap another digit button
or any filled cell to switch digit, or long-press another button. Long-press the locked
button again to leave the mode; it also ends when the digit is complete. Mistakes block
placing until undone, exactly as in cell-first mode, and undo does not select a cell.
Pad buttons use pointer events (`src/ui/longpress.ts`); keyboard Enter/Space still taps.

Pausing (or backgrounding the page) hides the board. Finishing the puzzle shows
a placeholder results screen with time and mistakes. Errors offer Retry / Back to menu.
Navigation lives in `src/ui/router.ts`; DOM-free game logic (state, stopwatch) lives in
`src/game/`. In dev, `?smoke`
runs a generator smoke test (not included in production builds).

## Commands

```sh
npm install        # install dev dependencies
npm run dev        # dev server with hot reload
npm run typecheck  # tsc --noEmit (strict)
npm test           # run Vitest once
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
```

## Deployment (GitHub Pages)

Pushes to `main` run `.github/workflows/deploy.yml`: type-check, test, build, then
publish `dist/` to GitHub Pages. The workflow can also be run manually
(`workflow_dispatch`). A failing check blocks the deploy.

**One-time setup:** in the repository, go to Settings -> Pages and set
**Source** to **GitHub Actions**.

The build uses `base: './'`, so it works from any sub-path such as
`https://<user>.github.io/sudoku-vibes/`.
