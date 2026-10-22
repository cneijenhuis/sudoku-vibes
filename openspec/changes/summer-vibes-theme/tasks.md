# Tasks

## 1. Assets and theme foundation

- [x] 1.1 Produce the optimised background (WebP, about 1170 px tall, 150 to 250 KB) from the uploaded image into `src/assets/backgrounds/`, add `src/theme/backgrounds.ts` (list with one entry, one chosen per load, fallback colour and position); verify the file size and view the result, and that the original PNG is not committed
- [x] 1.2 Add self-hosted Fredoka woff2 files (500, 600, 700, latin subset, with the OFL licence file) under `src/assets/fonts/` and `@font-face` rules; verify with a Playwright run that text renders in Fredoka (`document.fonts`), that no request leaves the app's origin, and that the files appear in the built output and the service worker precache list. If the fonts cannot be obtained, stop and report
- [x] 1.3 Rewrite `src/style.css` around the tokens, `.glass` (with `@supports` and `prefers-reduced-transparency` fallbacks), the fixed background layer with the fallback colour, and `color-scheme: light`; preload the background from `index.html`; verify a unit test or script that lists the token values, and a Playwright check of the glass fallbacks (emulate `prefers-reduced-transparency` where supported)

## 2. Play screen

- [x] 2.1 Restyle the header (undo, timer pill, status line, pause) and add the wordmark pill with the hide-when-no-room rule; verify screenshots at 390x844, 375x667, 320x568 and 667x375 show the specified sizes and that the board is not smaller than before the change at any of them
- [x] 2.2 Restyle the board and cells (frame, dividers, given/entered/highlighted/selected/error states, error colour chosen and contrast measured); verify screenshots of each cell state side by side and measured contrast of each text/surface pair is at least 4.5:1 (compute from the rendered pixels or tokens over #FFFDF8)
- [x] 2.3 Restyle the number keys (available, selected, number-first with lock, completed with check and dashed border) and recolour the long-press fill animation; verify Playwright screenshots of each state, a mid-hold frame, and that behaviour (taps, long-press, disabled completed keys) is unchanged

## 3. Other screens and branding

- [ ] 3.1 Re-skin the menu (wordmark header "Sudoku Vibes", glass level buttons with legible accents, Resume card, haptics toggle, confirm sheet), loading/error, pause overlay and results (including the celebration on the light theme); verify screenshots of each at 375x667 and 320x568 with no scrolling and legible text over the photo
- [ ] 3.2 Apply branding: page title, manifest name/short_name and colours, apple title, theme-color, README; check the iOS `apple-mobile-web-app-status-bar-style`; verify the built `dist/index.html` and manifest values and `Page.getInstallabilityErrors` is empty

## 4. Integration

- [ ] 4.1 Verify the full flow in Playwright on the built site from a sub-path (menu, start, play incl. number-first, pause, finish, results, resume), offline reload with the photo and fonts served from the service worker cache, and no console errors; verify `npm run typecheck`, `npm test`, `npm run build` and `openspec validate --all --strict` pass, and that the existing unit tests still pass unchanged apart from copy that mentions the old name
