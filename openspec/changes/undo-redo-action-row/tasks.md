# Tasks

## 1. Logic

- [ ] 1.1 Add redo to `src/game/state.ts` (`redoStack`, `redo`, `canRedo`; undo pushes, entries clear, restore starts empty); verify unit tests: undo then redo returns the same board and notes pruning, several undos and redos in order, new entry clears the stack, redo of a wrong digit does not count another mistake and blocks further entry like any mistake, redo after `restoreGame` unavailable, redo in number-first mode (no selection, mode kept), advance-on-complete on redo, nothing changes for undo behaviour

## 2. UI and layout

- [ ] 2.1 Move pause to the left of the top bar, add the bottom action row (undo under 1, redo under 2 when available, pencil under 9) and the landscape arrangement in `src/ui/game.ts` and `src/style.css`; update `tools/e2e/lib.mjs` (`boardMetrics`) and `smoke.mjs`; verify in Playwright at 390x844, 375x667, 320x568, 360x560, 768x1024: the three gaps equal within 1px (above board, board to digits, digits to action row), undo/redo/pencil each equal to a digit key in size with undo's left edge on the 1 key and the pencil's right edge on the 9 key's, redo appears only after undo and is under the 2, hit areas meet without overlap and reach 44px wide where free, board size unchanged versus now (report numbers), nothing clips or scrolls (also with simulateSafeArea bottom 34 and standalone); landscape 844x390, 667x375, 1024x768 fits and the row order is right
- [ ] 2.2 Verify flows in Playwright: undo, redo button appears, redo restores, new entry hides it, paused hides everything, reload and resume shows no redo, tab order; screenshot and review portrait (redo hidden and shown, notes on) and landscape; update `README.md` and the e2e skill Layout bullet; verify `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e:smoke`, `openspec validate --all --strict`
