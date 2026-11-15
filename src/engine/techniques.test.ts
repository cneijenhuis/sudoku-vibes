import { describe, expect, it } from 'vitest';
import { parse } from './board';
import { solve, countSolutions } from './solver';
import { TECHNIQUE_FIXTURES } from './fixtures';
import { mulberry32, shuffle } from '../generator/random';
import { randomFullGrid } from '../generator/grid';
import { analyze, OPEN_MOVES_WINDOW, Technique, TECHNIQUE_LEVEL } from './techniques';

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
    expect(r.steps.every((s) => s.technique <= Technique.NakedSingle)).toBe(true);
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

/** Level of Difficulty.Hard / Tough, the levels either side of X-Wing (as plain numbers: no grading import). */
const HARD = 5;
const TOUGH = 6;
const EXTREME = 7;

describe('highest allowed level', () => {
  const xwing = parse(TECHNIQUE_FIXTURES.find((f) => f.technique === Technique.XWing)!.puzzle);

  it('stalls on an X-Wing puzzle below the X-Wing level and solves it at that level', () => {
    const capped = analyze(xwing, HARD);
    expect(capped.solved).toBe(false);
    expect(capped.requiresGuessing).toBe(true);
    expect(capped.steps.every((s) => TECHNIQUE_LEVEL[s.technique] <= HARD)).toBe(true);
    const full = analyze(xwing, TOUGH);
    expect(full.solved).toBe(true);
    expect(full).toEqual(analyze(xwing));
  });

  it('defaults to every technique', () => {
    expect(analyze(xwing).steps).toEqual(analyze(xwing, 8).steps);
  });

  it('keeps techniques in level order', () => {
    const order = Object.keys(Technique)
      .filter((k) => isNaN(Number(k)))
      .map((k) => TECHNIQUE_LEVEL[Technique[k as keyof typeof Technique]]);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

describe('Skyscraper and XYZ-Wing', () => {
  for (const [technique, name] of [
    [Technique.Skyscraper, 'Skyscraper'],
    [Technique.XYZWing, 'XYZ-Wing'],
  ] as const) {
    it(`${name} is the only way forward on its fixture: capped below level 9 the solver stalls, uncapped it continues`, () => {
      const board = parse(TECHNIQUE_FIXTURES.find((f) => f.technique === technique)!.puzzle);
      expect(analyze(board, EXTREME).solved).toBe(false);
      const full = analyze(board);
      expect(full.solved).toBe(true);
      const first = full.steps.findIndex((s) => s.technique === technique);
      expect(first).toBeGreaterThan(0);
      expect(full.steps[first]!.eliminations.length).toBeGreaterThan(0);
      // Everything before it is an easier technique, and the capped solver stops right there.
      expect(analyze(board, EXTREME).steps).toEqual(full.steps.slice(0, first));
    });
  }

  it('never eliminate the solution digit over 200 random minimal puzzles', () => {
    const rng = mulberry32(20240607);
    let used = 0;
    for (let n = 0; n < 200; n++) {
      const solution = randomFullGrid(rng);
      const puzzle = Uint8Array.from(solution);
      for (const cell of shuffle(Array.from({ length: 81 }, (_, i) => i), rng)) {
        const digit = puzzle[cell]!;
        puzzle[cell] = 0;
        if (countSolutions(puzzle, 2) !== 1) puzzle[cell] = digit;
      }
      const result = analyze(puzzle);
      for (const step of result.steps) {
        for (const e of step.eliminations) expect(solution[e.cell]).not.toBe(e.digit);
        for (const p of step.placements) expect(solution[p.cell]).toBe(p.digit);
        if (step.technique === Technique.Skyscraper || step.technique === Technique.XYZWing) used++;
      }
    }
    expect(used).toBeGreaterThan(0); // the new finders really were exercised
  });
});

describe('open moves', () => {
  // The Wikipedia solution with three cells in different rows, columns and boxes blanked: each is a
  // single (naked and hidden) before and after the others are filled.
  const solved = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
  const blanked = (cells: number[]) => parse(solved.split('').map((c, i) => (cells.includes(i) ? '0' : c)).join(''));

  it('counts the cells a single could fill before each placement', () => {
    expect(analyze(blanked([0, 13, 26])).openMoves).toEqual([3, 2, 1]);
    expect(analyze(blanked([40])).openMoves).toEqual([1]);
  });

  it('records nothing for a full grid', () => {
    expect(analyze(blanked([])).openMoves).toEqual([]);
  });

  it('records at most the first 25 placements', () => {
    const r = analyze(parse(TECHNIQUE_FIXTURES[0]!.puzzle));
    expect(r.steps.filter((s) => s.placements.length > 0).length).toBeGreaterThan(OPEN_MOVES_WINDOW);
    expect(r.openMoves).toHaveLength(OPEN_MOVES_WINDOW);
    expect(r.openMoves.every((n) => n >= 1)).toBe(true);
  });
});
