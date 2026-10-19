# Design

## Context

`GameState` (src/game/state.ts) has `selected` and derives the same-number highlight from the selected cell. `Difficulty` is a numeric enum of five levels (src/engine/grading.ts) used by the generator, menu (`src/ui/levels.ts`), accent CSS classes and the status line. Generator floors live in `MIN_GIVENS` (src/generator/generate.ts). See proposal.md.

## Goals / Non-Goals

**Goals:** a single, explicit highlighted-digit concept that number-first mode can reuse; derived (not stored) completed-digit information; a sixth level that fits existing generation and grading paths.

**Non-Goals:** number-first mode itself, notes/pencil marks, per-digit remaining counters on the pad.

## Decisions

- **`highlight: number | null` in `GameState`.** Rules: tapping a filled cell sets it to that cell's digit (or null if that digit is complete); tapping a pad digit when it cannot be entered (no empty cell selected, a filled cell selected, or entry blocked by a mistake) toggles/switches it; a successful entry sets it to the entered digit; selecting an empty cell leaves it; undo leaves it. A pure `effectiveHighlight(state)` returns `null` when the digit is complete, so a stale value never shows. Alternative: keep deriving from the selected cell; rejected, it cannot express "keep 5s lit after entering".
- **Completed digits derived:** `completedDigits(state): boolean[]` counts correct instances per digit (cells equal to the solution digit); computed per render, 81 cells is trivial. The pad buttons use it for `disabled` and a greyed style. A complete digit cannot be highlighted or entered. Because it is derived, undo re-enables a digit automatically.
- **Tap vs complete digit:** `setHighlight` ignores complete digits; the button is disabled anyway.
- **Mistake interplay:** a wrong digit placed is a cell with the digit but not counted as correct, so it never makes a digit complete; entering it still highlights that digit.
- **Super Easy as an enum member below Easy.** Enum numeric values shift by one, so anywhere persisted or serialised numbers are used must be checked (nothing is persisted today). `DIFFICULTY_LABELS`, `LEVELS`, accent classes and `TECHNIQUE_DIFFICULTY` are updated; the technique map is unchanged because Super Easy and Easy share the "singles" technique, and `difficultyOf` splits them on `clues >= SUPER_EASY_GIVENS` (new constant `44`, next to `ALMOST_IMPOSSIBLE_MAX_CLUES`).
- **Generation:** Super Easy digs only down to exactly 44 givens (dig stops at floor 44, ceiling 44) and verifies singles-only solvability, retrying with a new grid otherwise. Easy's restore phase must not exceed 43 givens; if restoring would reach 44 the attempt is rejected (the regrade would otherwise yield Super Easy). Measure and record timings for the new level and re-check Easy.
- **Menu:** six buttons need roughly 6 x 56 px plus gaps and title in 667 px; button height may drop from 62 to about 54 px (still >= 44). Landscape two-column grid keeps working with six items (3 x 2).
- **Status line / accents:** Super Easy gets its own accent colour and a zero-pip indicator consistent with the existing per-level pips (pips = level index, so shift or add one).

## Risks / Trade-offs

- [Enum renumbering breaks tests that use raw numbers] → search for numeric usages; update tests to use enum names.
- [Menu crowding on 320x568] → verify at 320x568 and landscape; reduce paddings if needed.
- [A persistent highlight may confuse players who expect it to clear] → the pad toggle and the deselect-by-tapping-the-highlighted-digit behaviour make clearing one tap; revisit after play-testing.

## Measured generation timings

20 seeds (1-20) per level, `generatePuzzle(level, { seed })` with the default 8 s budget, run under Vitest on the dev container (node, single thread). All 120 puzzles were exact, unique and graded as requested.

| Level | Mean | Median | Max | Givens |
|---|---|---|---|---|
| Super Easy | 5 ms | 2 ms | 28 ms | 44 (exactly) |
| Easy | 3 ms | 2 ms | 8 ms | 36 |
| Medium | 183 ms | 113 ms | 600 ms | 32-38 |
| Hard | 921 ms | 590 ms | 4893 ms | 28-33 |
| Extreme | 66 ms | 41 ms | 261 ms | 25-32 |
| Almost Impossible | 22 ms | 18 ms | 60 ms | 22-27 |

Super Easy digs a fresh grid down to exactly 44 givens and keeps it (no restore, since restoring would add givens); at 44 givens the puzzle is essentially always singles-only, so retries are rare. Easy restores at most up to 43 givens (`maxClues`), so it can never regrade as Super Easy. The pre-existing slow tail is Hard.
