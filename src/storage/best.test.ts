import { describe, expect, it } from 'vitest';
import { Difficulty } from '../engine/grading';
import { BEST_KEY, createBests, parseBest } from './best';
import { createKeyValue, type StorageLike } from './kv';
import { MAX_ELAPSED_MS } from './save';

function fakeStorage(fail = false): { data: Map<string, string>; storage: StorageLike } {
  const data = new Map<string, string>();
  const boom = (): never => {
    throw new Error('blocked');
  };
  return {
    data,
    storage: {
      getItem: (k) => (fail ? boom() : (data.get(k) ?? null)),
      setItem: (k, v) => (fail ? boom() : void data.set(k, v)),
      removeItem: (k) => (fail ? boom() : void data.delete(k)),
    },
  };
}

const stored = (ms: unknown[]) => JSON.stringify({ v: 1, ms });
const empty = Array<number | null>(9).fill(null);
const withBest = (level: number, ms: unknown) => empty.map((x, i) => (i === level ? ms : x));
const MIN = 60_000;

describe('best times', () => {
  const setup = (initial?: string) => {
    const { data, storage } = fakeStorage();
    if (initial !== undefined) data.set(BEST_KEY, initial);
    return { data, bests: createBests(createKeyValue(() => storage)) };
  };

  it('starts empty', () => {
    expect(setup().bests.load()).toEqual(empty);
  });

  it('records the first flawless game', () => {
    const { bests, data } = setup();
    expect(bests.record(Difficulty.Medium, 7 * MIN, 0)).toBe(true);
    expect(bests.load()).toEqual(withBest(Difficulty.Medium, 7 * MIN));
    expect(JSON.parse(data.get(BEST_KEY)!)).toEqual({ v: 1, ms: withBest(Difficulty.Medium, 7 * MIN) });
  });

  it('flawless and faster: replaces the best time', () => {
    const { bests } = setup(stored(withBest(Difficulty.Medium, 7 * MIN + 12_000)));
    expect(bests.record(Difficulty.Medium, 6 * MIN + 10_000, 0)).toBe(true);
    expect(bests.load()[Difficulty.Medium]).toBe(6 * MIN + 10_000);
  });

  it('flawless but slower or equal: keeps the best time', () => {
    const { bests } = setup(stored(withBest(Difficulty.Medium, 7 * MIN + 12_000)));
    expect(bests.record(Difficulty.Medium, 8 * MIN, 0)).toBe(false);
    expect(bests.record(Difficulty.Medium, 7 * MIN + 12_000, 0)).toBe(false);
    expect(bests.load()[Difficulty.Medium]).toBe(7 * MIN + 12_000);
  });

  it('any mistake changes nothing, even when faster or when there is no best yet', () => {
    const { bests } = setup(stored(withBest(Difficulty.Medium, 7 * MIN)));
    expect(bests.record(Difficulty.Medium, 5 * MIN, 1)).toBe(false);
    expect(bests.record(Difficulty.Easy, 1 * MIN, 3)).toBe(false);
    expect(bests.load()).toEqual(withBest(Difficulty.Medium, 7 * MIN));
    const fresh = setup();
    expect(fresh.bests.record(Difficulty.Easy, MIN, 1)).toBe(false);
    expect(fresh.data.has(BEST_KEY)).toBe(false);
  });

  it('keeps levels apart', () => {
    const { bests } = setup();
    bests.record(Difficulty.SuperEasy, MIN, 0);
    bests.record(Difficulty.Impossible, 30 * MIN, 0);
    expect(bests.load()).toEqual(empty.map((_, i) => (i === 0 ? MIN : i === 8 ? 30 * MIN : null)));
  });

  it('ignores garbage and removes it', () => {
    const bad = [
      '',
      '{nope',
      'null',
      '[]',
      '42',
      stored(empty.slice(1)), // too short
      stored([...empty, null]), // too long
      JSON.stringify({ v: 2, ms: empty }),
      JSON.stringify({ ms: empty }),
      JSON.stringify({ v: 1 }),
      stored(withBest(0, 0)),
      stored(withBest(0, -5)),
      stored(withBest(0, MAX_ELAPSED_MS + 1)),
      stored(withBest(0, '5')),
      ' '.repeat(5000),
    ];
    for (const raw of bad) {
      const { bests, data } = setup(raw);
      expect(bests.load(), raw.slice(0, 40)).toEqual(empty);
      expect(data.has(BEST_KEY), raw.slice(0, 40)).toBe(false);
      // a new flawless game can still be recorded afterwards
      expect(bests.record(Difficulty.Easy, MIN, 0)).toBe(true);
    }
  });

  it('parseBest accepts exactly the stored shape', () => {
    expect(parseBest(stored(empty))).toEqual(empty);
    expect(parseBest(stored(withBest(4, 123_456)))).toEqual(withBest(4, 123_456));
    expect(parseBest(null)).toBeNull();
  });

  it('survives storage that throws or is missing', () => {
    const { storage } = fakeStorage(true);
    const blocked = createBests(createKeyValue(() => storage));
    expect(blocked.load()).toEqual(empty);
    expect(() => blocked.record(Difficulty.Easy, MIN, 0)).not.toThrow();
    for (const get of [
      () => {
        throw new Error('SecurityError');
      },
      () => null,
    ]) {
      const bests = createBests(createKeyValue(get));
      expect(bests.load()).toEqual(empty);
      expect(() => bests.record(Difficulty.Easy, MIN, 0)).not.toThrow();
    }
  });

  it('rejects bogus input to record', () => {
    const { bests } = setup();
    for (const [level, ms] of [[9, MIN], [-1, MIN], [1.5, MIN], [0, 0], [0, NaN], [0, Infinity], [0, -1]] as const) {
      expect(bests.record(level as Difficulty, ms, 0)).toBe(false);
    }
    expect(bests.load()).toEqual(empty);
  });
});
