# Tasks

## 1. Game state

- [x] 1.1 Implement `GameState`, `select`, `enter`, `undo`, `hasMistake`, `isComplete` in `src/game/state.ts`; verify unit tests for selection toggling, correct entry (deselects), given/filled cells unchanged, wrong entry counted, entry blocked while a mistake exists, count persists after undo, undo order and disabled-when-empty, and completion detection

## 2. Timer

- [x] 2.1 Implement the clock-injected stopwatch (`src/game/timer.ts`) with start, pause, resume, elapsed and `m:ss`/`h:mm:ss` formatting; verify unit tests including 65 s -> "1:05", pause freezing time, and no accrual while paused

## 3. Game screen

- [x] 3.1 Build board rendering (81 buttons, given/entry/mistake/selected/same classes, aria-labels, box borders) and the layout (top bar, board, number pad) in `src/ui/game.ts` and `src/style.css`; verify with Playwright screenshots at 375x667, 320x568 and 667x375 that nothing clips or scrolls and controls are >= 44px
- [x] 3.2 Wire cell-first interaction (select/toggle, digit entry, same-number highlight, mistake styling with non-colour cue, blocking, undo button disabled state); verify with Playwright: wrong digit shows mistake and blocks, undo restores entry, highlighting follows taps
- [x] 3.3 Add the timer display, pause overlay (board hidden, Resume, Quit to menu), auto-pause on `visibilitychange`, and `dispose()` cleanup; verify with Playwright that time stops while paused, the board is not visible in a paused screenshot, and quitting returns to the menu

## 4. Completion and integration

- [x] 4.1 Extend `AppState.results` with `elapsedMs` and `mistakes`, navigate on completion, and show a minimal placeholder results screen; verify end-to-end in Playwright by solving a seeded Easy puzzle using the known solution and checking the time and mistake values shown
- [x] 4.2 Verify `npm run typecheck`, `npm test`, `npm run build` pass, the built site works from a sub-path with no console errors, and update `README.md` if needed
