# Design

## Context

`src/ui/game.ts` is a placeholder. `GeneratedPuzzle` provides `puzzle` and `solution` as 81-character strings. The router (`src/ui/router.ts`) owns screens through `MountedScreen {el, dispose}`; the `results` state is an unused typed slot. Number-first mode (next change) must be able to share the same state and board. See proposal.md.

## Goals / Non-Goals

**Goals:** DOM-free, unit-tested game state; a board that renders efficiently and responsively on phones; structure that number-first mode can extend without rewrites.

**Non-Goals:** number-first mode, pencil marks/notes, hints, save/resume, sound/haptics, full results screen, peer (row/column/box) highlighting.

## Decisions

- **Game state module** `src/game/state.ts`: immutable-ish `GameState { givens, solution, cells: Uint8Array(81), selected: number|null, history: Move[], mistakes, mode }`, with pure functions `select(state, i)`, `enter(state, digit)`, `undo(state)`, `hasMistake(state)`, `isComplete(state)`. A `Move` records `{index, previous, value}`. `mode` is a field (`'cell-first'` only for now) so number-first can add a variant without changing the state shape. Alternative: class with mutation; rejected, pure functions are easier to test and diff.
- **Mistake detection** compares to `solution`, not to rule conflicts, so valid-looking but wrong digits are flagged (spec: "differs from the solution").
- **Blocking:** `enter` returns the state unchanged while `hasMistake`. Undo pops the history, so a mistake is simply the latest move.
- **Cell-first entry:** `enter` requires `selected` to be an empty cell, writes the digit, pushes a Move, increments `mistakes` if wrong, and sets `selected = null`.
- **Rendering:** a `renderBoard(state)` that updates 81 persistent button elements by toggling classes/text (no full re-create per move). Cells are `<button>` with `aria-label="Row r, column c, value v"`, in a CSS grid; thick lines come from `:nth-child` box borders. Classes: `given`, `entry`, `mistake`, `selected`, `same`. Mistake also gets an underline/strike-style cue so colour is not the only signal.
- **Layout:** `.game-screen` is a flex column: top bar, a board region (`flex: 1; min-height: 0; display:grid; place-items:center; container-type: size`), and the number pad. The board is `width: min(100cqw, 100cqh)` and square with `aspect-ratio: 1`. This avoids JS measuring. In landscape the same rule shrinks the board to the available height; the pad stays below (acceptable for the first iteration).
- **Timer:** based on `performance.now()` deltas accumulated while running, not a counted interval, so throttled timers cannot drift. A 250 ms `setInterval` only repaints. `visibilitychange` to hidden triggers pause. `dispose()` clears the interval and listeners (router contract).
- **Pause overlay** replaces board and pad contents' visibility (`visibility:hidden` on the board, an absolutely positioned overlay) so cells cannot be read from a screenshot while paused.
- **Completion:** after each `enter`, `isComplete` is checked; the game screen calls `onComplete({elapsedMs, mistakes})`. `AppState.results` gains `elapsedMs` and `mistakes`; the placeholder results screen shows both plus Back to menu.
- **Testing:** state functions unit-tested exhaustively; timer logic unit-tested with an injected clock; UI verified with Playwright against the built site.

## Risks / Trade-offs

- [Landscape layout cramped] → first iteration accepts a smaller board; refine in a polish change.
- [`cqw/cqh` container query units need modern browsers] → supported in all current mobile browsers; fall back to `min(100vw, 60dvh)` if needed.
- [Blocking after a mistake may feel strict] → matches the requested behaviour; selection stays available so the player can inspect the board.

## Implementation notes (added after review)

- In short landscape viewports the number pad becomes a 3x3 keypad beside the board (bigger board than a row below); portrait keeps the single row of nine.
- Nine digit buttons in one row are at least 44px tall but only about 30-39px wide on phones; this is a deliberate exception to the 44px rule, kept because the user asked for the digits in a row.
- Undo selects the cell it cleared so the replacement digit can be entered immediately.
