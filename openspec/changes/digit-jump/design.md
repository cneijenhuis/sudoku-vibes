## Context

The header grid is `52px 1fr 52px` with the last slot empty. Completion detection exists: `completedDigits` and `completedUnits` in `src/game/state.ts`; `apply` in `src/ui/game.ts` already knows entry vs undo/redo and the finishing entry. The results screen draws a star `.badge` with a burst around it.

## Decisions

**Detection is pure.** Add `newlyCompletedDigits(prev, next): number[]` next to `completedUnits` (digits complete in `next`, not in `prev`), unit-tested. Called only for entries, never for the finishing entry. One entry completes at most one digit (the entered one), so the first result is used.

**The final digit** is the digit of the finishing entry. `apply` already has it from the state change (the cell whose value changed); `GameResult` gets `lastDigit` and it travels through `AppState` results to `resultsScreen`.

**Assets.** Originals stay in `digits/` (full size, edited by hand if needed). Build shrunk transparent WebP, about 2x of the largest use (results badge, roughly 96px tall -> 192px tall), into `src/assets/digits/` and import them with Vite (hashed URLs, precached automatically). A small `src/ui/digit-sticker.ts` exposes `digitSticker(d): HTMLElement`.

**Motion.** One CSS keyframe `digit-jump` on an inner element, transform-only (translateY + scaleX/scaleY with `transform-origin: 50% 100%`). Iteration count 3 on the play screen (class `jump`), `infinite` on results; `animationend` removes the element, with a timer fallback. All tunables are custom properties defined once on `:root` (`--jump-ms`, `--jump-height`, `--stretch`, `--squash`) so the user can iterate by changing numbers. Starting values: 700 ms, 18px, stretch 1.08 (scaleY, scaleX 0.95), squash 0.88 (scaleY, scaleX 1.1), a rest at the end of each cycle. Reduced motion: no animation, play screen removes the sticker after 2 s.

**Layout.** The sticker sits in the third topbar slot, vertically centred on the 52px row, overflow visible so the jump can rise above the row (check it does not clip at the top safe area or cover the timer pill). Pausing hides the whole topbar already; a jump in progress is simply removed on pause/dispose.

**Replacement.** A new completion removes the current sticker and inserts a fresh one (restart), no queue.

Alternatives: a Web Animations API sequence (more code, harder for the user to tune than CSS variables); sprite sheet (no benefit); SVG trace (loses the glossy look).

Risks: image weight (9 small WebPs, a few KB each; check the total); the jump height near the top edge on the 320x568 viewport and in landscape, where the topbar lives in the side panel (the third slot must still exist there); iOS cannot be verified here.
