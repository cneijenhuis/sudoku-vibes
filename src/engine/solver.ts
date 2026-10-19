import { CELLS, PEERS, findConflicts, type Board } from './board';

const ALL = 0x1ff;

function popcount(x: number): number {
  let n = 0;
  while (x) {
    x &= x - 1;
    n++;
  }
  return n;
}

/**
 * Count solutions of `board` up to `limit` (default 2), using backtracking with
 * naked-single propagation and minimum-remaining-values branching.
 * When `capture` is given, the first solution found is written into it.
 */
function search(board: Board, limit: number, capture?: Board): number {
  if (findConflicts(board).length > 0) return 0;
  const cells = Uint8Array.from(board);
  const cand = new Uint16Array(CELLS);
  for (let i = 0; i < CELLS; i++) {
    if (cells[i] !== 0) continue;
    let used = 0;
    for (const p of PEERS[i] ?? []) {
      const v = cells[p] ?? 0;
      if (v) used |= 1 << (v - 1);
    }
    cand[i] = ALL & ~used;
    if (cand[i] === 0) return 0;
  }

  let count = 0;

  // Assign value v to cell i, removing it from peers; returns false on contradiction.
  // Pushes undo records onto `trail` as [cell, oldMask] pairs.
  function assign(i: number, v: number, trail: number[]): boolean {
    const bit = 1 << (v - 1);
    trail.push(i, cand[i] ?? 0);
    cells[i] = v;
    cand[i] = 0;
    const queue: number[] = [];
    for (const p of PEERS[i] ?? []) {
      const m = cand[p] ?? 0;
      if (cells[p] === 0 && m & bit) {
        trail.push(p, m);
        const nm = m & ~bit;
        cand[p] = nm;
        if (nm === 0) return false;
        if ((nm & (nm - 1)) === 0) queue.push(p);
      }
    }
    for (const p of queue) {
      if (cells[p] !== 0) continue;
      const m = cand[p] ?? 0;
      if (m === 0) return false;
      if (!assign(p, 32 - Math.clz32(m), trail)) return false;
    }
    return true;
  }

  function undo(trail: number[], mark: number): void {
    while (trail.length > mark) {
      const old = trail.pop() ?? 0;
      const i = trail.pop() ?? 0;
      cand[i] = old;
      // A cell whose candidates are restored to non-zero was empty; one restored
      // from an assignment record had mask `old` and is now unset again.
      cells[i] = board[i] ?? 0;
    }
  }

  function rec(): void {
    // pick empty cell with fewest candidates
    let best = -1;
    let bestN = 10;
    for (let i = 0; i < CELLS; i++) {
      if (cells[i] !== 0) continue;
      const n = popcount(cand[i] ?? 0);
      if (n < bestN) {
        bestN = n;
        best = i;
        if (n <= 1) break;
      }
    }
    if (best < 0) {
      count++;
      if (capture && count === 1) capture.set(cells);
      return;
    }
    let m = cand[best] ?? 0;
    while (m && count < limit) {
      const low = m & -m;
      m &= m - 1;
      const v = 32 - Math.clz32(low);
      const trail: number[] = [];
      if (assign(best, v, trail)) rec();
      undo(trail, 0);
    }
  }

  // Initial propagation of singles.
  const trail0: number[] = [];
  for (let i = 0; i < CELLS; i++) {
    if (cells[i] === 0 && (cand[i] ?? 0) !== 0 && ((cand[i] ?? 0) & ((cand[i] ?? 0) - 1)) === 0) {
      if (!assign(i, 32 - Math.clz32(cand[i] ?? 0), trail0)) return 0;
    }
  }
  rec();
  return count;
}

/** Number of solutions, capped at `limit` (default 2). Invalid boards yield 0. */
export function countSolutions(board: Board, limit = 2): number {
  return search(board, limit);
}

/** A complete solution (givens preserved), or null if none exists. */
export function solve(board: Board): Board | null {
  const out = new Uint8Array(CELLS);
  return search(board, 1, out) > 0 ? out : null;
}
