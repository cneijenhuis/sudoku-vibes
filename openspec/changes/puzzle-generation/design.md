# Design

## Context

The engine provides `parse/serialize`, `solve`, `countSolutions`, `analyze` and `grade` (see `src/engine/index.ts`). Roughly a third of sparse puzzles stall the technique solver, so Almost Impossible is easy to hit and Easy is the constrained case. See proposal.md.

## Goals / Non-Goals

**Goals:** exact-level puzzles with unique solutions, reproducible with a seed, never blocking the UI, always returning something playable.

**Non-Goals:** puzzle pre-generation/caching, daily puzzles, symmetric clue patterns.

## Decisions

- **Full grid:** fill by randomised backtracking (shuffled digit order per cell using the seeded PRNG).
- **Generation strategy: dig to minimal, then restore.** Remove givens in random order while `countSolutions` stays 1, giving a minimal puzzle. Almost Impossible keeps it and accepts it only if it grades Almost Impossible. Every other level then puts givens back in random order (several restore orders per minimal puzzle) and stops at the first state the technique solver finishes at or below the target level; the puzzle is accepted only if it grades exactly as the target, otherwise retry. Adding givens never breaks uniqueness. Rejected alternative (implemented and measured first): dig downward with a grade cap, rejecting removals that overshoot the target. It gets stuck, because most paths run out of valid removals at Easy/Medium and Hard needed about 1.2 s median and 8 s worst case; steering by comparing a few candidate removals per step gave no improvement. Digging minimal puzzles and restoring is also far cheaper per attempt (about 10 ms: one uniqueness-only dig plus a handful of analyses).
- **PRNG:** mulberry32 seeded from a 32-bit int; production seed from `crypto.getRandomValues`. The generator takes the PRNG as a parameter.
- **Time budget:** default 8 s, injectable clock for tests. On expiry return the best candidate (smallest level distance) with `exact: false`.
- **Worker:** one module worker (`src/generator/worker.ts`) handling `{id, difficulty, seed?}` and replying `{id, result}` or `{id, error}`. The client (`src/generator/client.ts`) keeps a monotonically increasing request id; replies for old ids are dropped. A superseded request's promise rejects with a `Superseded` error that callers can ignore. Alternative: terminate and respawn the worker on cancel; simpler to reason about but slower, can be added if budgets prove too long.
- **Testing:** generator logic is tested directly in Vitest with seeds and a short budget; the worker client is tested with an injected fake `Worker`. Real-worker behaviour is checked once in a browser (Playwright) during implementation.

## Risks / Trade-offs

- [Easy/Medium rejection loops are slow] → the grade-capped digging makes most attempts valid; the time budget plus fallback bounds the worst case.
- [Almost Impossible takes seconds on slow phones] → runs in the worker; the UI shows a loading state (start-menu change). Pre-generation can be added later.
- [Fallback puzzle differs from request] → the flag lets the UI choose to retry or accept; default is accept.

## Measured generation time

Measured with Node 22 in the dev container (single thread, `generatePuzzle` with seeds 1001..1020, budget 60 s so fallback never triggers; milliseconds):

| Level | Median | p90 | Worst | Exact (of 20) | Avg givens |
| --- | --- | --- | --- | --- | --- |
| Easy | 10 | 22 | 26 | 20 | 26.0 |
| Medium | 25 | 55 | 117 | 20 | 25.3 |
| Hard | 476 | 1024 | 3249 | 20 | 24.9 |
| Extreme | 68 | 126 | 360 | 20 | 25.9 |
| Almost Impossible | 19 | 39 | 67 | 20 | 24.7 |

Every level hit its exact grade within the default budget. Hard is the slowest because few minimal puzzles first become solvable at Hard (they usually need only Medium techniques or jump to Extreme); a rare unlucky seed takes about 3 s, still well inside the 8 s budget. Almost Impossible is fast because most minimal puzzles stall the technique solver. Phones will be several times slower, which is why generation runs in the worker.
