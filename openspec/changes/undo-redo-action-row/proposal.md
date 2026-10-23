# Proposal

## Why

Play-testing wants the thumb-zone row at the bottom to hold the editing actions: undo under the 1, the pencil under the 9, and a redo that appears after an undo. The top bar then only needs pause, which moves to the left.

## What Changes

- Top bar: pause on the left, the timer pill takes the rest of the row (assumption); undo leaves the top bar.
- Bottom action row (portrait), below the digits and in the digit columns: undo, key-sized, under the 1; redo, key-sized, under the 2, shown only while there is something to redo; pencil under the 9 as now.
- Redo: after undoing, the redo button appears and re-enters the undone digit (also re-pruning notes), repeatedly. Any new entry clears what can be redone. Redo is not saved: after a resume nothing can be redone. Redoing a wrong digit does not count another mistake (assumption: undo never lowered the count).
- Landscape (assumption): pause left of the timer in the panel; undo, redo and pencil form the compact row under the keypad (undo left, redo next to it, pencil right).
- Touch targets: undo, redo and the pencil are narrow keys; each gets a transparent hit area to at least 44px wide where no neighbour is within 44px, and neighbouring targets meet in the middle of the gap otherwise.

## Capabilities

### Modified Capabilities
- `game-board`: top bar, bottom action row, landscape panel, touch targets.
- `play-screen-visuals`: header controls.
- `mistakes-and-undo`: redo.

## Impact

`src/game/state.ts` (redo stack, `redo`, `canRedo`) and tests, `src/ui/game.ts` (buttons and order), `src/style.css` (portrait grid, top bar, landscape panel), `tools/e2e` metrics/smoke, README, e2e skill Layout bullet. No save-format or dependency change.
