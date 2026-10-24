# Design

**Detection is pure.** `completedUnits(prev, next)` in `state.ts` returns the set of cell indices to flash: for each of the 27 units (9 rows, 9 columns, 9 boxes) all nine cells correct in `next` but not in `prev`, plus every cell holding digit d when `completedDigits(next)[d]` and not `completedDigits(prev)[d]`. Wrong cells never count (same notion of "correct" as `completedDigits`). Unit-tested without DOM.

**Only on entries.** `apply` in `game.ts` calls it for entry actions (digit presses and cell-first entry), not for undo/redo; resume builds the state without calling it; the finishing entry is skipped because the results screen takes over. A group undone and completed again flashes again, as it is a new completion.

**Rendering.** A `flash` class on the cell button, restarted by removing it, forcing a reflow and re-adding it, and removed on `animationend` (with a timeout fallback). The keyframe animates a background overlay via a `::before` pseudo-element in `--highlight` with opacity 0 -> 1 -> 0 over 700 ms, above the cell background but below the digit, so it works over selected, highlighted and mistake cells without touching the render cache key. No pointer events, no layout change. `prefers-reduced-motion: reduce` sets `animation: none`.

Alternatives considered: a ripple from the entered cell (more code, harder to read as "group complete"; can be added later); animating `background` directly (fights `.hl`/`.selected`); toggling a class inside `render()` (would be cached away or replay on every render).

Risks: `render()` replaces cell children only when the cache key changes, so the pseudo-element on the button survives; a flash on a cell whose content changes mid-flash is harmless. Haptics are unchanged (no new vibration).
