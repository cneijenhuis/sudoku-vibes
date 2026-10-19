import { describe, expect, it } from 'vitest';
import { parse } from './board';
import { solve, countSolutions } from './solver';
import { TECHNIQUE_FIXTURES } from './fixtures';
import { analyze, Technique } from './techniques';

describe('technique solver', () => {
  for (const f of TECHNIQUE_FIXTURES) {
    describe(f.name, () => {
      const board = parse(f.puzzle);
      const result = analyze(board);

      it('is uniquely solvable', () => {
        expect(countSolutions(board, 2)).toBe(1);
      });

      it(`uses ${Technique[f.technique]} and reports ${Technique[f.hardest]} as hardest`, () => {
        expect(result.solved).toBe(true);
        expect(result.requiresGuessing).toBe(false);
        expect(result.steps.some((s) => s.technique === f.technique)).toBe(true);
        expect(result.hardest).toBe(f.hardest);
      });

      it('is sound: never removes the true digit and ends at the solution', () => {
        const sol = solve(board)!;
        for (const s of result.steps) {
          for (const e of s.eliminations) expect(sol[e.cell]).not.toBe(e.digit);
          for (const p of s.placements) expect(sol[p.cell]).toBe(p.digit);
          if (s.placements.length === 0) expect(s.eliminations.length).toBeGreaterThan(0);
        }
        expect(Array.from(result.board)).toEqual(Array.from(sol));
      });

      it('is deterministic', () => {
        expect(analyze(board).steps).toEqual(result.steps);
      });
    });
  }

  it('solves an easy puzzle with singles only', () => {
    const r = analyze(parse(TECHNIQUE_FIXTURES[0]!.puzzle));
    expect(r.steps.every((s) => s.technique <= Technique.HiddenSingle)).toBe(true);
  });

  it('prefers easier techniques: no step is used while a simpler one applies at stall points', () => {
    // Steps never need a technique harder than the reported hardest.
    for (const f of TECHNIQUE_FIXTURES) {
      const r = analyze(parse(f.puzzle));
      expect(Math.max(...r.steps.map((s) => s.technique))).toBe(r.hardest);
    }
  });

  it('flags puzzles that stall all techniques as requiring guessing', () => {
    const r = analyze(parse('800000000003600000070090200050007000000045700000100030001000068008500010090000400'));
    expect(r.solved).toBe(false);
    expect(r.requiresGuessing).toBe(true);
  });

  it('rejects boards with conflicts', () => {
    const b = parse('0'.repeat(81));
    b[0] = 1;
    b[1] = 1;
    expect(() => analyze(b)).toThrow();
  });
});
