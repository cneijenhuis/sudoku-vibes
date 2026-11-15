import { describe, expect, it } from 'vitest';
import { findConflicts, parse } from '../engine/board';
import { countSolutions } from '../engine/solver';
import { analyze } from '../engine/techniques';
import { DIFFICULTY_LABELS, Difficulty, grade, rate, scoreBand } from '../engine/grading';
import { generatePuzzle } from './generate';

const LEVELS = Object.values(Difficulty).filter((v): v is Difficulty => typeof v === 'number');

describe.each(LEVELS)('generatePuzzle (level %s)', (level) => {
  const label = DIFFICULTY_LABELS[level];
  // The slow levels get fewer seeds so `npm test` stays quick.
  const seeds = level <= Difficulty.Tricky ? [11, 12, 13, 14] : [11, 12];

  it(`${label}: unique, consistent, graded as requested and fair`, () => {
    for (const seed of seeds) {
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
      // Fair: the solver limited to the level's techniques finishes it, with no guess.
      const capped = analyze(puzzle, level);
      expect(capped.solved).toBe(true);
      expect(Array.from(capped.board)).toEqual(Array.from(solution));
    }
  });
});

describe('spread within the level', () => {
  it('puts fewer than half of 100 Gentle puzzles in the top fifth of the band', () => {
    const { lo, hi } = scoreBand(Difficulty.Gentle);
    const top = lo + (hi - lo) * 0.8;
    const scores: number[] = [];
    for (let seed = 1; seed <= 100; seed++) {
      const r = generatePuzzle(Difficulty.Gentle, { seed });
      expect(r.difficulty).toBe(Difficulty.Gentle);
      scores.push(rate(analyze(parse(r.puzzle))).score);
    }
    expect(scores.filter((s) => s >= top).length).toBeLessThan(50);
    // And they really spread: at least three distinct score steps, none outside the band.
    expect(new Set(scores).size).toBeGreaterThanOrEqual(3);
    expect(scores.every((s) => s >= lo && s < hi)).toBe(true);
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
    const results = [1, 2, 3, 4, 5, 6].map((seed) => generatePuzzle(Difficulty.Tricky, { seed, budgetMs: 0 }));
    for (const r of results) {
      const puzzle = parse(r.puzzle);
      expect(countSolutions(puzzle, 2)).toBe(1);
      expect(grade(puzzle)).toBe(r.difficulty);
      expect(r.exact).toBe(r.difficulty === Difficulty.Tricky);
    }
    const inexact = results.filter((r) => !r.exact);
    expect(inexact.length).toBeGreaterThan(0);
    // Deterministic: the same seed gives the same fallback.
    const again = generatePuzzle(Difficulty.Tricky, { seed: 1, budgetMs: 0 });
    expect(again).toEqual(results[0]);
  });

  it('a clock that never advances still returns once an exact puzzle is found', () => {
    const r = generatePuzzle(Difficulty.Medium, { seed: 3, budgetMs: 1000, now: () => 0 });
    expect(r.exact).toBe(true);
  });

  it('a clock that jumps past the deadline stops after the first graded candidate', () => {
    let t = 0;
    const r = generatePuzzle(Difficulty.Tough, { seed: 2, budgetMs: 10, now: () => (t += 1000) });
    expect(countSolutions(parse(r.puzzle), 2)).toBe(1);
    expect(r.exact).toBe(r.difficulty === Difficulty.Tough);
  });
});

describe('generatePuzzle input validation', () => {
  it('throws RangeError for an unknown difficulty', () => {
    expect(() => generatePuzzle(99 as Difficulty)).toThrow(RangeError);
    expect(() => generatePuzzle(-1 as Difficulty)).toThrow(RangeError);
    expect(() => generatePuzzle(Number.NaN as Difficulty)).toThrow(RangeError);
  });
});
