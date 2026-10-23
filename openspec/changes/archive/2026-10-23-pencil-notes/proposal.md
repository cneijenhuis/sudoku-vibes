# Proposal

## Why

Harder puzzles need pencil marks: candidate digits jotted into a cell without committing to one. Today every digit tap is a final, counted entry, so the player has to keep candidates in their head.

## What Changes

- A pencil button below the board, on the right, toggles notes mode. While it is on, digits are added to or removed from the selected cell as small notes instead of being placed; several notes can sit in one cell, shown as a 3x3 mini grid (1 2 3 / 4 5 6 / 7 8 9 positions).
- Notes work in both input modes: cell-first (the cell stays selected so several digits can be noted) and number-first (tapping an empty cell toggles the active digit as a note).
- Notes never count as mistakes and are never checked against the solution. Placing a digit in a cell clears that cell's notes.
- Notes are saved with the game and restored on resume.
- Landscape: the pencil button sits at the right end of the panel, under the keypad.

## Assumptions (not asked, easy to change)

- Notes mode is per game and starts off, also after resuming.
- Undo covers placed digits only; note toggles are not in the undo history.
- No automatic removal of other cells' notes when a digit is placed.
- Notes toggling is allowed while a mistake is on the board (only placing digits is blocked).

## Capabilities

### New Capabilities
- `pencil-notes`: notes mode, note entry, rendering, clearing.

### Modified Capabilities
- `game-board`: screen layout and landscape panel gain the pencil button.
- `game-persistence`: notes are saved and restored.

## Impact

`src/game/state.ts`, `src/storage/save.ts`, `src/ui/game.ts`, `src/style.css`, their tests, README. No new dependencies; the save stays version 1 with an optional `notes` field, so existing saves still load.
