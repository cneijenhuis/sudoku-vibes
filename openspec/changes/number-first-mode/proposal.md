# Proposal

## Why

Cell-first entry (pick a cell, then a digit) is slow when the player wants to place many instances of one digit. A "number-first" mode lets them pick a digit once and then tap every empty cell where it belongs, which is the fast way to work through a nearly solved grid.

## What Changes

- **Entering the mode:** long-pressing a digit button on the pad switches to number-first mode with that digit active. While the press is held the button fills up from the bottom as a progress animation; when it is full the mode switches on.
- **Placing:** in number-first mode, tapping an empty cell places the active digit immediately. No cell selection is involved.
- **Active digit highlighted:** every cell holding the active digit is highlighted (reusing the highlighted-digit state from the previous change) and the active pad button is shown as locked in.
- **Switching digits:** tapping another digit on the pad, or a filled cell on the board (given or entered), makes that digit active. Long-pressing another pad digit also makes it active and stays in the mode.
- **Leaving:** long-pressing the active digit again returns to cell-first mode. The mode also ends automatically when the active digit is completed or the game ends.
- Mistakes, blocking until undo, and undo behave as in cell-first mode.
- Short taps on the pad in cell-first mode keep their current behaviour.

## Capabilities

### New Capabilities
- `number-first-input`: Long-press to enter and leave number-first mode, the fill animation, placing digits by tapping cells, and switching the active digit.

### Modified Capabilities
- `mistakes-and-undo`: Clarify that blocking after a mistake and undo apply in number-first mode, and that undo does not select a cell there.

## Impact

`src/game/state.ts` (`InputMode` gains `'number-first'`; new pure transitions), a DOM-free long-press gesture helper, `src/ui/game.ts` and `style.css` (pad pointer handling, fill animation, locked-in styling), tests, README. No new dependencies.
