import { describe, expect, it } from 'vitest';
import { canUndo, createGame, enter, hasMistake, isComplete, isMistakeCell, select, undo } from './state';

const SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
// Cells 0, 1 and 80 empty; everything else given.
const PUZZLE = '00' + SOLUTION.slice(2, 80) + '0';
const wrongFor = (i: number) => (Number(SOLUTION[i]) % 9) + 1;

const fresh = () => createGame(PUZZLE, SOLUTION);

describe('createGame', () => {
  it('starts in cell-first mode with nothing selected', () => {
    const g = fresh();
    expect(g.mode).toBe('cell-first');
    expect(g.selected).toBeNull();
    expect(g.history).toEqual([]);
    expect(g.mistakes).toBe(0);
    expect(g.cells[0]).toBe(0);
    expect(g.cells[2]).toBe(4);
  });

  it('rejects malformed input', () => {
    expect(() => createGame('123', SOLUTION)).toThrow();
    expect(() => createGame(PUZZLE, 'x'.repeat(81))).toThrow();
  });
});

describe('select', () => {
  it('selects, replaces and toggles off', () => {
    let g = select(fresh(), 5);
    expect(g.selected).toBe(5);
    g = select(g, 7);
    expect(g.selected).toBe(7);
    g = select(g, 7);
    expect(g.selected).toBeNull();
  });

  it('can select givens and ignores out-of-range indexes', () => {
    const g = fresh();
    expect(select(g, 40).selected).toBe(40);
    expect(select(g, -1)).toBe(g);
    expect(select(g, 81)).toBe(g);
    expect(select(g, 1.5)).toBe(g);
  });

  it('does not mutate the previous state', () => {
    const g = fresh();
    select(g, 3);
    expect(g.selected).toBeNull();
  });
});

describe('enter', () => {
  it('does nothing without a selection', () => {
    const g = fresh();
    expect(enter(g, 5)).toBe(g);
  });

  it('places a correct digit, deselects and records history', () => {
    const g = enter(select(fresh(), 0), 5);
    expect(g.cells[0]).toBe(5);
    expect(g.selected).toBeNull();
    expect(g.mistakes).toBe(0);
    expect(g.history).toEqual([{ index: 0, previous: 0, value: 5 }]);
    expect(hasMistake(g)).toBe(false);
  });

  it('leaves givens unchanged', () => {
    const g = select(fresh(), 10);
    expect(enter(g, 9)).toBe(g);
  });

  it('leaves already-filled entries unchanged', () => {
    const g = select(enter(select(fresh(), 0), 5), 0);
    expect(enter(g, 1)).toBe(g);
    expect(g.cells[0]).toBe(5);
  });

  it('places a wrong digit as a counted mistake', () => {
    const g = enter(select(fresh(), 0), wrongFor(0));
    expect(g.cells[0]).toBe(wrongFor(0));
    expect(g.mistakes).toBe(1);
    expect(hasMistake(g)).toBe(true);
    expect(isMistakeCell(g, 0)).toBe(true);
    expect(isMistakeCell(g, 2)).toBe(false);
    expect(g.selected).toBeNull();
  });

  it('blocks entry while a mistake exists but still allows selection', () => {
    const bad = enter(select(fresh(), 0), wrongFor(0));
    const next = select(bad, 1);
    expect(next.selected).toBe(1);
    expect(enter(next, Number(SOLUTION[1]))).toBe(next);
    expect(select(next, 40).selected).toBe(40);
  });

  it('ignores invalid digits', () => {
    const g = select(fresh(), 0);
    for (const d of [0, 10, -1, 2.5, NaN]) expect(enter(g, d)).toBe(g);
  });
});

describe('undo', () => {
  it('is a no-op and reports nothing to undo on a fresh game', () => {
    const g = fresh();
    expect(canUndo(g)).toBe(false);
    expect(undo(g)).toBe(g);
  });

  it('removes entries in reverse order', () => {
    let g = fresh();
    g = enter(select(g, 0), 5);
    g = enter(select(g, 1), 3);
    g = enter(select(g, 80), 9);
    expect(canUndo(g)).toBe(true);
    g = undo(g);
    expect([g.cells[0], g.cells[1], g.cells[80]]).toEqual([5, 3, 0]);
    g = undo(g);
    expect([g.cells[0], g.cells[1]]).toEqual([5, 0]);
    g = undo(g);
    expect(g.cells[0]).toBe(0);
    expect(canUndo(g)).toBe(false);
  });

  it('removes a mistake, keeps the count and re-enables entry', () => {
    let g = enter(select(fresh(), 0), wrongFor(0));
    g = undo(g);
    expect(g.cells[0]).toBe(0);
    expect(g.mistakes).toBe(1);
    expect(hasMistake(g)).toBe(false);
    g = enter(g, 5); // undo left the cell selected
    expect(g.cells[0]).toBe(5);
    expect(g.mistakes).toBe(1);
  });

  it('reselects the cell it cleared', () => {
    const g = undo(enter(select(fresh(), 1), 3));
    expect(g.selected).toBe(1);
  });

  it('accumulates mistakes across repeated errors', () => {
    let g = fresh();
    for (let k = 0; k < 3; k++) {
      g = enter(g.selected === 0 ? g : select(g, 0), wrongFor(0));
      g = undo(g);
    }
    expect(g.mistakes).toBe(3);
  });
});

describe('isComplete', () => {
  it('is false until every cell is correct, true after the last one', () => {
    let g = fresh();
    expect(isComplete(g)).toBe(false);
    g = enter(select(g, 0), 5);
    g = enter(select(g, 1), 3);
    expect(isComplete(g)).toBe(false);
    g = enter(select(g, 80), 9);
    expect(isComplete(g)).toBe(true);
  });

  it('is false with a wrong digit in the last cell', () => {
    let g = enter(select(fresh(), 0), 5);
    g = enter(select(g, 1), 3);
    g = enter(select(g, 80), wrongFor(80));
    expect(isComplete(g)).toBe(false);
  });
});
