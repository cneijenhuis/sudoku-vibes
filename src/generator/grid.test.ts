import { describe, expect, it } from 'vitest';
import { findConflicts } from '../engine/board';
import { randomFullGrid } from './grid';
import { mulberry32 } from './random';

describe('randomFullGrid', () => {
  it('produces 50 seeded grids that are complete and conflict-free', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 50; seed++) {
      const g = randomFullGrid(mulberry32(seed));
      expect(g.every((v) => v >= 1 && v <= 9)).toBe(true);
      expect(findConflicts(g)).toEqual([]);
      seen.add(g.join(''));
    }
    expect(seen.size).toBe(50);
  });
});
