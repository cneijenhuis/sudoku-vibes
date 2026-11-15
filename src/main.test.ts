// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Difficulty } from './engine/grading';
import { LEVELS } from './ui/levels';

describe('start menu levels', () => {
  it('lists the nine difficulties in spec order', () => {
    expect(LEVELS.map((l) => l.label)).toEqual(['Super Easy', 'Easy', 'Gentle', 'Medium', 'Tricky', 'Hard', 'Tough', 'Extreme', 'Impossible']);
    expect(LEVELS.map((l) => l.difficulty)).toEqual([
      Difficulty.SuperEasy,
      Difficulty.Easy,
      Difficulty.Gentle,
      Difficulty.Medium,
      Difficulty.Tricky,
      Difficulty.Hard,
      Difficulty.Tough,
      Difficulty.Extreme,
      Difficulty.Impossible,
    ]);
  });
});
