import { describe, expect, it } from 'vitest';
import { parse } from './board';
import { GRADE_FIXTURES, TECHNIQUE_FIXTURES } from './fixtures';
import {
  ALMOST_IMPOSSIBLE_MAX_CLUES,
  Difficulty,
  TECHNIQUE_DIFFICULTY,
  difficultyOf,
  grade,
} from './grading';
import { countSolutions } from './solver';
import { analyze, Technique } from './techniques';

describe('Difficulty', () => {
  it('has five ordered levels', () => {
    expect(Difficulty.Easy).toBeLessThan(Difficulty.Medium);
    expect(Difficulty.Medium).toBeLessThan(Difficulty.Hard);
    expect(Difficulty.Hard).toBeLessThan(Difficulty.Extreme);
    expect(Difficulty.Extreme).toBeLessThan(Difficulty.AlmostImpossible);
    expect(Object.values(Difficulty).filter((v) => typeof v === 'number')).toHaveLength(5);
  });
});

describe('thresholds', () => {
  it('map techniques per the spec', () => {
    const d = TECHNIQUE_DIFFICULTY;
    expect([Technique.NakedSingle, Technique.HiddenSingle].map((t) => d[t])).toEqual([0, 0]);
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
