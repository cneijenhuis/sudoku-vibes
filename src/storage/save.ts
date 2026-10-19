import { DIFFICULTY_LABELS, type Difficulty } from '../engine/grading';
import { CELLS, isComplete, restoreGame, type GameState } from '../game/state';
import { localKv, type KeyValue } from './kv';

export const SAVE_KEY = 'sudoku-vibes:game';
export const SAVE_VERSION = 1;

/** A saved game is about 1 KB; anything far bigger is not ours. */
const MAX_JSON_CHARS = 8192;
const MAX_MISTAKES = 1_000_000;
/** About 115 days of play; beyond this the value is certainly bogus. */
const MAX_ELAPSED_MS = 1e10;

/** A validated save: everything needed to rebuild a `GameState` and the timer. */
export interface SavedGame {
  puzzle: string;
  solution: string;
  difficulty: Difficulty;
  /** The player's entries in order, as `[cell index, digit]`. */
  moves: [number, number][];
  mistakes: number;
  elapsedMs: number;
  savedAt: number;
}

/** JSON for the game in progress. Pure; `savedAt` is injectable for tests. */
export function serialize(state: GameState, difficulty: Difficulty, elapsedMs: number, savedAt = Date.now()): string {
  const saved: SavedGame & { v: number } = {
    v: SAVE_VERSION,
    puzzle: state.givens.join(''),
    solution: state.solution.join(''),
    difficulty,
    moves: state.history.map((m): [number, number] => [m.index, m.value]),
    mistakes: state.mistakes,
    elapsedMs: Math.max(0, Math.round(elapsedMs)),
    savedAt,
  };
  return JSON.stringify(saved);
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isDigits = (x: unknown): x is string => typeof x === 'string' && /^[0-9]{81}$/.test(x);

/** True when `solution` (81 digits) is a complete Sudoku grid: 1-9 once in every row, column and box. */
function isValidGrid(solution: string): boolean {
  const seen = new Uint16Array(27); // 9 rows, 9 columns, 9 boxes as digit bitmasks
  for (let i = 0; i < CELLS; i++) {
    const d = Number(solution[i]);
    if (d < 1) return false;
    const bit = 1 << d;
    const units = [Math.floor(i / 9), 9 + (i % 9), 18 + Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3)];
    for (const u of units) {
      if (seen[u]! & bit) return false;
      seen[u]! |= bit;
    }
  }
  return true;
}

/**
 * Parse and strictly validate saved JSON. Returns null for anything that is not a trustworthy
 * save of an unfinished game: wrong version, malformed fields, givens that disagree with the
 * solution, a solution that is not a valid grid, entries on given, out-of-range or repeated
 * cells, impossible mistakes, or a bad time. Never throws.
 */
export function restore(json: string | null): SavedGame | null {
  try {
    if (typeof json !== 'string' || json.length > MAX_JSON_CHARS) return null;
    const data: unknown = JSON.parse(json);
    if (!isRecord(data) || data.v !== SAVE_VERSION) return null;
    const { puzzle, solution, difficulty, moves, mistakes, elapsedMs, savedAt } = data;
    if (!isDigits(puzzle) || !isDigits(solution) || !isValidGrid(solution)) return null;
    for (let i = 0; i < CELLS; i++) if (puzzle[i] !== '0' && puzzle[i] !== solution[i]) return null;
    if (typeof difficulty !== 'number' || !Number.isInteger(difficulty) || DIFFICULTY_LABELS[difficulty as Difficulty] === undefined) return null;
    if (!Array.isArray(moves) || moves.length > CELLS) return null;

    const filled = new Set<number>();
    const checked: [number, number][] = [];
    let wrong = 0;
    for (const [k, move] of moves.entries()) {
      if (!Array.isArray(move) || move.length !== 2) return null;
      const [index, value] = move as unknown[];
      if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= CELLS) return null;
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 9) return null;
      if (puzzle[index] !== '0' || filled.has(index)) return null; // given or already entered
      filled.add(index);
      if (String(value) !== solution[index]) {
        wrong++;
        if (k !== moves.length - 1) return null; // a mistake blocks entry, so it can only be last
      }
      checked.push([index, value]);
    }
    if (typeof mistakes !== 'number' || !Number.isInteger(mistakes) || mistakes < wrong || mistakes > MAX_MISTAKES) return null;
    if (typeof elapsedMs !== 'number' || !Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs > MAX_ELAPSED_MS) return null;
    if (typeof savedAt !== 'number' || !Number.isFinite(savedAt)) return null;

    const result: SavedGame = { puzzle, solution, difficulty: difficulty as Difficulty, moves: checked, mistakes, elapsedMs, savedAt };
    // A finished game is never kept, so a "complete" save is bogus.
    if (isComplete(restoreGame(result))) return null;
    return result;
  } catch {
    return null;
  }
}

/** The single saved game, behind a storage that may fail at any time. */
export interface Saves {
  /** The valid saved game, or null. Invalid or unreadable data is removed. */
  load(): SavedGame | null;
  save(state: GameState, difficulty: Difficulty, elapsedMs: number): void;
  clear(): void;
}

export function createSaves(kv: KeyValue = localKv, now: () => number = Date.now): Saves {
  return {
    load() {
      const raw = kv.get(SAVE_KEY);
      if (raw === null) return null;
      const saved = restore(raw);
      if (saved === null) kv.remove(SAVE_KEY);
      return saved;
    },
    save(state, difficulty, elapsedMs) {
      kv.set(SAVE_KEY, serialize(state, difficulty, elapsedMs, now()));
    },
    clear() {
      kv.remove(SAVE_KEY);
    },
  };
}
