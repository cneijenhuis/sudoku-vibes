import { describe, expect, it } from 'vitest';
import { mulberry32, randInt, randomSeed, shuffle } from './random';

const take = (seed: number, n: number): number[] => {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => r());
};

describe('mulberry32', () => {
  it('gives the same sequence for the same seed', () => {
    expect(take(42, 20)).toEqual(take(42, 20));
  });

  it('gives different sequences for different seeds', () => {
    expect(take(1, 20)).not.toEqual(take(2, 20));
  });

  it('stays within [0, 1)', () => {
    for (const x of take(7, 1000)) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('helpers', () => {
  it('randInt stays in range', () => {
    const r = mulberry32(3);
    for (let i = 0; i < 500; i++) {
      const v = randInt(r, 9);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(9);
    }
  });

  it('shuffle is a seeded permutation', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], mulberry32(5));
    const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], mulberry32(5));
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(a).not.toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('randomSeed returns a 32-bit unsigned integer', () => {
    const s = randomSeed();
    expect(Number.isInteger(s)).toBe(true);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThan(2 ** 32);
  });
});
