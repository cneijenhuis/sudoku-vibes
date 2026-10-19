import { findConflicts, CELLS, type Board } from './board';
import { countSolutions } from './solver';
import { analyze, Technique, type Analysis } from './techniques';

/** The five ordered difficulty levels. */
export enum Difficulty {
  Easy,
  Medium,
  Hard,
  Extreme,
  AlmostImpossible,
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.Easy]: 'Easy',
  [Difficulty.Medium]: 'Medium',
  [Difficulty.Hard]: 'Hard',
  [Difficulty.Extreme]: 'Extreme',
  [Difficulty.AlmostImpossible]: 'Almost Impossible',
};

/**
 * Grading thresholds: the single place to tune difficulty.
 * Each technique maps to the minimum difficulty of a puzzle that needs it.
 */
export const TECHNIQUE_DIFFICULTY: Record<Technique, Difficulty> = {
  [Technique.NakedSingle]: Difficulty.Easy,
  [Technique.HiddenSingle]: Difficulty.Easy,
  [Technique.LockedCandidates]: Difficulty.Medium,
  [Technique.NakedPair]: Difficulty.Medium,
  [Technique.HiddenPair]: Difficulty.Medium,
  [Technique.NakedTriple]: Difficulty.Hard,
  [Technique.HiddenTriple]: Difficulty.Hard,
  [Technique.NakedQuad]: Difficulty.Hard,
  [Technique.HiddenQuad]: Difficulty.Hard,
  [Technique.XWing]: Difficulty.Hard,
  [Technique.Swordfish]: Difficulty.Extreme,
  [Technique.XYWing]: Difficulty.Extreme,
};

/**
 * A puzzle that the technique solver finishes at Extreme level but which has
 * at most this many givens is promoted to Almost Impossible (fewest-clues rule).
 */
export const ALMOST_IMPOSSIBLE_MAX_CLUES = 22;

export function countClues(board: Board): number {
  let n = 0;
  for (let i = 0; i < CELLS; i++) if ((board[i] ?? 0) !== 0) n++;
  return n;
}

/** Difficulty implied by an analysis (and the puzzle's clue count). */
export function difficultyOf(analysis: Analysis, clues: number): Difficulty {
  if (!analysis.solved) return Difficulty.AlmostImpossible;
  const level = analysis.hardest === null ? Difficulty.Easy : TECHNIQUE_DIFFICULTY[analysis.hardest];
  if (level >= Difficulty.Extreme && clues <= ALMOST_IMPOSSIBLE_MAX_CLUES) return Difficulty.AlmostImpossible;
  return level;
}

/**
 * Grade a uniquely solvable puzzle. Throws if the board has conflicts or
 * does not have exactly one solution.
 */
export function grade(board: Board): Difficulty {
  if (findConflicts(board).length > 0 || countSolutions(board, 2) !== 1) {
    throw new Error('Only puzzles with exactly one solution can be graded');
  }
  return difficultyOf(analyze(board), countClues(board));
}
