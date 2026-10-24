# Tasks

## 1. Logic

- [x] 1.1 Add `completedUnits(prev, next)` to `src/game/state.ts` with unit tests (row, column, box, digit, union without duplicates, wrong digit, already complete before, undo-then-redo case via states); verify `npm test`

## 2. UI

- [x] 2.1 Call it from entry actions in `src/ui/game.ts` (not undo/redo, resume or the finishing entry), add the `flash` class handling and the CSS keyframes with reduced-motion fallback in `src/style.css`; add a DOM test in the style of existing `src/main.test.ts` if feasible
- [x] 2.2 Verify with `tools/e2e/` (seeded puzzle) at 390x844 and 844x390: completing a row/column/box and a digit adds `flash` to exactly the expected cells, removes it after ~700ms, input works during it, undo/redo and resume flash nothing, reduced-motion emulation plays nothing; view screenshots mid-flash over plain, highlighted, selected cells
- [x] 2.3 Update `README.md`; verify `npm run typecheck`, `npm test`, `npm run build`, `openspec validate --all --strict`
