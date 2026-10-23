# Design

**Redo state.** `GameState` gains `redoStack: readonly Move[]` (in memory only, `[]` after `createGame` and `restoreGame`). `undo` pushes the undone move; `place` from a player entry clears it. `redo(state)`: pop, re-place the digit in that cell using the same path as `place` (so notes are cleared and, for a correct digit, peers pruned and the move records the removed bits again, the advance-on-complete rule applies as for any entry), but without counting a mistake again, then select nothing (like an entry). It refuses when the stack is empty or a mistake is on the board (a mistake is only on the board after redoing a wrong digit; undo it first, as with entry). `canRedo` drives the button.

**Layout.** The portrait grid keeps the three equal gaps; the last row becomes the action row, a 9-column grid like the pad: undo in column 1, redo in column 2 (`hidden` while nothing to redo, so the row does not shift), pencil in column 9 (and the eraser later in column 8). DOM order: pad, then the row, so tab order is digits, undo, redo, pencil. The top bar becomes `[pause 52px][timer pill 1fr]`.

**Hit areas.** The existing `::after` extension of the pencil generalises: undo and redo get the same pseudo-element (right-extending for undo, as there is nothing to its left; redo extends nowhere past its neighbours); where two visible buttons are closer than 44px the extension is limited so targets meet at the gap's midline and never overlap. Verify with `elementFromPoint` sweeps.

**Landscape.** Compact 56x44 buttons in one row under the keypad: undo and redo at the left, pencil at the right (the eraser later between). The panel top row is `[pause][timer]`.

Alternatives: undo in the top bar remains, rejected by the request; redo as a long-press of undo, rejected (hidden affordance).
