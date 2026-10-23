/** DOM-free game state for the playing screen. All functions are pure. */

export const CELLS = 81;

/**
 * Input modes. In 'number-first' the active digit is `highlight` (non-null and not complete,
 * see `activeMode`) and tapping an empty cell places it.
 */
export type InputMode = 'cell-first' | 'number-first';

/** One entry made by the player, recorded so it can be undone. */
export interface Move {
  index: number;
  /** Value before the move (always 0 today: only empty cells can be filled). */
  previous: number;
  value: number;
  /**
   * The note bits this entry removed, per cell (the entry cell's own notes, each peer that lost
   * the digit). Undo ORs them back, keeping notes toggled since. Absent for restored moves.
   */
  notes?: readonly [index: number, mask: number][];
}

export interface GameState {
  /** Puzzle clues, 0 = empty. Never changes. */
  readonly givens: Uint8Array;
  readonly solution: Uint8Array;
  /** Current board: givens plus the player's entries. Treated as immutable. */
  readonly cells: Uint8Array;
  readonly selected: number | null;
  /**
   * The digit whose cells are highlighted, or null. May hold a digit that has since been
   * completed; use `effectiveHighlight` to read it.
   */
  readonly highlight: number | null;
  readonly history: readonly Move[];
  /**
   * Undone entries, the next one to redo last. In memory only: empty after `createGame` and
   * `restoreGame`, and cleared by every new entry.
   */
  readonly redoStack: readonly Move[];
  /** Every wrong entry ever made; undoing a mistake does not reduce it. */
  readonly mistakes: number;
  readonly mode: InputMode;
  /** Whether digit input adds pencil notes instead of placing digits. */
  readonly notesOn: boolean;
  /** Pencil notes per cell: bit `d-1` set = digit d noted. Always 0 for filled cells. Treated as immutable. */
  readonly notes: Uint16Array;
}

function parse(s: string, what: string): Uint8Array {
  if (!/^[0-9]{81}$/.test(s)) throw new Error(`${what} must be 81 digits`);
  return Uint8Array.from(s, (c) => Number(c));
}

/** A new game: no selection, no history, no mistakes. */
export function createGame(puzzle: string, solution: string): GameState {
  const givens = parse(puzzle, 'puzzle');
  return {
    givens,
    solution: parse(solution, 'solution'),
    cells: Uint8Array.from(givens),
    selected: null,
    highlight: null,
    history: [],
    redoStack: [],
    mistakes: 0,
    mode: 'cell-first',
    notesOn: false,
    notes: new Uint16Array(CELLS),
  };
}

/**
 * Rebuild a game from a validated save: givens plus the entries in order. Entries are applied
 * directly rather than through `enter`, which would refuse legitimate saved sequences (e.g. a
 * trailing mistake). The result starts cell-first with no selection or highlight; `previous` is
 * always 0 because only empty cells can be filled.
 */
export function restoreGame(saved: {
  puzzle: string;
  solution: string;
  moves: readonly (readonly [number, number])[];
  mistakes: number;
  /** Optional note masks (81 values); absent = no notes. */
  notes?: readonly number[];
}): GameState {
  const game = createGame(saved.puzzle, saved.solution);
  const cells = Uint8Array.from(game.cells);
  const history: Move[] = [];
  for (const [index, value] of saved.moves) {
    cells[index] = value;
    history.push({ index, previous: 0, value });
  }
  const notes = saved.notes ? Uint16Array.from(saved.notes) : game.notes;
  return { ...game, cells, history, mistakes: saved.mistakes, notes };
}

/** Number of cells holding the correct digit, per digit (index 1-9; index 0 unused). */
function correctCounts(state: GameState): number[] {
  const counts = new Array<number>(10).fill(0);
  for (let i = 0; i < CELLS; i++) {
    const v = state.cells[i] ?? 0;
    if (v !== 0 && v === state.solution[i]) counts[v] = (counts[v] ?? 0) + 1;
  }
  return counts;
}

/** Which digits (index 1-9; index 0 is always false) have all nine instances correctly placed. */
export function completedDigits(state: GameState): boolean[] {
  return correctCounts(state).map((n, d) => d !== 0 && n === 9);
}

/** The digit to highlight on screen: the stored one unless it is complete. */
export function effectiveHighlight(state: GameState): number | null {
  const d = state.highlight;
  if (d === null) return null;
  return completedDigits(state)[d] ? null : d;
}

/**
 * Select a cell, replacing any selection; selecting the selected cell deselects it.
 * Selecting a filled cell highlights its digit (unless complete); selecting an empty cell
 * leaves the highlight alone.
 */
export function select(state: GameState, index: number): GameState {
  if (!Number.isInteger(index) || index < 0 || index >= CELLS) return state;
  const v = state.cells[index] ?? 0;
  const highlight = v === 0 ? state.highlight : completedDigits(state)[v] ? null : v;
  return { ...state, selected: state.selected === index ? null : index, highlight };
}

/** True while any entered digit differs from the solution. */
export function hasMistake(state: GameState): boolean {
  for (let i = 0; i < CELLS; i++) {
    if (state.cells[i] !== 0 && state.cells[i] !== state.solution[i]) return true;
  }
  return false;
}

/** True when every cell holds its solution digit. */
export function isComplete(state: GameState): boolean {
  for (let i = 0; i < CELLS; i++) if (state.cells[i] !== state.solution[i]) return false;
  return true;
}

/** Whether `index` currently shows a wrong digit. */
export function isMistakeCell(state: GameState, index: number): boolean {
  const v = state.cells[index] ?? 0;
  return v !== 0 && v !== state.solution[index];
}

export function canUndo(state: GameState): boolean {
  return state.history.length > 0;
}

/** Whether an undone entry can be re-entered: something was undone and no mistake is on the board. */
export function canRedo(state: GameState): boolean {
  return state.redoStack.length > 0 && !hasMistake(state);
}

/**
 * Place `digit` (1-9) in the selected cell, deselect it and highlight the digit. Does nothing
 * when no cell is selected, the cell is already filled, or a mistake is on the board.
 * (`pressDigit` additionally refuses complete digits.) A wrong digit is placed and counted.
 */
export function enter(state: GameState, digit: number): GameState {
  const i = state.selected;
  if (i === null) return state;
  return place(state, i, digit);
}

/** The 20 other cells sharing a row, column or 3x3 box with `i`. */
function peersOf(i: number): number[] {
  const row = Math.floor(i / 9);
  const col = i % 9;
  const out: number[] = [];
  for (let p = 0; p < CELLS; p++) {
    if (p === i) continue;
    const r = Math.floor(p / 9);
    const c = p % 9;
    if (r === row || c === col || (Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3))) out.push(p);
  }
  return out;
}

/**
 * Put `digit` into empty cell `i` (no entry when a mistake is on the board), record it, highlight
 * the digit and clear the selection. Completing the digit in number-first mode makes the next
 * incomplete digit active; in cell-first mode (or when nothing is left) the mode is cell-first.
 * Notes: the cell's own notes are cleared and a correct digit is removed from its peers' notes;
 * the previous masks are recorded in the move so undo can restore them.
 */
function place(state: GameState, i: number, digit: number, redoing = false): GameState {
  if (!Number.isInteger(digit) || digit < 1 || digit > 9) return state;
  if (state.cells[i] !== 0 || hasMistake(state)) return state;
  const cells = Uint8Array.from(state.cells);
  cells[i] = digit;
  let notes = state.notes;
  const removed: [number, number][] = [];
  const setMask = (p: number, mask: number) => {
    if (notes === state.notes) notes = Uint16Array.from(notes); // copy on first change
    removed.push([p, (notes[p] ?? 0) & ~mask]);
    notes[p] = mask;
  };
  if (notes[i] !== 0) setMask(i, 0); // placing a digit clears the cell's notes
  if (digit === state.solution[i]) {
    // a correct digit can no longer be a candidate in its row, column or box
    const bit = 1 << (digit - 1);
    for (const p of peersOf(i)) if ((notes[p] ?? 0) & bit) setMask(p, (notes[p] ?? 0) & ~bit);
  }
  const next: GameState = {
    ...state,
    cells,
    notes,
    selected: null,
    highlight: digit,
    history: [...state.history, removed.length > 0 ? { index: i, previous: 0, value: digit, notes: removed } : { index: i, previous: 0, value: digit }],
    redoStack: redoing ? state.redoStack.slice(0, -1) : [],
    // A redone wrong digit was counted when it was first entered.
    mistakes: state.mistakes + (redoing || digit === state.solution[i] ? 0 : 1),
  };
  const completed = completedDigits(next);
  // Only the entry that completes the digit advances (a stray entry of an already complete digit does not).
  if (!completed[digit] || completedDigits(state)[digit]) return next;
  const advanceTo = activeMode(state) === 'number-first' ? nextIncompleteDigit(digit, completed) : null;
  return advanceTo === null ? { ...next, mode: 'cell-first' } : { ...next, highlight: advanceTo };
}

/**
 * The next digit after `from` (higher first, wrapping 9 to 1, `from` itself last) whose entry in
 * `completed` (as from `completedDigits`) is false, or null when every digit is complete.
 */
export function nextIncompleteDigit(from: number, completed: readonly boolean[]): number | null {
  for (let step = 1; step <= 9; step++) {
    const d = ((from - 1 + step) % 9 + 9) % 9 + 1;
    if (!completed[d]) return d;
  }
  return null;
}

/** Whether a tap on a digit button would place the digit rather than highlight it. */
export function canEnter(state: GameState): boolean {
  const i = state.selected;
  return i !== null && state.cells[i] === 0 && !hasMistake(state);
}

/**
 * Handle a tap on a digit button: with notes mode on and an empty cell selected, toggle the note
 * (the cell stays selected); otherwise place the digit when an empty cell is selected and entry
 * is allowed, otherwise highlight it (tapping the highlighted digit clears the highlight).
 * Complete digits are ignored. In number-first mode it makes the digit the active one instead
 * (tapping the active digit changes nothing).
 */
export function pressDigit(state: GameState, digit: number): GameState {
  if (!Number.isInteger(digit) || digit < 1 || digit > 9 || completedDigits(state)[digit]) return state;
  if (activeMode(state) === 'number-first') {
    return state.highlight === digit ? state : { ...state, highlight: digit };
  }
  const sel = state.selected;
  if (state.notesOn && sel !== null && state.cells[sel] === 0) return toggleNote(state, sel, digit);
  if (canEnter(state)) return enter(state, digit);
  return { ...state, highlight: effectiveHighlight(state) === digit ? null : digit };
}

/**
 * Revert the most recent entry, adding back the note bits it removed (notes toggled since are
 * kept); the mistake count is kept. Cell-first mode selects the freed cell, number-first mode
 * keeps the mode and selects nothing.
 */
export function undo(state: GameState): GameState {
  const move = state.history[state.history.length - 1];
  if (!move) return state;
  const cells = Uint8Array.from(state.cells);
  cells[move.index] = move.previous;
  let notes = state.notes;
  if (move.notes) {
    notes = Uint16Array.from(notes);
    for (const [index, mask] of move.notes) notes[index] = (notes[index] ?? 0) | mask;
  }
  return {
    ...state,
    cells,
    notes,
    selected: activeMode(state) === 'number-first' ? null : move.index,
    history: state.history.slice(0, -1),
    redoStack: [...state.redoStack, move],
  };
}

/**
 * Re-enter the most recently undone entry through the same path as an entry (notes cleared, a
 * correct digit pruned from its peers, advance-on-complete), without counting a mistake again and
 * selecting nothing. Does nothing when there is nothing to redo or a mistake is on the board.
 */
export function redo(state: GameState): GameState {
  const move = state.redoStack[state.redoStack.length - 1];
  if (!move) return state;
  return place(state, move.index, move.value, true);
}

/** The mode to act on: number-first only while its active digit is set and not yet complete. */
export function activeMode(state: GameState): InputMode {
  const d = state.highlight;
  if (state.mode !== 'number-first' || d === null || completedDigits(state)[d]) return 'cell-first';
  return 'number-first';
}

/**
 * Switch to number-first mode with `digit` active (also switches the digit when already in the
 * mode). Clears the selection; does nothing for a complete or invalid digit.
 */
export function startNumberFirst(state: GameState, digit: number): GameState {
  if (!Number.isInteger(digit) || digit < 1 || digit > 9 || completedDigits(state)[digit]) return state;
  return { ...state, mode: 'number-first', selected: null, highlight: digit };
}

/** Back to cell-first mode with nothing selected; the highlight stays. */
export function exitNumberFirst(state: GameState): GameState {
  if (state.mode === 'cell-first' && state.selected === null) return state;
  return { ...state, mode: 'cell-first', selected: null };
}

/** A long press on a digit button: leave the mode on the active digit, otherwise (re)start it. */
export function longPressDigit(state: GameState, digit: number): GameState {
  if (activeMode(state) === 'number-first' && state.highlight === digit) return exitNumberFirst(state);
  return startNumberFirst(state, digit);
}

/**
 * A tap on a board cell. Cell-first: select it. Number-first: an empty cell receives the active
 * digit (unselected; blocked while a mistake is on the board) or, with notes mode on, toggles it
 * as a note, a filled cell makes its digit
 * the active one unless that digit is complete.
 */
export function tapCell(state: GameState, index: number): GameState {
  if (activeMode(state) === 'cell-first') return select(state, index);
  if (!Number.isInteger(index) || index < 0 || index >= CELLS) return state;
  const v = state.cells[index] ?? 0;
  if (v === 0) return state.notesOn ? toggleNote(state, index, state.highlight ?? 0) : place(state, index, state.highlight ?? 0);
  if (completedDigits(state)[v] || v === state.highlight) return state;
  return { ...state, highlight: v };
}

/** Flip notes mode. Nothing else changes. */
export function toggleNotes(state: GameState): GameState {
  return { ...state, notesOn: !state.notesOn };
}

/**
 * Toggle `digit` as a note in empty cell `index`. Ignored for filled cells, invalid input and
 * complete digits. Leaves history, mistakes, selection and highlight alone.
 */
export function toggleNote(state: GameState, index: number, digit: number): GameState {
  if (!Number.isInteger(index) || index < 0 || index >= CELLS) return state;
  if (!Number.isInteger(digit) || digit < 1 || digit > 9 || completedDigits(state)[digit]) return state;
  if (state.cells[index] !== 0) return state;
  const notes = Uint16Array.from(state.notes);
  notes[index] = (notes[index] ?? 0) ^ (1 << (digit - 1));
  return { ...state, notes };
}

/** The digits (ascending) noted in cell `index`. */
export function notesOf(state: GameState, index: number): number[] {
  const mask = state.notes[index] ?? 0;
  const out: number[] = [];
  for (let d = 1; d <= 9; d++) if (mask & (1 << (d - 1))) out.push(d);
  return out;
}
