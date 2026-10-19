/** Stopwatch driven by an injected clock; accrues only while running. */
export interface Stopwatch {
  /** Reset to zero and start running. */
  start(): void;
  pause(): void;
  /** Continue after `pause`; no effect once stopped. */
  resume(): void;
  /** Freeze permanently (game over). */
  stop(): void;
  readonly running: boolean;
  /** Active milliseconds so far. */
  elapsed(): number;
}

export function createStopwatch(now: () => number = () => performance.now()): Stopwatch {
  let accrued = 0;
  let startedAt: number | null = null;
  let stopped = false;

  const freeze = (): void => {
    if (startedAt !== null) {
      accrued += Math.max(0, now() - startedAt);
      startedAt = null;
    }
  };

  return {
    start() {
      accrued = 0;
      stopped = false;
      startedAt = now();
    },
    pause: freeze,
    resume() {
      if (!stopped && startedAt === null) startedAt = now();
    },
    stop() {
      freeze();
      stopped = true;
    },
    get running() {
      return startedAt !== null;
    },
    elapsed() {
      return startedAt === null ? accrued : accrued + Math.max(0, now() - startedAt);
    },
  };
}

/** Whole seconds as `m:ss`, or `h:mm:ss` from one hour. */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
