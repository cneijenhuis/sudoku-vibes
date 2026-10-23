# Proposal

## Why

Once a digit is placed, the same digit can no longer be a candidate anywhere else in its row, column or 3x3 box. Leaving those notes in place is clutter the player must clear by hand.

## What Changes

- Placing a correct digit removes that digit's note from every other cell in the same row, column and box.
- A wrong digit prunes nothing (the player has to undo it anyway).
- Undo restores every note the undone entry removed (the entry cell's own notes and the pruned peer notes), so undo is lossless. This replaces the earlier rule that undo leaves the cell empty without notes.
- Entries restored from a save have no removal record, so undoing them after a resume restores nothing; this is a limit of the existing save format, which stays unchanged.

## Capabilities

### Modified Capabilities
- `pencil-notes`: placing a digit prunes peer notes; undo restores removed notes.

## Impact

`src/game/state.ts` (the `Move` record and `place`/`undo`) and its tests, README. No UI, save-format or dependency change.
