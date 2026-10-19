import { describe, expect, it } from 'vitest';
import {
  canEnter,
  canUndo,
  completedDigits,
  createGame,
  effectiveHighlight,
  enter,
  hasMistake,
  isComplete,
  isMistakeCell,
  pressDigit,
  select,
  undo,
  type GameState,
} from './state';

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
    expect(g.highlight).toBeNull();
    expect(effectiveHighlight(g)).toBeNull();
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

// Two rows empty: every digit is missing exactly two instances. Row 1 of the solution is
// 5 3 4 6 7 8 9 1 2 and row 2 is 6 7 2 1 9 5 3 4 8, so 5 is missing at cells 0 and 14.
const ROW_PUZZLE = '0'.repeat(18) + SOLUTION.slice(18);
const completeFive = (g: GameState) => pressDigit(select(pressDigit(select(g, 0), 5), 14), 5);
const row = () => createGame(ROW_PUZZLE, SOLUTION);
const wrongRow = (i: number) => (Number(SOLUTION[i]) % 9) + 1;

describe('highlight', () => {
  it('selecting a filled cell highlights its digit; an empty cell keeps the highlight', () => {
    let g = select(row(), 18);
    expect(effectiveHighlight(g)).toBe(1);
    g = select(g, 0);
    expect(g.selected).toBe(0);
    expect(effectiveHighlight(g)).toBe(1);
  });

  it('pressing a digit with nothing selected highlights it, toggles off and switches', () => {
    let g = pressDigit(row(), 5);
    expect(effectiveHighlight(g)).toBe(5);
    expect(g.cells).toEqual(row().cells);
    g = pressDigit(g, 7);
    expect(effectiveHighlight(g)).toBe(7);
    g = pressDigit(g, 7);
    expect(effectiveHighlight(g)).toBeNull();
  });

  it('pressing a digit with a filled cell selected only highlights', () => {
    const g = pressDigit(select(row(), 18), 8);
    expect(g.cells).toEqual(row().cells);
    expect(g.history).toEqual([]);
    expect(effectiveHighlight(g)).toBe(8);
  });

  it('entering deselects the cell and highlights the entered digit', () => {
    const g = pressDigit(select(row(), 1), 3);
    expect(g.cells[1]).toBe(3);
    expect(g.selected).toBeNull();
    expect(g.highlight).toBe(3);
  });

  it('the highlight survives selecting an empty cell; entering another digit replaces it', () => {
    let g = pressDigit(row(), 6);
    g = select(g, 1);
    expect(effectiveHighlight(g)).toBe(6);
    g = pressDigit(g, 3);
    expect(g.cells[1]).toBe(3);
    expect(effectiveHighlight(g)).toBe(3);
  });

  it('a blocked entry (mistake on the board) highlights the digit instead', () => {
    const g = select(enter(select(row(), 0), wrongRow(0)), 1);
    expect(canEnter(g)).toBe(false);
    const next = pressDigit(g, 3);
    expect(next.cells).toEqual(g.cells);
    expect(next.history).toEqual(g.history);
    expect(effectiveHighlight(next)).toBe(3);
  });

  it('a blocked tap on the already highlighted digit clears the highlight', () => {
    const g = select(enter(select(row(), 0), wrongRow(0)), 1);
    const once = pressDigit(g, 3);
    expect(effectiveHighlight(once)).toBe(3);
    expect(effectiveHighlight(pressDigit(once, 3))).toBeNull();
  });

  it('a wrong entry highlights the entered digit', () => {
    const g = enter(select(row(), 0), wrongRow(0));
    expect(effectiveHighlight(g)).toBe(wrongRow(0));
  });

  it('undo leaves the highlight alone', () => {
    let g = pressDigit(select(row(), 0), 5);
    g = pressDigit(g, 7);
    g = undo(g);
    expect(effectiveHighlight(g)).toBe(7);
  });

  it('ignores invalid digits', () => {
    const g = row();
    for (const d of [0, 10, -1, 2.5, NaN]) expect(pressDigit(g, d)).toBe(g);
  });
});

describe('completedDigits', () => {
  it('reports a digit once its ninth correct instance is placed, and undo reopens it', () => {
    let g = row();
    expect(completedDigits(g).some(Boolean)).toBe(false);
    g = pressDigit(select(g, 0), 5);
    expect(completedDigits(g)[5]).toBe(false);
    g = completeFive(row());
    expect(completedDigits(g)[5]).toBe(true);
    expect(completedDigits(g)[3]).toBe(false);
    expect(completedDigits(g)[0]).toBe(false);
    g = undo(g);
    expect(completedDigits(g)[5]).toBe(false);
  });

  it('a wrong digit never completes a digit', () => {
    const g = enter(select(row(), 0), wrongRow(0));
    expect(completedDigits(g).some(Boolean)).toBe(false);
  });

  it('a complete digit is not highlighted and cannot be pressed', () => {
    const g = completeFive(row()); // 5 is now complete; stored highlight is 5
    expect(g.highlight).toBe(5);
    expect(effectiveHighlight(g)).toBeNull();
    expect(pressDigit(g, 5)).toBe(g);
    const sel = select(g, 1);
    expect(pressDigit(sel, 5)).toBe(sel);
  });

  it('selecting a cell with a complete digit highlights nothing', () => {
    const g = completeFive(row());
    const on = select(pressDigit(g, 7), 0);
    expect(on.selected).toBe(0);
    expect(effectiveHighlight(on)).toBeNull();
  });

  it('undoing the completing entry brings the stored highlight back', () => {
    let g = completeFive(row());
    expect(effectiveHighlight(g)).toBeNull();
    g = undo(g);
    expect(effectiveHighlight(g)).toBe(5);
  });
});
