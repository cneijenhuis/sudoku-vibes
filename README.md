# Sudoku Vibes

Mobile-first Sudoku game in TypeScript (Vite, plain DOM). No runtime dependencies.

## Screens

The app opens on a start menu with the six difficulty levels (Super Easy, Easy, Medium,
Hard, Extreme, Almost Impossible). Choosing one shows a loading screen (with Cancel) while a
puzzle is generated in a Web Worker, then the game screen: top bar (pause, timer),
the board, a 1-9 number pad and below it an action row (undo under the 1, redo under the 2 while there is
something to redo, an eraser under the 8 once notes exist, the pencil under the 9). Input is cell-first: tap a cell, then a digit. Tapping a digit with no empty cell selected
highlights every cell holding it (tap again to clear); entering a digit keeps that digit
highlighted, and once all nine are placed correctly its pad button is greyed out. Wrong digits
show immediately as mistakes, block further entry until undone, and are counted; undo is
unlimited. After an undo a redo button appears and re-enters the undone entries in order (also re-pruning
notes, never counting a mistake twice); any new entry clears it and it is not saved.

**Number-first mode:** long-press a digit button (about half a second; the button fills up
from the bottom while you hold) to lock that digit in. Every cell holding it is highlighted
and tapping an empty cell places it right away, no selection needed. Tap another digit button
or any filled cell to switch digit, or long-press another button. Long-press the locked
button again to leave the mode. When the locked digit is complete the lock moves on to the
next higher digit that still needs placing (skipping finished ones, 9 wraps to 1), so you can
keep tapping; finishing the last digit finishes the puzzle. Mistakes block
placing until undone, exactly as in cell-first mode, and undo does not select a cell.
Pad buttons use pointer events (`src/ui/longpress.ts`); keyboard Enter/Space still taps.

**Completion flash:** an entry that finishes a row, column or 3x3 box flashes its nine cells
yellow once (about 700 ms); one that places the ninth correct instance of a digit flashes every
cell holding it. Several completions from one entry flash together, each cell once. Wrong digits,
undo, redo, resuming a save and the move that finishes the puzzle flash nothing, and reduced motion
turns it off. Detection is `completedUnits` in `src/game/state.ts`; the flash is a `::before`
wash under the digit (`.cell.flash` in `src/style.css`), so it never touches layout or input.

**Pencil notes:** the pencil button, one digit key in size, below the digit row and right-aligned under the 9 key (the free
space above the board, above the digits and above the pencil is three equal gaps; in landscape a compact button under
the keypad), toggles notes mode (yellow while on). With it on, tapping a digit with an empty cell selected adds or removes that
digit as a small note and keeps the cell selected, so several candidates fit in one cell, shown as a 3x3
grid (1 2 3 / 4 5 6 / 7 8 9). In number-first mode a tap on an empty cell toggles the active digit as a
note. Notes are never checked and never count as mistakes, also work while a mistake is on the board,
and placing a digit clears that cell's notes. Placing a correct digit also removes that digit's note
from every other cell in its row, column and 3x3 box (a wrong digit prunes nothing). Undo covers placed
digits only (note toggles are not in the history) but brings back the notes the undone entry removed;
an entry loaded from a save has no such record, so undoing it after a resume restores no notes.
While a digit is highlighted (selected filled cell, pressed key or number-first lock), its note in every empty cell is
drawn dark blue and extra bold (`.cell .notes .hl`), with no fill or ring. Notes mode starts off in every game, also after resume.

**Eraser:** once notes are visible on the board an eraser button appears left of the pencil (under the 8; hidden
otherwise, nothing shifts). In cell-first mode a tap clears all notes of the selected empty cell, which stays
selected. In number-first mode the eraser is a tool like a digit: hold it (same fill and padlock as a digit key) and
tap cells to clear their notes (filled cells do nothing); tap a digit to switch to it, tap the eraser to come
back, hold it again to leave. When the last visible note is gone the eraser hides and the mode ends. Clearing notes
is not part of undo (like toggling a note) and never touches placed digits. The state lives in `GameState.erasing`.

Pausing (or backgrounding the page) hides the board. Finishing the puzzle shows a
congratulations screen (a CSS-only celebration, toned down under reduced motion) with the level,
time and mistakes (a flawless run gets its own message), and three actions: **Next difficulty**
(one level harder; not offered after Almost Impossible), **Same difficulty** and **Menu**. The
two start actions use the normal loading / Cancel / error flow. Errors offer Retry / Back to menu.
Navigation lives in `src/ui/router.ts`; DOM-free game logic (state, notes, stopwatch) lives in
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
  in `src/assets/backgrounds/` and add an entry. One is picked at random at launch and another (never
  the same twice in a row) whenever a new game starts (menu, results, error retry); resuming a game or
  going back to the menu keeps it. The new image is applied once decoded, so the swap never flashes
  the fallback colour. The choice is exposed to the CSS as `--bg-image`; there is no preload (the
  service worker precaches every image, so switches are instant and offline). The plain fallback colour `#F6E9D2` shows while the photo loads or
  if it fails. The photo is the page canvas (the `<html>` background), not a fixed layer. In iOS
  home-screen mode the layout viewport is shorter than the screen (e.g. 793 against 852 points, the
  status-bar height) and fixed layers stop at that edge, which left a beige strip under the app;
  `src/theme/canvas.ts` therefore sets `--canvas-h` to the screen height there so the photo covers
  everything. It re-checks on load timers and on resize, focus, visibility and touch events, and
  decides the same way once the viewport has grown, which keeps it from flickering.
- **Fonts:** Fredoka 500/600/700 (latin subset, SIL OFL, licence in `src/assets/fonts/OFL.txt`) is
  self-hosted with `font-display: swap`, so there are no third-party requests and the service worker
  precaches it for offline play.
- **Play screen layout:** no wordmark on the play screen (it is on the menu). In portrait the board
  is centred between the bar and the number keys with a 6px side gutter (`--board-gutter`, the header
  keeps 12px) and is at most 720px. Whenever the screen is landscape (width greater than height) pause
  and the clock sit in a panel on the right above a 3x3 keypad with a compact undo/redo/pencil row and the board takes the full
  height minus the gutter; rotation is pure CSS, so game state is untouched.
- **Per-level colours** are small accents (bar, pips, chips) kept dark enough for the light glass.
- **Browser chrome:** `theme-color` and the manifest background are `#F6E9D2`. The iOS status bar
  is `black-translucent`, so the photo runs under the clock and the home-screen app is edge to edge.
  The app icon is the deckchair with the inflatable 7 from the photo (see the PWA section).

## Saving, resuming and the Back button

The game in progress is saved automatically in the browser (`localStorage`, key
`sudoku-vibes:game`, about 1 KB): after every entry, note change or undo, on pause, when the page is hidden or
closed, and when you leave mid-game. The menu then shows a **Resume** card (difficulty and elapsed
time); resuming opens the game **paused** with the board, notes, undo history, mistakes and time restored
(older saves without notes still load; the optional `notes` field holds 81 bitmasks).
Quit to menu and the Back button keep the save; finishing the puzzle clears it. Starting a new game
while a save exists asks first (an in-app sheet) and only replaces the save once confirmed. Saved
data is never trusted: it is validated strictly (version, 81-digit puzzle/solution, valid solution
grid, givens matching it, entries and notes only on empty cells, plausible mistakes and time) and silently
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
works from a sub-path like `/sudoku-vibes/`) plus icons in `public/icons/` (192, 512, maskable 512, a 180px Apple touch icon and a 32px
favicon). They are all rendered from one master image, `icons-src/icon-master.jpg` (the deckchair
with the 7, an opaque full-bleed square with the artwork inside the central 70% so the circle crop
of maskable icons keeps the 7), by `python3 icons-src/render.py` (needs Pillow; a one-off tool, not
part of the build). The large 512px icons are only fetched when the app is installed, so the service
worker does not precache them (`PRECACHE_EXCLUDE` in `build/sw-plugin.ts`).

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
npm run e2e:smoke  # browser smoke test of the built site (needs `npm run build` and Playwright, see tools/e2e)
```

## Deployment (GitHub Pages)

Pushes to `main` run `.github/workflows/deploy.yml`: type-check, test, build, then
publish `dist/` to GitHub Pages. The workflow can also be run manually
(`workflow_dispatch`). A failing check blocks the deploy.

**One-time setup:** in the repository, go to Settings -> Pages and set
**Source** to **GitHub Actions**.

The build uses `base: './'`, so it works from any sub-path such as
`https://<user>.github.io/sudoku-vibes/`.
