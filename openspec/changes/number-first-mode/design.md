# Design

## Context

`GameState` already has `mode: InputMode` (currently only `'cell-first'`), `selected`, and `highlight` (the highlighted digit), plus `pressDigit`, `select`, `enter`, `undo`, `effectiveHighlight`, `completedDigits`. The pad uses a delegated `click` handler in `src/ui/game.ts`. See proposal.md.

## Goals / Non-Goals

**Goals:** a robust, testable long-press gesture; number-first as a small extension of the existing state machine; clear visual feedback for the hold and for the active mode.

**Non-Goals:** haptics/sound, pencil marks, a setting for the long-press delay, persisting the mode.

## Decisions

- **State:** `InputMode = 'cell-first' | 'number-first'`. In number-first mode the active digit is `highlight` (invariant: non-null and not complete). New pure functions: `startNumberFirst(state, digit)` (no-op if the digit is complete; clears `selected`), `exitNumberFirst(state)` (mode back to cell-first, keeps highlight), `tapCell(state, i)` (single entry point for board taps: in cell-first it behaves as `select`; in number-first, an empty cell calls the entry logic with the active digit and without selecting, a filled cell switches the active digit unless that digit is complete, in which case nothing changes), and `pressDigit` is extended so a short tap in number-first mode switches the active digit (tap on the active digit is a no-op). A derived `activeMode(state)` returns `'cell-first'` if the active digit has become complete, so the UI and logic never act on a stale number-first state; `enter`/`apply` normalise `mode` to cell-first when the entered digit completes.
- **Undo** in number-first mode removes the move and does not set `selected` (cell-first undo still reselects).
- **Long-press gesture** as a small DOM-free controller (`src/ui/longpress.ts`) taking `{delayMs, setTimeout, clearTimeout}` and callbacks `onTap`, `onLongPress`, `onProgress`. Logic: `pointerdown` starts a timer; `pointerup` before it fires calls `onTap`; when the timer fires `onLongPress` runs once and the following `pointerup` is swallowed; `pointercancel`, `pointerleave` (moving off the button) or a drag cancel the press without a tap. Delay 450 ms. Alternative: `contextmenu`/native long-press; rejected, unreliable and the context menu is intentionally disabled.
- **Pad handlers:** pad buttons switch from `click` to pointer events through the controller, with `touch-action: manipulation` and `-webkit-touch-callout: none` retained. Keyboard activation (Enter/Space on a focused button) still works through `click` as a tap, guarded so a pointer-generated click does not double-fire. Board taps stay on `click`.
- **Fill animation:** a CSS pseudo-element on the pad button scaling from `scaleY(0)` to `1` from the bottom over the long-press delay, started on `pointerdown` (class `holding`) and removed on release or cancel. It uses `transform` only (compositor friendly) and respects `prefers-reduced-motion` by using a brief opacity change instead.
- **Active styling:** the locked-in button uses a solid fill with a lock/dot marker and `aria-pressed`; the pad container gets `data-mode="number-first"` which also tints the board border so the mode is visible without looking at the pad. The highlight colour for cells is unchanged.
- **Pause/resume** do not touch the state, so the mode is preserved (the controller is cancelled when pausing). Leaving the screen disposes the controller timers.
- **Testing:** state transitions unit-tested; the long-press controller tested with fake timers (tap, long press, cancel, swallowed pointerup); UI checked in Playwright with real pointer events using timed holds.

## Risks / Trade-offs

- [Browsers may fire `contextmenu` or text selection on long press] → already suppressed globally for `.screen`; add a `contextmenu` preventDefault on the pad and verify on the built site.
- [Accidental long-press on a pad digit while meaning to tap] → 450 ms is longer than normal taps; if too sensitive it is a single constant.
- [Pointer events on pad lose keyboard `click` path] → explicit keyboard handling and a test.
