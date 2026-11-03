# Tasks

## 1. Logic and assets

- [x] 1.1 Add `newlyCompletedDigits(prev, next)` to `src/game/state.ts` with unit tests (completes, not yet complete, already complete before, wrong digit, undo then re-enter); verify `npm test`
- [x] 1.2 Create shrunk WebP stickers in `src/assets/digits/` from `digits/*.png` (Pillow script in the scratchpad, not committed), add `src/ui/digit-sticker.ts`; verify each file's size and alpha channel (alpha has transparent corners) and `npm run build` includes them

## 2. Play screen

- [x] 2.1 Pass the digit through the header's third slot in `src/ui/game.ts` (entries only, not the finishing entry, undo/redo or resume; replace on a new completion; clear on dispose), add the `digit-jump` keyframes, tunable custom properties and reduced-motion fallback to `src/style.css`; verify with `tools/e2e/` (seeded puzzle) at 390x844, 320x568 and 844x390: completing a digit shows exactly that sticker, it ends after three jumps, undo/redo/resume show none, replacement works, taps work during a jump, the header does not shift (measure the timer pill's box before/during), reduced-motion emulation shows it still then removes it; view screenshots at stretch and squash frames

## 3. Results screen

- [x] 3.1 Add `lastDigit` to `GameResult`, carry it through the router state to `resultsScreen`, replace the star with the infinitely jumping sticker (burst stays); verify at 390x844, 375x667, 320x568 and 844x390 that nothing scrolls or clips and the final digit shown is the one entered last; reduced motion shows it still

## 4. Wrap-up

- [x] 4.1 Update `README.md`; verify `npm run typecheck`, `npm test`, `npm run build`, `openspec validate --all --strict`, and that the offline reload still shows a sticker

## 5. Remove the in-game sticker (user decision after trying it)

- [x] 5.1 Remove the play-screen sticker: the header slot and trigger in `src/ui/game.ts`, `newlyCompletedDigits` and its tests, the play-screen-only CSS (`.sticker-slot`, `.jump`, `--jump-count`, `--sticker-size`, `--sticker-drop`, the 2 s reduced-motion hold), `preloadStickers` if no longer needed for the results screen (keep it only if the results screen uses it), and dead helpers in `digit-sticker.ts`; keep `lastDigit` for the results screen; verify with `tools/e2e/` that completing a digit flashes cells and shows no sticker, the header looks as before the change at 390x844, 320x568 and 844x390, and the results screen still shows the infinitely jumping final digit (reduced motion still); update `README.md`; verify `npm run typecheck`, `npm test`, `npm run build`, `openspec validate --all --strict`
