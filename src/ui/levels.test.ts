import { describe, expect, it } from 'vitest';
import { Difficulty } from '../engine/grading';
import { LEVELS, nextDifficulty } from './levels';

describe('nextDifficulty', () => {
  it('steps through every level in order', () => {
    expect(nextDifficulty(Difficulty.SuperEasy)).toBe(Difficulty.Easy);
    expect(nextDifficulty(Difficulty.Easy)).toBe(Difficulty.Medium);
    expect(nextDifficulty(Difficulty.Medium)).toBe(Difficulty.Hard);
    expect(nextDifficulty(Difficulty.Hard)).toBe(Difficulty.Extreme);
    expect(nextDifficulty(Difficulty.Extreme)).toBe(Difficulty.AlmostImpossible);
  });

  it('returns null after Almost Impossible', () => {
    expect(nextDifficulty(Difficulty.AlmostImpossible)).toBeNull();
  });

  it('is consistent with LEVELS order', () => {
    LEVELS.forEach((level, i) => {
      expect(nextDifficulty(level.difficulty)).toBe(LEVELS[i + 1]?.difficulty ?? null);
    });
  });
});
