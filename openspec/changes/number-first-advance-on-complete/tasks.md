# Tasks

## 1. Logic

- [ ] 1.1 Add `nextIncompleteDigit` and apply it in the number-first entry path in `src/game/state.ts`; verify unit tests for adjacent, skipping, wrapping, wrap-and-skip and all-complete cases, number-first entry completing a digit (mode stays, next digit active and highlighted), cell-first unchanged, undo of the completing entry (mode and active digit unchanged, entry removed, digit re-enabled) and puzzle completion on the last digit

## 2. UI check

- [ ] 2.1 Verify in Playwright on a seeded puzzle in number-first mode: completing a digit moves the locked button and highlight to the next incomplete digit (including a skip and the 9-to-1 wrap), further taps place the new digit, undo keeps the active digit; take a screenshot of the state after advancing and review it
- [ ] 2.2 Verify `npm run typecheck`, `npm test`, `npm run build` and `openspec validate --all --strict` pass, and update `README.md` where it describes number-first mode ending on completion
