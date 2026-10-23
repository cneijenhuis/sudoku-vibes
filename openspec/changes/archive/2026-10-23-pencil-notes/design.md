# Design

## State

`GameState` gains `notesOn: boolean` and `notes: Uint16Array(81)` (bit `d-1` set = digit d noted; 0 for filled cells). Both immutable like `cells`. Pure functions in `state.ts`:

- `toggleNotes(state)` flips `notesOn`.
- `toggleNote(state, index, digit)`: only for an empty cell and a non-complete digit; flips the bit. Does not touch history, mistakes, highlight or selection.
- `place` clears the cell's notes. `undo` does not restore them.
- `pressDigit`: when `notesOn` and an empty cell is selected, it toggles the note and keeps the cell selected; with no empty cell selected it behaves as before (highlight). Number-first `tapCell` on an empty cell with `notesOn` toggles the active digit's note instead of placing.
- Mistake blocking applies only to `place`, not to notes.

**Alternatives.** (a) Notes in the undo history: more expected from other apps but needs a richer history type and a richer save format; deferred. (b) Auto-pruning peers' notes on placement: a bigger feature with its own undo problem; deferred. (c) Notes mode as a third `InputMode`: rejected, it is orthogonal to cell-first/number-first.

## Persistence

`serialize` adds `notes: number[]` (81 masks) only when any note exists; `restore` accepts it as optional (absent = no notes) and rejects the whole save when it is not an array of 81 integers in 0..511 or has a note on a filled cell (given or entered). `SAVE_VERSION` stays 1. `SavedGame.notes` is optional and `restoreGame` takes it. Resume starts with `notesOn` false. A note toggle triggers a save like an entry.

## UI

- Pencil button: 44px minimum, glass key style like the other controls, `aria-pressed`, label "Notes". On state uses the butter-yellow of the selected key, never red. Disabled while paused/finished.
- Portrait: a row between board region and pad, button right-aligned and aligned with the pad's right edge. The board is centred between bar and this row. Where the board is height-limited (short phones) it gets smaller by the row's height; implementer measures and reports 375x667 and 320x568.
- Landscape: the button sits right-aligned under the keypad in the panel.
- Cells render notes as a 3x3 grid of small digits (about 28% of cell width), muted ink, fixed positions, cell label gains ", notes 1, 2, 5". The cell render cache key includes the mask. A cell with a value shows no notes.
- Digit buttons keep their appearance in notes mode; no haptics for notes.
