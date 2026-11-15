import { Difficulty, DIFFICULTY_LABELS } from '../engine/grading';

export interface Level {
  difficulty: Difficulty;
  label: string;
}

/** The menu's choices, in display order (Super Easy to Impossible). */
export const LEVELS: readonly Level[] = (Object.values(Difficulty).filter((v) => typeof v === 'number') as Difficulty[]).map(
  (difficulty) => ({ difficulty, label: DIFFICULTY_LABELS[difficulty] }),
);

/** The level one step harder than `d`, or `null` after the hardest level. */
export function nextDifficulty(d: Difficulty): Difficulty | null {
  const i = LEVELS.findIndex((l) => l.difficulty === d);
  if (i < 0) return null;
  return LEVELS[i + 1]?.difficulty ?? null;
}
