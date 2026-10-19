# Tasks

## 1. Super Easy level (engine and generator)

- [ ] 1.1 Add `SuperEasy` to `Difficulty`, the `SUPER_EASY_GIVENS = 44` rule in `difficultyOf`, labels and technique mapping; verify grading tests: a singles-only puzzle with 44 givens grades Super Easy, with 36 givens grades Easy, ordering test lists six levels, and all existing grading tests still pass
- [ ] 1.2 Generate Super Easy puzzles with exactly 44 givens and keep Easy at fewer than 44; verify per-level tests over several seeds (uniqueness, exact grade, givens count) and record timing per level for 20 seeds in `design.md`

## 2. Highlight and completed digits (game state)

- [ ] 2.1 Add `highlight`, `setHighlight`/entry/selection rules, `completedDigits` and `effectiveHighlight` to `src/game/state.ts`; verify unit tests for each scenario in the cell-first-input and game-board deltas (pad tap highlight/toggle/switch, survives empty-cell select and entry, mistake-blocked tap highlights, completed digit not highlighted or enterable, undo re-opens a digit, new game has no highlight)

## 3. UI

- [ ] 3.1 Update the game screen: highlight rendering from `effectiveHighlight`, pad buttons greyed and disabled for completed digits, keyboard/aria state (`disabled`, accessible label), tap handling for the new rules; verify with Playwright on a seeded puzzle: tapping 5 highlights 5s, entering keeps 5s lit and deselects the cell, completing a digit greys its button and clears its highlight, undo re-enables it
- [ ] 3.2 Add the Super Easy button to the menu (first, own accent) and make six buttons fit 375x667, 320x568 and landscape; verify Playwright screenshots at those sizes and that choosing Super Easy yields a game with 44 givens
- [ ] 3.3 Run `npm run typecheck`, `npm test`, `npm run build` and `openspec validate --all --strict`; verify the built site works from a sub-path with no console errors and update `README.md` if it lists levels
