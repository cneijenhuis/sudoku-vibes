import { describe, expect, it } from 'vitest';
import { Difficulty } from '../engine/grading';
import { LEVELS, nextDifficulty } from './levels';

describe('nextDifficulty', () => {
  it('steps through every level in order', () => {
    const order = [
      Difficulty.SuperEasy,
      Difficulty.Easy,
      Difficulty.Gentle,
      Difficulty.Medium,
      Difficulty.Tricky,
      Difficulty.Hard,
      Difficulty.Tough,
      Difficulty.Extreme,
      Difficulty.Impossible,
    ];
    order.slice(0, -1).forEach((d, i) => expect(nextDifficulty(d)).toBe(order[i + 1]));
  });

  it('crosses from Extreme to Impossible and stops there', () => {
    expect(nextDifficulty(Difficulty.Extreme)).toBe(Difficulty.Impossible);
    expect(nextDifficulty(Difficulty.Impossible)).toBeNull();
  });

  it('is consistent with LEVELS order', () => {
    expect(LEVELS).toHaveLength(9);
    expect(LEVELS.map((l) => l.label)).toEqual(['Super Easy', 'Easy', 'Gentle', 'Medium', 'Tricky', 'Hard', 'Tough', 'Extreme', 'Impossible']);
    LEVELS.forEach((level, i) => {
      expect(nextDifficulty(level.difficulty)).toBe(LEVELS[i + 1]?.difficulty ?? null);
    });
  });
});
