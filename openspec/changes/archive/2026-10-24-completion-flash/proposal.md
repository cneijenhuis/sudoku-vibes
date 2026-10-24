# Proposal

## Why

Finishing a row, column, box or digit is a small win the board does not acknowledge. A brief yellow flash on the affected cells makes progress visible and rewarding.

## What Changes

- When an entry completes a row, column or 3x3 box, every cell of it flashes yellow once.
- When an entry completes a digit (all nine placed correctly), every cell holding that digit flashes at the same time.
- Several completions from one entry flash together as one union of cells.
- Only entries trigger it: undo, redo, resuming a save and the final move that finishes the puzzle do not.
- Reduced-motion users get no animation.

## Capabilities

### New Capabilities
- `completion-flash`: when and where the board flashes.

## Impact

`src/game/state.ts` (pure helper that lists newly completed units), `src/ui/game.ts`, `src/style.css`, tests, README. No save-format, haptics or dependency change.
