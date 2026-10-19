# Proposal

## Why

The game needs a fresh, random, uniquely solvable puzzle for each of the five difficulty levels every time the player starts a game. The engine (solver, technique analysis, grading) exists; this change uses it to produce puzzles.

## What Changes

- Add a puzzle generator: builds a random complete grid, removes givens while preserving a unique solution, and keeps the puzzle at the requested difficulty as graded by the engine.
- Add a seedable random source so generation is reproducible in tests.
- Add a time budget with a graceful fallback so generation always returns a playable puzzle.
- Add a Web Worker wrapper with a promise-based API so the UI never freezes while generating.

## Capabilities

### New Capabilities
- `puzzle-generation`: Producing random, uniquely solvable puzzles (with their solutions) that grade at a requested difficulty.
- `background-generation`: Running generation off the main thread behind an asynchronous API.

### Modified Capabilities

## Impact

New modules under `src/generator/` (generator, PRNG, worker, client) plus tests. Uses `src/engine/`. No new dependencies. Vite bundles the worker with the standard `new Worker(new URL(...), { type: 'module' })` form.
