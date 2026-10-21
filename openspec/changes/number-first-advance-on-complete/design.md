# Design

## Context

In `src/game/state.ts`, the entry path (after placing a digit) normalises `mode` to `'cell-first'` when `completedDigits(next)[digit]` is true (see the line returning `{ ...next, mode: 'cell-first' }`). `activeMode(state)` also reports cell-first whenever the stored highlight digit is complete. `highlight` doubles as the active digit in number-first mode. See proposal.md.

## Goals / Non-Goals

**Goals:** a single, pure rule for the next digit; no change to the pad or to cell-first behaviour.

**Non-Goals:** reordering digits by remaining count, animation for the switch, a setting for the behaviour.

## Decisions

- **`nextIncompleteDigit(from, completed)`**: scans `from+1 .. 9`, then `1 .. from`, returning the first digit whose entry in `completedDigits` is false, or `null` if all are complete (the puzzle is then complete anyway). Pure and exported for tests.
- **On entry in number-first mode:** if placing the digit made it complete, set `highlight` to `nextIncompleteDigit(digit, completed)` (leaving `mode` as `'number-first'`); if it returns `null`, keep today's behaviour (normalise to cell-first, nothing highlighted) because the game finishes. Cell-first entries keep the current normalisation.
- **Undo** is untouched: it removes the move, leaves `highlight` and `mode` alone, and in number-first mode does not select a cell. The re-opened digit is simply available again on the pad.
- **`activeMode` safety net stays** (stored digit complete -> cell-first) for states produced by other paths such as undo-and-redo sequences or a restored save.
- **Haptics and UI:** the transition is a change of the active digit within number-first mode, so no 'mode' vibration fires; the pad and board already render from state.
- **Testing:** table tests for `nextIncompleteDigit` (adjacent, skip, wrap, wrap and skip, none); state tests for each delta scenario including undo and cell-first unchanged.

## Risks / Trade-offs

- [Player is moved to a digit they did not choose] → intended by the request; one tap or long-press still exits or switches.
- [Active digit changes right as the player taps quickly] → the highlight changes immediately after the completing entry, so the next tap uses the new digit; the user asked for exactly this flow.
