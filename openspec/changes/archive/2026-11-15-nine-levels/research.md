# Sudoku Vibes: difficulty calibration research

Date: 2026-11-03. Scope: web research, a reading of `src/engine/grading.ts`, `src/engine/techniques.ts`, `src/generator/generate.ts` and `openspec/specs/difficulty-grading/spec.md`, and two small experiments run on a scratchpad copy of the engine (the repo was not modified).

**Network caveat.** Most research hosts could not be reached from this session: arxiv.org, ar5iv.org, fi.muni.cz, cdn.aaai.org, sudokuwiki.org, sudokuoftheday.com, forum.enjoysudoku.com, sudokupulse.com and emerginginvestigators.org all failed to resolve or returned 403. Primary sources that *could* be read are GitHub raw files (HoDoKu, Sudoku Explainer, QQwing, Simon Tatham's Solo, pencilmark), hodoku.sourceforge.net and pypi.org. Anything taken only from search-engine snippets is labelled **[snippet]**. Anything from my own memory that I could not check is labelled **[unverified]**.

---

## 0. TL;DR

1. **What actually drives the curve today:**
   - Every level is generated at its **givens floor**. The restore loop stops at the *first* state that solves at the target level, so each puzzle is the hardest one its band allows.
   - The tiers sit about one step higher than mainstream apps use. Our "Hard" often needs an X-Wing, and our "Extreme" needs XY-Wing or Swordfish.
   - "Almost Impossible" has **no upper bound**. It is any minimal puzzle that stalls the solver, which ranges from about SE 4.4 up to 9+.
2. **The evidence on what predicts human solve time:**
   - The *hardest technique* used is a weak predictor on its own: Spearman 0.29–0.48 for SE and HoDoKu against human times. Givens count is weaker still (about 0.25 **[snippet]**).
   - Cumulative and round-based scores do better, such as Andrew Stuart's grader (0.50–0.59) and models of step complexity plus dependency or choice (Pelánek, r = 0.95 on his data; pencilmark 0.61–0.80).
   - The best-supported practical recipe has three parts: a technique tier as a *hard gate*, a **summed step score** within the band, and a **bottleneck or choice** measure (how many moves are available at each point) for the easy levels.
3. **Recommendation:**
   - Shift the technique ladder down one notch: Medium = singles + locked candidates, Hard = + pairs, Extreme = + X-Wing/triples/Swordfish/XY-Wing.
   - Pick the givens count from a range instead of the floor.
   - Add a HoDoKu-style score window and a "placeable cells per step" minimum for Super Easy and Easy.
   - Bound Almost Impossible: either add a few "next-tier" techniques, or require that a single restored given lets the solver finish.
   - Generate with **Tatham-style constrained digging**: keep a removal only if the limited technique solver still finishes. My prototype ran at 5–150 ms per puzzle on desktop Node, so the 8 s phone budget is no problem.

---

## 1. How established graders and generators do it

### Sudoku Explainer (SE): max-technique rating, de-facto community scale
Each technique has a fixed rating, and a puzzle's rating is the **maximum** rating over its solve path. Values verified in SukakuExplainer source (original ratings; e.g. `HiddenSingleHint.java`, `NakedSingleHint.java`, `LockingHint.java`, `NakedSetHint.java`, `HiddenSetHint.java`, `XYWingHint.java`) and the project's wiki table:

| SE | Technique |
|---|---|
| 1.0 | Last value in unit (full house) |
| 1.2 | Hidden single in **box** |
| 1.5 | Hidden single in row/col |
| 2.3 | Naked single (1.6 in the "revised" rating) |
| 2.6 / 2.8 | Pointing / Claiming (locked candidates) |
| 3.0 | Naked pair |
| 3.2 | X-Wing |
| 3.4 | Hidden pair |
| 3.6 | Naked triple |
| 3.8 | Swordfish |
| 4.0 | Hidden triple |
| 4.2 / 4.4 | XY-Wing / XYZ-Wing |
| 4.5–5.0 | Uniqueness (UR) |
| 5.0 / 5.2 / 5.4 | Naked quad / Jellyfish / Hidden quad |
| 5.6–6.0 | BUG |
| 6.5–7.0 | X-chains, Y-cycles |
| 7.1+ | Forcing chains, Nishio, dynamic chains (to ~11.9) |

Sources: https://github.com/SudokuMonster/SukakuExplainer/wiki/Difficulty-ratings-in-Sudoku-Explainer-v1.2.1 , https://raw.githubusercontent.com/SudokuMonster/SukakuExplainer/HEAD/diuf/sudoku/solver/rules/HiddenSingleHint.java (and siblings).

Notes for us:
- SE rates naked singles (2.3) as **much harder** than hidden singles in a box (1.2), because a naked single needs candidate analysis. Our solver tries naked singles *first*. The grade is unaffected, but any per-step metric is skewed (see §6).
- Our quads sit in "Hard" while SE puts them above XY-Wing. Our tier order (quads < X-Wing < Swordfish < XY-Wing) does not match SE.
- An SE-based generator mapping **[snippet]**: "Hard" = SE 1.7–2.5 ("can be solved without writing down candidates"), and "Fiendish" starts at 2.6, the point where candidates must be written down. Source: http://forum.enjoysudoku.com/how-is-the-difficulty-of-a-sudoku-puzzle-determined-t32249.html (via search). This shows how low "Hard" sits in some published series.

### HoDoKu: tier gate plus summed score
Defaults verified in a verbatim TypeScript port of HoDoKu's `Options` (https://raw.githubusercontent.com/gil/HoDoKu-ts/HEAD/src/config/defaults.ts) and in HoDoKu's docs (https://hodoku.sourceforge.net/en/docs_cre.php):

- **Level max scores:** Easy ≤ 800, Medium ≤ 1000, Hard ≤ 1600, Unfair ≤ 1800, Extreme = ∞.
- **Step scores (level):**
  - Easy: full house 4, naked single 4, hidden single 14.
  - Medium: locked candidates 50, locked pair 40, locked triple 60, naked pair 60, hidden pair 70, naked triple 80, hidden triple 100.
  - Hard: naked quad 120, hidden quad 150, X-Wing 140, Swordfish 150, Jellyfish 160, Skyscraper 130, 2-String Kite 150, W-Wing 150, XY-Wing 160, XYZ-Wing 180, Remote Pair 110, BUG+1 100, uniqueness 1–6 100, finned X-Wing 130, sashimi X-Wing 150.
  - Unfair: finned/sashimi Swordfish 200/240, and up.
- **Rule** (docs_cre.php):
  - A puzzle's level is at least the level of its hardest step.
  - The score is the **sum of all step scores**.
  - If the sum exceeds the max score of the hardest step's level, the score decides, which pushes long puzzles up.
- The generator discards puzzles of the wrong level (docs_cre.php). It produces symmetric or patterned puzzles (`generateSudoku(boolean symmetric)` in SudokuGenerator.java). A `BackgroundGeneratorThread` keeps **10 pre-generated puzzles per level** cached (https://raw.githubusercontent.com/wyzelli/HoDoKu/HEAD/src/generator/BackgroundGeneratorThread.java).
- **Key point:** HoDoKu "Medium" already includes **triples**, and HoDoKu "Hard" includes X-Wing/Swordfish/XY-Wing. Our Hard (triples, quads, X-Wing) roughly equals HoDoKu Medium-to-Hard. Our Extreme equals HoDoKu Hard. Our AI covers HoDoKu Hard (XYZ-Wing, Skyscraper, W-Wing…) through Extreme.

### QQwing: hardest-technique buckets, singles split
Verified in source (https://raw.githubusercontent.com/stephenostermiller/qqwing/HEAD/src/cpp/qqwing.cpp, `getDifficulty`):

- **Simple** = naked singles only.
- **Easy** = needs hidden singles.
- **Intermediate** = needs pointing, box-line reduction, or naked/hidden pairs.
- **Expert** = needs guessing.

The generator removes givens in random order, optionally symmetric, then rates. A caller loops until the rating matches.

### Simon Tatham's Solo: constrained digging; the author says the low end is too hard
Verified in source (https://raw.githubusercontent.com/ghewgill/puzzles/HEAD/solo.c, a mirror of Tatham's repo).

**Levels:**
- Trivial: "blockwise positional elimination only", i.e. hidden singles in boxes.
- Basic: "row/column/number elimination required".
- Intermediate: intersections.
- Advanced: "set elimination", i.e. subsets.
- Extreme: fish, wings and similar.
- Unreasonable: guessing.

**Generator:**
- Removes givens in symmetric groups in random order.
- A removal is kept only if the solver *capped at the target level* still solves the puzzle.
- The loop accepts the result when the final grade equals the target and otherwise starts a new grid ("Loop until we get a grid of the required difficulty. This is nasty, but it seems to be unpleasantly hard to generate difficult grids otherwise.").

**The author's own TODO (top of solo.c)** is directly relevant to our complaint:
> "reports from users are that `Trivial'-mode puzzles are still rather hard compared to newspapers' easy ones … it's possible that really easy puzzles always have _several_ things you can do, so don't make you hunt too hard for the one deduction you can currently make … perhaps there's a higher incidence of things you can deduce by looking only at (say) rows … `Basic' grids requiring numeric elimination [naked singles] are actually very hard, so I wonder if a difficulty gradation between that and positional-elimination-only might be in order"

That is the "available moves per step" and "hidden versus naked single" argument, made by a long-time generator author. The comment is an observation, not a measured result.

### Andrew Stuart / SudokuWiki: cumulative score with round weighting [snippet]
- Grades are Gentle, Moderate, Tough, Diabolical and Extreme. Sample-pack scores: "Easiest Gentle score = 23", "Typical Extreme 20 clues score = 930", "Most Extreme score = 2399" (https://www.str8ts.com/SudokuX_Sample_Pack.pdf, https://www.SudokuWiki.org/ACS_Sample_Puzzle_Pack.pdf).
- Stuart: "the strategies used is only partly what counts towards the score. Some puzzles will be easy apart from a bottle neck which doesn't push the score over the grade."
- **Easy-grade rounds idea**, from https://www.sudokuwiki.org/Easy_Sudoku_Grading___Discussion via search:
  - Score by solving rounds, where each round places everything currently available.
  - Cells solved in round 1 score 0, round 2 score 1, round 3 score 2–3. More rounds mean fewer options per round, which makes the puzzle harder.
  - He states the goal was to "include the human experience of the puzzle".
- Exact grade cutoffs: not found.

### Sudoku of the Day: summed technique costs, first use costs more
- Cost per technique, with a higher cost for the first use and lower for repeats, summed over the solve (https://www.sudokuoftheday.com/difficulty, via search).
- Six levels, Beginner to Diabolical: "Beginner 4000" average, "Diabolical … 11000 to 25000", average 18000 **[snippet]**. X-Wing listed at 2800 **[snippet]**.
- **[unverified, from memory]**:
  - Single candidate / single position: 100 each.
  - Candidate lines: 350 first, 200 after.
  - Naked pair: 750/500. Hidden pair: 1500/1200.
  - Level averages: Beginner ~4000, Easy ~4900, Medium ~6000, Tricky ~7600, Fiendish ~10000.
  - If true, Beginner is ~40 singles (≈ 40 givens). Medium adds only a handful of candidate-line uses, and pairs first appear at Tricky.

### Mainstream apps (Sudoku.com/Easybrain, NYT, Microsoft Sudoku, Brainium, Good Sudoku, Conceptis)
None of these publish their grading method; I found no primary documentation.
- **Easybrain:** levels Easy → Medium → Hard → Expert → Master → Extreme (https://sudokugp.easybrain.com/hc/en-us/articles/10374460300826-What-is-Sudoku). A competitor claims sudoku.com Easy, Medium and Hard "are essentially the same difficulty" **[snippet, marketing source]**.
- **NYT:** three levels; Easy reportedly has about 38 givens **[snippet, single commercial source]**.
- **Good Sudoku (Zach Gage):** its store text says each level is defined by the techniques it requires, and the top tier uses Swordfish, Jellyfish, XYZ-Wing and Hidden Quads **[snippet]** (https://apps.apple.com/us/app/id1551669399). The per-level list was not found.
- **Microsoft Sudoku, Brainium, Conceptis:** nothing verifiable found.

**Consensus of teaching sites [snippet]:** Easy = singles; Medium = locked candidates and/or pairs; Hard = pairs, triples, maybe X-Wing; Expert = fish and wings. So mainstream "Hard" is mostly singles + locked candidates + pairs, with fish and wings only at Expert or above.

### pencilmark (2026 grader with a human-time benchmark)
Read from the PyPI description and GitHub docs:
- https://pypi.org/project/pencilmark/
- https://raw.githubusercontent.com/silly-puppyy/pencilmark/main/docs/grades/benchmark.mdx
- https://raw.githubusercontent.com/silly-puppyy/pencilmark/main/docs/grades/philosophy.md

Caveats: it is a self-published benchmark by an AI-written project, so it is a single source.
- **Band ladder:**
  - Very Easy = full house + **hidden singles** (no notes).
  - Easy = **naked singles** + pointing/claiming.
  - Medium = pairs, triples, quads.
  - Hard = X-Wing, Skyscraper, 2-String Kite, simple colouring.
  - Very Hard = Swordfish, finned fish, wings, uniqueness.
  - Expert = chains.
  - Extreme = forcing chains, trial and error.
- **Spearman correlation with human solve time on the same classic puzzles:**

  | Puzzle set | pencilmark | Andrew Stuart | Rangsk (hardest tier) | HoDoKu score | SE (max) |
  |---|---|---|---|---|---|
  | fed-sudoku.eu, 540 puzzles | 0.67 | 0.59 | 0.36 | 0.33 | 0.29 |
  | Wang 2024, 207 puzzles | 0.66 | 0.50 | 0.35 | 0.40 | 0.48 |

- "Bands order knowledge, not effort… a Hard puzzle is often easier and quicker than a Medium one". Where band and difficulty disagree, solvers side with the difficulty number "about three times in four".
- Generator speed: HoDoKu 0.05–1 s per puzzle and SE 0.17–2.2 s, while pencilmark takes 18–66 s. Its note that "the others' 'Hard' is often an easier band" is consistent with tier-only grading being coarse.

---

## 2. Which metrics predict human difficulty (evidence)

| Metric | Evidence | Verdict |
|---|---|---|
| Number of givens | Pelánek uses it as a baseline. A garbled table fragment shows about 0.25–0.27 for "static number of givens" **[snippet]** (https://arxiv.org/pdf/1403.7373). Ercsey-Ravasz & Toroczkai: hardness "depends not only on the number of clues but also on their position" (https://www.technologyreview.com/2012/08/06/18948/). Our experiment: singles-only puzzles exist with 23–28 givens. | Weak alone. Useful as a *secondary* knob inside a technique band, and players perceive it. |
| Hardest technique (SE/QQwing/our grade) | SE 0.29–0.48 and Rangsk 0.35–0.36 against human times (pencilmark benchmark). Stuart: puzzles are often "easy apart from a bottleneck". | Good as a **gate**, i.e. what you must know. Poor as a ranking within a band. |
| Summed step score (HoDoKu, Sudoku of the Day, Stuart) | HoDoKu 0.33–0.40. Stuart's round-weighted cumulative grader 0.50–0.59, the best of the established graders. | Better than max alone, especially with weighting by rounds/dependency. |
| Step complexity + dependency/choice structure | Pelánek: difficulty comes from "complexity of individual steps" and "structure of dependency among steps". Best metric r = 0.95 with human times, and 0.88 for a less Sudoku-specific one, on more than 1,700 puzzles and hundreds of solvers (abstract via search: https://arxiv.org/abs/1403.7373, https://www.semanticscholar.org/paper/8cfb2f11ea270b95e49c98d1ee3de88aa84afcec). His dataset is dominated by puzzles solvable with simple techniques, so for easy and medium puzzles *how hard the next step is to find* dominates **[detail unverified: full text unreachable]**. | Best supported. In practice: count rounds, and the number of available moves per state. |
| Available moves per step ("bottleneck") | Tatham's TODO (hypothesis); Stuart's round weighting (more rounds = fewer options); Pelánek's dependency factor. A SudokuWiki thread warns that the *total candidate count* tracks filled cells at r ≈ 0.95, so it mostly measures progress **[snippet]** (https://www.sudokuwiki.org/A_New_Metric_for_Difficult_Sudoku_Puzzles). | Use "placeable cells available at each state" (min, mean, number of 1-option states), not total candidates. |
| Hidden versus naked singles | SE: hidden single in box 1.2 < line 1.5 < naked single 2.3. HoDoKu scores them the other way (naked 4, hidden 14). Tatham: naked-single-only "Basic" grids "are actually very hard". pencilmark puts naked singles a band above hidden singles. | Majority view for a no-notes player: box hidden singles are easiest and naked singles need notes. Good lever for Super Easy. |
| Escape rate κ, η = −log10 κ (Ercsey-Ravasz & Toroczkai 2012) | Correlates with human ratings; "Richter" scale (https://www.dcs.gla.ac.uk/~pat/cpM/jchoco/sudoku/1208.0370v1.pdf). | Elegant, but needs ODE integration. Not worth it on a phone. |
| Nishio human cycles / clause length (Project Patti 2025) | Universal Easy/Medium/Hard classification that matches 4 of 5 websites (https://arxiv.org/abs/2507.21137, abstract only). | Research-grade; not needed. |

**Not found:** Hunt, Pong & Tucker (Harvey Mudd, MCM 2008 "Difficulty-Driven Sudoku Puzzle Generation") is listed by COMAP (https://www.mathmodels.org/Problems/2008/MCM-B/index.html), but I could not reach the text. I could not verify its metric.

---

## 3. Concrete numeric level definitions found

| Source | Level → requirement |
|---|---|
| QQwing | Simple: naked singles · Easy: + hidden singles · Intermediate: + pointing/box-line/pairs · Expert: guessing |
| Tatham Solo | Trivial: box hidden singles · Basic: + row/col/naked singles · Intermediate: + intersections · Advanced: + subsets · Extreme: fish/wings · Unreasonable: guessing |
| HoDoKu | Easy: singles, score ≤ 800 · Medium: + LC, pairs, triples, ≤ 1000 · Hard: + quads, X-Wing, Swordfish, XY/XYZ/W-Wing, Skyscraper, uniqueness, ≤ 1600 · Unfair: finned big fish, chains, ≤ 1800 · Extreme: beyond |
| SE (community) | ≤ 1.5: hidden singles only · ≤ 2.3: any singles · 2.6–2.8: LC · 3.0–3.4: pairs/X-Wing · 3.6–4.4: triples, Swordfish, XY/XYZ · 6.5+: chains |
| pencilmark | Very Easy: full house + hidden singles · Easy: + naked singles, LC · Medium: + subsets · Hard: X-Wing, Skyscraper… · Very Hard: Swordfish, wings · Expert: chains · Extreme: forcing/T&E |
| Sudoku of the Day | Average score Beginner ~4000 … Diabolical ~18000 (range 11000–25000) **[snippet]** |
| NYT | Easy reportedly ~38 givens **[snippet]** |
| **Ours today** | Super Easy: singles + exactly 44 givens · Easy: singles, 36–43 givens (in practice always 36) · Medium: LC/pairs, ≥ 32 · Hard: triples/quads/X-Wing, ≥ 28 · Extreme: Swordfish/XY-Wing, ≥ 25 · AI: stalls, or Extreme with ≤ 22 givens |

Conclusion: across sources, **mainstream "Hard" ≈ singles + locked candidates + pairs, sometimes triples**. X-Wing and Swordfish start at "Expert/Fiendish/Very Hard". Chains are the top tier. Our ladder is about one tier steeper from Hard upward, and "Almost Impossible" is open-ended.

---

## 4. Generation strategies

| Strategy | Who | Pros / cons |
|---|---|---|
| Dig to minimal, rate, discard on mismatch | QQwing, HoDoKu (+ symmetry) | Simple. Wasteful for easy targets; minimal puzzles skew hard. |
| **Constrained dig**: keep a removal only if the solver *capped at the target tier* still finishes | Tatham Solo | Logic completion proves uniqueness, so `countSolutions` is not needed during the dig. Never produces a puzzle above the target. Can stop at any chosen givens count. The result must still be checked to *need* the target tier. |
| Dig to floor, then restore until it solves at target (ours) | Sudoku Vibes | The first acceptable restore state is always the hardest version, so it lands **at the floor**. |
| Symmetric removal | HoDoKu, Tatham, QQwing (optional) | Aesthetics. Halves the removal choices and makes generation slightly slower. Not a difficulty lever. |
| Pre-generated bank or background cache | HoDoKu (10 per level), most commercial apps **[unverified]** | Instant; covers rare targets such as hard top tiers. A small bank inside the PWA is feasible (81 chars per puzzle). |
| Pick the best of K candidates by score | pencilmark, HoDoKu filtering | Centres puzzles inside a band. Costs K× time. |

### Measurements on the current generator (scratchpad copy, Node 22, desktop CPU, 20 seeds per level; 12 for Extreme and AI)

| Level | Givens (median, range) | Non-single steps (median) | Placeable cells at start (median) | Other observations |
|---|---|---|---|---|
| Super Easy | 44 | 0 | 27 | 3 rounds; one puzzle had a 1-option round. |
| Easy | **always 36** (the floor) | 0 | 17 | Fewest options in any round: median 2, minimum 1. |
| Medium | 32 (32–34) | 2 | 9 | Mostly 1–2 locked candidates. |
| Hard | 29 (28–33) | 5 | 7 | X-Wing in about 0.8 steps per puzzle. Median 450 ms, max 2.1 s. |
| Extreme | 26 (25–30) | 5 | 7 | XY-Wing in about 1.3 steps per puzzle. |
| Almost Impossible | 25 (23–26) | — | 6 | Minimal puzzles that stall after XY-Wing, so true difficulty is unbounded. |

The analyzer labels about 95 % of single placements "NakedSingle" because it tries naked singles first. Its per-step counts therefore do not reflect what a human would do.

### Constrained-dig prototype (`analyze()` cap check per removal)
- **Singles to 34 givens:** 5 ms per puzzle.
- **Locked candidates required, to 28 givens:** 71 ms per puzzle (about 1 grid in 12 qualifies).
- **Pairs required, to 26 givens:** 113 ms.
- **Triples to XY-Wing required:** 154 ms, givens 23–28.
- `analyze()` costs about 0.1–0.2 ms per call.
- With no floor, singles-only puzzles reach **23–28 givens** (median 25). Givens are a free knob, not a consequence of the technique.

Assuming a phone is 5–10× slower, every level stays under about 2 s.

Scripts: `/tmp/claude-0/-home-user-sudoku-vibes/74689927-f4cf-59eb-a96f-f1c28cd3b72e/scratchpad/exp/measure.ts`, `/tmp/claude-0/-home-user-sudoku-vibes/74689927-f4cf-59eb-a96f-f1c28cd3b72e/scratchpad/exp/cdig.ts`.

---

## 5. Recommendation for our six levels

Definitions used below:
- **Placeable** means the cells that can be filled at a state from the givens and placed digits alone, with no notes; it is the union of naked and hidden singles.
- **Score** is the HoDoKu default weight per step, summed: full house/naked single 4, hidden single 14, LC 50, NP 60, HP 70, NT 80, HT 100, NQ 120, HQ 150, X-Wing 140, Swordfish 150, XY-Wing 160. The score windows below are starting points to tune after measuring a few hundred generated puzzles. They are not taken from any source.

| Level | Allowed (cap) | Must need | Givens (choose uniformly) | Extra constraints |
|---|---|---|---|---|
| **Super Easy** | Full house + hidden singles only, solvable without naked singles (SE ≤ 1.5; Tatham "Trivial") | — | 40–46 | ≥ 3 placeable cells at every state of the singles path (or ≤ 1 state with < 3); ≤ 4 rounds |
| **Easy** | All singles (SE ≤ 2.3; HoDoKu Easy) | — | 34–39 | ≥ 2 placeable at every state; at most 2 states with exactly 1 option |
| **Medium** | Singles + locked candidates (pointing/claiming) | ≥ 1 LC, **or** singles-only with 30–33 givens and a 1-option bottleneck | 30–35 | ≤ 4 LC steps; score ≤ ~800 |
| **Hard** | + naked/hidden pairs, naked triple (HoDoKu Medium; SE ≤ 3.6 minus X-Wing) | ≥ 1 pair/triple | 27–32 | score ≤ ~1000; ≤ 3 "hard-tier" steps |
| **Extreme** | + hidden triple, quads, X-Wing, Swordfish, XY-Wing (HoDoKu Hard; SE ≤ 4.2) | ≥ 1 of these | 24–29 | Pick the candidate whose score is nearest the band median |
| **Almost Impossible** | Option A (new code): + XYZ-Wing, Skyscraper, 2-String Kite, W-Wing, finned X-Wing, simple colouring / X-chain ≤ 6 links (HoDoKu Hard/Unfair; SE 4.4–~6.6). Option B (no new techniques): stalls after the current set, but bounded (see right) | Needs ≥ 1 technique beyond Extreme | 22–27 | Option B: restore givens until the solver finishes at Extreme, then remove the *last* restored given. The puzzle then stalls exactly once and is one given away from Extreme, instead of being an arbitrary minimal puzzle. Also drop the "Extreme with ≤ 22 givens → AI" rule; givens should not promote across a technique tier. |

Additional grading rules:
- **Level = max(technique tier, score tier)**, as in HoDoKu. A very long Medium gets pushed into Hard instead of being sold as Medium.
- **Reorder singles for the human model:** full house → hidden single (box) → hidden single (line) → naked single. This does not change which puzzles are solvable. It makes counts, "placeable" and the Super Easy definition meaningful. Tag hidden singles with their unit type.
- **Optionally move quads** above X-Wing/XY-Wing, as in SE and HoDoKu, or into Extreme as proposed above.
- Grade stays deterministic. Per-step metrics are computed on the same easiest-first path.

### Generation within ~8 s
1. Choose the target givens count G uniformly from the level's range (seeded RNG).
2. Fill a random grid. Shuffle the cells (optionally in 180°-symmetric pairs).
3. **Constrained dig:**
   - For each cell, remove it, then run the technique solver limited to the level's cap. Add a `maxTechnique` parameter to `analyze()` so it stops early instead of trying higher finders.
   - Keep the removal if the solver finishes and the per-level constraints still hold (placeable minimum, score ceiling). Otherwise restore the cell.
   - Stop at G givens.
   - No `countSolutions` is needed during the dig; keep one final check as a safety net.
4. **Accept** if the result needs the level's "must need" technique and the score is in the window. Otherwise take a new grid. The prototype took 5–150 ms per accepted puzzle on desktop.
5. Optionally generate K = 3–5 accepted candidates, or as many as fit in about 1.5 s, and return the one whose score is nearest the band's target. This centres the experience and reduces variance.
6. **Almost Impossible (Option B):** dig to minimal → restore-to-Extreme → remove the last restored given → verify uniqueness and that it stalls. Keep a small pre-generated **bank** (e.g. 50–200 puzzles, about 81 bytes each) as a fallback for any level that misses the budget, and as the main source for AI if Option A turns out slow.
7. The current `exact: false` fallback can stay. With constrained digging it should be essentially unreachable for levels 0–4.

### What the current technique set covers versus what is new
- **Covered now:** everything for Super Easy through Extreme, plus AI Option B.
- **Small new code (no new techniques):**
  - `analyze(board, maxTechnique)` cap.
  - Single ordering: full house and box/line hidden singles before naked singles.
  - A singles-round or "placeable count" metric.
  - A step score sum.
  - A givens range per level instead of a floor.
  - The constrained-dig generator.
  - The AI restore-minus-one rule.
- **New techniques (only for AI Option A):** XYZ-Wing, Skyscraper / 2-String Kite (or a general X-chain up to about 6 links, which covers both plus Turbot), W-Wing, finned X-Wing, simple colouring. Each is about 40–100 lines in the current finder style.
- **Spec impact:** the `difficulty-grading` requirements "Grade assignment" (tier mapping, the 44/36/22 givens rules) and `MIN_GIVENS` change, which makes this an OpenSpec change. The SE/HoDoKu tables above can serve as its design rationale.

---

## 6. Things I could not verify / open questions
- **Pelánek's full metric definitions** and per-metric correlations (paper unreachable). Only the abstract numbers 0.95 and 0.88 are confirmed. The 0.25 for givens is from a garbled snippet.
- **Mainstream apps:** exact technique mix per level for Sudoku.com, NYT, Microsoft Sudoku, Brainium, Conceptis and Good Sudoku. No primary documentation was found, and the claims above are from snippets or marketing pages.
- **Exact cutoffs:** Sudoku of the Day per-technique costs and Stuart's grade cutoffs.
- **Hunt/Pong/Tucker** paper contents.
- **Score windows** in §5 are proposals; calibrate them by generating a few hundred puzzles per level. Ideally also time the user on a handful per level, since the complaint is perceptual.
- **Speed:** all timings are desktop Node 22. Phone timings (iOS Safari web worker) were not measured.

## 7. Addendum: primary sources the user provided (2026-11-15)

### Pelánek 2014 (arXiv 1403.7373v1, full text read)
- Data: fed-sudoku.eu (1089 puzzles, ~131 solvers each, experts, mean 8 min) and sudoku.org.uk (731 puzzles, ~1307 solvers, general public, mean 23 min).
- Table 3, Pearson r with mean solve time (fed / org.uk):
  - number of givens 0.25 / 0.27 (weak, confirmed)
  - backtracking steps 0.16 / 0.25
  - dependency 0.67 / 0.69; refutation sum 0.68 / 0.83; Fowler 0.68 / 0.87
  - **Serate (hardest SE technique) 0.70 / 0.86**; Serate LM (linear model over technique counts) 0.78 / 0.86
  - combined SFRD 0.84 / 0.95
  - Correction to §3: the hardest technique is a *good* predictor on these datasets, not 0.29–0.48 as the pencilmark benchmark claimed.
- **Dependency metric**: run a randomized human model (simplest technique first, random choice among its applications); at each step count how many simple-technique moves are available; average over the first k steps (k = 20–30 best). On singles-only ("simple") puzzles it reaches r = 0.74–0.80, better than the technique-based metrics, which cannot separate singles-only puzzles. Singles-only puzzles still differ by more than 2× in human time.
- Fig. 7 examples: easy puzzle (235 s) ~10 moves available per step from the start; medium (583 s) ~2–6; hard (1067 s) drops to 0–4 during the first 25 steps.
- Model treats naked and hidden single as equal; SE ratings: hidden single 1.2, naked single 2.3, pointing 2.6, claiming 2.8.

### Sudoku of the Day (text supplied by user)
- Solver applies the easiest technique first; cost summed over the whole solve; first use costs more.
- Costs (first / later): single candidate 100/100, single position 100/100, candidate lines 350/200, double pairs 500/250, multiple lines 700/400, naked pair 750/500, hidden pair 1500/1200, naked triple 2000/1400, hidden triple 2400/1600, X-Wing 2800/1600, forcing chains 4200/2100, naked quad 5000/4000, hidden quad 7000/5000, swordfish 8000/6000.
- Level ranges (deliberately overlapping): Beginner 3600–4500 (avg 4000), Easy 4300–5500 (4900), Medium 5300–6900 (6000), Tricky 6500–9300 (7600), Fiendish 8300–14000 (10000), Diabolical 11000–25000 (18000).
- Reading: 45 singles = 4500, so Beginner ≈ singles only with ≥36 givens; Easy ≈ singles plus a few candidate lines; Medium ≈ a few candidate lines plus one pair; Tricky ≈ several pairs or a hidden pair/triple; Fiendish ≈ X-Wing/quads; Diabolical ≈ Swordfish/forcing chains.

### Revised recommendation
Grade with the SotD cost model (map our techniques onto its table; locked candidates = candidate lines) and its ranges, mapped one-to-one: Super Easy = Beginner, Easy = Easy, Medium = Medium, Hard = Tricky, Extreme = Fiendish, Almost Impossible = Diabolical. Add Pelánek's dependency metric (mean available single placements over the first 25 steps) as a floor on Super Easy and Easy, which separates singles-only puzzles. Generator: dig with a technique-capped solver, accept when the score falls inside the level's range. Thresholds still need calibration on a few hundred generated puzzles.
