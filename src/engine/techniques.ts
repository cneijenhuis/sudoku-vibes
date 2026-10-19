import { BOXES, CELLS, COLS, PEERS, ROWS, UNITS, boxOf, colOf, findConflicts, rowOf, type Board } from './board';

/**
 * Human solving techniques, in the fixed order they are tried (simplest first).
 * The numeric value is the rank; lower ranks are always preferred.
 */
export enum Technique {
  NakedSingle,
  HiddenSingle,
  LockedCandidates,
  NakedPair,
  HiddenPair,
  NakedTriple,
  HiddenTriple,
  NakedQuad,
  HiddenQuad,
  XWing,
  Swordfish,
  XYWing,
}

export interface Placement {
  cell: number;
  digit: number;
}

export interface Step {
  technique: Technique;
  /** Digits placed by this step (singles only). */
  placements: Placement[];
  /** Candidates eliminated by this step. */
  eliminations: Placement[];
}

export interface Analysis {
  /** True when the technique solver filled the whole grid. */
  solved: boolean;
  /** True when the solver stalled with empty cells left (a guess would be needed). */
  requiresGuessing: boolean;
  steps: Step[];
  /** Hardest technique used, or null if no step was needed. */
  hardest: Technique | null;
  /** Board state when the solver finished or stalled. */
  board: Board;
}

const ALL = 0x1ff;
const bit = (d: number): number => 1 << (d - 1);
const digitOf = (lowBit: number): number => 32 - Math.clz32(lowBit);

function popcount(x: number): number {
  let n = 0;
  while (x) {
    x &= x - 1;
    n++;
  }
  return n;
}

function combinations<T>(items: readonly T[], k: number): T[][] {
  const out: T[][] = [];
  const cur: T[] = [];
  const go = (start: number): void => {
    if (cur.length === k) {
      out.push([...cur]);
      return;
    }
    for (let i = start; i <= items.length - (k - cur.length); i++) {
      cur.push(items[i] as T);
      go(i + 1);
      cur.pop();
    }
  };
  go(0);
  return out;
}

class State {
  cells: Uint8Array;
  cand = new Uint16Array(CELLS);

  constructor(board: Board) {
    this.cells = Uint8Array.from(board);
    for (let i = 0; i < CELLS; i++) {
      if (this.cells[i] !== 0) continue;
      let used = 0;
      for (const p of PEERS[i] ?? []) {
        const v = this.cells[p] ?? 0;
        if (v) used |= bit(v);
      }
      this.cand[i] = ALL & ~used;
    }
  }

  c(i: number): number {
    return this.cand[i] ?? 0;
  }

  empty(i: number): boolean {
    return this.cells[i] === 0;
  }

  get contradiction(): boolean {
    for (let i = 0; i < CELLS; i++) if (this.empty(i) && this.c(i) === 0) return true;
    return false;
  }

  get done(): boolean {
    return this.cells.every((v) => v !== 0);
  }

  place(cell: number, digit: number): void {
    this.cells[cell] = digit;
    this.cand[cell] = 0;
    for (const p of PEERS[cell] ?? []) this.cand[p] = this.c(p) & ~bit(digit);
  }

  /** Remove the digits in `mask` from `cell`; records and returns eliminations made. */
  eliminate(cell: number, mask: number, out: Placement[]): void {
    if (!this.empty(cell)) return;
    const hit = this.c(cell) & mask;
    if (!hit) return;
    this.cand[cell] = this.c(cell) & ~hit;
    for (let d = 1; d <= 9; d++) if (hit & bit(d)) out.push({ cell, digit: d });
  }
}

type Finder = (s: State) => Step | null;

function elim(technique: Technique, eliminations: Placement[]): Step | null {
  return eliminations.length ? { technique, placements: [], eliminations } : null;
}

const nakedSingle: Finder = (s) => {
  for (let i = 0; i < CELLS; i++) {
    const m = s.c(i);
    if (s.empty(i) && m !== 0 && (m & (m - 1)) === 0) {
      const digit = digitOf(m);
      s.place(i, digit);
      return { technique: Technique.NakedSingle, placements: [{ cell: i, digit }], eliminations: [] };
    }
  }
  return null;
};

const hiddenSingle: Finder = (s) => {
  for (const unit of UNITS) {
    for (let d = 1; d <= 9; d++) {
      let where = -1;
      let n = 0;
      for (const i of unit) {
        if (s.empty(i) && s.c(i) & bit(d)) {
          where = i;
          n++;
        }
      }
      if (n === 1) {
        s.place(where, d);
        return { technique: Technique.HiddenSingle, placements: [{ cell: where, digit: d }], eliminations: [] };
      }
    }
  }
  return null;
};

const lockedCandidates: Finder = (s) => {
  const out: Placement[] = [];
  // Pointing: digit confined to one line within a box -> clear rest of that line.
  // Claiming: digit confined to one box within a line -> clear rest of that box.
  for (let d = 1; d <= 9; d++) {
    const b = bit(d);
    const cellsOf = (unit: readonly number[]): number[] => unit.filter((i) => s.empty(i) && s.c(i) & b);
    for (const box of BOXES) {
      const cs = cellsOf(box);
      if (cs.length < 2) continue;
      const first = cs[0] as number;
      if (cs.every((i) => rowOf(i) === rowOf(first))) {
        for (const i of ROWS[rowOf(first)] ?? []) if (boxOf(i) !== boxOf(first)) s.eliminate(i, b, out);
      }
      if (cs.every((i) => colOf(i) === colOf(first))) {
        for (const i of COLS[colOf(first)] ?? []) if (boxOf(i) !== boxOf(first)) s.eliminate(i, b, out);
      }
      if (out.length) return elim(Technique.LockedCandidates, out);
    }
    for (const line of [...ROWS, ...COLS]) {
      const cs = cellsOf(line);
      if (cs.length < 2) continue;
      const first = cs[0] as number;
      if (cs.every((i) => boxOf(i) === boxOf(first))) {
        for (const i of BOXES[boxOf(first)] ?? []) if (!line.includes(i)) s.eliminate(i, b, out);
      }
      if (out.length) return elim(Technique.LockedCandidates, out);
    }
  }
  return null;
};

function nakedSubset(technique: Technique, k: number): Finder {
  return (s) => {
    const out: Placement[] = [];
    for (const unit of UNITS) {
      const pool = unit.filter((i) => s.empty(i) && popcount(s.c(i)) <= k && s.c(i) !== 0);
      for (const combo of combinations(pool, k)) {
        let union = 0;
        for (const i of combo) union |= s.c(i);
        if (popcount(union) !== k) continue;
        for (const i of unit) if (!combo.includes(i)) s.eliminate(i, union, out);
        if (out.length) return elim(technique, out);
      }
    }
    return null;
  };
}

function hiddenSubset(technique: Technique, k: number): Finder {
  return (s) => {
    const out: Placement[] = [];
    for (const unit of UNITS) {
      const where = new Map<number, number>(); // digit -> mask of unit positions
      for (let d = 1; d <= 9; d++) {
        let m = 0;
        unit.forEach((i, pos) => {
          if (s.empty(i) && s.c(i) & bit(d)) m |= 1 << pos;
        });
        if (m !== 0 && popcount(m) <= k) where.set(d, m);
      }
      for (const combo of combinations([...where.keys()], k)) {
        let union = 0;
        let digits = 0;
        for (const d of combo) {
          union |= where.get(d) ?? 0;
          digits |= bit(d);
        }
        if (popcount(union) !== k) continue;
        unit.forEach((i, pos) => {
          if (union & (1 << pos)) s.eliminate(i, ALL & ~digits, out);
        });
        if (out.length) return elim(technique, out);
      }
    }
    return null;
  };
}

/** X-Wing (n = 2) and Swordfish (n = 3), in both row-based and column-based form. */
function fish(technique: Technique, n: number): Finder {
  return (s) => {
    const out: Placement[] = [];
    for (let d = 1; d <= 9; d++) {
      const b = bit(d);
      for (const [bases, covers] of [
        [ROWS, COLS],
        [COLS, ROWS],
      ] as const) {
        const lines: { idx: number; mask: number }[] = [];
        bases.forEach((line, idx) => {
          let mask = 0;
          line.forEach((i, pos) => {
            if (s.empty(i) && s.c(i) & b) mask |= 1 << pos;
          });
          if (mask !== 0 && popcount(mask) <= n) lines.push({ idx, mask });
        });
        for (const combo of combinations(lines, n)) {
          let union = 0;
          for (const l of combo) union |= l.mask;
          if (popcount(union) !== n) continue;
          const used = new Set(combo.map((l) => l.idx));
          for (let pos = 0; pos < 9; pos++) {
            if (!(union & (1 << pos))) continue;
            for (const i of covers[pos] ?? []) {
              const baseIdx = bases === ROWS ? rowOf(i) : colOf(i);
              if (!used.has(baseIdx)) s.eliminate(i, b, out);
            }
          }
          if (out.length) return elim(technique, out);
        }
      }
    }
    return null;
  };
}

const xyWing: Finder = (s) => {
  const out: Placement[] = [];
  for (let pivot = 0; pivot < CELLS; pivot++) {
    const pm = s.c(pivot);
    if (!s.empty(pivot) || popcount(pm) !== 2) continue;
    const bivalue = (PEERS[pivot] ?? []).filter((p) => s.empty(p) && popcount(s.c(p)) === 2);
    for (const [p1, p2] of combinations(bivalue, 2) as [number, number][]) {
      const m1 = s.c(p1);
      const m2 = s.c(p2);
      // Pincers must each share exactly one digit with the pivot and share a common third digit.
      if (popcount(pm & m1) !== 1 || popcount(pm & m2) !== 1) continue;
      if ((pm & m1) === (pm & m2)) continue;
      const z = (m1 & ~pm) & (m2 & ~pm);
      if (popcount(z) !== 1 || popcount(m1 | m2 | pm) !== 3) continue;
      const seen = new Set(PEERS[p1] ?? []);
      for (const i of PEERS[p2] ?? []) {
        if (seen.has(i) && i !== pivot) s.eliminate(i, z, out);
      }
      if (out.length) return elim(Technique.XYWing, out);
    }
  }
  return null;
};

/** Finders in ascending technique order. */
const FINDERS: readonly [Technique, Finder][] = [
  [Technique.NakedSingle, nakedSingle],
  [Technique.HiddenSingle, hiddenSingle],
  [Technique.LockedCandidates, lockedCandidates],
  [Technique.NakedPair, nakedSubset(Technique.NakedPair, 2)],
  [Technique.HiddenPair, hiddenSubset(Technique.HiddenPair, 2)],
  [Technique.NakedTriple, nakedSubset(Technique.NakedTriple, 3)],
  [Technique.HiddenTriple, hiddenSubset(Technique.HiddenTriple, 3)],
  [Technique.NakedQuad, nakedSubset(Technique.NakedQuad, 4)],
  [Technique.HiddenQuad, hiddenSubset(Technique.HiddenQuad, 4)],
  [Technique.XWing, fish(Technique.XWing, 2)],
  [Technique.Swordfish, fish(Technique.Swordfish, 3)],
  [Technique.XYWing, xyWing],
];

/**
 * Solve with human techniques only. At every point the easiest applicable
 * technique is applied (one step at a time), so the result is deterministic
 * and `hardest` is the hardest technique that was actually needed.
 */
export function analyze(board: Board): Analysis {
  if (findConflicts(board).length > 0) throw new Error('Cannot analyse a board with conflicts');
  const s = new State(board);
  const steps: Step[] = [];
  let hardest: Technique | null = null;
  while (!s.done && !s.contradiction) {
    let step: Step | null = null;
    for (const [, find] of FINDERS) {
      step = find(s);
      if (step) break;
    }
    if (!step) break;
    steps.push(step);
    if (hardest === null || step.technique > hardest) hardest = step.technique;
  }
  const solved = s.done && findConflicts(s.cells).length === 0;
  return { solved, requiresGuessing: !solved, steps, hardest, board: s.cells };
}
