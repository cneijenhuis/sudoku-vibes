# Tasks

## 1. Board and solver

- [ ] 1.1 Implement board model, parse/serialise and peer/unit tables in `src/engine/board.ts`; verify round-trip and invalid-input tests pass
- [ ] 1.2 Implement conflict detection; verify tests for row, column and box duplicates pass
- [ ] 1.3 Implement backtracking `solve` and `countSolutions` with limit; verify tests on known unique, multi-solution, empty and unsolvable boards pass

## 2. Technique solver

- [ ] 2.1 Implement candidate bitmasks and singles (naked/hidden); verify an easy puzzle solves with only singles
- [ ] 2.2 Implement locked candidates and naked/hidden pairs; verify against published example grids
- [ ] 2.3 Implement triples/quads and X-Wing; verify against published example grids
- [ ] 2.4 Implement Swordfish and XY-Wing; verify against published example grids

## 3. Grading

- [ ] 3.1 Implement `Difficulty` enum, `analyze` and `grade` with threshold constants; verify one fixture puzzle per level grades correctly and grading is deterministic
- [ ] 3.2 Export public API from `src/engine/index.ts` and verify `npm run typecheck` and `npm test` pass
