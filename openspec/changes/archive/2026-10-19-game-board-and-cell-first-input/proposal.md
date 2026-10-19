# Proposal

## Why

The app can generate a puzzle but cannot yet be played. This change delivers the core game screen: the board, the top bar, the number pad and the default "cell-first" way of entering numbers, with immediate mistake feedback, unlimited undo and a pausable timer.

## What Changes

- Replace the placeholder game screen with the real one: top bar (undo left, timer centre, pause right), the 9x9 board centred, and a row of the digits 1-9 at the bottom.
- Add DOM-free game logic (cell values, selection, history, mistake count, elapsed time) with unit tests.
- Cell-first input: tap a cell to select it; a filled cell highlights all cells with the same digit; an empty cell is filled from the number pad, which then deselects it.
- A wrong digit is shown as a mistake immediately and blocks further entry until it is undone; mistakes are counted.
- Unlimited undo of any entry, including mistakes.
- Timer that counts up, with pause/resume (pausing hides the board) and auto-pause when the page is hidden.
- When the last cell is correctly filled, navigate to the `results` state carrying time and mistake count (the real results screen is a later change; a minimal placeholder shows both values).
- Pause overlay offers Resume and Quit to menu, replacing the placeholder's Back button.

## Capabilities

### New Capabilities
- `game-board`: The game screen layout, rendering of givens/entries, selection and same-number highlighting, and completion detection.
- `cell-first-input`: Selecting cells and entering digits from the number pad in the default interaction mode.
- `mistakes-and-undo`: Immediate mistake display, blocking until undone, mistake counting, and unlimited undo.
- `game-timer`: Elapsed-time display, pause/resume, and auto-pause.

### Modified Capabilities

## Impact

New `src/game/` (state, tests) and reworked `src/ui/game.ts`, `src/ui/router.ts` (results state carries stats), `src/ui/app.ts`, `src/style.css`. No new dependencies. Number-first mode, the full results screen and save/resume remain separate changes.
