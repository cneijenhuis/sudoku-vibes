import { CELLS, serialize, type Board } from '../engine/board';
import { analyze } from '../engine/techniques';
import { DIFFICULTY_LABELS, Difficulty, OPEN_MOVES_MAX_LEVEL, rate, scoreBand } from '../engine/grading';
import { randomFullGrid } from './grid';
import { mulberry32, randomSeed, shuffle, type Random } from './random';

export const DEFAULT_BUDGET_MS = 8000;

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
  score: number;
}

/**
 * Remove givens one at a time, in random order, from a full grid. A removal is kept only while the
 * technique solver limited to `target`'s techniques still finishes the puzzle and neither the
 * techniques it needs nor its score reach above `target`; that also proves the solution unique.
 * (The open-moves tier is left out of this test: it is highest for nearly full grids and falls as
 * givens go.) Digging stops once the puzzle grades as `target` with a score of at least `goal`, so
 * puzzles land at a random point of the level's score band instead of at its hard edge. `expired`
 * cuts digging short (the state so far is valid).
 */
function dig(solution: Board, target: Difficulty, goal: number, rng: Random, expired: () => boolean): Candidate {
  const puzzle = Uint8Array.from(solution);
  // Open moves can only raise a level up to Gentle, so above it the (costlier) count is not needed.
  const trackOpenMoves = target < OPEN_MOVES_MAX_LEVEL;
  let difficulty: Difficulty = Difficulty.SuperEasy;
  let score = 0;
  for (const cell of shuffle(Array.from({ length: CELLS }, (_, i) => i), rng)) {
    if (expired()) break;
    const digit = puzzle[cell] ?? 0;
    puzzle[cell] = 0;
    const analysis = analyze(puzzle, target, trackOpenMoves);
    const rating = rate(analysis);
    if (!analysis.solved || rating.tiers.technique > target || rating.tiers.score > target) {
      puzzle[cell] = digit;
      continue;
    }
    difficulty = rating.difficulty;
    score = rating.score;
    if (difficulty === target && score >= goal) break;
  }
  // The dig's own rating can miss the open-moves tier; the reported level never does.
  if (!trackOpenMoves) {
    const full = rate(analyze(puzzle));
    difficulty = full.difficulty;
    score = full.score;
  }
  return { puzzle, solution, difficulty, score };
}

/**
 * Generate a uniquely solvable puzzle for `target` that the technique solver can finish with the
 * techniques up to that level (it never needs a guess). Retries with fresh grids until one grades
 * exactly as requested or the time budget runs out, in which case the closest puzzle found (the
 * nearest level, easier on a tie) is returned with `exact: false`. At least one attempt always completes,
 * so a puzzle is always returned.
 *
 * Loop exits: (1) a candidate grades exactly as `target` (returned with `exact: true`); (2) the
 * clock reaches the deadline after a candidate was graded (best candidate returned, `exact: false`).
 * With a clock that never advances only exit 1 applies, so the target must be reachable; with
 * `budgetMs <= 0` exactly one candidate is produced.
 */
export function generatePuzzle(target: Difficulty, options: GenerateOptions = {}): GeneratedPuzzle {
  if (!(target in DIFFICULTY_LABELS)) throw new RangeError(`Unknown difficulty: ${String(target)}`);
  const rng = options.rng ?? mulberry32(options.seed ?? randomSeed());
  const now = options.now ?? (() => Date.now());
  const deadline = now() + (options.budgetMs ?? DEFAULT_BUDGET_MS);
  const expired = () => now() >= deadline;
  const { lo, hi } = scoreBand(target);

  let best: Candidate | null = null;
  for (;;) {
    const goal = lo + rng() * (hi - lo);
    // Once something is in hand, let the deadline cut digging short.
    const candidate = dig(randomFullGrid(rng), target, goal, rng, () => best !== null && expired());
    if (candidate.difficulty === target) return finish(candidate, true);
    if (best === null || closer(candidate, best, target)) best = candidate;
    if (expired()) return finish(best, false);
  }
}

/** Nearer the target level wins; on a tie the easier puzzle, then the higher score. */
function closer(a: Candidate, b: Candidate, target: Difficulty): boolean {
  const da = Math.abs(a.difficulty - target);
  const db = Math.abs(b.difficulty - target);
  if (da !== db) return da < db;
  if (a.difficulty !== b.difficulty) return a.difficulty < b.difficulty;
  return a.score > b.score;
}

function finish(c: Candidate, exact: boolean): GeneratedPuzzle {
  return {
    puzzle: serialize(c.puzzle),
    solution: serialize(c.solution),
    difficulty: c.difficulty,
    exact,
  };
}
