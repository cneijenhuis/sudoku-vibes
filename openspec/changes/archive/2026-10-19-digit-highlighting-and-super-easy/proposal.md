# Proposal

## Why

Play-testing the first playable build showed two gaps. Digits are hard to scan for: tapping a number on the pad does nothing unless a cell is selected, and entering a digit drops the highlight, so players cannot keep "all the 5s" in view while hunting for the next 5. Finished digits also stay tappable. And the lowest level (Easy, 36 givens) is still too hard for a relaxed or first-time player.

## What Changes

- **Digit highlight is its own state.** Tapping a digit on the pad (without an empty cell selected) highlights every cell with that digit; tapping it again clears it. Tapping a filled cell highlights its digit, as before.
- **Entering keeps the highlight.** Entering a digit still deselects the cell, but the entered digit stays highlighted across the board. The highlight also survives selecting an empty cell, so the player can look for where the digit fits.
- **Completed digits.** Once all nine instances of a digit are correctly on the board, its pad button is greyed out and disabled, and that digit is no longer highlighted anywhere (it cannot be highlighted again). Undoing an entry that un-completes a digit re-enables it.
- **New level "Super Easy"**: a singles-only puzzle with exactly 44 givens, shown first in the menu (six levels in total).

## Capabilities

### New Capabilities

### Modified Capabilities
- `cell-first-input`: tapping a digit without a selected empty cell highlights it; entering keeps the highlight.
- `game-board`: highlight is driven by a highlighted digit; completed digits are disabled and not highlighted.
- `start-menu`: six difficulty buttons including Super Easy, still fitting 375x667.
- `difficulty-grading`: six ordered levels; singles-only puzzles with 44 or more givens grade as Super Easy, fewer as Easy.
- `puzzle-generation`: Super Easy puzzles have exactly 44 givens and are generated and graded as requested.

## Impact

`src/game/state.ts` (highlight digit, completed digits), `src/ui/game.ts` and `style.css` (pad states, highlight classes), `src/engine/grading.ts` (new level and rule), `src/generator/generate.ts` (Super Easy target, 44 givens), `src/ui/levels.ts`/menu (sixth button, layout), plus tests. Number-first mode (next change) will reuse the highlighted-digit state, so it is introduced here. No new dependencies.
