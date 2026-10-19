/** Board model: 81 cells in row-major order, 0 = empty, 1-9 = digit. */
export type Board = Uint8Array;

export const SIZE = 9;
export const CELLS = 81;

export function rowOf(i: number): number {
  return Math.floor(i / 9);
}
export function colOf(i: number): number {
  return i % 9;
}
export function boxOf(i: number): number {
  return Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
}

/** The 27 units (9 rows, 9 columns, 9 boxes) as arrays of cell indices. */
export const UNITS: readonly (readonly number[])[] = (() => {
  const units: number[][] = [];
  for (let r = 0; r < 9; r++) units.push(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  for (let c = 0; c < 9; c++) units.push(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    const cells: number[] = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push((br + r) * 9 + bc + c);
    units.push(cells);
  }
  return units;
})();

export const ROWS = UNITS.slice(0, 9);
export const COLS = UNITS.slice(9, 18);
export const BOXES = UNITS.slice(18, 27);

/** For each cell, the three units containing it. */
export const UNITS_OF: readonly (readonly (readonly number[])[])[] = Array.from(
  { length: CELLS },
  (_, i) => [ROWS[rowOf(i)] ?? [], COLS[colOf(i)] ?? [], BOXES[boxOf(i)] ?? []],
);

/** For each cell, the 20 other cells sharing a row, column or box. */
export const PEERS: readonly (readonly number[])[] = Array.from({ length: CELLS }, (_, i) => {
  const set = new Set<number>();
  for (const unit of UNITS_OF[i] ?? []) for (const j of unit) if (j !== i) set.add(j);
  return [...set].sort((a, b) => a - b);
});

const PUZZLE_RE = /^[0-9.]{81}$/;

/** Parse an 81-char string ('0' or '.' = empty). Throws on invalid input. */
export function parse(text: string): Board {
  if (typeof text !== 'string' || !PUZZLE_RE.test(text)) {
    throw new Error('Invalid board: expected 81 characters of digits 0-9 or "."');
  }
  const board = new Uint8Array(CELLS);
  for (let i = 0; i < CELLS; i++) {
    const ch = text.charAt(i);
    board[i] = ch === '.' ? 0 : Number(ch);
  }
  return board;
}

/** Serialise to an 81-char string using '0' for empty cells. */
export function serialize(board: Board): string {
  let out = '';
  for (let i = 0; i < CELLS; i++) out += String(board[i] ?? 0);
  return out;
}

/** Sorted indices of all cells that share a digit with a peer in a row, column or box. */
export function findConflicts(board: Board): number[] {
  const bad = new Set<number>();
  for (const unit of UNITS) {
    const seen = new Map<number, number>();
    for (const i of unit) {
      const v = board[i] ?? 0;
      if (v === 0) continue;
      const prev = seen.get(v);
      if (prev !== undefined) {
        bad.add(prev);
        bad.add(i);
      } else seen.set(v, i);
    }
  }
  return [...bad].sort((a, b) => a - b);
}

export function hasConflicts(board: Board): boolean {
  return findConflicts(board).length > 0;
}
