import { describe, expect, it } from 'vitest';
import * as engine from './index';

describe('public API', () => {
  it('exports the documented surface', () => {
    for (const name of ['parse', 'serialize', 'findConflicts', 'solve', 'countSolutions', 'analyze', 'grade']) {
      expect(typeof (engine as Record<string, unknown>)[name]).toBe('function');
    }
    expect(engine.Difficulty.AlmostImpossible).toBeGreaterThan(engine.Difficulty.Extreme);
  });

  it('works end to end through the index', () => {
    const p = engine.parse('530070000600195000098000060800060003400803001700020006060000280000419005000080079');
    expect(engine.countSolutions(p)).toBe(1);
    expect(engine.grade(p)).toBe(engine.Difficulty.Easy);
  });
});
