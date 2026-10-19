import { CELLS, serialize, type Board } from '../engine/board';
import { countSolutions } from '../engine/solver';
import { analyze } from '../engine/techniques';
import { DIFFICULTY_LABELS, Difficulty, SUPER_EASY_GIVENS, countClues, difficultyOf } from '../engine/grading';
import { randomFullGrid } from './grid';
import { mulberry32, randomSeed, shuffle, type Random } from './random';

export const DEFAULT_BUDGET_MS = 8000;

/** Restore orders tried per minimal puzzle before digging a fresh grid. */
const RESTORES_PER_DIG = 4;

export interface GenerateOptions {
  /** 32-bit seed; the same seed and level reproduce the same puzzle (ignored if `rng` is given). */
  seed?: number;
  /** Random source override; defaults to mulberry32(seed). */
  rng?: Random;
  /** Time budget in milliseconds (default 8000). */
  budgetMs?: number;
  /** Clock override for tests (milliseconds). */
  now?: () => number;
}

export interface GeneratedPuzzle {
  /** 81 chars, '0' = empty. */
  puzzle: string;
  /** 81 chars, complete solution. */
  solution: string;
  /** What the engine actually grades the puzzle as. */
  difficulty: Difficulty;
  /** False when the budget ran out and this is the closest puzzle found. */
  exact: boolean;
}

interface Candidate {
  puzzle: Board;
  solution: Board;
  difficulty: Difficulty;
}

/**
 * Minimum number of givens per level (Almost Impossible has none). Super Easy is also
 * the exact number: it digs down to this floor and never restores.
 */
export const MIN_GIVENS: Record<Difficulty, number> = {
  [Difficulty.SuperEasy]: SUPER_EASY_GIVENS,
  [Difficulty.Easy]: 36,
  [Difficulty.Medium]: 32,
  [Difficulty.Hard]: 28,
  [Difficulty.Extreme]: 25,
  [Difficulty.AlmostImpossible]: 0,
};

/**
 * Remove givens in random order while the solution stays unique, stopping at `floor`
 * givens. With floor 0 this gives a minimal puzzle.
 */
function dig(solution: Board, floor: number, rng: Random, expired: () => boolean): Board {
  const puzzle = Uint8Array.from(solution);
  let clues = CELLS;
  for (const cell of shuffle(Array.from({ length: CELLS }, (_, i) => i), rng)) {
    if (expired() || clues <= floor) break;
    const digit = puzzle[cell] ?? 0;
    puzzle[cell] = 0;
    if (countSolutions(puzzle, 2) !== 1) puzzle[cell] = digit;
    else clues--;
  }
  return puzzle;
}

/**
 * Put givens of `solution` back into `minimal` in random order until the technique
 * solver finishes within `target`. The first such state is returned, so it grades
 * at the target whenever it needs a target-level technique. Adding givens keeps
 * the solution unique. Restoring stops at `maxClues` givens (the puzzle is then left
 * unsolved by `target`-level techniques and the caller rejects it).
 */
function restore(minimal: Board, solution: Board, target: Difficulty, rng: Random, maxClues: number): Board {
  const puzzle = Uint8Array.from(minimal);
  const empty = shuffle(
    Array.from({ length: CELLS }, (_, i) => i).filter((i) => puzzle[i] === 0),
    rng,
  );
  for (const cell of empty) {
    if (countClues(puzzle) >= maxClues) break;
    const a = analyze(puzzle);
    if (a.solved && difficultyOf(a, countClues(puzzle)) <= target) break;
    puzzle[cell] = solution[cell] ?? 0;
  }
  return puzzle;
}

function gradeUnique(puzzle: Board): Difficulty {
  return difficultyOf(analyze(puzzle), countClues(puzzle));
}

/**
 * Generate a uniquely solvable puzzle for `target`. Retries with fresh grids until
 * one grades exactly as requested or the time budget runs out, in which case the
 * closest-graded puzzle found is returned with `exact: false`. At least one
 * attempt always completes, so a puzzle is always returned.
 *
 * Loop exits: (1) a candidate grades exactly as `target` (returned with `exact: true`);
 * (2) the clock reaches the deadline after a candidate was graded (best candidate returned,
 * `exact: false`). With a clock that never advances only exit 1 applies, so the target must
 * be reachable; with `budgetMs <= 0` exactly one candidate is produced.
 */
export function generatePuzzle(target: Difficulty, options: GenerateOptions = {}): GeneratedPuzzle {
  if (!(target in DIFFICULTY_LABELS)) throw new RangeError(`Unknown difficulty: ${String(target)}`);
  const rng = options.rng ?? mulberry32(options.seed ?? randomSeed());
  const now = options.now ?? (() => Date.now());
  const deadline = now() + (options.budgetMs ?? DEFAULT_BUDGET_MS);
  const expired = () => now() >= deadline;

  let best: Candidate | null = null;
  const dist = (c: Candidate) => Math.abs(c.difficulty - target);

  for (;;) {
    const solution = randomFullGrid(rng);
    // Once something is in hand, let the deadline cut digging short.
    const minimal = dig(solution, MIN_GIVENS[target], rng, () => best !== null && expired());
    // Super Easy and Almost Impossible keep the dug puzzle (exactly 44 givens / minimal);
    // other levels try several restore orders, which is much cheaper than digging a fresh
    // grid. Easy never restores up to 44 givens, as that would regrade as Super Easy.
    const keep = target === Difficulty.AlmostImpossible || target === Difficulty.SuperEasy;
    const maxClues = target === Difficulty.Easy ? SUPER_EASY_GIVENS - 1 : CELLS;
    const tries = keep ? 1 : RESTORES_PER_DIG;
    for (let k = 0; k < tries; k++) {
      const puzzle = keep ? minimal : restore(minimal, solution, target, rng, maxClues);
      const candidate: Candidate = { puzzle, solution, difficulty: gradeUnique(puzzle) };
      if (candidate.difficulty === target) return finish(candidate, true);
      if (best === null || dist(candidate) < dist(best)) best = candidate;
      if (expired()) return finish(best, false);
    }
  }
}

function finish(c: Candidate, exact: boolean): GeneratedPuzzle {
  return {
    puzzle: serialize(c.puzzle),
    solution: serialize(c.solution),
    difficulty: c.difficulty,
    exact,
  };
}
