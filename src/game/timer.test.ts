import { describe, expect, it } from 'vitest';
import { createStopwatch, formatTime } from './timer';

function clock() {
  let t = 1000;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

describe('formatTime', () => {
  it.each([
    [0, '0:00'],
    [999, '0:00'],
    [1000, '0:01'],
    [65_000, '1:05'],
    [599_999, '9:59'],
    [600_000, '10:00'],
    [3_599_000, '59:59'],
    [3_600_000, '1:00:00'],
    [3_661_000, '1:01:01'],
    [-5, '0:00'],
  ])('%d ms -> %s', (ms, text) => expect(formatTime(ms)).toBe(text));
});

describe('stopwatch', () => {
  it('is idle at zero until started', () => {
    const c = clock();
    const sw = createStopwatch(c.now);
    c.advance(5000);
    expect(sw.running).toBe(false);
    expect(sw.elapsed()).toBe(0);
  });

  it('counts while running (65 s shows 1:05)', () => {
    const c = clock();
    const sw = createStopwatch(c.now);
    sw.start();
    c.advance(65_000);
    expect(sw.elapsed()).toBe(65_000);
    expect(formatTime(sw.elapsed())).toBe('1:05');
  });

  it('freezes on pause and accrues nothing while paused', () => {
    const c = clock();
    const sw = createStopwatch(c.now);
    sw.start();
    c.advance(3000);
    sw.pause();
    c.advance(60_000);
    expect(sw.running).toBe(false);
    expect(sw.elapsed()).toBe(3000);
    sw.resume();
    c.advance(2000);
    expect(sw.elapsed()).toBe(5000);
  });

  it('pause and resume are idempotent', () => {
    const c = clock();
    const sw = createStopwatch(c.now);
    sw.start();
    c.advance(1000);
    sw.pause();
    sw.pause();
    c.advance(1000);
    sw.resume();
    sw.resume();
    c.advance(1000);
    expect(sw.elapsed()).toBe(2000);
  });

  it('stop freezes permanently', () => {
    const c = clock();
    const sw = createStopwatch(c.now);
    sw.start();
    c.advance(4000);
    sw.stop();
    sw.resume();
    c.advance(4000);
    expect(sw.running).toBe(false);
    expect(sw.elapsed()).toBe(4000);
  });

  it('start resets', () => {
    const c = clock();
    const sw = createStopwatch(c.now);
    sw.start();
    c.advance(4000);
    sw.stop();
    sw.start();
    c.advance(1000);
    expect(sw.elapsed()).toBe(1000);
  });

  it('never goes backwards if the clock does', () => {
    const c = clock();
    const sw = createStopwatch(c.now);
    sw.start();
    c.advance(-500);
    expect(sw.elapsed()).toBe(0);
  });
});
