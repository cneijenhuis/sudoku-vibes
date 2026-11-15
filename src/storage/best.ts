import { Difficulty } from '../engine/grading';
import { localKv, type KeyValue } from './kv';
import { MAX_ELAPSED_MS } from './save';

export const BEST_KEY = 'sudoku-vibes:best';
export const BEST_VERSION = 1;

const LEVEL_COUNT = Object.values(Difficulty).filter((v) => typeof v === 'number').length;

/** Best time in ms per level, index = level; `null` where no game was completed without mistakes. */
export type BestTimes = (number | null)[];

const isTime = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x) && x > 0 && x <= MAX_ELAPSED_MS;

/** Parse stored best times; null for anything that is not exactly `{ v: 1, ms: [9 times or nulls] }`. Never throws. */
export function parseBest(json: string | null): BestTimes | null {
  try {
    if (typeof json !== 'string' || json.length > 1024) return null;
    const data: unknown = JSON.parse(json);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
    const { v, ms } = data as Record<string, unknown>;
    if (v !== BEST_VERSION || !Array.isArray(ms) || ms.length !== LEVEL_COUNT) return null;
    if (!ms.every((t) => t === null || isTime(t))) return null;
    return ms as BestTimes;
  } catch {
    return null;
  }
}

/** The best times, behind a storage that may fail at any time. */
export interface Bests {
  /** The nine best times (null = none); invalid or unreadable data is removed and reads as all null. */
  load(): BestTimes;
  /**
   * Record a finished game: only a game with no mistakes, faster than the stored time (or with none),
   * changes anything. Returns true when the best time was set.
   */
  record(level: Difficulty, elapsedMs: number, mistakes: number): boolean;
}

export function createBests(kv: KeyValue = localKv): Bests {
  const load = (): BestTimes => {
    const raw = kv.get(BEST_KEY);
    if (raw === null) return Array<number | null>(LEVEL_COUNT).fill(null);
    const parsed = parseBest(raw);
    if (parsed === null) {
      kv.remove(BEST_KEY);
      return Array<number | null>(LEVEL_COUNT).fill(null);
    }
    return parsed;
  };
  return {
    load,
    record(level, elapsedMs, mistakes) {
      if (mistakes !== 0 || !isTime(elapsedMs) || !Number.isInteger(level) || level < 0 || level >= LEVEL_COUNT) return false;
      const ms = load();
      const current = ms[level];
      if (current !== null && current !== undefined && current <= elapsedMs) return false;
      ms[level] = Math.max(1, Math.round(elapsedMs));
      kv.set(BEST_KEY, JSON.stringify({ v: BEST_VERSION, ms }));
      return true;
    },
  };
}
