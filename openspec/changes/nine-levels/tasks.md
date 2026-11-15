## 1. Engine: levels, techniques, score, open moves

- [x] 1.1 Nine-level `Difficulty` enum and labels in `src/engine/grading.ts`; verify with unit tests for ordering and labels
- [x] 1.2 Reorder finders by tier (design decision 2), hidden single before naked single, add `maxLevel` to `analyze`; verify with unit tests: capped solver stalls on an X-Wing puzzle at level 6 and solves it at 7; existing technique tests still pass
- [x] 1.3 Add Skyscraper and XYZ-Wing finders; verify with unit tests on hand-made positions where each is the only progress, and a soundness test (no elimination removes the solution digit) over at least 200 random generated puzzles
- [x] 1.4 Score (cost table, first/later use) and open moves (mean over first 25 placements) in the analysis; verify with unit tests for the spec scenarios (4500 for 45 singles, 5550 example) and a hand-checked open-moves count on a small fixture
- [x] 1.5 Level rule `max(technique, score, open)` with the threshold constants in one place; unsolved → Impossible; verify with unit tests covering every scenario of the difficulty-grading delta spec

## 2. Generator

- [x] 2.1 Replace dig/restore with technique-capped digging toward a random goal score (decision 6); remove `MIN_GIVENS`, `SUPER_EASY_GIVENS`, restore code; keep seed reproducibility and the budget fallback; verify with unit tests: each level grades as requested for fixed seeds, uniqueness, the capped solver solves every result, same seed gives the same puzzle, budget fallback still returns a puzzle
- [x] 2.2 Calibration script (decision 7), not part of `npm test`; run it (≥ 100 puzzles per level) and put the table (hit rate, median/p95 ms, givens range, score and open-moves spread, technique mix) in the report; tune thresholds within the allowed range only if hit rates at levels 1–8 are below 95%, and record any change in design.md and the delta spec
- [x] 2.3 Verify the spread requirement: 100 seeded Gentle puzzles, fewer than half in the top fifth of the band (unit test or calibration output, state which)

## 3. Persistence

- [x] 3.1 `SAVE_VERSION` → 2; verify with a unit test that a version-1 save is rejected and removed
- [ ] 3.2 `src/storage/best.ts` (decision 8) and recording on completion in `src/ui/app.ts`; verify with unit tests: flawless faster/slower, any mistake, invalid/garbage data, throwing storage; and in the browser (e2e) that a flawless seeded game sets the best time shown in the menu and a game with a mistake does not

## 4. Menu and colours

- [ ] 4.1 New menu box (decision 10) in `src/ui/menu.ts` and `src/style.css`, names and solved state with "Best m:ss", accessible names; delete hints and pips from `src/ui/levels.ts`; verify with `tools/e2e/` screenshots (viewed) at 390x844, 375x667, 320x568, 768x1024, 844x390 and 667x375 in three states: no best times, levels 1–4 solved (seed storage), and with a Resume entry; measure every cell ≥ 44px, no scrolling, "Super Easy" on one line, box as large as fits; compare with the approved mockup `menu-final2.png` (path in the implementer prompt)
- [ ] 4.2 Remove per-level colours (decision 11) from CSS and TS; verify `grep -n "\-\-c[0-9]\|--level\|accent-[0-9]\|level-[0-9]" src` is empty, `src/theme/tokens.test.ts` passes, and screenshots of loading, game status line, pause card and results (viewed) look right with the shared tokens
- [ ] 4.3 Regression in the browser: start a game from the menu, replace-saved confirmation, resume, results → next difficulty across the 8→9 boundary and no "Next" after Impossible, loading/cancel

## 5. Docs and gates

- [ ] 5.1 Update README (levels, grading, menu, best times, per-level colours bullet) and `openspec/config.yaml` (level list); run `npm run typecheck && npm test && npm run build` and `openspec validate --all --strict`
