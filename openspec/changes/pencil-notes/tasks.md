# Tasks

## 1. Logic and persistence

- [x] 1.1 Add notes state and `toggleNotes`/`toggleNote`, wire `pressDigit`, `tapCell`, `place` in `src/game/state.ts`; verify unit tests for toggle on/off, several notes per cell, no note on filled cell or complete digit, cell stays selected, number-first toggle, notes not blocked by a mistake, placement clears the cell's notes, undo leaves notes alone, mistakes and history untouched by notes
- [x] 1.2 Save and restore `notes` in `src/storage/save.ts` and `restoreGame`; verify unit tests for round trip, absent field (old save) loads, wrong length, out-of-range value, note on a filled cell rejected, save without notes unchanged in shape

## 2. UI

- [ ] 2.1 Pencil button, notes rendering, aria labels, save on note change in `src/ui/game.ts` and `src/style.css`; verify with Playwright (`tools/e2e/`) on a seeded puzzle: toggle, add several notes, remove one, full 123/456/789 cell, number-first note, place a digit clears notes, reload and resume shows notes, notes mode off after resume
- [ ] 2.2 Measure and screenshot portrait 390x844, 375x667, 320x568 and landscape 844x390 and 1024x768 (button right-aligned, 44px minimum, nothing clipped, board size reported), and review the screenshots for legibility of the notes in a full cell

## 3. Docs and gates

- [ ] 3.1 Update `README.md` (input section, persistence); verify `npm run typecheck`, `npm test`, `npm run build`, `openspec validate --all --strict`
