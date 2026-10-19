# Tasks

## 1. State and gesture logic

- [x] 1.1 Extend `InputMode`, add `startNumberFirst`, `exitNumberFirst`, `tapCell`, extend `pressDigit`/`undo`/`apply`, and `activeMode` in `src/game/state.ts`; verify unit tests for every number-first scenario: place, wrong placement and blocking, switch by pad and by filled cell, tap on active digit, exit, completed digit ends the mode and cannot start it, undo keeps mode without selecting, selection cleared on entry
- [x] 1.2 Implement the DOM-free long-press controller in `src/ui/longpress.ts`; verify fake-timer tests for tap, long press (once), early release cancels, swallowed pointerup after long press, pointercancel/leave

## 2. UI

- [ ] 2.1 Wire the pad to the controller (pointer events, keyboard click path, contextmenu suppression), the fill animation and reduced-motion variant, locked-in button styling, `data-mode` board tint and aria state; verify with Playwright (real pointer down/up with timed holds): animation visible mid-hold, long press enters mode, early release is a tap, long press on the active digit exits
- [ ] 2.2 Wire board taps through `tapCell`, pause/resume preserving the mode, controller cleanup in `dispose()`; verify with Playwright on a seeded puzzle: tap-fill several cells, wrong placement shows a mistake and blocks, undo restores, switching via pad and via filled cell, mode ends when the digit completes, pause/resume keeps the mode
- [ ] 2.3 Take screenshots at 375x667, 320x568 and 667x375 for cell-first, mid-hold and number-first states and review them; verify nothing clips and the modes are visually distinguishable

## 3. Integration

- [ ] 3.1 Verify `npm run typecheck`, `npm test`, `npm run build` and `openspec validate --all --strict` pass; verify the built site works from a sub-path with no console errors; update `README.md` with how to use number-first mode
