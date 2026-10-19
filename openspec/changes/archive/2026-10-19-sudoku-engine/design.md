# Design

## Context

Pure logic, no DOM, to run unchanged in a Web Worker and Vitest (see proposal.md).

## Goals / Non-Goals

**Goals:** correct and fast solving; transparent grading; no dependencies.

**Non-Goals:** puzzle generation (next change), UI, hints for players.

## Decisions

- **Board as `Uint8Array(81)`** with precomputed peer/unit index tables. Alternative: 2D arrays; rejected for speed and simplicity.
- **Bitmask candidates** (9-bit ints per cell) for propagation and the technique solver.
- **Backtracking solver** with propagation (naked/hidden singles) and minimum-remaining-values branching; `countSolutions(board, limit=2)`.
- **Technique solver** applies techniques in a fixed order, always the easiest applicable first: naked/hidden singles → locked candidates, naked/hidden pairs → triples/quads, X-Wing → Swordfish, XY-Wing. Each step records its technique; the grade is the hardest used. Alternative: score by clue count only; rejected as a poor correlate of difficulty, though clue count is used as the tie-breaker for Almost Impossible.
- **Almost Impossible** = unique puzzle where the technique solver stalls (needs guessing/advanced chains). The generator will target this by minimal clues.
- **Public API** in `src/engine/index.ts`: `parse`, `serialize`, `findConflicts`, `solve`, `countSolutions`, `analyze`, `grade`, `Difficulty` enum.

## Risks / Trade-offs

- [Technique grading may not match perceived difficulty] → thresholds are constants in one place, tunable after play-testing.
- [Hard techniques are bug-prone] → each gets targeted unit tests using published example grids.
