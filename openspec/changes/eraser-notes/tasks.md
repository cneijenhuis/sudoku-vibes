# Tasks

## 1. Logic

- [ ] 1.1 Add `erasing`, `eraseNotes`, `hasVisibleNotes` and the transitions in `src/game/state.ts`; verify unit tests: cell-first erase of the selected cell (selection kept, digits untouched, filled cell and no selection no-ops), number-first erase by tapping cells, long-press enter/leave, switching to a digit and back to the eraser, tapping a filled cell does nothing, last note erased ends the mode, hidden notes of a complete digit do not count as visible, erase not in undo history and untouched mistakes, undo/redo behaviour unchanged in eraser mode

## 2. UI and layout

- [ ] 2.1 Eraser button (column 8, key-sized, hidden without visible notes) with long-press lock reusing the digit hold styling, an eraser icon, accessible labels ("Erase notes", locked variant), portrait and landscape placement, hit-area splitting with the pencil and undo/redo in `src/ui/game.ts` and `src/style.css`; verify in Playwright at 390x844, 375x667, 320x568, 768x1024: appears only once notes exist and shifts nothing, size equals a digit key, right edge of the pencil and eraser columns match the 9 and 8 keys, hit-area sweeps with all four buttons shown (no dead zone, no overlap, pencil still reaches 44px when the eraser is hidden), board size and gaps unchanged, landscape 844x390 and 1024x768 fit
- [ ] 2.2 Verify flows in Playwright: cell-first erase, number-first long press (fill animation, lock), erase several cells, switch to a digit and back, leave by long press, auto-exit when the last note goes, paused hides it, reload and resume shows the eraser when notes exist, haptic fires on enter/leave (vibration spy); screenshot and review; update `README.md` and the e2e skill; verify `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e:smoke`, `openspec validate --all --strict`
