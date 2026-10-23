import { describe, expect, it } from 'vitest';
import {
  activeMode,
  canEnter,
  canRedo,
  canUndo,
  completedDigits,
  createGame,
  effectiveHighlight,
  enter,
  exitNumberFirst,
  hasMistake,
  isComplete,
  isMistakeCell,
  longPressDigit,
  nextIncompleteDigit,
  pressDigit,
  redo,
  restoreGame,
  select,
  startNumberFirst,
  tapCell,
  toggleNote,
  toggleNotes,
  notesOf,
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

describe('number-first mode', () => {
  // ROW_PUZZLE: rows 0 and 1 empty; the 5s are missing at cells 0 and 14.
  const nf = (d = 5) => startNumberFirst(row(), d);
  const cellsOf = (g: GameState) => Array.from(g.cells);

  it('starts with the digit active, highlighted and the selection cleared', () => {
    const g = startNumberFirst(select(row(), 3), 5);
    expect(g.mode).toBe('number-first');
    expect(activeMode(g)).toBe('number-first');
    expect(g.selected).toBeNull();
    expect(effectiveHighlight(g)).toBe(5);
  });

  it('cannot start for a complete or invalid digit', () => {
    const done = completeFive(row());
    expect(startNumberFirst(done, 5)).toBe(done);
    const g = row();
    for (const d of [0, 10, 1.5, NaN]) expect(startNumberFirst(g, d)).toBe(g);
  });

  it('places the active digit in a tapped empty cell without selecting', () => {
    const g = tapCell(nf(), 0);
    expect(g.cells[0]).toBe(5);
    expect(g.selected).toBeNull();
    expect(g.mode).toBe('number-first');
    expect(effectiveHighlight(g)).toBe(5);
    expect(g.history).toEqual([{ index: 0, previous: 0, value: 5 }]);
    expect(g.mistakes).toBe(0);
  });

  it('a wrong placement is a counted mistake, and blocks further placing until undone', () => {
    let g = tapCell(nf(), 1); // 5 does not belong at cell 1 (solution 3)
    expect(g.cells[1]).toBe(5);
    expect(isMistakeCell(g, 1)).toBe(true);
    expect(g.mistakes).toBe(1);
    const blocked = tapCell(g, 0);
    expect(blocked).toBe(g);
    g = undo(g);
    expect(g.cells[1]).toBe(0);
    expect(g.mistakes).toBe(1);
    expect(tapCell(g, 0).cells[0]).toBe(5);
  });

  it('undo keeps the mode and the digit and selects nothing', () => {
    const g = undo(tapCell(nf(), 0));
    expect(g.cells[0]).toBe(0);
    expect(g.mode).toBe('number-first');
    expect(g.highlight).toBe(5);
    expect(g.selected).toBeNull();
  });

  it('cell-first undo still selects the freed cell', () => {
    expect(undo(enter(select(row(), 0), 5)).selected).toBe(0);
  });

  it('switches digit by pad tap; tapping the active digit changes nothing', () => {
    const g = nf();
    const seven = pressDigit(g, 7);
    expect(seven.mode).toBe('number-first');
    expect(effectiveHighlight(seven)).toBe(7);
    expect(pressDigit(g, 5)).toBe(g);
  });

  it('switches digit by tapping a filled cell (given or entered), board unchanged', () => {
    const g = nf();
    const given = tapCell(g, 18); // solution[18] = 1, a given
    expect(effectiveHighlight(given)).toBe(Number(SOLUTION[18]));
    expect(given.mode).toBe('number-first');
    expect(cellsOf(given)).toEqual(cellsOf(g));
    const placed = tapCell(g, 0);
    const back = tapCell(pressDigit(placed, 7), 0);
    expect(effectiveHighlight(back)).toBe(5);
    expect(tapCell(given, 18)).toBe(given); // already active
  });

  it('a long press on another digit switches; on the active digit it exits', () => {
    const g = nf();
    const seven = longPressDigit(g, 7);
    expect(seven.mode).toBe('number-first');
    expect(effectiveHighlight(seven)).toBe(7);
    const out = longPressDigit(g, 5);
    expect(out.mode).toBe('cell-first');
    expect(out.selected).toBeNull();
    expect(effectiveHighlight(out)).toBe(5);
    expect(longPressDigit(out, 5).mode).toBe('number-first');
  });

  it('exitNumberFirst keeps the highlight and is a no-op in cell-first', () => {
    const g = exitNumberFirst(nf());
    expect(g.mode).toBe('cell-first');
    expect(g.highlight).toBe(5);
    const plain = row();
    expect(exitNumberFirst(plain)).toBe(plain);
  });

  it('placing the last instance advances to the next incomplete digit and stays in the mode', () => {
    const g = tapCell(tapCell(nf(), 0), 14);
    expect(completedDigits(g)[5]).toBe(true);
    expect(g.mode).toBe('number-first');
    expect(activeMode(g)).toBe('number-first');
    expect(g.highlight).toBe(6);
    expect(effectiveHighlight(g)).toBe(6);
    expect(g.selected).toBeNull();
    expect(startNumberFirst(g, 5)).toBe(g);
    expect(pressDigit(g, 5)).toBe(g);
  });

  it('cell-first entry of the last instance still highlights nothing', () => {
    const g = completeFive(row());
    expect(g.mode).toBe('cell-first');
    expect(effectiveHighlight(g)).toBeNull();
  });

  describe('advancing after a completed digit', () => {
    // Blank the first cell of each listed digit in the solution: each is then one short of complete.
    const missing = (...ds: number[]) => {
      const p = [...SOLUTION];
      const at = ds.map((d) => {
        const i = p.indexOf(String(d));
        p[i] = '0';
        return i;
      });
      return { game: createGame(p.join(''), SOLUTION), at };
    };
    const finish = (ds: number[], from: number) => {
      const { game, at } = missing(...ds);
      return { g: tapCell(startNumberFirst(game, from), at[ds.indexOf(from)]!), at, game };
    };

    it('moves to the adjacent digit', () => {
      expect(finish([2, 3], 2).g.highlight).toBe(3);
    });

    it('skips completed digits', () => {
      const { g } = finish([2, 4], 2); // 3 is complete
      expect(g.highlight).toBe(4);
      expect(g.mode).toBe('number-first');
    });

    it('wraps from 9 to 1', () => {
      expect(finish([9, 1], 9).g.highlight).toBe(1);
    });

    it('wraps and skips', () => {
      expect(finish([9, 3], 9).g.highlight).toBe(3); // 1 and 2 are complete
    });

    it('can wrap back below the completed digit', () => {
      expect(finish([5, 2], 5).g.highlight).toBe(2);
    });

    it('the next digit is then placed by the following tap', () => {
      const { g, at } = finish([2, 3], 2);
      const next = tapCell(g, at[1]!);
      expect(next.cells[at[1]!]).toBe(3);
      expect(next.mistakes).toBe(0);
    });

    it('undoing the completing entry keeps the advanced digit, selects nothing and reopens the digit', () => {
      const { g } = finish([2, 3], 2);
      const u = undo(g);
      expect(completedDigits(u)[2]).toBe(false);
      expect(u.mode).toBe('number-first');
      expect(u.highlight).toBe(3);
      expect(u.selected).toBeNull();
      expect(activeMode(u)).toBe('number-first');
      expect(pressDigit(u, 2).highlight).toBe(2);
    });

    it('finishing the last incomplete digit completes the puzzle and leaves cell-first with nothing highlighted', () => {
      const { g } = finish([9], 9);
      expect(isComplete(g)).toBe(true);
      expect(g.mode).toBe('cell-first');
      expect(effectiveHighlight(g)).toBeNull();
    });

    it('a mistake never advances', () => {
      const { game, at } = missing(2, 3);
      let g = startNumberFirst(game, 2);
      g = tapCell(g, at[1]!); // a 2 where a 3 belongs
      expect(g.highlight).toBe(2);
      expect(g.mistakes).toBe(1);
    });
  });

  it('a stored complete digit in number-first mode falls back to cell-first via activeMode', () => {
    const done = tapCell(tapCell(nf(), 0), 14);
    const stale = { ...done, highlight: 5 }; // e.g. a state assembled elsewhere
    expect(activeMode(stale)).toBe('cell-first');
    expect(effectiveHighlight(stale)).toBeNull();
  });

  it('tapping a cell of a complete digit does not switch to it', () => {
    let g = completeFive(row());
    g = startNumberFirst(g, 7);
    const five = [...SOLUTION].findIndex((c, i) => c === '5' && i >= 18);
    expect(tapCell(g, five)).toBe(g);
  });

  it('cell-first tapCell behaves as select', () => {
    const g = row();
    expect(tapCell(g, 4)).toEqual(select(g, 4));
  });

  it('ignores out-of-range taps', () => {
    const g = nf();
    for (const i of [-1, 81, 1.5]) expect(tapCell(g, i)).toBe(g);
  });
});

describe('nextIncompleteDigit', () => {
  const only = (...incomplete: number[]) => Array.from({ length: 10 }, (_, d) => d !== 0 && !incomplete.includes(d));
  it.each([
    [2, [3], 3],
    [2, [4], 4],
    [9, [1], 1],
    [9, [3], 3],
    [5, [2, 7], 7],
    [5, [2], 2],
    [5, [5, 8], 8],
  ])('from %i with %j incomplete gives %i', (from, incomplete, want) => {
    expect(nextIncompleteDigit(from, only(...incomplete))).toBe(want);
  });
  it('wraps all the way round to the digit itself when it is the only one left', () => {
    expect(nextIncompleteDigit(5, only(5))).toBe(5);
  });
  it('is null when every digit is complete', () => {
    expect(nextIncompleteDigit(5, only())).toBeNull();
  });
});

describe('pencil notes', () => {
  const notesGame = () => toggleNotes(fresh());

  it('starts off with no notes, and toggleNotes flips only the flag', () => {
    const g = fresh();
    expect(g.notesOn).toBe(false);
    expect(Array.from(g.notes)).toEqual(new Array(81).fill(0));
    const on = toggleNotes(g);
    expect(on.notesOn).toBe(true);
    expect({ ...on, notesOn: false }).toEqual(g);
    expect(toggleNotes(on).notesOn).toBe(false);
  });

  it('adds several notes to a selected cell and keeps it selected', () => {
    let g = select(notesGame(), 0);
    for (const d of [5, 3, 9]) g = pressDigit(g, d);
    expect(notesOf(g, 0)).toEqual([3, 5, 9]);
    expect(g.selected).toBe(0);
    expect(g.cells[0]).toBe(0);
    expect(g.history).toEqual([]);
    expect(g.mistakes).toBe(0);
  });

  it('removes a noted digit when it is pressed again', () => {
    let g = select(notesGame(), 0);
    g = pressDigit(pressDigit(g, 5), 3);
    g = pressDigit(g, 5);
    expect(notesOf(g, 0)).toEqual([3]);
  });

  it('does not touch the highlight when noting', () => {
    let g = pressDigit(notesGame(), 5); // no cell selected: highlight
    expect(g.highlight).toBe(5);
    g = select(g, 0);
    g = pressDigit(g, 3);
    expect(g.highlight).toBe(5);
    expect(notesOf(g, 0)).toEqual([3]);
  });

  it('highlights as usual with no empty cell selected and adds no note', () => {
    const g = pressDigit(select(notesGame(), 40), 3); // 40 is a given holding 5
    expect(g.highlight).toBe(3);
    expect(Array.from(g.notes).every((m) => m === 0)).toBe(true);
    const h = pressDigit(notesGame(), 5);
    expect(h.highlight).toBe(5);
    expect(Array.from(h.notes).every((m) => m === 0)).toBe(true);
  });

  it('never notes on a filled cell or a complete digit', () => {
    const g = notesGame();
    expect(toggleNote(g, 2, 5)).toBe(g); // given
    expect(completedDigits(g)[4]).toBe(true);
    expect(toggleNote(g, 0, 4)).toBe(g);
    expect(pressDigit(select(g, 0), 4).notes[0]).toBe(0);
    expect(toggleNote(g, 0, 0)).toBe(g);
    expect(toggleNote(g, 0, 10)).toBe(g);
    expect(toggleNote(g, 81, 5)).toBe(g);
    const filled = enter(select(fresh(), 0), 5);
    expect(toggleNote(filled, 0, 3)).toBe(filled);
  });

  it('is not blocked by a mistake on the board', () => {
    let g = enter(select(fresh(), 0), wrongFor(0));
    expect(hasMistake(g)).toBe(true);
    g = select(toggleNotes(g), 1);
    g = pressDigit(g, 3);
    expect(notesOf(g, 1)).toEqual([3]);
    expect(g.mistakes).toBe(1);
  });

  it('leaves mistakes and history alone', () => {
    let g = enter(select(fresh(), 0), Number(SOLUTION[0]));
    const before = g;
    g = toggleNote(toggleNotes(g), 1, 3);
    expect(g.history).toBe(before.history);
    expect(g.mistakes).toBe(before.mistakes);
    expect(g.cells).toBe(before.cells);
  });

  it('toggles the active digit as a note in number-first mode', () => {
    let g = toggleNotes(startNumberFirst(fresh(), 5));
    g = tapCell(g, 0);
    expect(notesOf(g, 0)).toEqual([5]);
    expect(g.cells[0]).toBe(0);
    expect(g.history).toEqual([]);
    g = tapCell(g, 0);
    expect(notesOf(g, 0)).toEqual([]);
    expect(g.mode).toBe('number-first');
  });

  it('still switches the active digit on a filled cell in number-first notes mode', () => {
    const g = tapCell(toggleNotes(startNumberFirst(fresh(), 5)), 2); // cell 2 holds 4, complete
    expect(g.highlight).toBe(5);
    const h = tapCell(toggleNotes(startNumberFirst(fresh(), 5)), 3); // holds 6 (complete too)
    expect(h.highlight).toBe(5);
    const placed = enter(select(fresh(), 0), 3); // a wrong 3, so 3 is not complete
    const k = tapCell(toggleNotes(startNumberFirst(placed, 9)), 0);
    expect(k.highlight).toBe(3);
  });

  it('placing a digit clears that cell notes only, and undo restores them', () => {
    let g = select(notesGame(), 0);
    g = pressDigit(pressDigit(g, 5), 3); // notes 3, 5 in cell 0
    g = toggleNote(g, 80, 9); // unrelated cell
    g = enter(g, 5); // cell 0 is still selected
    expect(g.cells[0]).toBe(5);
    expect(g.notes[0]).toBe(0);
    expect(notesOf(g, 80)).toEqual([9]);
    g = undo(g);
    expect(g.cells[0]).toBe(0);
    expect(notesOf(g, 0)).toEqual([3, 5]);
    expect(notesOf(g, 80)).toEqual([9]);
  });

  describe('pruning peer notes', () => {
    // Empty cells: 0 (solution 5), its peers 1 (row), 9 (column), 10 (box), and the unrelated 40 and 80.
    const puzzle = [...SOLUTION].map((c, i) => ([0, 1, 9, 10, 40, 80].includes(i) ? '0' : c)).join('');
    const noted = () => {
      let g = createGame(puzzle, SOLUTION);
      for (const i of [1, 9, 10, 40]) g = toggleNote(toggleNote(g, i, 5), i, 9);
      return toggleNote(g, 0, 5);
    };

    it('removes a correct digit from row, column and box peers, keeping other notes', () => {
      let g = enter(select(noted(), 0), 5);
      for (const i of [1, 9, 10]) expect(notesOf(g, i)).toEqual([9]);
      expect(notesOf(g, 40)).toEqual([5, 9]);
      expect(g.notes[0]).toBe(0);
    });

    it('does not change cells without the note or the notes array identity needlessly', () => {
      const g = createGame(puzzle, SOLUTION);
      expect(enter(select(g, 0), 5).notes).toBe(g.notes);
      expect(enter(select(g, 0), 5).history[0]).toEqual({ index: 0, previous: 0, value: 5 });
    });

    it('a wrong digit prunes nothing', () => {
      const g0 = noted();
      const g = enter(select(g0, 0), wrongFor(0));
      expect(g.mistakes).toBe(1);
      expect(g.notes[0]).toBe(0);
      for (const i of [1, 9, 10, 40]) expect(notesOf(g, i)).toEqual([5, 9]);
      const wrong5 = enter(select(g0, 1), 5); // 5 is wrong in cell 1 (solution 3)
      expect(notesOf(wrong5, 9)).toEqual([5, 9]);
      expect(Array.from(undo(wrong5).notes)).toEqual(Array.from(g0.notes));
    });

    it('undo restores peers and the entry cell notes', () => {
      const g0 = noted();
      const g = undo(enter(select(g0, 0), 5));
      expect(Array.from(g.notes)).toEqual(Array.from(g0.notes));
      expect(g.cells[0]).toBe(0);
      expect(g.history).toEqual([]);
    });

    it('undo restores only the last entry notes', () => {
      let g = noted();
      g = enter(select(g, 0), 5);
      g = toggleNote(g, 1, 3);
      g = enter(select(g, 1), 3); // cell 1 solution 3; its notes 3, 9 are cleared
      expect(g.notes[1]).toBe(0);
      g = undo(g);
      expect(notesOf(g, 1)).toEqual([3, 9]);
      expect(notesOf(g, 9)).toEqual([9]); // still pruned by the first entry
      g = undo(g);
      expect(notesOf(g, 9)).toEqual([5, 9]);
    });

    it('prunes in number-first mode', () => {
      const g = tapCell(startNumberFirst(noted(), 5), 0);
      expect(g.cells[0]).toBe(5);
      for (const i of [1, 9, 10]) expect(notesOf(g, i)).toEqual([9]);
      expect(Array.from(undo(g).notes)).toEqual(Array.from(noted().notes));
    });

    it('keeps cells, history and mistakes behaviour', () => {
      const g = enter(select(noted(), 0), 5);
      expect(g.history.map((m) => [m.index, m.previous, m.value])).toEqual([[0, 0, 5]]);
      expect(g.mistakes).toBe(0);
      expect(g.cells[0]).toBe(5);
    });

    it('undo keeps notes toggled on a peer after the entry', () => {
      let g = enter(select(noted(), 0), 5);
      g = toggleNote(g, 1, 7);
      g = toggleNote(g, 1, 3); // peer 1 now {3, 7, 9}
      g = undo(g);
      expect(notesOf(g, 1)).toEqual([3, 5, 7, 9]);
    });

    it('undo restores the entry cell notes (cell-first)', () => {
      let g = noted(); // cell 0 has note 5
      g = toggleNote(g, 0, 9);
      g = undo(enter(select(g, 0), 5));
      expect(notesOf(g, 0)).toEqual([5, 9]);
      expect(g.selected).toBe(0);
    });

    it('undo of a wrong digit restores the cell own notes and nothing else', () => {
      let g = toggleNote(noted(), 0, 9);
      g = enter(select(g, 0), wrongFor(0));
      expect(g.notes[0]).toBe(0);
      g = undo(g);
      expect(notesOf(g, 0)).toEqual([5, 9]);
      for (const i of [1, 9, 10, 40]) expect(notesOf(g, i)).toEqual([5, 9]);
    });

    it('undo after a resume, then a new entry and undo, restores only the new entry', () => {
      let g = restoreGame({ puzzle, solution: SOLUTION, moves: [[40, 5]], mistakes: 0 });
      for (const i of [1, 9]) g = toggleNote(toggleNote(g, i, 5), i, 9);
      g = enter(select(g, 0), 5);
      expect(notesOf(g, 1)).toEqual([9]);
      g = undo(g);
      expect(notesOf(g, 1)).toEqual([5, 9]);
      g = undo(g); // the restored entry: no record
      expect(g.cells[40]).toBe(0);
      expect(notesOf(g, 1)).toEqual([5, 9]);
    });

    it('does not mutate earlier states', () => {
      const g0 = select(noted(), 0);
      const notes0 = Array.from(g0.notes);
      const g1 = enter(g0, 5);
      expect(Array.from(g0.notes)).toEqual(notes0);
      expect(g0.history).toEqual([]);
      const notes1 = Array.from(g1.notes);
      const hist1 = [...g1.history];
      const g2 = undo(g1);
      expect(Array.from(g1.notes)).toEqual(notes1);
      expect(g1.history).toEqual(hist1);
      expect(g2.notes).not.toBe(g1.notes);
    });

    it('number-first placement of the last 5 prunes peers and still advances', () => {
      const last = [...SOLUTION].map((c, i) => ([0, 1].includes(i) ? '0' : c)).join('');
      let g = toggleNote(toggleNote(createGame(last, SOLUTION), 1, 5), 1, 3);
      g = tapCell(startNumberFirst(g, 5), 0);
      expect(g.cells[0]).toBe(5);
      expect(notesOf(g, 1)).toEqual([3]);
      expect(g.highlight).toBe(3);
      expect(activeMode(g)).toBe('number-first');
    });

    it('undoing a restored entry restores no notes', () => {
      const g = undo(restoreGame({ puzzle: PUZZLE, solution: SOLUTION, moves: [[0, 5]], mistakes: 0, notes: new Array(81).fill(0) }));
      expect(g.cells[0]).toBe(0);
      expect(Array.from(g.notes)).toEqual(new Array(81).fill(0));
    });
  });

  it('placing in number-first mode clears notes too', () => {
    let g = toggleNote(fresh(), 0, 3);
    g = tapCell(startNumberFirst(g, 5), 0);
    expect(g.cells[0]).toBe(5);
    expect(g.notes[0]).toBe(0);
  });

  it('does not mutate the previous state', () => {
    const g = notesGame();
    toggleNote(g, 0, 5);
    expect(g.notes[0]).toBe(0);
  });
});

describe('redo', () => {
  const noted = () => {
    let g = fresh();
    g = toggleNote(g, 1, 3);
    g = toggleNote(g, 1, 4);
    g = toggleNote(g, 80, 9);
    return g;
  };
  const same = (a: GameState, b: GameState) => {
    expect(Array.from(a.cells)).toEqual(Array.from(b.cells));
    expect(Array.from(a.notes)).toEqual(Array.from(b.notes));
    expect(a.mistakes).toBe(b.mistakes);
  };

  it('has nothing to redo at first, and redo is a no-op', () => {
    const g = fresh();
    expect(canRedo(g)).toBe(false);
    expect(redo(g)).toBe(g);
  });

  it('undo then redo returns the same board and note pruning, selecting nothing', () => {
    const g0 = noted();
    const entered = enter(select(g0, 0), 5); // 5 is the solution of cell 0
    const g = redo(undo(entered));
    same(g, entered);
    expect(g.selected).toBeNull();
    expect(g.history).toEqual(entered.history);
    expect(canRedo(g)).toBe(false);
  });

  it('prunes peer notes again and a second undo restores them', () => {
    let g0 = fresh();
    g0 = toggleNote(g0, 1, 5); // cell 1 is a peer of cell 0 (same row)
    const entered = enter(select(g0, 0), 5);
    expect(notesOf(entered, 1)).toEqual([]);
    const r = redo(undo(entered));
    expect(notesOf(r, 1)).toEqual([]);
    expect(notesOf(undo(r), 1)).toEqual([5]);
  });

  it('redoes several undone entries in their original order', () => {
    let g = enter(select(fresh(), 0), 5);
    g = enter(select(g, 1), 3);
    const done = g;
    g = undo(undo(g));
    expect(canRedo(g)).toBe(true);
    g = redo(g);
    expect(g.cells[0]).toBe(5);
    expect(g.cells[1]).toBe(0);
    g = redo(g);
    same(g, done);
    expect(canRedo(g)).toBe(false);
  });

  it('a new entry clears what can be redone', () => {
    let g = undo(enter(select(fresh(), 0), 5));
    expect(canRedo(g)).toBe(true);
    g = enter(select(g, 1), 3);
    expect(canRedo(g)).toBe(false);
    expect(g.redoStack).toEqual([]);
  });

  it('notes toggles and selection keep the redo stack', () => {
    let g = undo(enter(select(fresh(), 0), 5));
    g = toggleNote(select(g, 1), 1, 3);
    expect(canRedo(g)).toBe(true);
  });

  it('redo of a wrong digit does not count another mistake and blocks entry', () => {
    let g = enter(select(fresh(), 0), wrongFor(0));
    expect(g.mistakes).toBe(1);
    g = redo(undo(g));
    expect(g.mistakes).toBe(1);
    expect(g.cells[0]).toBe(wrongFor(0));
    expect(isMistakeCell(g, 0)).toBe(true);
    const blocked = enter(select(g, 1), 3);
    expect(Array.from(blocked.cells)).toEqual(Array.from(g.cells));
  });

  it('refuses to redo while a mistake is on the board', () => {
    // A wrong digit is always the newest entry, so it is the last one that can be redone; hand-build
    // the stack the other way round to reach the refusal.
    const wrong = enter(select(fresh(), 0), wrongFor(0));
    const stacked: GameState = { ...wrong, redoStack: [{ index: 80, previous: 0, value: 9 }] };
    expect(canRedo(stacked)).toBe(false);
    expect(redo(stacked)).toBe(stacked);
  });

  it('is unavailable after restoreGame', () => {
    const g = restoreGame({ puzzle: PUZZLE, solution: SOLUTION, moves: [[0, 5]], mistakes: 0 });
    expect(canRedo(g)).toBe(false);
    expect(g.redoStack).toEqual([]);
  });

  it('in number-first mode redo selects nothing and keeps the mode and digit', () => {
    const placed = tapCell(startNumberFirst(row(), 5), 0); // another 5 is still missing at cell 14
    const g = redo(undo(placed));
    expect(g.cells[0]).toBe(5);
    expect(g.selected).toBeNull();
    expect(g.mode).toBe('number-first');
    expect(effectiveHighlight(g)).toBe(5);
  });

  it('in number-first mode redo leaves the locked digit alone', () => {
    const entered = enter(select(row(), 1), 3); // cell 1 is a 3
    const g = redo(startNumberFirst(undo(entered), 7));
    expect(g.cells[1]).toBe(3);
    expect(g.mode).toBe('number-first');
    expect(g.highlight).toBe(7);
    expect(activeMode(g)).toBe('number-first');
  });

  it('a redo that completes another digit does not move the locked digit either', () => {
    const p = [...SOLUTION];
    const at2 = p.indexOf('2');
    p[at2] = '0';
    p[p.indexOf('7')] = '0'; // the 7 stays open so it can be locked
    const entered = enter(select(createGame(p.join(''), SOLUTION), at2), 2); // cell-first, completes the 2
    const g = redo(startNumberFirst(undo(entered), 7));
    expect(completedDigits(g)[2]).toBe(true);
    expect(g.highlight).toBe(7);
    expect(activeMode(g)).toBe('number-first');
  });

  it('advances to the next digit when the redo completes a digit', () => {
    const p = [...SOLUTION];
    const at2 = p.indexOf('2');
    const at3 = p.indexOf('3');
    p[at2] = '0';
    p[at3] = '0';
    const game = startNumberFirst(createGame(p.join(''), SOLUTION), 2);
    const placed = tapCell(game, at2);
    expect(placed.highlight).toBe(3);
    const g = redo(undo(placed));
    expect(g.highlight).toBe(3);
    expect(g.mode).toBe('number-first');
    expect(completedDigits(g)[2]).toBe(true);
  });

  it('does not change what undo does', () => {
    const entered = enter(select(fresh(), 0), 5);
    const u = undo(entered);
    expect(u.cells[0]).toBe(0);
    expect(u.selected).toBe(0);
    expect(u.history).toEqual([]);
    expect(u.redoStack).toEqual([entered.history[0]]);
  });
});
