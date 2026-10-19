import { Difficulty, DIFFICULTY_LABELS } from '../engine/grading';

export interface Level {
  difficulty: Difficulty;
  label: string;
  hint: string;
}

const HINTS: Record<Difficulty, string> = {
  [Difficulty.SuperEasy]: 'Gentle first steps',
  [Difficulty.Easy]: 'Relaxed and friendly',
  [Difficulty.Medium]: 'A steady workout',
  [Difficulty.Hard]: 'Needs real technique',
  [Difficulty.Extreme]: 'For seasoned solvers',
  [Difficulty.AlmostImpossible]: 'Only for the fearless',
};

/** The menu's choices, in display order (Super Easy to Almost Impossible). */
export const LEVELS: readonly Level[] = [
  Difficulty.SuperEasy,
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
  Difficulty.Extreme,
  Difficulty.AlmostImpossible,
].map((difficulty) => ({ difficulty, label: DIFFICULTY_LABELS[difficulty], hint: HINTS[difficulty] }));
