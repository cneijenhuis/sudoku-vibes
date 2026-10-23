# Proposal

## Why

Notes accumulate, and a cell's notes sometimes need wiping in one go. Toggling nine digits one by one is slow.

## What Changes

- Once notes exist on the board, an eraser button appears in the action row, key-sized, directly left of the pencil (under the 8).
- Cell-first: tapping the eraser clears all notes of the selected empty cell; the cell stays selected.
- Number-first: the eraser is activated like a digit (long press locks it, shown locked like a digit key), after which tapping an empty cell clears its notes. Long-pressing it again leaves the mode; tapping a digit switches to that digit; tapping the eraser while a digit is locked switches to the eraser.
- When the last note on the board is gone the eraser hides, ending the eraser mode if it was active (assumption).
- Clearing notes is not part of undo, like toggling a note (assumption). It never touches placed digits.
- Landscape (assumption): compact eraser sits just left of the pencil in the row under the keypad.
- Touch areas: with the eraser shown, the pencil's and eraser's areas meet midway between the buttons.

## Capabilities

### Modified Capabilities
- `pencil-notes`: eraser button and its two input modes; pencil touch area rule.
- `game-board`: action row gains the eraser.

## Impact

`src/game/state.ts` (eraser tool state, `eraseNotes`, wiring in `pressDigit`, `tapCell`, `activeMode`, `longPressDigit`-like action) and tests, `src/ui/game.ts` (button, long-press controller reuse, rendering), `src/style.css`, `tools/e2e`, README. No save-format or dependency change.
