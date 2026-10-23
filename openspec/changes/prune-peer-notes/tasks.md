# Tasks

## 1. Logic

- [x] 1.1 Implement pruning and note restore in `src/game/state.ts`; verify unit tests for pruning row, column and box peers, no pruning for a wrong digit, no change to cells without that note, undo restoring peers and the entry cell's own notes, undo after `restoreGame` restoring nothing, number-first placement pruning, and unchanged `cells`/`history`/`mistakes` behaviour
- [ ] 1.2 Verify in Playwright on a seeded puzzle: note a digit in a row peer, a column peer and a box peer, place it, see the notes vanish, undo and see them return; take a screenshot and review it
- [ ] 1.3 Update `README.md`; verify `npm run typecheck`, `npm test`, `npm run build`, `openspec validate --all --strict`
