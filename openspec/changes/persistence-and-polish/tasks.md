# Tasks

## 1. Save and resume

- [x] 1.1 Implement `serialize`/`restore` with strict validation and a throwing-safe `SaveStore` in `src/storage/`, plus `restoreGame` in `src/game/state.ts`; verify unit tests: round-trip equality of cells/history/mistakes, a table of invalid or tampered saves returning null, storage that throws on read and write, and undo after restore
- [x] 1.2 Wire saving (after board changes, on pause, on `visibilitychange` hidden and `pagehide`), clearing on completion, Quit keeping the save, and `resumeGame` opening the game paused; verify with Playwright: enter digits, reload, Resume shows the same board/mistakes/time and starts paused, undo works, completion clears the save
- [x] 1.3 Add the Resume card and the replace-confirmation sheet to the menu; verify with Playwright: confirm replaces, decline keeps, no Resume card without a save, and the menu fits 375x667 and 320x568 with the card shown

## 2. Back button

- [x] 2.1 Implement the history sync in the router (single marker entry, replaceState between non-menu screens, popstate leaves the screen safely); verify fake-History unit tests and a Playwright run: Back from game/loading/results goes to the menu, Back on the menu leaves the page, three games in a row need one Back to leave, and the game is saved after Back

## 3. Haptics

- [x] 3.1 Implement `src/ui/haptics.ts` (feature detection, setting, visibility guard, patterns), wire it to mistakes, mode changes and completion, and add the menu toggle shown only when supported; verify unit tests with a fake `navigator` and Playwright with a stubbed `navigator.vibrate` recording calls (including toggle off and persistence across reload)

## 4. PWA

- [ ] 4.1 Create the SVG source, render and commit the PNG icons (192, 512, 512 maskable, 180) using the pre-installed Chromium, add the manifest and `index.html` tags; verify the icons look right (view them) and `Page.getInstallabilityErrors` reports none on the built site
- [ ] 4.2 Add the Vite plugin generating `sw.js` (file list, hashed cache name, network-first navigations, cache-first assets, activate cleanup) and `src/pwa/register.ts` (production only, relative scope, failures swallowed); verify a unit test of the generated worker content and a Playwright run from a sub-path: online load registers the worker, offline reload shows the menu and a game can be started and played
- [ ] 4.3 Verify an update: build twice with different content, confirm the second visit activates the new worker, serves only new files and deletes the old cache

## 5. Integration

- [ ] 5.1 Verify `npm run typecheck`, `npm test`, `npm run build` and `openspec validate --all --strict` pass; verify the production bundle has no test hooks, the built site has no console errors from a sub-path, and update `README.md` (resume, install, offline, haptics, Back)
