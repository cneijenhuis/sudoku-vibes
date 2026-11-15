## Context
Grading today (`src/engine/grading.ts`) maps the single hardest technique to one of six levels, with
givens thresholds for Super Easy and Almost Impossible. The generator (`src/generator/generate.ts`) digs
a random full grid to a givens floor, then restores givens until the solver finishes at the target, so
the puzzle is always the hardest state of its level. Measured on the current generator (research run in
the scratchpad): Easy always has exactly 36 givens, Medium about 32, Hard 29, Extreme 26; Easy starts
with about 17 open cells against 27 for Super Easy; Hard needs about 0.8 X-Wings per puzzle; Almost
Impossible is any minimal puzzle the solver gets stuck on.

Sources (read in full by us or supplied by the user):
- Pelánek 2014, "Difficulty Rating of Sudoku Puzzles: An Overview and Evaluation" (arXiv 1403.7373),
  >1700 puzzles, hundreds of solvers. Pearson r with mean solve time: number of givens 0.25/0.27;
  hardest technique (Sudoku Explainer) 0.70/0.86; refutation sum 0.68/0.83; "dependency" (mean number
  of simple moves available over the first k = 20–30 steps) 0.67/0.69 overall but 0.74–0.80 on
  singles-only puzzles, where technique metrics cannot discriminate; combined 0.84/0.95. Singles-only
  puzzles differ by more than 2x in solve time. Example puzzles: easy (235 s) ~10 open moves per step,
  medium (583 s) ~2–6, hard (1067 s) drops to 0–4 in the first 25 steps.
- Sudoku of the Day's published method: easiest technique first, cost summed over the whole solve,
  first use costs more; six levels with overlapping score bands Beginner 3600–4500, Easy 4300–5500,
  Medium 5300–6900, Tricky 6500–9300, Fiendish 8300–14000, Diabolical 11000–25000.
- HoDoKu, QQwing, Tatham's Solo (source read by the research agent): mainstream "Hard" is roughly
  singles, locked candidates and pairs; fish and wings start at Expert. Tatham notes easy puzzles must
  offer several moves at once.

The user chose nine levels (one per digit), the menu design "A2" from a contact sheet, no per-level
colours, best times only for flawless games, and no migration of old data.

## Goals / Non-Goals
Goals: a gentler, more gradual curve; levels 1–5 match mainstream Easy–Hard; puzzles spread within
their band; a fair puzzle always (no guessing); generation within the existing 8 s budget on a phone.
Non-goals: a pre-generated puzzle bank, chains/colouring beyond the two new techniques, statistics
beyond best times, a "new best" celebration on the results screen, changing the results layout.

## Decisions

**1. Levels.** `Difficulty` becomes a nine-member enum (values 0–8, displayed as 1–9) with labels
Super Easy, Easy, Gentle, Medium, Tricky, Hard, Tough, Extreme, Impossible. `LEVELS`/`nextDifficulty`
in `src/ui/levels.ts` follow it; hints and pips are deleted.

**2. Solver order and techniques.** Finders run in tier order, then by cost inside a tier:
tier 1 hidden single, naked single; 4 locked candidates; 5 naked pair; 6 hidden pair, naked triple,
hidden triple; 7 X-Wing, naked quad, hidden quad; 8 Swordfish, XY-Wing; 9 Skyscraper, XYZ-Wing.
Hidden before naked single because people find hidden singles first (Sudoku Explainer rates them 1.2
vs 2.3; Tatham's notes). Tier order rather than pure cost order, so a level-9 technique is never used
where a level-7 one would do. `analyze(board, maxLevel = Impossible, trackOpenMoves = true)` skips finders above `maxLevel` (a 0-based `Difficulty` value); the generator turns open-moves counting off above Gentle, where it cannot change the level.
- Skyscraper: for a digit, two rows (or columns) each with exactly two candidates, one pair of which
  shares a column (row); the other two ends see each other's peers: eliminate the digit from cells that
  see both ends.
- XYZ-Wing: pivot with candidates {x,y,z}, wings {x,z} and {y,z} each seeing the pivot (one in the
  pivot's box, one in its line); eliminate z from cells that see the pivot and both wings.
Each gets a unit test with a hand-made position where it is the only progress, plus a soundness test
(eliminations never remove the solution digit) over many random puzzles.
Alternative: also adding chains/colouring for a richer level 9. Rejected for now: more code, and two
techniques are enough to make 9 harder than 8.

**3. Score.** Sudoku of the Day's costs for the techniques it lists; for ours that it does not list:
XY-Wing and Skyscraper as its forcing chains (4200/2100), XYZ-Wing 5000/2500. Locked candidates use
"candidate lines" (350/200). One table in `grading.ts`.

**4. Open moves.** Computed during `analyze`: before each placement, count empty cells a naked or
hidden single could fill; mean over the first 25 placements (Pelánek's best k is 20–30). Deterministic
(the solver is deterministic), unlike Pelánek's randomized average; good enough and keeps grading
deterministic.

**5. Level rule.** `level = max(techniqueTier, scoreTier, openTier)`; unsolved → Impossible. Score
thresholds (score ≥ t raises the tier): 4000, 4500, 5100, 5600, 6500, 8000, 10000, 13000. Open-moves
thresholds: ≥ 8 → 1, ≥ 5 → 2, else 3. Singles cost 100 per cell, so a singles-only Super Easy puzzle has
at least 42 givens, Easy 37–41, Gentle 31–36 (or a bottleneck). The bands follow Sudoku of the Day's
midpoints split over nine levels (Beginner ≈ 1–2, Easy ≈ 3–4, Medium ≈ 5, Tricky ≈ 6, Fiendish ≈ 7–8,
Diabolical ≈ 9). Non-overlapping, so grading is a function; the spread comes from decision 6.
Alternative: HoDoKu's "technique tier unless the score pushes it up" is the same rule without the
open-moves tier.

**6. Generator.** For target level L (band [lo, hi) = the score thresholds around L; lo for level 1 is
3600, hi for level 9 is 20000): pick a goal score g uniformly in [lo, hi). Take a random full grid and a
random removal order. For each cell: remove it; analyse with `maxLevel = L`; if the solver does not
finish, or its technique or score tier exceeds L, put it back (the open-moves tier is left out here: nearly full grids have few open cells, so it would reject every early removal; the returned puzzle is still graded with all three tiers); otherwise keep the removal, and once the level equals L and
score ≥ g, stop. A puzzle that ends at level L (even below g) is a hit; otherwise keep the closest and
try a fresh grid until the budget runs out (existing fallback, `exact: false`). The capped solver
finishing proves uniqueness (all techniques are sound), so `countSolutions` is not needed per removal;
`grade()` keeps its uniqueness check. `MIN_GIVENS`, `SUPER_EASY_GIVENS`, `restore` and
`RESTORES_PER_DIG` go. The research prototype took 5–150 ms per puzzle on desktop for levels up to 8.
Alternatives: dig-then-restore (current; piles at the hard edge); a pre-generated bank (adds data to
maintain; keep as a fallback idea if level 9 proves slow).

**7. Calibration.** A dev script (`tools/calibrate.ts` or a vitest `.bench`-style test excluded from
`npm test`; implementer's choice, no new dependency) generates ≥ 100 puzzles per level with fixed seeds
and prints hit rate, median and p95 time, givens range, score and open-moves distributions, and the
technique mix. Thresholds may be tuned within ±15% to reach hit rates ≥ 95% within budget at levels 1–8,
keeping the bands strictly increasing; any change goes into this design and the spec constants. Level
9 hit rate is reported as is.

**8. Best times.** New DOM-free module `src/storage/best.ts` on the existing never-throwing `KeyValue`:
key `sudoku-vibes:best`, JSON `{ v: 1, ms: (number | null)[9] }`, validated on read (finite, > 0, below
the save's elapsed-time cap), anything else ignored and removed. `recordBest(level, ms, mistakes)`
writes only when mistakes are 0 and ms beats the stored value. Called where completion clears the save
(`src/ui/app.ts`). The menu reads it on mount.

**9. Save version.** `SAVE_VERSION` 1 → 2. Version-1 saves fail validation and are removed by the
existing path (`createSaves().load()`), which is exactly "drop, no migration".

**10. Menu.** `.level-box`: one glass card, 3px strong-line border, radius 16px, 0 4px 0 strong-line
drop edge, 1.5px soft-line separators, `overflow: hidden`. Side = the largest square that fits the
column width (max 420px) and the height left after title, Resume and the toggle (CSS `min()` of width
and a container-query height, no JS measuring if avoidable). Cell: `<button>` with the balloon image
(the existing hashed digit imports from `digit-sticker.ts`, reused, so they stay precached) at about
55% of the cell height (about 46% when solved) with the existing sticker drop shadow, and below it the
name (Fredoka 600, done-text colour, about 15px, scaled down on small boxes so "Super Easy" never wraps
or clips). Solved: background = new token `--solved-tint: rgba(111, 143, 163, 0.3)` (done edge at 30%),
"Best m:ss" in the same style as the name, no tick. Pressed: same 2px translate feedback as other
controls, applied to the image. Resume card and haptics toggle as now. The replace-saved confirmation
sheet is unchanged.

**11. Colours.** Delete `--c0…--c5`, `--level`, `.level-N`, `.accent-N` (and the `accent-*` classes in
TS). Replacements: Resume play disc → strong line with surface-solid icon; spinner arc → highlight ring;
loading level name → key text; results level chip border and ghost button → strong line; sparks →
highlight ring; pause time → ink; haptics toggle "on" track (was `--c1`) → entry. All are existing
tokens with contrast already tested.

## Risks / Trade-offs
- [Thresholds are educated guesses] → calibration task with numbers in the report; the user judges the
  feel on the phone and we tune constants afterwards.
- [Level 9 is rare: needs a Skyscraper/XYZ-Wing or a very high score] → budget fallback returns the
  closest (usually level 8, flagged `exact: false`); calibration reports the hit rate; a bank is the
  follow-up if it is too low.
- [Phone speed] → research prototype was fast on desktop; calibration reports desktop p95; real iPhone
  timing is unverified.
- [Score tiers can lift a technique-easy but sparse puzzle] → intended (sparse singles-only puzzles are
  slow for people), and bounded because the generator stops at the goal score.
- [Dropping saves and the six-level enum] → the user accepted losing old data.
