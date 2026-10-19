import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLongPress, LONG_PRESS_MS } from './longpress';

function setup(delayMs?: number) {
  const calls: string[] = [];
  const lp = createLongPress({
    delayMs,
    onTap: () => calls.push('tap'),
    onLongPress: () => calls.push('long'),
    onProgress: (h) => calls.push(h ? 'start' : 'stop'),
  });
  return { lp, calls };
}

describe('createLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a quick press and release is a tap', () => {
    const { lp, calls } = setup();
    lp.down(1);
    vi.advanceTimersByTime(LONG_PRESS_MS - 1);
    lp.up(1);
    expect(calls).toEqual(['start', 'stop', 'tap']);
    vi.advanceTimersByTime(1000);
    expect(calls).toEqual(['start', 'stop', 'tap']);
    expect(lp.pressed).toBe(false);
  });

  it('holding fires the long press once and swallows the release', () => {
    const { lp, calls } = setup();
    lp.down(1);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(calls).toEqual(['start', 'stop', 'long']);
    expect(lp.pressed).toBe(true);
    vi.advanceTimersByTime(5000);
    lp.up(1);
    expect(calls).toEqual(['start', 'stop', 'long']);
    expect(lp.pressed).toBe(false);
  });

  it('honours a custom delay', () => {
    const { lp, calls } = setup(100);
    lp.down();
    vi.advanceTimersByTime(99);
    expect(calls).toEqual(['start']);
    vi.advanceTimersByTime(1);
    expect(calls).toContain('long');
  });

  it('cancel before the delay gives no tap and no long press', () => {
    const { lp, calls } = setup();
    lp.down(1);
    vi.advanceTimersByTime(200);
    lp.cancel(1);
    vi.advanceTimersByTime(1000);
    lp.up(1);
    expect(calls).toEqual(['start', 'stop']);
  });

  it('cancel after the long press fired just resets', () => {
    const { lp, calls } = setup();
    lp.down(1);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    lp.cancel(1);
    lp.up(1);
    expect(calls).toEqual(['start', 'stop', 'long']);
    expect(lp.pressed).toBe(false);
  });

  it('can be reused for a following press', () => {
    const { lp, calls } = setup();
    lp.down(1);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    lp.up(1);
    lp.down(2);
    lp.up(2);
    expect(calls).toEqual(['start', 'stop', 'long', 'start', 'stop', 'tap']);
  });

  it('ignores a second pointer while one is pressing, and stray releases', () => {
    const { lp, calls } = setup();
    lp.up(9);
    lp.cancel(9);
    lp.down(1);
    lp.down(2);
    lp.up(2);
    lp.cancel(2);
    expect(lp.pressed).toBe(true);
    lp.up(1);
    expect(calls).toEqual(['start', 'stop', 'tap']);
  });

  it('works with injected timers', () => {
    const timers: Array<() => void> = [];
    const cleared: unknown[] = [];
    const calls: string[] = [];
    const lp = createLongPress({
      onTap: () => calls.push('tap'),
      onLongPress: () => calls.push('long'),
      setTimeout: (fn) => (timers.push(fn), timers.length),
      clearTimeout: (h) => cleared.push(h),
    });
    lp.down(1);
    lp.up(1);
    expect(cleared).toEqual([1]);
    expect(calls).toEqual(['tap']);
    lp.down(1);
    timers[1]!();
    expect(calls).toEqual(['tap', 'long']);
  });
});
