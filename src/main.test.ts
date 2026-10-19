// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Difficulty } from './engine/grading';
import { LEVELS } from './ui/levels';

describe('start menu levels', () => {
  it('lists the six difficulties in spec order', () => {
    expect(LEVELS.map((l) => l.label)).toEqual(['Super Easy', 'Easy', 'Medium', 'Hard', 'Extreme', 'Almost Impossible']);
    expect(LEVELS.map((l) => l.difficulty)).toEqual([
      Difficulty.SuperEasy,
      Difficulty.Easy,
      Difficulty.Medium,
      Difficulty.Hard,
      Difficulty.Extreme,
      Difficulty.AlmostImpossible,
    ]);
  });
});
