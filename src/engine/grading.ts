import { findConflicts, CELLS, type Board } from './board';
import { countSolutions } from './solver';
import { analyze, Technique, TECHNIQUE_LEVEL, type Analysis, type Step } from './techniques';

/** The nine ordered difficulty levels (values 0 to 8, shown to the player as 1 to 9). */
export enum Difficulty {
  SuperEasy,
  Easy,
  Gentle,
  Medium,
  Tricky,
  Hard,
  Tough,
  Extreme,
  Impossible,
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.SuperEasy]: 'Super Easy',
  [Difficulty.Easy]: 'Easy',
  [Difficulty.Gentle]: 'Gentle',
  [Difficulty.Medium]: 'Medium',
  [Difficulty.Tricky]: 'Tricky',
  [Difficulty.Hard]: 'Hard',
  [Difficulty.Tough]: 'Tough',
  [Difficulty.Extreme]: 'Extreme',
  [Difficulty.Impossible]: 'Impossible',
};

/** Each technique mapped to the lowest level of a puzzle that needs it. */
export const TECHNIQUE_DIFFICULTY: Record<Technique, Difficulty> = TECHNIQUE_LEVEL as Record<Technique, Difficulty>;

/**
 * Solving cost of a technique step: `first` the first time the technique is used in a solve,
 * `later` every time after. Sudoku of the Day's published costs; XY-Wing and Skyscraper use its
 * forcing-chain costs and XYZ-Wing sits between them and the quad (see design.md of nine-levels).
 */
export const TECHNIQUE_COST: Record<Technique, { first: number; later: number }> = {
  [Technique.HiddenSingle]: { first: 100, later: 100 },
  [Technique.NakedSingle]: { first: 100, later: 100 },
  [Technique.LockedCandidates]: { first: 350, later: 200 },
  [Technique.NakedPair]: { first: 750, later: 500 },
  [Technique.HiddenPair]: { first: 1500, later: 1200 },
  [Technique.NakedTriple]: { first: 2000, later: 1400 },
  [Technique.HiddenTriple]: { first: 2400, later: 1600 },
  [Technique.XWing]: { first: 2800, later: 1600 },
  [Technique.NakedQuad]: { first: 5000, later: 4000 },
  [Technique.HiddenQuad]: { first: 7000, later: 5000 },
  [Technique.Swordfish]: { first: 8000, later: 6000 },
  [Technique.XYWing]: { first: 4200, later: 2100 },
  [Technique.Skyscraper]: { first: 4200, later: 2100 },
  [Technique.XYZWing]: { first: 5000, later: 2500 },
};

/**
 * Score tiers: a puzzle whose score reaches the n-th threshold is at least level n + 1.
 * One of the two places to tune difficulty (the other is `OPEN_MOVES_THRESHOLDS`).
 */
export const SCORE_THRESHOLDS: readonly number[] = [4000, 4500, 5100, 5600, 6500, 8000, 10000, 13000];

/** The highest level the open-moves tier alone can imply. */
export const OPEN_MOVES_MAX_LEVEL = Difficulty.Gentle;

/** Mean open moves at or above which a puzzle may be Super Easy / Easy; below the second it is at least Gentle. */
export const OPEN_MOVES_THRESHOLDS = { superEasy: 8, easy: 5 } as const;

export function countClues(board: Board): number {
  let n = 0;
  for (let i = 0; i < CELLS; i++) if ((board[i] ?? 0) !== 0) n++;
  return n;
}

/** Sum of the step costs of a solve, a technique's first use costing more than later ones. */
export function scoreOf(steps: readonly Step[]): number {
  const used = new Set<Technique>();
  let score = 0;
  for (const { technique } of steps) {
    const cost = TECHNIQUE_COST[technique];
    score += used.has(technique) ? cost.later : cost.first;
    used.add(technique);
  }
  return score;
}

/** Mean open moves over the recorded placements; a solve without placements counts as wide open. */
export function meanOpenMoves(openMoves: readonly number[]): number {
  if (openMoves.length === 0) return Infinity;
  return openMoves.reduce((a, b) => a + b, 0) / openMoves.length;
}

/** The level (0 to 8) a score alone implies. */
export function scoreTier(score: number): Difficulty {
  return SCORE_THRESHOLDS.filter((t) => score >= t).length;
}

/** The level a mean open-moves count alone implies: Super Easy, Easy or Gentle. */
export function openMovesTier(mean: number): Difficulty {
  if (mean >= OPEN_MOVES_THRESHOLDS.superEasy) return Difficulty.SuperEasy;
  if (mean >= OPEN_MOVES_THRESHOLDS.easy) return Difficulty.Easy;
  return Difficulty.Gentle;
}

/** Where the score band of the lowest level starts and where that of the highest level ends (the generator's aim). */
const LOWEST_BAND_START = 3600;
const HIGHEST_BAND_END = 20000;

/** The score range `[lo, hi)` the generator aims into for `level`: between the thresholds around it. */
export function scoreBand(level: Difficulty): { lo: number; hi: number } {
  return {
    lo: level === Difficulty.SuperEasy ? LOWEST_BAND_START : (SCORE_THRESHOLDS[level - 1] as number),
    hi: SCORE_THRESHOLDS[level] ?? HIGHEST_BAND_END,
  };
}

export interface Rating {
  difficulty: Difficulty;
  score: number;
  /** Mean open moves (Infinity when nothing was placed). */
  openMoves: number;
  solved: boolean;
  /** The three tiers the level is the highest of. */
  tiers: { technique: Difficulty; score: Difficulty; openMoves: Difficulty };
}

/** Level of an analysis: the highest of the technique, score and open-moves tiers; unsolved is Impossible. */
export function rate(analysis: Analysis): Rating {
  const score = scoreOf(analysis.steps);
  const openMoves = meanOpenMoves(analysis.openMoves);
  const tiers = {
    technique: analysis.hardest === null ? Difficulty.SuperEasy : TECHNIQUE_DIFFICULTY[analysis.hardest],
    score: scoreTier(score),
    openMoves: openMovesTier(openMoves),
  };
  if (!analysis.solved) return { difficulty: Difficulty.Impossible, score, openMoves, solved: false, tiers };
  const difficulty = Math.max(tiers.technique, tiers.score, tiers.openMoves) as Difficulty;
  return { difficulty, score, openMoves, solved: true, tiers };
}

/** Difficulty implied by an analysis. */
export function difficultyOf(analysis: Analysis): Difficulty {
  return rate(analysis).difficulty;
}

/**
 * Grade a uniquely solvable puzzle. Throws if the board has conflicts or
 * does not have exactly one solution.
 */
export function grade(board: Board): Difficulty {
  if (findConflicts(board).length > 0 || countSolutions(board, 2) !== 1) {
    throw new Error('Only puzzles with exactly one solution can be graded');
  }
  return difficultyOf(analyze(board));
}
