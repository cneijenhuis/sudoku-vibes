# Tasks

## 1. Randomness and grid generation

- [x] 1.1 Add seedable PRNG (`src/generator/random.ts`) with shuffle helper; verify tests show same seed gives same sequence and different seeds differ
- [x] 1.2 Implement random full-grid generation; verify tests that 50 seeded grids are conflict-free and complete

## 2. Puzzle generation

- [x] 2.1 Implement grade-capped digging that preserves uniqueness (`src/generator/generate.ts`); verify unique solution and consistent givens/solution tests for each level
- [x] 2.2 Implement target acceptance, retries, time budget with injectable clock, and closest-level fallback with `exact` flag; verify tests for each of the five levels with fixed seeds, the seeded-reproducibility scenario and the budget-exhausted scenario
- [x] 2.3 Measure generation time per level over 20 seeds and record typical/worst times in `design.md`; verify Easy–Extreme finish well within budget

## 3. Background generation

- [ ] 3.1 Implement the worker module and promise client with request ids, superseding and error rejection; verify unit tests with a fake Worker for resolve, superseded and error cases
- [ ] 3.2 Wire a dev smoke page/log in `main.ts` that requests a puzzle through the real worker; verify with Playwright that a puzzle arrives for each level while the main thread stays responsive (e.g. a timer keeps ticking) and `npm run build` bundles the worker
