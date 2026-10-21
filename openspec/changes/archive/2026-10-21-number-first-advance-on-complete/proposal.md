# Proposal

## Why

In number-first mode, finishing a digit currently drops the player back to cell-first mode, so they have to long-press the next digit to carry on. Play-testing showed the natural flow is to move straight on to the next digit that still needs placing.

## What Changes

- When the active digit in number-first mode becomes complete, the mode stays on and the next higher digit that is not yet complete becomes the active digit (wrapping from 9 to 1, skipping completed digits).
- Cell-first mode is unchanged: completing a digit there still highlights nothing.
- Undoing the completing entry does not change which digit is active.

## Capabilities

### New Capabilities

### Modified Capabilities
- `number-first-input`: completing the active digit advances to the next incomplete digit instead of ending the mode.

## Impact

`src/game/state.ts` (the entry path that currently normalises mode to cell-first on completion; `activeMode` stays as a safety net), its tests, README. No UI structure change: the pad already renders the active digit. No new dependencies.
