// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { LEVELS } from './ui/levels';

describe('start menu levels', () => {
  it('lists the five difficulties in spec order', () => {
    expect(LEVELS.map((l) => l.label)).toEqual(['Easy', 'Medium', 'Hard', 'Extreme', 'Almost Impossible']);
    expect(LEVELS.map((l) => l.difficulty)).toEqual([0, 1, 2, 3, 4]);
  });
});
