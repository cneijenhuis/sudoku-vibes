# Proposal

## Why

After the Summer Vibes restyle the board is slightly smaller than before on most phones (for example 366px instead of 369px at 390x844, and 336px instead of 342px at 360x640). The cause is the designer's 12px side gutter, which replaced a gutter of about 8px plus snapping to whole cell sizes. The board is the star of the game, so it should be as large as the screen allows. The "Sudoku Vibes" pill above the board also takes vertical space and is redundant (the name is on the menu). In landscape the header bar sits above the board, which makes the board smaller than it needs to be.

## What Changes

- **Remove the "Sudoku Vibes" wordmark pill** from the play screen (the wordmark stays on the menu).
- **Larger board in portrait:** side gutter for the board and the number keys drops from 12px to 6px, and the size cap rises from 560px to 720px (tablets). Header controls keep their 12px inset. The board is centred horizontally and vertically in the space between the header and the number keys.
- **Landscape side panel:** whenever the screen is not portrait (width greater than height), undo, the timer and pause move to the right side together with the number keys, so the board takes the full height. Previously this only happened on short landscape screens.

## Capabilities

### New Capabilities

### Modified Capabilities
- `game-board`: the screen layout no longer has a wordmark pill, centres the board, and uses a right-hand panel in landscape.
- `play-screen-visuals`: the wordmark pill requirement is removed; the layout requirement sets the gutter, cap and landscape panel.

## Impact

`src/style.css` (game screen layout, removal of the wordmark-slot and `--pb` machinery, landscape media query), `src/ui/game.ts` (remove the pill markup; the `wordmark` helper stays for the menu), tests for any removed helpers, README. No behaviour changes. No new dependencies.
