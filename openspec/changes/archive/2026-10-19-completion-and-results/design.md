# Design

## Context

`AppState.results` already carries `game` (a `GeneratedPuzzle`), `elapsedMs` and `mistakes`, and `resultsScreen` is a placeholder. `router.startGame(difficulty)` ignores calls while loading and already handles cancel and errors. `LEVELS` in `src/ui/levels.ts` lists levels in display order. See proposal.md.

## Goals / Non-Goals

**Goals:** a rewarding finish screen; progression logic that is a pure, tested function; no router changes.

**Non-Goals:** high scores or personal bests (could build on save/resume later), sharing, confetti libraries, sound.

## Decisions

- **Level played** is `game.difficulty` (the graded level of the puzzle actually played). If generation fell back to another level, "Same difficulty" means that level; this keeps the label on screen consistent with the action.
- **`nextDifficulty(d): Difficulty | null`** in `src/ui/levels.ts`, derived from `LEVELS` order, returning `null` for the last level. Unit-tested.
- **Actions** are buttons wired to `router.startGame(game.difficulty)` and `router.startGame(next)`. Because `startGame` replaces the screen with the loading screen synchronously, a second tap lands on the loading screen and cannot start another game; the buttons are also disabled after the first activation.
- **Hierarchy:** "Same difficulty" and "Next difficulty" are the two primary buttons (next is the visually strongest when available), "Menu" is a secondary text-style button.
- **Flawless message** when `mistakes === 0`; otherwise a plain congratulations headline. Copy kept short.
- **Celebration:** pure CSS, a few small particles or a pulsing ring behind the headline using `transform`/`opacity`, 1.5 s, no libraries; under `prefers-reduced-motion: reduce` it is removed.
- **Layout:** reuses the centred `.screen` column with the existing stat styles; verify at 320x568 and landscape.
- **Testing:** `nextDifficulty` and any copy-selection helper unit-tested; UI verified with Playwright (solve a seeded puzzle, check stats and the buttons, start Same/Next, cancel, hardest level).

## Risks / Trade-offs

- [Seeded fixture needed for e2e] → reuse the Worker-override approach from earlier checks; no hooks in production code.
- [Landscape with five stacked elements] → allow the stats and actions to sit in two columns in short viewports.

## Implementation notes (added after review)

- Result buttons ignore clicks during the first 400 ms after the screen mounts (`GHOST_CLICK_MS`): the completing tap fires on pointer-up and a trailing compatibility click could otherwise land on the Menu button under the finger. Keyboard and screen-reader activation after that window is unaffected. A sturdier alternative (require a pointerdown on the result button before honouring a pointer-originated click) is noted as a future refinement.
- If generation fell back to a different level than requested (`exact: false`), "Same difficulty" and "Next difficulty" are based on the level actually played.
