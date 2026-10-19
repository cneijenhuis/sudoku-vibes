import { describe, expect, it } from 'vitest';
import { findConflicts, parse, serialize } from './board';
import { countSolutions, solve } from './solver';

const EASY = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
const EASY_SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
// Hard 17-clue puzzle (hard for naive backtracking).
const SEVENTEEN = '000000010400000000020000000000050407008000300001090000300400200050100000000806000';
// Norvig's "hard for brute force" puzzle.
const NORVIG = '4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......';

describe('solve', () => {
  it('solves a known puzzle, preserving givens', () => {
    const puzzle = parse(EASY);
    const sol = solve(puzzle);
    expect(sol).not.toBeNull();
    expect(serialize(sol!)).toBe(EASY_SOLUTION);
    expect(findConflicts(sol!)).toEqual([]);
    puzzle.forEach((v, i) => {
      if (v) expect(sol![i]).toBe(v);
    });
  });

  it('does not mutate its input', () => {
    const puzzle = parse(EASY);
    solve(puzzle);
    expect(serialize(puzzle)).toBe(EASY);
  });

  it('reports no solution for an unsolvable board', () => {
    // Row 0 has 1-8 placed; the last cell is forced to 9 but column 8 already has a 9.
    const b = parse('123456780' + '0'.repeat(72));
    b[17] = 9;
    expect(solve(b)).toBeNull();
    expect(countSolutions(b)).toBe(0);
  });

  it('reports no solution for a board with conflicts', () => {
    const b = parse(EASY);
    b[2] = 5; // duplicates the 5 at index 0
    expect(solve(b)).toBeNull();
  });

  it('solves an empty board', () => {
    const sol = solve(parse('0'.repeat(81)));
    expect(sol).not.toBeNull();
    expect(findConflicts(sol!)).toEqual([]);
    expect(sol!.every((v) => v >= 1 && v <= 9)).toBe(true);
  });
});

describe('countSolutions', () => {
  it('returns 1 for a unique puzzle', () => {
    expect(countSolutions(parse(EASY))).toBe(1);
    expect(countSolutions(parse(NORVIG))).toBe(1);
  });

  it('returns the limit (2) for an empty board without enumerating', () => {
    expect(countSolutions(parse('0'.repeat(81)))).toBe(2);
    expect(countSolutions(parse('0'.repeat(81)), 5)).toBe(5);
  });

  it('detects a puzzle with multiple solutions', () => {
    // Blank the top two rows of a full grid: many completions remain.
    const p = parse(EASY_SOLUTION);
    for (let i = 0; i < 18; i++) p[i] = 0;
    expect(countSolutions(p)).toBe(2);
  });

  it('is fast on a hard 17-clue puzzle', () => {
    const t = performance.now();
    expect(countSolutions(parse(SEVENTEEN))).toBe(1);
    expect(performance.now() - t).toBeLessThan(2000);
  });
});
