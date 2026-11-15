import { describe, expect, it } from 'vitest';
import { parse } from './board';
import { GRADE_FIXTURES, TECHNIQUE_FIXTURES } from './fixtures';
import {
  DIFFICULTY_LABELS,
  Difficulty,
  OPEN_MOVES_THRESHOLDS,
  SCORE_THRESHOLDS,
  TECHNIQUE_COST,
  TECHNIQUE_DIFFICULTY,
  grade,
  meanOpenMoves,
  openMovesTier,
  rate,
  scoreOf,
  scoreTier,
} from './grading';
import { mulberry32, shuffle } from '../generator/random';
import { countSolutions, solve } from './solver';
import { analyze, Technique, type Analysis, type Step } from './techniques';

const LEVEL_NAMES = ['Super Easy', 'Easy', 'Gentle', 'Medium', 'Tricky', 'Hard', 'Tough', 'Extreme', 'Impossible'];

const step = (technique: Technique): Step => ({ technique, placements: [], eliminations: [] });
const steps = (technique: Technique, n: number): Step[] => Array.from({ length: n }, () => step(technique));

/** A hand-made solved analysis, to exercise the level rule without a puzzle. */
function analysis(hardest: Technique | null, stepList: Step[], openMoves: number[]): Analysis {
  return { solved: true, requiresGuessing: false, steps: stepList, hardest, board: new Uint8Array(81), openMoves };
}

describe('Difficulty', () => {
  it('has nine ordered levels', () => {
    const order = [
      Difficulty.SuperEasy,
      Difficulty.Easy,
      Difficulty.Gentle,
      Difficulty.Medium,
      Difficulty.Tricky,
      Difficulty.Hard,
      Difficulty.Tough,
      Difficulty.Extreme,
      Difficulty.Impossible,
    ];
    order.forEach((d, i) => expect(d).toBe(i));
    expect(Object.values(Difficulty).filter((v) => typeof v === 'number')).toHaveLength(9);
  });

  it('labels every level', () => {
    expect(Object.values(DIFFICULTY_LABELS)).toEqual(LEVEL_NAMES);
    expect(Difficulty.Impossible).toBeGreaterThan(Difficulty.Extreme);
  });
});

describe('constants', () => {
  it('maps techniques to the levels of the spec', () => {
    const d = TECHNIQUE_DIFFICULTY;
    expect([Technique.HiddenSingle, Technique.NakedSingle].map((t) => d[t])).toEqual([Difficulty.SuperEasy, Difficulty.SuperEasy]);
    expect(d[Technique.LockedCandidates]).toBe(Difficulty.Medium);
    expect(d[Technique.NakedPair]).toBe(Difficulty.Tricky);
    for (const t of [Technique.HiddenPair, Technique.NakedTriple, Technique.HiddenTriple]) expect(d[t]).toBe(Difficulty.Hard);
    for (const t of [Technique.XWing, Technique.NakedQuad, Technique.HiddenQuad]) expect(d[t]).toBe(Difficulty.Tough);
    for (const t of [Technique.Swordfish, Technique.XYWing]) expect(d[t]).toBe(Difficulty.Extreme);
    for (const t of [Technique.Skyscraper, Technique.XYZWing]) expect(d[t]).toBe(Difficulty.Impossible);
  });

  it('are monotonic in technique order', () => {
    const levels = Object.keys(Technique)
      .filter((k) => isNaN(Number(k)))
      .map((k) => TECHNIQUE_DIFFICULTY[Technique[k as keyof typeof Technique]]);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });

  it('has eight strictly ascending score thresholds and a cost for every technique', () => {
    expect(SCORE_THRESHOLDS).toEqual([4000, 4500, 5100, 5600, 6500, 8000, 10000, 13000]);
    expect([...SCORE_THRESHOLDS].sort((a, b) => a - b)).toEqual([...SCORE_THRESHOLDS]);
    expect(OPEN_MOVES_THRESHOLDS).toEqual({ superEasy: 8, easy: 5 });
    for (const cost of Object.values(TECHNIQUE_COST)) expect(cost.first).toBeGreaterThanOrEqual(cost.later);
    expect(Object.keys(TECHNIQUE_COST)).toHaveLength(14);
  });
});

describe('score', () => {
  it('is 100 per single', () => {
    expect(scoreOf(steps(Technique.HiddenSingle, 45))).toBe(4500);
    expect(scoreOf([...steps(Technique.HiddenSingle, 20), ...steps(Technique.NakedSingle, 25)])).toBe(4500);
  });

  it('charges a technique more the first time it is used', () => {
    const list = [...steps(Technique.HiddenSingle, 50), ...steps(Technique.LockedCandidates, 2)];
    expect(scoreOf(list)).toBe(5000 + 350 + 200);
  });

  it('is 4500 for a real puzzle with 45 empty cells solved by singles', () => {
    const base = parse(GRADE_FIXTURES.medium);
    const solution = solve(base)!;
    const puzzle = Uint8Array.from(base);
    // Giving 6 more cells keeps it singles-only and unique.
    let added = 0;
    for (let i = 0; i < 81 && added < 6; i++) {
      if (puzzle[i] === 0) {
        puzzle[i] = solution[i]!;
        added++;
      }
    }
    const a = analyze(puzzle);
    expect(a.steps.every((s) => s.technique <= Technique.NakedSingle)).toBe(true);
    expect(scoreOf(a.steps)).toBe(4500);
  });

  it('has a tier of 1 plus the thresholds reached', () => {
    expect(scoreTier(0)).toBe(Difficulty.SuperEasy);
    expect(scoreTier(3999)).toBe(Difficulty.SuperEasy);
    expect(scoreTier(4000)).toBe(Difficulty.Easy);
    expect(scoreTier(7000)).toBe(Difficulty.Hard); // spec: 7000 -> tier 6
    expect(scoreTier(12999)).toBe(Difficulty.Extreme);
    expect(scoreTier(13000)).toBe(Difficulty.Impossible);
    expect(scoreTier(99999)).toBe(Difficulty.Impossible);
  });
});

describe('open moves', () => {
  it('tiers by the two thresholds', () => {
    expect(openMovesTier(9)).toBe(Difficulty.SuperEasy);
    expect(openMovesTier(8)).toBe(Difficulty.SuperEasy);
    expect(openMovesTier(7.9)).toBe(Difficulty.Easy);
    expect(openMovesTier(5)).toBe(Difficulty.Easy);
    expect(openMovesTier(3)).toBe(Difficulty.Gentle);
  });

  it('averages the recorded placements', () => {
    expect(meanOpenMoves([3, 2, 1])).toBe(2);
    expect(meanOpenMoves([])).toBe(Infinity);
  });
});

describe('level rule', () => {
  const singles = (n: number) => steps(Technique.HiddenSingle, n);

  it('Grade by hardest technique: a naked pair with low score and open tiers is Tricky', () => {
    const a = analysis(Technique.NakedPair, [...singles(35), step(Technique.NakedPair)], [9, 9]);
    expect(rate(a).score).toBe(35 * 100 + 750);
    expect(rate(a).difficulty).toBe(Difficulty.Tricky);
  });

  it('Score raises the grade: singles and locked candidates in the Hard band', () => {
    // 7000 is in the Hard band (6500 to 8000); the hardest technique alone would say Medium.
    const a = analysis(Technique.LockedCandidates, [...singles(66), step(Technique.LockedCandidates)], [9]);
    expect(rate(a).score).toBe(6600 + 350);
    expect(rate(a).difficulty).toBe(Difficulty.Hard);
  });

  it('Few open moves raise the grade: a Super Easy score with a bottleneck is Gentle', () => {
    const a = analysis(Technique.HiddenSingle, singles(35), [4, 4, 3]);
    expect(scoreTier(rate(a).score)).toBe(Difficulty.SuperEasy);
    expect(rate(a).difficulty).toBe(Difficulty.Gentle);
    expect(rate(analysis(Technique.HiddenSingle, singles(35), [6, 6])).difficulty).toBe(Difficulty.Easy);
    expect(rate(analysis(Technique.HiddenSingle, singles(35), [9, 8])).difficulty).toBe(Difficulty.SuperEasy);
  });

  it('is the highest of the three tiers', () => {
    // Technique Tough, score Easy, wide open.
    expect(rate(analysis(Technique.XWing, [step(Technique.XWing)], [9])).difficulty).toBe(Difficulty.Tough);
    // Technique Super Easy, score Extreme, wide open.
    expect(rate(analysis(Technique.NakedSingle, singles(110), [9])).difficulty).toBe(Difficulty.Extreme);
  });

  it('grades a solve without steps Super Easy', () => {
    expect(rate(analysis(null, [], [])).difficulty).toBe(Difficulty.SuperEasy);
  });

  it('grades a puzzle that defeats all techniques Impossible', () => {
    const stuck = parse(GRADE_FIXTURES.stuck);
    expect(analyze(stuck).solved).toBe(false);
    expect(grade(stuck)).toBe(Difficulty.Impossible);
    expect(grade(parse(GRADE_FIXTURES.escargot))).toBe(Difficulty.Impossible);
  });

  it('level 9 techniques always grade Impossible', () => {
    for (const f of TECHNIQUE_FIXTURES) {
      if (f.hardest === Technique.Skyscraper || f.hardest === Technique.XYZWing) {
        expect(grade(parse(f.puzzle)), f.name).toBe(Difficulty.Impossible);
      }
    }
  });
});

describe('grade', () => {
  it('grades the fixtures', () => {
    expect(grade(parse(GRADE_FIXTURES.medium))).toBe(Difficulty.Medium);
    expect(grade(parse(GRADE_FIXTURES.tricky))).toBe(Difficulty.Tricky);
    expect(grade(parse(GRADE_FIXTURES.hard))).toBe(Difficulty.Hard);
    expect(grade(parse(GRADE_FIXTURES.tough))).toBe(Difficulty.Tough);
    expect(grade(parse(GRADE_FIXTURES.impossible))).toBe(Difficulty.Impossible);
  });

  it('grades a singles-only puzzle by its score as givens are added', () => {
    const base = parse(GRADE_FIXTURES.medium);
    const solution = solve(base)!;
    const withEmpty = (empty: number) => {
      const b = Uint8Array.from(base);
      let left = b.filter((v) => v === 0).length;
      // Scattered givens keep many cells open (the first empty cells would leave a bottleneck).
      for (const i of shuffle(Array.from({ length: 81 }, (_, k) => k), mulberry32(7))) {
        if (left <= empty) break;
        if (b[i] === 0) {
          b[i] = solution[i]!;
          left--;
        }
      }
      return b;
    };
    expect(grade(withEmpty(51))).toBe(Difficulty.Medium); // score 5100
    expect(grade(withEmpty(45))).toBe(Difficulty.Gentle); // score 4500
    expect(grade(withEmpty(41))).toBe(Difficulty.Easy); // score 4100
    expect(grade(withEmpty(35))).toBe(Difficulty.SuperEasy); // score 3500
  });

  it('fixtures are uniquely solvable', () => {
    for (const p of Object.values(GRADE_FIXTURES)) expect(countSolutions(parse(p), 2)).toBe(1);
  });

  it('grades each technique fixture at least at its technique level', () => {
    for (const f of TECHNIQUE_FIXTURES) {
      expect(grade(parse(f.puzzle)), f.name).toBeGreaterThanOrEqual(TECHNIQUE_DIFFICULTY[f.hardest]);
    }
  });

  it('is deterministic', () => {
    for (const p of Object.values(GRADE_FIXTURES)) {
      expect(grade(parse(p))).toBe(grade(parse(p)));
    }
  });

  it('refuses puzzles without exactly one solution', () => {
    expect(() => grade(parse('0'.repeat(81)))).toThrow();
    const b = parse(GRADE_FIXTURES.medium);
    b[2] = 5;
    expect(() => grade(b)).toThrow();
  });
});
