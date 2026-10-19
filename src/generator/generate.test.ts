import { describe, expect, it } from 'vitest';
import { findConflicts, parse } from '../engine/board';
import { countSolutions } from '../engine/solver';
import { DIFFICULTY_LABELS, Difficulty, grade } from '../engine/grading';
import { generatePuzzle } from './generate';

const LEVELS = [
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
  Difficulty.Extreme,
  Difficulty.AlmostImpossible,
];

describe.each(LEVELS)('generatePuzzle (%s)', (level) => {
  const label = DIFFICULTY_LABELS[level];

  it(`${label}: unique, consistent and graded as requested`, () => {
    for (const seed of [11, 12]) {
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
    }
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
  it('returns a unique, truthfully graded fallback flagged inexact when the budget is exhausted', () => {
    // A clock that is already past the deadline after the first reading: only one attempt runs.
    let t = 0;
    const now = () => (t += 1000);
    const results = [1, 2, 3, 4, 5, 6].map((seed) => generatePuzzle(Difficulty.Hard, { seed, budgetMs: 1, now }));
    for (const r of results) {
      const puzzle = parse(r.puzzle);
      expect(countSolutions(puzzle, 2)).toBe(1);
      expect(grade(puzzle)).toBe(r.difficulty);
      expect(r.exact).toBe(r.difficulty === Difficulty.Hard);
    }
    expect(results.some((r) => !r.exact)).toBe(true);
  });
});
