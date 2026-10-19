# Design

## Context

`src/main.ts` has a trivial `mount(screen, root)`. The generator client rejects superseded or disposed requests with `Superseded`/`Disposed`; callers must handle these (a rejection nobody catches is reported as unhandled). See proposal.md.

## Goals / Non-Goals

**Goals:** a small, typed navigation core that later screens (game, results) plug into; no stale state between screens.

**Non-Goals:** URL routing, browser Back-button integration, animations/transitions, save/resume.

## Decisions

- **State as a discriminated union:** `type AppState = {screen:'menu'} | {screen:'loading', difficulty} | {screen:'error', difficulty, message} | {screen:'game', game: GeneratedPuzzle} | {screen:'results', ...}` (results arrives in a later change; the router leaves a typed slot). A single `navigate(state)` renders the matching screen via `root.replaceChildren(...)`. Alternative: a router library or hash routes; rejected as overkill for four screens.
- **Screens as pure functions** `(ctx) => HTMLElement` receiving `{navigate, state}`. Screens that own resources (none yet; the game screen will own a timer) return a `{el, dispose}` pair; the router calls the previous screen's `dispose` before mounting the next. This is what satisfies "no stale handlers or timers".
- **Starting a game:** a `startGame(difficulty)` function in the router sets `loading`, calls `generatePuzzleAsync`, and on resolve navigates to `game` only if the loading state for that request is still current (request token compare). Cancel calls the client's `dispose()` and navigates to `menu`; a later `Disposed`/`Superseded` rejection is swallowed.
- **Double taps:** buttons are disabled once a game starts and the menu is replaced immediately by the loading screen, so a second tap cannot land on a menu button.
- **Errors:** any other rejection shows the error screen; Retry re-runs `startGame` with the same difficulty.
- **Layout:** menu uses a centred column, `gap`, buttons `min-height: 56px` and `flex: 0 0 auto`, which fits 5 buttons + title in 667px.
- **Smoke hook:** gate with `import.meta.env.DEV` so Vite drops it from production.
- **Testing:** the router logic is separable from DOM construction, so it is unit-tested with a fake generator and a minimal DOM stub. No `jsdom` dependency; use plain objects for state tests and cover DOM output via a Playwright check on the built site.

## Risks / Trade-offs

- [Android Back leaves the app instead of returning to the menu] → accepted for now; revisit with History API in a polish change.
- [Hand-rolled DOM tests are thin] → keep logic in the router/state functions and verify UI in a real browser.
