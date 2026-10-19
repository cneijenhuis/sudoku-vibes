import { describe, expect, it } from 'vitest';
import { parse } from './board';
import { GRADE_FIXTURES, TECHNIQUE_FIXTURES } from './fixtures';
import {
  ALMOST_IMPOSSIBLE_MAX_CLUES,
  DIFFICULTY_LABELS,
  SUPER_EASY_GIVENS,
  Difficulty,
  TECHNIQUE_DIFFICULTY,
  countClues,
  difficultyOf,
  grade,
} from './grading';
import { countSolutions, solve } from './solver';
import { analyze, Technique } from './techniques';

describe('Difficulty', () => {
  it('has six ordered levels', () => {
    expect(Difficulty.SuperEasy).toBeLessThan(Difficulty.Easy);
    expect(Difficulty.Easy).toBeLessThan(Difficulty.Medium);
    expect(Difficulty.Medium).toBeLessThan(Difficulty.Hard);
    expect(Difficulty.Hard).toBeLessThan(Difficulty.Extreme);
    expect(Difficulty.Extreme).toBeLessThan(Difficulty.AlmostImpossible);
    expect(Object.values(Difficulty).filter((v) => typeof v === 'number')).toHaveLength(6);
  });

  it('labels every level', () => {
    expect(Object.values(DIFFICULTY_LABELS)).toEqual(['Super Easy', 'Easy', 'Medium', 'Hard', 'Extreme', 'Almost Impossible']);
  });
});

describe('thresholds', () => {
  it('map techniques per the spec', () => {
    const d = TECHNIQUE_DIFFICULTY;
    expect([Technique.NakedSingle, Technique.HiddenSingle].map((t) => d[t])).toEqual([Difficulty.Easy, Difficulty.Easy]);
    for (const t of [Technique.LockedCandidates, Technique.NakedPair, Technique.HiddenPair]) {
      expect(d[t]).toBe(Difficulty.Medium);
    }
    for (const t of [
      Technique.NakedTriple,
      Technique.HiddenTriple,
      Technique.NakedQuad,
      Technique.HiddenQuad,
      Technique.XWing,
    ]) {
      expect(d[t]).toBe(Difficulty.Hard);
    }
    for (const t of [Technique.Swordfish, Technique.XYWing]) expect(d[t]).toBe(Difficulty.Extreme);
  });

  it('are monotonic in technique order', () => {
    const levels = Object.keys(Technique)
      .filter((k) => isNaN(Number(k)))
      .map((k) => TECHNIQUE_DIFFICULTY[Technique[k as keyof typeof Technique]]);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });
});

describe('grade', () => {
  it('grades one fixture per level', () => {
    expect(grade(parse(GRADE_FIXTURES.easy))).toBe(Difficulty.Easy);
    expect(grade(parse(GRADE_FIXTURES.medium))).toBe(Difficulty.Medium);
    expect(grade(parse(GRADE_FIXTURES.hard))).toBe(Difficulty.Hard);
    expect(grade(parse(GRADE_FIXTURES.extreme))).toBe(Difficulty.Extreme);
    expect(grade(parse(GRADE_FIXTURES.almostImpossible))).toBe(Difficulty.AlmostImpossible);
    expect(grade(parse(GRADE_FIXTURES.escargot))).toBe(Difficulty.AlmostImpossible);
  });

  it('grades a singles-only puzzle by its number of givens', () => {
    const easy = parse(GRADE_FIXTURES.easy);
    const solution = solve(easy)!;
    expect(solution).not.toBeNull();
    // Adding givens from the solution keeps the puzzle singles-only and unique.
    const withGivens = (n: number) => {
      const b = Uint8Array.from(easy);
      for (let i = 0; i < 81 && countClues(b) < n; i++) if (b[i] === 0) b[i] = solution[i]!;
      return b;
    };
    expect(grade(withGivens(36))).toBe(Difficulty.Easy);
    expect(grade(withGivens(SUPER_EASY_GIVENS - 1))).toBe(Difficulty.Easy);
    expect(SUPER_EASY_GIVENS).toBe(44);
    expect(grade(withGivens(SUPER_EASY_GIVENS))).toBe(Difficulty.SuperEasy);
    expect(grade(withGivens(60))).toBe(Difficulty.SuperEasy);
  });

  it('fixtures are uniquely solvable', () => {
    for (const p of Object.values(GRADE_FIXTURES)) expect(countSolutions(parse(p), 2)).toBe(1);
  });

  it('grades a naked-pair-hardest puzzle Medium', () => {
    const f = TECHNIQUE_FIXTURES.find((x) => x.technique === Technique.NakedPair)!;
    expect(grade(parse(f.puzzle))).toBe(Difficulty.Medium);
  });

  it('grades each technique fixture at its threshold level', () => {
    for (const f of TECHNIQUE_FIXTURES) {
      expect(grade(parse(f.puzzle)), f.name).toBe(TECHNIQUE_DIFFICULTY[f.hardest]);
    }
  });

  it('is deterministic', () => {
    for (const p of Object.values(GRADE_FIXTURES)) {
      expect(grade(parse(p))).toBe(grade(parse(p)));
    }
  });

  it('refuses puzzles without exactly one solution', () => {
    expect(() => grade(parse('0'.repeat(81)))).toThrow();
    const b = parse(GRADE_FIXTURES.easy);
    b[2] = 5;
    expect(() => grade(b)).toThrow();
  });

  it('promotes Extreme puzzles with very few clues to Almost Impossible', () => {
    const analysis = analyze(parse(GRADE_FIXTURES.extreme));
    expect(difficultyOf(analysis, ALMOST_IMPOSSIBLE_MAX_CLUES + 1)).toBe(Difficulty.Extreme);
    expect(difficultyOf(analysis, ALMOST_IMPOSSIBLE_MAX_CLUES)).toBe(Difficulty.AlmostImpossible);
  });
});
