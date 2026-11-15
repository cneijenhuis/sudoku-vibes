import { BOXES, CELLS, COLS, PEERS, ROWS, UNITS, boxOf, colOf, findConflicts, rowOf, type Board } from './board';

/**
 * Human solving techniques, listed in the order they are tried: by level, then by cost inside
 * a level (hidden singles before naked singles, as people find them first). The numeric value is
 * the rank; lower ranks are always preferred.
 */
export enum Technique {
  HiddenSingle,
  NakedSingle,
  LockedCandidates,
  NakedPair,
  HiddenPair,
  NakedTriple,
  HiddenTriple,
  XWing,
  NakedQuad,
  HiddenQuad,
  Swordfish,
  XYWing,
  Skyscraper,
  XYZWing,
}

/**
 * The lowest level (0 = Super Easy ... 8 = Impossible, the values of `Difficulty`) of a puzzle that
 * needs the technique.
 */
export const TECHNIQUE_LEVEL: Record<Technique, number> = {
  [Technique.HiddenSingle]: 0,
  [Technique.NakedSingle]: 0,
  [Technique.LockedCandidates]: 3,
  [Technique.NakedPair]: 4,
  [Technique.HiddenPair]: 5,
  [Technique.NakedTriple]: 5,
  [Technique.HiddenTriple]: 5,
  [Technique.XWing]: 6,
  [Technique.NakedQuad]: 6,
  [Technique.HiddenQuad]: 6,
  [Technique.Swordfish]: 7,
  [Technique.XYWing]: 7,
  [Technique.Skyscraper]: 8,
  [Technique.XYZWing]: 8,
};

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
  /**
   * For each of the first `OPEN_MOVES_WINDOW` placements, the number of empty cells a single could
   * have filled just before it.
   */
  openMoves: number[];
}

/** Placements over which open moves are recorded (Pelanek's best window is 20 to 30 steps). */
export const OPEN_MOVES_WINDOW = 25;

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

/**
 * Digits that have exactly one place among the empty cells of `unit`, as a mask (the hidden singles),
 * computed with a once/twice pass over the candidates.
 */
function uniqueDigits(unit: readonly number[], cells: Uint8Array, cand: Uint16Array): number {
  let once = 0;
  let twice = 0;
  for (const i of unit) {
    if (cells[i] !== 0) continue;
    const m = cand[i] ?? 0;
    twice |= once & m;
    once |= m;
  }
  return once & ~twice;
}

/** Number of empty cells that a naked or hidden single could fill in the given state. */
function countOpenMoves(cells: Uint8Array, cand: Uint16Array): number {
  const open = new Uint8Array(CELLS);
  for (let i = 0; i < CELLS; i++) {
    const m = cand[i] ?? 0;
    if (cells[i] === 0 && m !== 0 && (m & (m - 1)) === 0) open[i] = 1;
  }
  for (const unit of UNITS) {
    const uniq = uniqueDigits(unit, cells, cand);
    if (uniq === 0) continue;
    for (const i of unit) if (cells[i] === 0 && (cand[i] ?? 0) & uniq) open[i] = 1;
  }
  let total = 0;
  for (let i = 0; i < CELLS; i++) total += open[i] ?? 0;
  return total;
}

/**
 * Like `combinations(items, k)` in the same order, but skips every combination whose `maskOf` union
 * has more than `k` bits (a prefix already over `k` cannot shrink back). Calls `visit` until it returns true.
 */
function eachSmallUnion<T>(items: readonly T[], k: number, maskOf: (item: T) => number, visit: (combo: T[], union: number) => boolean): boolean {
  const cur: T[] = [];
  const go = (start: number, union: number): boolean => {
    if (cur.length === k) return visit(cur, union);
    for (let i = start; i <= items.length - (k - cur.length); i++) {
      const u = union | maskOf(items[i] as T);
      if (popcount(u) > k) continue;
      cur.push(items[i] as T);
      const stop = go(i + 1, u);
      cur.pop();
      if (stop) return true;
    }
    return false;
  };
  return go(0, 0);
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
    const uniq = uniqueDigits(unit, s.cells, s.cand);
    if (uniq === 0) continue;
    const digit = digitOf(uniq & -uniq); // the lowest such digit
    const where = unit.find((i) => s.empty(i) && s.c(i) & bit(digit)) as number;
    s.place(where, digit);
    return { technique: Technique.HiddenSingle, placements: [{ cell: where, digit }], eliminations: [] };
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
      const found = eachSmallUnion(pool, k, (i) => s.c(i), (combo, union) => {
        if (popcount(union) !== k) return false;
        for (const i of unit) if (!combo.includes(i)) s.eliminate(i, union, out);
        return out.length > 0;
      });
      if (found) return elim(technique, out);
    }
    return null;
  };
}

function hiddenSubset(technique: Technique, k: number): Finder {
  return (s) => {
    const out: Placement[] = [];
    for (const unit of UNITS) {
      const where: { digit: number; mask: number }[] = []; // digits with at most k places, and those places (unit positions)
      for (let d = 1; d <= 9; d++) {
        let m = 0;
        unit.forEach((i, pos) => {
          if (s.empty(i) && s.c(i) & bit(d)) m |= 1 << pos;
        });
        if (m !== 0 && popcount(m) <= k) where.push({ digit: d, mask: m });
      }
      const found = eachSmallUnion(where, k, (w) => w.mask, (combo, union) => {
        if (popcount(union) !== k) return false;
        let digits = 0;
        for (const w of combo) digits |= bit(w.digit);
        unit.forEach((i, pos) => {
          if (union & (1 << pos)) s.eliminate(i, ALL & ~digits, out);
        });
        return out.length > 0;
      });
      if (found) return elim(technique, out);
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

/** Cells that see both `a` and `b`, other than `a` and `b` themselves. */
function seenByBoth(a: number, b: number): number[] {
  const pa = new Set(PEERS[a] ?? []);
  return (PEERS[b] ?? []).filter((i) => pa.has(i) && i !== a && i !== b);
}

/**
 * Skyscraper, in both row-based and column-based form: a digit that has exactly two places in each of
 * two lines, one place of each in the same cross line (the base). One of the two other places (the
 * roof ends) must hold the digit, so cells that see both ends cannot.
 */
const skyscraper: Finder = (s) => {
  const out: Placement[] = [];
  for (let d = 1; d <= 9; d++) {
    const b = bit(d);
    for (const lines of [ROWS, COLS]) {
      const pairs: { cells: [number, number]; pos: [number, number] }[] = [];
      for (const line of lines) {
        const at: number[] = [];
        const pos: number[] = [];
        line.forEach((i, p) => {
          if (s.empty(i) && s.c(i) & b) {
            at.push(i);
            pos.push(p);
          }
        });
        if (at.length === 2) pairs.push({ cells: at as [number, number], pos: pos as [number, number] });
      }
      for (const [p, q] of combinations(pairs, 2) as [(typeof pairs)[number], (typeof pairs)[number]][]) {
        const shared = p.pos.filter((x) => q.pos.includes(x));
        if (shared.length !== 1) continue; // none: no base; two: that is an X-Wing
        const base = shared[0] as number;
        const endP = p.cells[p.pos[0] === base ? 1 : 0];
        const endQ = q.cells[q.pos[0] === base ? 1 : 0];
        for (const i of seenByBoth(endP, endQ)) s.eliminate(i, b, out);
        if (out.length) return elim(Technique.Skyscraper, out);
      }
    }
  }
  return null;
};

/**
 * XYZ-Wing: a pivot with candidates {x, y, z} and two cells that see it with {x, z} and {y, z}. One
 * of the three holds z, so cells that see all three cannot.
 */
const xyzWing: Finder = (s) => {
  const out: Placement[] = [];
  for (let pivot = 0; pivot < CELLS; pivot++) {
    const pm = s.c(pivot);
    if (!s.empty(pivot) || popcount(pm) !== 3) continue;
    const wings = (PEERS[pivot] ?? []).filter((p) => s.empty(p) && popcount(s.c(p)) === 2 && (s.c(p) & ~pm) === 0);
    for (const [w1, w2] of combinations(wings, 2) as [number, number][]) {
      const m1 = s.c(w1);
      const m2 = s.c(w2);
      if ((m1 | m2) !== pm) continue; // together they must cover the pivot's three digits
      const z = m1 & m2;
      if (popcount(z) !== 1) continue;
      for (const i of seenByBoth(w1, w2)) {
        if (i !== pivot && (PEERS[pivot] ?? []).includes(i)) s.eliminate(i, z, out);
      }
      if (out.length) return elim(Technique.XYZWing, out);
    }
  }
  return null;
};

/** Finders in the order they are tried. */
const FINDERS: readonly [Technique, Finder][] = [
  [Technique.HiddenSingle, hiddenSingle],
  [Technique.NakedSingle, nakedSingle],
  [Technique.LockedCandidates, lockedCandidates],
  [Technique.NakedPair, nakedSubset(Technique.NakedPair, 2)],
  [Technique.HiddenPair, hiddenSubset(Technique.HiddenPair, 2)],
  [Technique.NakedTriple, nakedSubset(Technique.NakedTriple, 3)],
  [Technique.HiddenTriple, hiddenSubset(Technique.HiddenTriple, 3)],
  [Technique.XWing, fish(Technique.XWing, 2)],
  [Technique.NakedQuad, nakedSubset(Technique.NakedQuad, 4)],
  [Technique.HiddenQuad, hiddenSubset(Technique.HiddenQuad, 4)],
  [Technique.Swordfish, fish(Technique.Swordfish, 3)],
  [Technique.XYWing, xyWing],
  [Technique.Skyscraper, skyscraper],
  [Technique.XYZWing, xyzWing],
];

/**
 * Solve with human techniques only. At every point the easiest applicable
 * technique is applied (one step at a time), so the result is deterministic
 * and `hardest` is the hardest technique that was actually needed. Techniques
 * above `maxLevel` (0-8, the values of `Difficulty`) are not tried, so the solver
 * stalls where a puzzle needs one. `openMoves` stays empty when `trackOpenMoves` is false (cheaper).
 */
export function analyze(board: Board, maxLevel = 8, trackOpenMoves = true): Analysis {
  if (findConflicts(board).length > 0) throw new Error('Cannot analyse a board with conflicts');
  const s = new State(board);
  const steps: Step[] = [];
  const openMoves: number[] = [];
  const finders = FINDERS.filter(([t]) => TECHNIQUE_LEVEL[t] <= maxLevel);
  let hardest: Technique | null = null;
  while (!s.done && !s.contradiction) {
    // Only the first window of placements is wanted, counted in the state before the single is applied.
    const counting = trackOpenMoves && openMoves.length < OPEN_MOVES_WINDOW;
    const before = counting ? { cells: s.cells.slice(), cand: s.cand.slice() } : null;
    let step: Step | null = null;
    for (const [, find] of finders) {
      step = find(s);
      if (step) break;
    }
    if (!step) break;
    if (before && step.placements.length > 0) openMoves.push(countOpenMoves(before.cells, before.cand));
    steps.push(step);
    if (hardest === null || step.technique > hardest) hardest = step.technique;
  }
  const solved = s.done && findConflicts(s.cells).length === 0;
  return { solved, requiresGuessing: !solved, steps, hardest, board: s.cells, openMoves };
}
