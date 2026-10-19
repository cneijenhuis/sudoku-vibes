/** DOM-free long-press gesture for one button. Feed it pointer events; it decides tap vs hold. */

export const LONG_PRESS_MS = 450;

export interface LongPressOptions {
  delayMs?: number;
  /** Called on release before the delay elapsed (and not cancelled). */
  onTap: () => void;
  /** Called once when the hold reaches the delay; the following release is swallowed. */
  onLongPress: () => void;
  /** True when a hold starts (drive the fill animation), false when it ends for any reason. */
  onProgress?: (holding: boolean) => void;
  setTimeout?: (fn: () => void, ms: number) => unknown;
  clearTimeout?: (handle: unknown) => void;
}

export interface LongPress {
  /** A pointer went down on the button. Ignored while another pointer is already pressing. */
  down(pointerId?: number): void;
  /** That pointer was released. Fires onTap unless the hold already fired or was cancelled. */
  up(pointerId?: number): void;
  /** Abort without tap: pointercancel, finger moved off the button, pause, dispose. */
  cancel(pointerId?: number): void;
  /** Whether a pointer is currently down (a long press may already have fired). */
  readonly pressed: boolean;
}

export function createLongPress(opts: LongPressOptions): LongPress {
  const delay = opts.delayMs ?? LONG_PRESS_MS;
  const setT = opts.setTimeout ?? ((fn, ms) => globalThis.setTimeout(fn, ms));
  const clearT = opts.clearTimeout ?? ((h) => globalThis.clearTimeout(h as ReturnType<typeof setTimeout>));

  let pointer: number | undefined;
  let state: 'idle' | 'holding' | 'fired' = 'idle';
  let handle: unknown;

  function stopTimer(): void {
    if (handle !== undefined) clearT(handle);
    handle = undefined;
  }

  function matches(id: number | undefined): boolean {
    return id === undefined || pointer === undefined || id === pointer;
  }

  return {
    get pressed() {
      return state !== 'idle';
    },
    down(id) {
      if (state !== 'idle') return;
      pointer = id;
      state = 'holding';
      opts.onProgress?.(true);
      handle = setT(() => {
        handle = undefined;
        if (state !== 'holding') return;
        state = 'fired';
        opts.onProgress?.(false);
        opts.onLongPress();
      }, delay);
    },
    up(id) {
      if (state === 'idle' || !matches(id)) return;
      const was = state;
      stopTimer();
      state = 'idle';
      pointer = undefined;
      if (was === 'holding') {
        opts.onProgress?.(false);
        opts.onTap();
      }
    },
    cancel(id) {
      if (state === 'idle' || !matches(id)) return;
      const was = state;
      stopTimer();
      state = 'idle';
      pointer = undefined;
      if (was === 'holding') opts.onProgress?.(false);
    },
  };
}
