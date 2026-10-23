# Proposal

## Why

The slim pencil row between the board and the number keys looked awkward. Play-testing picked a pencil button the size of a number key, stacked above the 9 key (option A of the contact sheet), centred in the space between board and keys.

## What Changes

- Portrait: the pencil button is exactly one digit key in width and height, its right edge in line with the 9 key.
- The free vertical space between the top bar and the digit row is split into three equal gaps: above the board, between the board and the pencil button, between the pencil button and the digit row. The board stays as large as fits, with at least a 6px gap each.
- Landscape is unchanged (assumption): the pencil button keeps its compact size under the keypad.

## Capabilities

### Modified Capabilities
- `game-board`: portrait screen layout of the pencil button.

## Impact

`src/ui/game.ts` only if the DOM needs it, `src/style.css` (`.notes-row`, `.notes-btn`, `.pad` padding, portrait layout), `tools/e2e/lib.mjs` (`boardMetrics` gaps), README. No logic, save or dependency change.
