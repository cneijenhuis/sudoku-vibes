import { CELLS, PEERS, type Board } from '../engine/board';
import { shuffle, type Random } from './random';

/** Build a random complete, conflict-free grid by randomised backtracking. */
export function randomFullGrid(rng: Random): Board {
  const board = new Uint8Array(CELLS);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const canPlace = (i: number, d: number): boolean => {
    for (const p of PEERS[i] ?? []) if (board[p] === d) return false;
    return true;
  };

  const fill = (i: number): boolean => {
    if (i === CELLS) return true;
    for (const d of shuffle(digits.slice(), rng)) {
      if (!canPlace(i, d)) continue;
      board[i] = d;
      if (fill(i + 1)) return true;
    }
    board[i] = 0;
    return false;
  };

  fill(0);
  return board;
}
