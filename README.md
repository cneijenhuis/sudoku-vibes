# Sudoku Vibes

Mobile-first Sudoku game in TypeScript (Vite, plain DOM). No runtime dependencies.

## Screens

The app opens on a start menu with the five difficulty levels (Easy, Medium, Hard,
Extreme, Almost Impossible). Choosing one shows a loading screen (with Cancel) while a
puzzle is generated in a Web Worker, then the game screen: top bar (undo, timer, pause),
the board and a 1-9 number pad. Input is cell-first: tap a cell, then a digit. Wrong digits
show immediately as mistakes, block further entry until undone, and are counted; undo is
unlimited. Pausing (or backgrounding the page) hides the board. Finishing the puzzle shows
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
