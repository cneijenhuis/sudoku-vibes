import { describe, expect, it } from 'vitest';
import { findConflicts, parse } from '../engine/board';
import { countSolutions } from '../engine/solver';
import { DIFFICULTY_LABELS, Difficulty, grade } from '../engine/grading';
import { MIN_GIVENS, generatePuzzle } from './generate';

const LEVELS = [
  Difficulty.SuperEasy,
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
  Difficulty.Extreme,
  Difficulty.AlmostImpossible,
];

describe.each(LEVELS)('generatePuzzle (%s)', (level) => {
  const label = DIFFICULTY_LABELS[level];

  it(`${label}: unique, consistent and graded as requested`, () => {
    for (const seed of [11, 12, 13, 14]) {
      const r = generatePuzzle(level, { seed, budgetMs: 20000 });
      const puzzle = parse(r.puzzle);
      const solution = parse(r.solution);

      expect(solution.every((v) => v >= 1 && v <= 9)).toBe(true);
      expect(findConflicts(solution)).toEqual([]);
      puzzle.forEach((v, i) => {
        if (v !== 0) expect(v).toBe(solution[i]);
      });
      expect(countSolutions(puzzle, 2)).toBe(1);
      expect(grade(puzzle)).toBe(r.difficulty);
      expect(r.difficulty).toBe(level);
      expect(r.exact).toBe(true);
      const givens = r.puzzle.replace(/0/g, '').length;
      expect(givens).toBeGreaterThanOrEqual(MIN_GIVENS[level]);
      if (level === Difficulty.SuperEasy) expect(givens).toBe(44);
      if (level === Difficulty.Easy) expect(givens).toBeLessThan(44);
    }
  });

  it(`${label}: respects the minimum givens`, () => {
    const floors: Record<string, number> = { 'Super Easy': 44, Easy: 36, Medium: 32, Hard: 28, Extreme: 25, 'Almost Impossible': 0 };
    expect(MIN_GIVENS[level]).toBe(floors[label] ?? -1);
  });
});

describe('generatePuzzle randomness', () => {
  it('same seed and level reproduce the same puzzle', () => {
    expect(generatePuzzle(Difficulty.Medium, { seed: 99 })).toEqual(generatePuzzle(Difficulty.Medium, { seed: 99 }));
  });

  it('different seeds (and unseeded calls) give different puzzles', () => {
    const a = generatePuzzle(Difficulty.Easy, { seed: 1 });
    const b = generatePuzzle(Difficulty.Easy, { seed: 2 });
    expect(a.puzzle).not.toBe(b.puzzle);
    const c = generatePuzzle(Difficulty.Easy);
    const d = generatePuzzle(Difficulty.Easy);
    expect(c.puzzle).not.toBe(d.puzzle);
  });
});

describe('generatePuzzle time budget', () => {
  it('with no budget returns the first candidate: unique, truthfully graded, flagged inexact', () => {
    const results = [1, 2, 3, 4, 5, 6].map((seed) => generatePuzzle(Difficulty.Hard, { seed, budgetMs: 0 }));
    for (const r of results) {
      const puzzle = parse(r.puzzle);
      expect(countSolutions(puzzle, 2)).toBe(1);
      expect(grade(puzzle)).toBe(r.difficulty);
      expect(r.exact).toBe(r.difficulty === Difficulty.Hard);
    }
    const inexact = results.filter((r) => !r.exact);
    expect(inexact.length).toBeGreaterThan(0);
    // Deterministic: the same seed gives the same fallback.
    const again = generatePuzzle(Difficulty.Hard, { seed: 1, budgetMs: 0 });
    expect(again).toEqual(results[0]);
  });

  it('a clock that never advances still returns once an exact puzzle is found', () => {
    const r = generatePuzzle(Difficulty.Medium, { seed: 3, budgetMs: 1000, now: () => 0 });
    expect(r.exact).toBe(true);
  });

  it('a clock that jumps past the deadline stops after the first graded candidate', () => {
    let t = 0;
    const r = generatePuzzle(Difficulty.Extreme, { seed: 2, budgetMs: 10, now: () => (t += 1000) });
    expect(countSolutions(parse(r.puzzle), 2)).toBe(1);
    expect(r.exact).toBe(r.difficulty === Difficulty.Extreme);
  });
});

describe('generatePuzzle input validation', () => {
  it('throws RangeError for an unknown difficulty', () => {
    expect(() => generatePuzzle(99 as Difficulty)).toThrow(RangeError);
    expect(() => generatePuzzle(-1 as Difficulty)).toThrow(RangeError);
    expect(() => generatePuzzle(Number.NaN as Difficulty)).toThrow(RangeError);
  });
});
