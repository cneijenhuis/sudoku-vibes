/** DOM-free game state for the playing screen. All functions are pure. */

export const CELLS = 81;

/** Input modes; number-first will add a variant later without changing the state shape. */
export type InputMode = 'cell-first';

/** One entry made by the player, recorded so it can be undone. */
export interface Move {
  index: number;
  /** Value before the move (always 0 today: only empty cells can be filled). */
  previous: number;
  value: number;
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
  /** Every wrong entry ever made; undoing a mistake does not reduce it. */
  readonly mistakes: number;
  readonly mode: InputMode;
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
    mistakes: 0,
    mode: 'cell-first',
  };
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

/**
 * Place `digit` (1-9) in the selected cell, deselect it and highlight the digit. Does nothing
 * when no cell is selected, the cell is already filled, or a mistake is on the board.
 * (`pressDigit` additionally refuses complete digits.) A wrong digit is placed and counted.
 */
export function enter(state: GameState, digit: number): GameState {
  const i = state.selected;
  if (i === null || !Number.isInteger(digit) || digit < 1 || digit > 9) return state;
  if (state.cells[i] !== 0 || hasMistake(state)) return state;
  const cells = Uint8Array.from(state.cells);
  cells[i] = digit;
  return {
    ...state,
    cells,
    selected: null,
    highlight: digit,
    history: [...state.history, { index: i, previous: 0, value: digit }],
    mistakes: state.mistakes + (digit === state.solution[i] ? 0 : 1),
  };
}

/** Whether a tap on a digit button would place the digit rather than highlight it. */
export function canEnter(state: GameState): boolean {
  const i = state.selected;
  return i !== null && state.cells[i] === 0 && !hasMistake(state);
}

/**
 * Handle a tap on a digit button: place the digit when an empty cell is selected and entry
 * is allowed, otherwise highlight it (tapping the highlighted digit clears the highlight).
 * Complete digits are ignored.
 */
export function pressDigit(state: GameState, digit: number): GameState {
  if (!Number.isInteger(digit) || digit < 1 || digit > 9 || completedDigits(state)[digit]) return state;
  if (canEnter(state)) return enter(state, digit);
  return { ...state, highlight: effectiveHighlight(state) === digit ? null : digit };
}

/** Revert the most recent entry and select its cell; the mistake count is kept. */
export function undo(state: GameState): GameState {
  const move = state.history[state.history.length - 1];
  if (!move) return state;
  const cells = Uint8Array.from(state.cells);
  cells[move.index] = move.previous;
  return { ...state, cells, selected: move.index, history: state.history.slice(0, -1) };
}
