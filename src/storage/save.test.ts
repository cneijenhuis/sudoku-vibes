import { describe, expect, it } from 'vitest';
import { Difficulty } from '../engine/grading';
import { createGame, enter, restoreGame, select, tapCell, undo, canUndo, type GameState } from '../game/state';
import { createKeyValue, type KeyValue, type StorageLike } from './kv';
import { SAVE_KEY, createSaves, restore, serialize } from './save';

const SOL = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
const EMPTY = [0, 1, 3, 4, 6, 10, 12, 19, 22, 27, 30, 33, 36, 40, 44, 50, 55, 60, 66, 72, 80];
const PUZ = [...SOL].map((c, i) => (EMPTY.includes(i) ? '0' : c)).join('');

const play = (state: GameState, cell: number, digit: number): GameState => enter(select(state, cell), digit);
const sol = (i: number): number => Number(SOL[i]);

/** A game with three correct entries and one wrong one (last). */
function sample(): GameState {
  let g = createGame(PUZ, SOL);
  g = play(g, 0, sol(0));
  g = play(g, 1, sol(1));
  g = play(g, 3, sol(3));
  g = play(g, 4, sol(4) === 9 ? 1 : 9); // wrong
  return g;
}

describe('serialize / restore', () => {
  it('round-trips cells, history and mistakes', () => {
    const g = sample();
    const saved = restore(serialize(g, Difficulty.Hard, 272_345, 1000));
    expect(saved).not.toBeNull();
    expect(saved).toMatchObject({ puzzle: PUZ, solution: SOL, difficulty: Difficulty.Hard, mistakes: 1, elapsedMs: 272_345, savedAt: 1000 });
    const r = restoreGame(saved!);
    expect(Array.from(r.cells)).toEqual(Array.from(g.cells));
    expect(r.history).toEqual(g.history);
    expect(r.mistakes).toBe(g.mistakes);
    expect(Array.from(r.givens)).toEqual(Array.from(g.givens));
    expect(r.mode).toBe('cell-first');
    expect(r.selected).toBeNull();
    expect(r.highlight).toBeNull();
  });

  it('keeps mistakes that were undone', () => {
    let g = sample();
    g = undo(g);
    expect(g.mistakes).toBe(1);
    const r = restoreGame(restore(serialize(g, Difficulty.Easy, 0))!);
    expect(r.mistakes).toBe(1);
    expect(r.history).toHaveLength(3);
  });

  it('supports undo after restore, entry by entry', () => {
    const r0 = restoreGame(restore(serialize(sample(), Difficulty.Medium, 5))!);
    let r = undo(r0);
    expect(r.cells[4]).toBe(0);
    expect(r.history).toHaveLength(3);
    expect(r.selected).toBe(4);
    r = undo(undo(undo(r)));
    expect(canUndo(r)).toBe(false);
    expect(Array.from(r.cells)).toEqual(Array.from(r.givens));
  });

  it('allows entering after restore', () => {
    const r = restoreGame(restore(serialize(play(createGame(PUZ, SOL), 0, sol(0)), Difficulty.Easy, 0))!);
    expect(tapCell(r, 1).selected).toBe(1);
    expect(enter(tapCell(r, 1), sol(1)).cells[1]).toBe(sol(1));
  });

  it('rounds elapsed time and never stores a negative one', () => {
    const g = createGame(PUZ, SOL);
    expect(JSON.parse(serialize(g, 0, 1234.6)).elapsedMs).toBe(1235);
    expect(JSON.parse(serialize(g, 0, -5)).elapsedMs).toBe(0);
  });
});

describe('restore rejects invalid saves', () => {
  const good = () => JSON.parse(serialize(sample(), Difficulty.Hard, 1000, 5)) as Record<string, unknown>;
  const withField = (k: string, v: unknown) => JSON.stringify({ ...good(), [k]: v });
  const oneWrong = (i: number) => (sol(i) === 1 ? 2 : 1);

  const cases: [string, string | null][] = [
    ['null', null],
    ['empty string', ''],
    ['not json', '{nope'],
    ['json null', 'null'],
    ['json array', '[]'],
    ['json number', '42'],
    ['huge string', ' '.repeat(100_000)],
    ['version missing', JSON.stringify({ ...good(), v: undefined })],
    ['unknown version', withField('v', 2)],
    ['version as string', withField('v', '1')],
    ['puzzle too short', withField('puzzle', PUZ.slice(1))],
    ['puzzle with letters', withField('puzzle', PUZ.replace('5', 'x'))],
    ['puzzle not a string', withField('puzzle', 5)],
    ['solution too long', withField('solution', SOL + '1')],
    ['solution has zero', withField('solution', '0' + SOL.slice(1))],
    ['solution row conflict', withField('solution', '5' + '5' + SOL.slice(2))],
    ['solution column conflict (swapped rows)', withField('solution', SOL.slice(9, 18) + SOL.slice(0, 9) + SOL.slice(18))],
    ['solution box conflict', withField('solution', SOL.slice(0, 9).split('').reverse().join('') + SOL.slice(9))],
    ['given disagrees with solution', withField('puzzle', PUZ.slice(0, 2) + (PUZ[2] === '4' ? '9' : '4') + PUZ.slice(3))],
    ['difficulty out of range', withField('difficulty', 6)],
    ['difficulty negative', withField('difficulty', -1)],
    ['difficulty fractional', withField('difficulty', 1.5)],
    ['difficulty string', withField('difficulty', 'Hard')],
    ['moves not array', withField('moves', 'x')],
    ['moves object', withField('moves', {})],
    ['too many moves', withField('moves', Array.from({ length: 82 }, () => [0, 1]))],
    ['move not array', withField('moves', [5])],
    ['move wrong length', withField('moves', [[0, 5, 1]])],
    ['move index negative', withField('moves', [[-1, 5]])],
    ['move index 81', withField('moves', [[81, 5]])],
    ['move index fractional', withField('moves', [[0.5, 5]])],
    ['move index string', withField('moves', [['0', 5]])],
    ['move on given cell', withField('moves', [[2, sol(2)]])],
    ['move value 0', withField('moves', [[0, 0]])],
    ['move value 10', withField('moves', [[0, 10]])],
    ['move value fractional', withField('moves', [[0, 5.5]])],
    ['same cell twice', withField('moves', [[0, sol(0)], [0, sol(0)]])],
    ['wrong move followed by another', withField('moves', [[0, oneWrong(0)], [1, sol(1)]])],
    ['fewer mistakes than wrong moves', JSON.stringify({ ...good(), mistakes: 0 })],
    ['mistakes negative', withField('mistakes', -1)],
    ['mistakes fractional', withField('mistakes', 1.5)],
    ['mistakes string', withField('mistakes', '1')],
    ['mistakes absurd', withField('mistakes', 1e12)],
    ['elapsed negative', withField('elapsedMs', -1)],
    ['elapsed string', withField('elapsedMs', '5')],
    ['elapsed null (NaN stored)', withField('elapsedMs', null)],
    ['elapsed absurd', withField('elapsedMs', 1e15)],
    ['savedAt missing', JSON.stringify({ ...good(), savedAt: undefined })],
    ['complete board', withField('moves', EMPTY.map((i) => [i, sol(i)])).replace(/"mistakes":\d+/, '"mistakes":0')],
  ];

  it.each(cases)('%s', (_name, json) => {
    expect(restore(json)).toBeNull();
  });

  it('the base fixture itself is valid', () => {
    expect(restore(JSON.stringify(good()))).not.toBeNull();
  });

  it('ignores unknown extra fields', () => {
    expect(restore(withField('extra', { a: 1 }))).not.toBeNull();
  });

  it('accepts a game with no entries and one with a trailing mistake only', () => {
    expect(restore(serialize(createGame(PUZ, SOL), Difficulty.SuperEasy, 0))).not.toBeNull();
    const g = play(createGame(PUZ, SOL), 0, oneWrong(0));
    expect(restore(serialize(g, Difficulty.SuperEasy, 0))).not.toBeNull();
  });
});

/** In-memory storage; `fail` makes the chosen operations throw. */
function fakeStorage(fail: { get?: boolean; set?: boolean; remove?: boolean } = {}) {
  const data = new Map<string, string>();
  const storage: StorageLike = {
    getItem(k) {
      if (fail.get) throw new Error('blocked');
      return data.get(k) ?? null;
    },
    setItem(k, v) {
      if (fail.set) throw new Error('quota');
      data.set(k, v);
    },
    removeItem(k) {
      if (fail.remove) throw new Error('blocked');
      data.delete(k);
    },
  };
  return { data, storage };
}

describe('createSaves', () => {
  it('saves, loads and clears', () => {
    const { data, storage } = fakeStorage();
    const saves = createSaves(createKeyValue(() => storage), () => 77);
    expect(saves.load()).toBeNull();
    saves.save(sample(), Difficulty.Extreme, 9000);
    expect(data.has(SAVE_KEY)).toBe(true);
    expect(saves.load()).toMatchObject({ difficulty: Difficulty.Extreme, elapsedMs: 9000, savedAt: 77 });
    saves.clear();
    expect(data.has(SAVE_KEY)).toBe(false);
    expect(saves.load()).toBeNull();
  });

  it('removes invalid data when loading', () => {
    const { data, storage } = fakeStorage();
    data.set(SAVE_KEY, '{"v":1,"puzzle":"bad"}');
    const saves = createSaves(createKeyValue(() => storage));
    expect(saves.load()).toBeNull();
    expect(data.has(SAVE_KEY)).toBe(false);
  });

  it('survives storage that throws on read, write and remove', () => {
    const { storage } = fakeStorage({ get: true, set: true, remove: true });
    const saves = createSaves(createKeyValue(() => storage));
    expect(saves.load()).toBeNull();
    expect(() => saves.save(sample(), Difficulty.Easy, 1)).not.toThrow();
    expect(() => saves.clear()).not.toThrow();
  });

  it('survives a storage accessor that throws or returns nothing', () => {
    for (const kv of [
      createKeyValue(() => {
        throw new Error('SecurityError');
      }),
      createKeyValue(() => null),
      createKeyValue(() => undefined),
    ] as KeyValue[]) {
      const saves = createSaves(kv);
      expect(saves.load()).toBeNull();
      expect(() => saves.save(sample(), Difficulty.Easy, 1)).not.toThrow();
      expect(() => saves.clear()).not.toThrow();
    }
  });
});
