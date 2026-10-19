# Tasks

## 1. Navigation core

- [ ] 1.1 Add `AppState` union and router (`src/ui/router.ts`) with `navigate`, previous-screen `dispose`, and `startGame` with request-token check, cancel and error handling; verify unit tests with a fake generator for success, cancel-then-late-result, error then retry, rapid double start and superseded rejection swallowed
- [ ] 1.2 Make the `?smoke` hook dev-only (`import.meta.env.DEV`); verify `npm run build` output no longer contains the smoke chunk

## 2. Screens

- [ ] 2.1 Build the start menu screen (`src/ui/menu.ts`) with five buttons and styles; verify a Playwright screenshot at 375x667 shows all five buttons without scrolling and the label order matches the spec
- [ ] 2.2 Build the loading screen (difficulty name + Cancel) and error screen (message, Retry, Back to menu); verify with Playwright using a throttled/forced-failure generator
- [ ] 2.3 Build the placeholder game screen (difficulty name, givens string, Back to menu) and wire `main.ts` to the router; verify end-to-end in Playwright: tap each of the five levels, reach the game screen, go back, and that tapping twice quickly starts only one game

## 3. Integration

- [ ] 3.1 Verify `npm run typecheck`, `npm test`, `npm run build` pass and the built site works from a sub-path with no console errors; update `README.md` if commands or behaviour changed
