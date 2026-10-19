# Design

## Context

State lives in `GameState` (src/game/state.ts), with a `Stopwatch` (src/game/timer.ts). The router (`src/ui/router.ts`) holds `AppState` and screens are built in `src/ui/app.ts`; the game screen owns the stopwatch and pause logic. The site is a Vite build with `base: './'` deployed under a sub-path. See proposal.md.

## Goals / Non-Goals

**Goals:** nothing the player did is lost; the app works offline and installs; Back works; all of it with zero new npm dependencies and without making gameplay depend on storage, the service worker or vibration.

**Non-Goals:** multiple save slots, statistics/high scores, cloud sync, push notifications, a "new version available" toast, sound.

## Decisions

- **Save format** (`src/storage/save.ts`), one `localStorage` key `sudoku-vibes:game`, JSON: `{v:1, puzzle, solution, difficulty, moves:[[index,value],...], mistakes, elapsedMs, savedAt}`. `serialize(state, difficulty, elapsedMs)` and `restore(json)` are pure; `restore` validates strictly (version, 81-digit strings, givens consistent with solution, solution conflict-free, each move on an originally empty in-range cell with a 1-9 value, `mistakes >= number of wrong moves`, `elapsedMs` finite and non-negative) and returns `null` on any failure. All storage access is wrapped in try/catch (private mode, quota). A thin `SaveStore` interface (get/set/clear) allows an in-memory fake in tests.
- **Restore into state:** `restoreGame(saved)` in `state.ts` rebuilds `cells` from givens plus moves, rebuilds `history` (`previous` is always 0), sets `mistakes` from the save, and starts cell-first with no selection or highlight. Alternative: replay moves through `enter`; rejected because mistake blocking would reject legitimate saved sequences.
- **When to save:** after each state change that touches the board, on pause, on `visibilitychange` to hidden and on `pagehide`. Writes are small (about 1 KB), so no debouncing beyond coalescing within one task. Elapsed time is read from the stopwatch at save time.
- **Lifecycle:** completion clears the save; Quit and Back leave it. Starting a game while a save exists goes through a confirm sheet in the menu. Resume is a router action `resumeGame(saved)` that navigates to `game` with the restored state and `startPaused: true`; `AppState.game` therefore carries an optional `resume` payload.
- **Menu:** a Resume card above the level list (difficulty accent, time); a small haptics toggle in the footer when `navigator.vibrate` exists. Layout compresses level buttons slightly when the card is present so 320x568 still fits; verify with Playwright.
- **PWA:** hand-written, dependency-free. `public/manifest.webmanifest` (relative `start_url`/`scope` of `./`), `public/icons/*` PNGs (192, 512, 512 maskable, 180 apple-touch) rendered once from an SVG source with the pre-installed Chromium and committed, and `<link rel=manifest>`/apple-touch tags in `index.html`. Service worker: a small Vite plugin in `vite.config.ts` (`closeBundle`/`generateBundle`) emits `sw.js` with the exact list of built files and a cache name derived from a hash of that list. Strategy: precache on install; navigations are network-first with cache fallback (so a new deploy shows up on the next online visit); other requests are cache-first from the versioned cache; `activate` deletes other caches and claims clients. Registration (`src/pwa/register.ts`) runs only when `import.meta.env.PROD`, uses a relative URL (`./sw.js`) and swallows failures. Alternative: Workbox or vite-plugin-pwa; rejected to keep zero extra dependencies.
- **Haptics** (`src/ui/haptics.ts`): `vibrate(pattern)` guarded by feature detection, an enabled flag read from `localStorage` (`sudoku-vibes:haptics`, default on) and `document.visibilityState === 'visible'`; patterns: mistake `[30]`, mode change `[15]`, completion `[40,60,40,60,120]`. Calls are made from the game screen in response to state transitions it already observes.
- **Back button:** the router syncs with `history`: entering any non-menu screen from the menu does `history.pushState` once (a marker entry); moving between non-menu screens uses `replaceState`; returning to the menu in-app calls `history.back()` only if the marker entry exists (so no stray entries accumulate); a `popstate` while on a non-menu screen triggers the screen's leave behaviour (cancel generation, save and stop the game, go to menu). A page load always starts on the menu with no marker. Alternative: hash routing; rejected, no deep links are wanted.
- **Testing:** save/restore round-trip and a table of invalid inputs; storage-failure tests with a throwing fake; haptics guard tests with a fake `navigator`; service worker file generation checked by a unit test of the plugin's output function; router/history behaviour via a fake `History`; Playwright covers reload-resume, offline reload with `context.setOffline`, installability errors via CDP (`Page.getInstallabilityErrors`) and Back handling.

## Risks / Trade-offs

- [Stale service worker caches bad build] → versioned cache names, navigation network-first, old caches deleted on activate.
- [localStorage cleared by the browser] → the game simply starts fresh; no error surface.
- [iOS has no vibration] → feature detection hides the toggle.
- [History marker bugs trap or skip Back] → keep the logic in one small module with a fake-History unit test table and Playwright Back tests.
- [Save format changes later] → `v` field and silent discard of unknown versions.
