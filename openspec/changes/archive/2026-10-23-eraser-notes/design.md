# Design

**State.** Number-first currently means `mode === 'number-first'` with a digit in `highlight`. The eraser is a second tool of the same mode: add `erasing: boolean` to `GameState` (true only together with `mode === 'number-first'`). While `erasing`, `highlight` is null and `activeMode` returns `'number-first'` (it must not require a digit), so the existing guards in `tapCell`, `pressDigit`, `undo` and the haptic mode-change detection keep working. Transitions: long press on the eraser starts number-first with `erasing` (or leaves the mode when already erasing); a plain tap on the eraser while number-first switches to `erasing`; `pressDigit`/`startNumberFirst` on a digit while erasing switch to that digit (`erasing: false`); exiting the mode clears `erasing`. `eraseNotes(state, index)` clears the note mask of an empty cell (no-op for a filled cell or a cell without notes). `tapCell` while `erasing`: an empty cell is erased, a filled cell does nothing.

**Cell-first.** A tap on the eraser calls `eraseNotes(state, selected)` when an empty cell is selected; otherwise nothing. Selection is kept.

**Visibility.** `hasVisibleNotes(state)`: some empty cell has a note bit of a digit that is not complete (what the board actually shows). The button is `hidden` otherwise, like redo, so nothing shifts. A state transition that makes it false while `erasing` ends the mode (`erasing: false`, `mode: 'cell-first'`, haptic as for any end of the mode). Focus handed over like redo does.

**UI.** The eraser reuses `createLongPress` and the hold fill/lock styling of the digit keys (it is a key-sized control in the action row), with an eraser icon; locked state shows the padlock like a digit. Save needs nothing: notes are saved as masks, tools are not.

**Hit areas.** The action row already splits hit areas between neighbouring visible buttons at the midline (redo/undo); extend that to the eraser/pencil pair and to the undo/redo/eraser trio when everything is shown (columns 1, 2, 8, 9). At 320 wide the areas are about key width + gap; verify with sweeps.

**Landscape.** Compact 56x44 row: undo, redo at the left, eraser and pencil at the right (eraser left of the pencil).

Alternatives: eraser inside the undo history (rejected here: bigger history change; notes toggles are not undoable either); always-visible eraser (rejected: the request says it appears once notes exist).
