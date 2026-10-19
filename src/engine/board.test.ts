import { describe, expect, it } from 'vitest';
import { PEERS, UNITS, findConflicts, parse, serialize } from './board';

const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';

describe('parse / serialize', () => {
  it('round-trips and normalises "." to 0', () => {
    expect(serialize(parse(PUZZLE))).toBe(PUZZLE);
    expect(serialize(parse(PUZZLE.replaceAll('0', '.')))).toBe(PUZZLE);
  });

  it('rejects invalid input', () => {
    expect(() => parse('')).toThrow();
    expect(() => parse(PUZZLE.slice(1))).toThrow();
    expect(() => parse(PUZZLE + '0')).toThrow();
    expect(() => parse('x' + PUZZLE.slice(1))).toThrow();
    expect(() => parse(' ' + PUZZLE.slice(1))).toThrow();
  });
});

describe('tables', () => {
  it('has 27 units of 9 and 20 peers per cell', () => {
    expect(UNITS).toHaveLength(27);
    for (const u of UNITS) expect(new Set(u).size).toBe(9);
    for (const p of PEERS) expect(p).toHaveLength(20);
  });
});

describe('findConflicts', () => {
  it('is empty for a valid board', () => {
    expect(findConflicts(parse(PUZZLE))).toEqual([]);
  });

  it('flags both cells of a row duplicate', () => {
    const b = parse('0'.repeat(81));
    b[0] = 5;
    b[8] = 5;
    expect(findConflicts(b)).toEqual([0, 8]);
  });

  it('flags column duplicates', () => {
    const b = parse('0'.repeat(81));
    b[3] = 7;
    b[75] = 7;
    expect(findConflicts(b)).toEqual([3, 75]);
  });

  it('flags box duplicates', () => {
    const b = parse('0'.repeat(81));
    b[0] = 4;
    b[20] = 4; // row 2, col 2: same box, different row and column
    expect(findConflicts(b)).toEqual([0, 20]);
  });
});
