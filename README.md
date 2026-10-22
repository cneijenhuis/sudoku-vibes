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
button again to leave the mode. When the locked digit is complete the lock moves on to the
next higher digit that still needs placing (skipping finished ones, 9 wraps to 1), so you can
keep tapping; finishing the last digit finishes the puzzle. Mistakes block
placing until undone, exactly as in cell-first mode, and undo does not select a cell.
Pad buttons use pointer events (`src/ui/longpress.ts`); keyboard Enter/Space still taps.

Pausing (or backgrounding the page) hides the board. Finishing the puzzle shows a
congratulations screen (a CSS-only celebration, toned down under reduced motion) with the level,
time and mistakes (a flawless run gets its own message), and three actions: **Next difficulty**
(one level harder; not offered after Almost Impossible), **Same difficulty** and **Menu**. The
two start actions use the normal loading / Cancel / error flow. Errors offer Retry / Back to menu.
Navigation lives in `src/ui/router.ts`; DOM-free game logic (state, stopwatch) lives in
`src/game/`. In dev, `?smoke`
runs a generator smoke test (not included in production builds).

## Look and feel (Summer Vibes)

The app is called **Sudoku Vibes** and uses a light "Summer Vibes" theme: a full-screen beach photo
behind frosted white glass surfaces, navy grid lines, a butter-yellow highlight and the rounded
Fredoka typeface. Everything is driven by the tokens at the top of `src/style.css` (colours, glass
surface, shadows; components never use literal colours, which `src/theme/tokens.test.ts` checks).

- **Glass:** the shared `.glass` class is the 86% white surface with a 3px backdrop blur. Without
  `backdrop-filter` support it becomes 94% white, and with `prefers-reduced-transparency` it is
  opaque `#FFFDF8` with no blur.
- **Background photo:** `src/theme/backgrounds.ts` lists the available backgrounds (id, image,
  fallback colour, focal position). To add one, put an optimised image (WebP, about 1170 px tall)
  in `src/assets/backgrounds/` and add an entry; one is picked per page load and exposed to the CSS
  as `--bg-image`. `index.html` preloads the first entry's image, so with several entries only that
  one benefits from the preload. The plain fallback colour `#F6E9D2` shows while the photo loads or
  if it fails.
- **Fonts:** Fredoka 500/600/700 (latin subset, SIL OFL, licence in `src/assets/fonts/OFL.txt`) is
  self-hosted with `font-display: swap`, so there are no third-party requests and the service worker
  precaches it for offline play.
- **Wordmark pill:** the play screen shows a "Sudoku Vibes" pill above the board whenever that does
  not make the board smaller than it would be without it (pure CSS, see `--pb` in `src/style.css`).
  That is the case whenever the board is width-limited (e.g. 375x667, 320x568, 360x640); it is hidden
  only when the viewport is height-limited, such as landscape.
- **Per-level colours** are small accents (bar, pips, chips) kept dark enough for the light glass.
- **Browser chrome:** `theme-color` and the manifest background are `#F6E9D2`. The iOS status bar
  is `default` (dark text on a light bar) because the white text of `black-translucent` would be
  unreadable over the bright photo. The PWA icons still show the earlier dark mark and have not been
  redrawn (design follow-up).

## Saving, resuming and the Back button

The game in progress is saved automatically in the browser (`localStorage`, key
`sudoku-vibes:game`, about 1 KB): after every entry or undo, on pause, when the page is hidden or
closed, and when you leave mid-game. The menu then shows a **Resume** card (difficulty and elapsed
time); resuming opens the game **paused** with the board, undo history, mistakes and time restored.
Quit to menu and the Back button keep the save; finishing the puzzle clears it. Starting a new game
while a save exists asks first (an in-app sheet) and only replaces the save once confirmed. Saved
data is never trusted: it is validated strictly (version, 81-digit puzzle/solution, valid solution
grid, givens matching it, entries only on empty cells, plausible mistakes and time) and silently
discarded if anything is off. If storage is blocked or full the game simply plays without saving.
Code: `src/storage/` (pure `serialize`/`restore`, never-throwing key-value wrapper) and
`restoreGame` in `src/game/state.ts`.

The browser/Android **Back** button returns from loading, error, game and results to the menu
(cancelling generation or saving the game) and leaves the page from the menu. `src/ui/history.ts`
keeps at most one extra history entry, so any number of games in a row still needs a single Back
to leave. Reloading always shows the menu (one extra Back after a reload taken mid-game, because
the pre-reload history entry still exists).

## Install, offline and updates

The app is an installable PWA: `public/manifest.webmanifest` (relative `start_url`/`scope`, so it
works from a sub-path like `/sudoku-vibes/`) plus icons in `public/icons/` (192, 512, maskable 512
and an Apple touch icon). The icons are rendered from the SVG sources in `icons-src/` with
`CHROMIUM_PATH=<chromium> NODE_PATH=<dir with playwright> node icons-src/render.mjs` (a one-off
tool, not part of the build).

`npm run build` also emits `dist/sw.js` (`build/sw-plugin.ts`, template in `src/pwa/sw-source.ts`;
no Workbox). It precaches every built file, including the puzzle-generator worker, into a cache
named from a hash of the file list and contents, so after one online visit the app starts and plays
offline. Page loads are network-first (revalidated, 3 s timeout) with the cached page as fallback,
everything else is cache-first. A new deploy shows up on the next online visit; its worker waits
until the old pages are closed (no `skipWaiting`, so an open page never mixes old and new files)
and then deletes the old cache. The worker is registered only in production builds
(`src/pwa/register.ts`) and every failure is swallowed: the game never depends on it.

## Haptics

Where `navigator.vibrate` exists (Android browsers; not iOS Safari) the app vibrates briefly on a
mistake, when number-first mode starts or ends (not when it moves to the next digit), and with a longer pattern when a puzzle is
completed. A **Vibration** switch in the menu (shown only where supported, on by default, remembered
in `localStorage`) turns it off. Nothing vibrates while the game is paused or the page is hidden
(`src/ui/haptics.ts`).

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
