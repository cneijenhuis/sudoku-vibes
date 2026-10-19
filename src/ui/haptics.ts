import { localKv, type KeyValue } from '../storage/kv';

export type HapticEvent = 'mistake' | 'mode' | 'complete';

/** Vibration patterns in milliseconds (vibrate, pause, vibrate, ...). */
export const PATTERNS: Record<HapticEvent, readonly number[]> = {
  mistake: [30],
  mode: [15],
  complete: [40, 60, 40, 60, 120],
};

export const HAPTICS_KEY = 'sudoku-vibes:haptics';

export interface VibrationApi {
  vibrate?: (pattern: number | number[]) => boolean;
}

export interface HapticsEnv {
  /** `navigator`, or anything with an optional `vibrate`. */
  nav: VibrationApi | null | undefined;
  kv: KeyValue;
  /** Whether the page is currently shown to the player. */
  visible: () => boolean;
}

export interface Haptics {
  /** The browser can vibrate (iOS Safari and most desktops cannot). */
  readonly supported: boolean;
  /** The player's setting (default on). */
  enabled(): boolean;
  setEnabled(on: boolean): void;
  /** Vibrate for `event` when supported, enabled and the page is visible. Never throws. */
  fire(event: HapticEvent): void;
}

export function createHaptics({ nav, kv, visible }: HapticsEnv): Haptics {
  let cached: boolean | null = null;
  const supported = (): boolean => {
    try {
      return typeof nav?.vibrate === 'function';
    } catch {
      return false;
    }
  };
  const read = (): boolean => (cached ??= kv.get(HAPTICS_KEY) !== '0');
  return {
    get supported() {
      return supported();
    },
    enabled: read,
    setEnabled(on) {
      cached = on;
      kv.set(HAPTICS_KEY, on ? '1' : '0');
    },
    fire(event) {
      try {
        if (!supported() || !read() || !visible()) return;
        nav!.vibrate!([...PATTERNS[event]]);
      } catch {
        /* haptics are a nicety: never let them break the game */
      }
    },
  };
}

/** The app-wide instance, backed by the real `navigator` and `localStorage`. */
export const haptics: Haptics = createHaptics({
  nav: typeof navigator === 'undefined' ? null : navigator,
  kv: localKv,
  visible: () => typeof document === 'undefined' || document.visibilityState === 'visible',
});
