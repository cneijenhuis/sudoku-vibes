## Why
The player finds the difficulty "too steep and too difficult overall". Research
(`design.md`, sources: Pelánek 2014 "Difficulty Rating of Sudoku Puzzles", Sudoku of the Day's rating
method, HoDoKu, QQwing, Tatham's Solo) shows each of our six levels is about one tier harder than in
mainstream apps, and generated puzzles always sit at the hardest edge of their level because the
generator stops at the first state that reaches it. Grading by the single hardest technique also cannot
tell singles-only puzzles apart, though people take more than twice as long on some of them.

## What Changes
- **BREAKING** Nine levels instead of six: Super Easy, Easy, Gentle, Medium, Tricky, Hard, Tough,
  Extreme, Impossible (numbered 1–9).
- New grading: the level is the highest of three tiers: (a) the hardest technique needed, (b) a summed
  difficulty score (Sudoku of the Day's per-technique costs, first use costs more), (c) for
  singles-only play, how many cells are open to fill at each step (Pelánek's dependency measure).
- Two new techniques, Skyscraper and XYZ-Wing, which define level 9. The solver tries techniques in
  level order. Puzzles the solver cannot finish are never generated.
- New generator: removes givens one at a time while a solver limited to the target level's techniques
  still finishes, and stops at a random score inside the level's band, so puzzles spread across the
  band instead of piling up at its hard edge. The old per-level givens floors go.
- New start menu: one 3×3 sudoku box with the balloon digit images 1–9; the level name under each
  digit. A level solved without mistakes shows a grey cell and "Best m:ss" instead of the name.
- Best time per level, recorded only for games completed with zero mistakes.
- All per-level colours are removed; those elements use existing theme tokens.
- **BREAKING** Old saved games are dropped (save version bump), no migration.

## Capabilities
### New Capabilities
None (best times are part of `game-persistence`).

### Modified Capabilities
- `difficulty-grading`: nine levels, technique order and two new techniques, score, open-moves measure, grade rule.
- `puzzle-generation`: fair puzzles only, technique-capped digging, spread within the band; givens floors removed.
- `start-menu`: 3×3 balloon-digit box, names, solved state with best time.
- `results-screen`: next-difficulty order over nine levels.
- `game-persistence`: best times; old saves dropped.
- `visual-theme`: no per-level colours.

## Impact
`src/engine/{grading,techniques}.ts`, `src/generator/generate.ts`, `src/storage/` (save version, new
best-times store), `src/ui/{menu,levels,results,status,game,app}.ts`, `src/style.css`, tests, README,
`openspec/config.yaml` (level list). No new dependencies; the balloon digit images already exist.
