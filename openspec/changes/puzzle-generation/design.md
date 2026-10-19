# Design

## Context

The engine provides `parse/serialize`, `solve`, `countSolutions`, `analyze` and `grade` (see `src/engine/index.ts`). Roughly a third of sparse puzzles stall the technique solver, so Almost Impossible is easy to hit and Easy is the constrained case. See proposal.md.

## Goals / Non-Goals

**Goals:** exact-level puzzles with unique solutions, reproducible with a seed, never blocking the UI, always returning something playable.

**Non-Goals:** puzzle pre-generation/caching, daily puzzles, symmetric clue patterns.

## Decisions

- **Full grid:** fill by randomised backtracking (shuffled digit order per cell using the seeded PRNG).
- **Digging strategy depends on the target.** Visit cells in random order and remove a given only if the puzzle stays unique (`countSolutions` = 1) AND its grade does not exceed the target. Easy..Extreme stop at the first removal that would overshoot, so they naturally end at the target level; accept only if the final grade equals the target, else retry with a new grid. Almost Impossible removes without a grade cap (down to a minimal puzzle) and accepts only a puzzle whose grade is Almost Impossible. Alternative: generate minimal puzzles and filter by grade; rejected, since nearly all minimal puzzles are hard and Easy would almost never be found.
- **PRNG:** mulberry32 seeded from a 32-bit int; production seed from `crypto.getRandomValues`. The generator takes the PRNG as a parameter.
- **Time budget:** default 8 s, injectable clock for tests. On expiry return the best candidate (smallest level distance) with `exact: false`.
- **Worker:** one module worker (`src/generator/worker.ts`) handling `{id, difficulty, seed?}` and replying `{id, result}` or `{id, error}`. The client (`src/generator/client.ts`) keeps a monotonically increasing request id; replies for old ids are dropped. A superseded request's promise rejects with a `Superseded` error that callers can ignore. Alternative: terminate and respawn the worker on cancel; simpler to reason about but slower, can be added if budgets prove too long.
- **Testing:** generator logic is tested directly in Vitest with seeds and a short budget; the worker client is tested with an injected fake `Worker`. Real-worker behaviour is checked once in a browser (Playwright) during implementation.

## Risks / Trade-offs

- [Easy/Medium rejection loops are slow] → the grade-capped digging makes most attempts valid; the time budget plus fallback bounds the worst case.
- [Almost Impossible takes seconds on slow phones] → runs in the worker; the UI shows a loading state (start-menu change). Pre-generation can be added later.
- [Fallback puzzle differs from request] → the flag lets the UI choose to retry or accept; default is accept.
