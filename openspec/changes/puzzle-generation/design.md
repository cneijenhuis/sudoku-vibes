# Design

## Context

The engine provides `parse/serialize`, `solve`, `countSolutions`, `analyze` and `grade` (see `src/engine/index.ts`). Roughly a third of sparse puzzles stall the technique solver, so Almost Impossible is easy to hit and Easy is the constrained case. See proposal.md.

## Goals / Non-Goals

**Goals:** exact-level puzzles with unique solutions, reproducible with a seed, never blocking the UI, always returning something playable.

**Non-Goals:** puzzle pre-generation/caching, daily puzzles, symmetric clue patterns.

## Decisions

- **Full grid:** fill by randomised backtracking (shuffled digit order per cell using the seeded PRNG).
- **Generation strategy: dig, then restore, with per-level floors.** Remove givens in random order while `countSolutions` stays 1, stopping at the level's minimum-givens floor (Easy 36, Medium 32, Hard 28, Extreme 25; none for Almost Impossible, which digs to a minimal puzzle). Almost Impossible keeps the result and accepts it only if it grades Almost Impossible. Every other level, if the technique solver cannot finish the dug puzzle at or below the target level, puts givens back in random order (several restore orders per dug puzzle) until it can, so a restored puzzle never has fewer givens than the floor; the puzzle is accepted only if it grades exactly as the target, otherwise retry. Adding givens never breaks uniqueness. Rejected alternative (implemented and measured first): dig downward with a grade cap, rejecting removals that overshoot the target. It gets stuck, because most paths run out of valid removals at Easy/Medium and Hard needed about 1.2 s median and 8 s worst case; steering by comparing a few candidate removals per step gave no improvement. Digging minimal puzzles and restoring is also far cheaper per attempt (about 10 ms: one uniqueness-only dig plus a handful of analyses).
- **PRNG:** mulberry32 seeded from a 32-bit int; production seed from `crypto.getRandomValues`. The generator takes the PRNG as a parameter.
- **Time budget:** default 8 s, injectable clock for tests. On expiry return the best candidate (smallest level distance) with `exact: false`.
- **Worker:** one module worker (`src/generator/worker.ts`) handling `{id, difficulty, seed?}` and replying `{id, result}` or `{id, error}`. The client (`src/generator/client.ts`) keeps a monotonically increasing request id; replies for old ids are dropped. A superseded request's promise rejects with a `Superseded` error that callers can ignore, and the worker is terminated and respawned lazily on the next request, so a stale Hard or Almost Impossible search never delays the new one (respawn costs a few ms). `dispose()` rejects the pending request with `Disposed`; worker `error` and `messageerror` events reject it and discard the worker.
- **Testing:** generator logic is tested directly in Vitest with seeds and a short budget; the worker client is tested with an injected fake `Worker`. Real-worker behaviour is checked once in a browser (Playwright) during implementation.

## Risks / Trade-offs

- [Rejection loops are slow] → attempts are cheap (about 10 ms) and each minimal puzzle gets several restore orders; the time budget plus fallback bounds the worst case. Hard is the slowest level.
- [Almost Impossible takes seconds on slow phones] → runs in the worker; the UI shows a loading state (start-menu change). Pre-generation can be added later.
- [Fallback puzzle differs from request] → the flag lets the UI choose to retry or accept; default is accept.

## Measured generation time

Measured with Node 22 in the dev container (single thread, `generatePuzzle` with seeds 1001..1020 and the minimum-givens floors enabled, budget 60 s so the fallback never triggers; milliseconds):

| Level | Median | p90 | Worst | Exact (of 20) | Avg givens | Min givens |
| --- | --- | --- | --- | --- | --- | --- |
| Easy | 3 | 5 | 17 | 20 | 36.0 | 36 |
| Medium | 64 | 146 | 207 | 20 | 32.1 | 32 |
| Hard | 511 | 1514 | 2549 | 20 | 29.0 | 28 |
| Extreme | 56 | 147 | 264 | 20 | 26.8 | 25 |
| Almost Impossible | 15 | 58 | 71 | 20 | 24.7 | 23 |

Every level hit its exact grade, and the worst case (Hard, 2.5 s) is well inside the default 8 s budget, so the exact rate within budget is 20/20 for all levels. The floors cost little: Hard and Extreme stay feasible and fast (Hard median about 0.5 s). Hard is the slowest because few dug puzzles first become solvable at Hard; Almost Impossible is fast because most minimal puzzles stall the technique solver. Phones will be several times slower, which is why generation runs in the worker.
