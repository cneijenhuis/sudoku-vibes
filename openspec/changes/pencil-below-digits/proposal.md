# Proposal

## Why

Play-testing: the numbers should come first, then the pencil. The pencil above the digit row sits between the board and the keys the player uses most.

## What Changes

- Portrait: the digit row sits directly below the board and the key-sized pencil button below the digits, its right edge in line with the 9 key (assumption: it stays right-aligned, now under the 9).
- The three equal gaps are now above the board, between the board and the digits, and between the digits and the pencil.
- Landscape is unchanged.

## Capabilities

### Modified Capabilities
- `game-board`: portrait order of digits and pencil button.

## Impact

`src/style.css` (portrait grid rows and paddings), `src/ui/game.ts` only if the DOM order must change for tab order (digits before pencil), `tools/e2e/lib.mjs` and `smoke.mjs` (gap measurement and asserts), README. No logic, save or dependency change.
