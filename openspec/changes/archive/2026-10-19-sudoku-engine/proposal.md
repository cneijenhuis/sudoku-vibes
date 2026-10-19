# Proposal

## Why

Everything in the game depends on a correct Sudoku core: validating boards, solving them, proving uniqueness, and rating difficulty. Building it as pure, UI-free logic first makes it fully unit-testable and keeps puzzle generation (next change) simple.

## What Changes

- Add a pure TypeScript board model (81-cell grid, givens vs. player entries, row/column/box peers).
- Add a solver: backtracking with candidate propagation, solution counting (stop at 2) for uniqueness checks.
- Add a logical technique solver that solves puzzles using human techniques in order of difficulty and reports which were needed.
- Add a difficulty grader mapping required techniques to Easy / Medium / Hard / Extreme / Almost Impossible.

## Capabilities

### New Capabilities
- `sudoku-solver`: Board validity checking, solving, and solution counting to establish uniqueness.
- `difficulty-grading`: Rating a puzzle into one of the five difficulty levels based on the techniques required to solve it logically.

### Modified Capabilities

## Impact

New modules under `src/engine/` with Vitest unit tests. No UI, no new dependencies. Depends on `project-scaffold-and-pages-deploy`.
