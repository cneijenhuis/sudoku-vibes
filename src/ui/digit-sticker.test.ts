import { describe, expect, it } from 'vitest';
import { parseCssTime } from './digit-sticker';

describe('parseCssTime', () => {
  it('reads milliseconds and seconds', () => {
    expect(parseCssTime('700ms', 1)).toBe(700);
    expect(parseCssTime(' 0.7s ', 1)).toBe(700);
    expect(parseCssTime('1.25s', 1)).toBe(1250);
  });

  it('falls back for anything else', () => {
    expect(parseCssTime('', 650)).toBe(650);
    expect(parseCssTime('fast', 650)).toBe(650);
    expect(parseCssTime('0ms', 650)).toBe(650);
    expect(parseCssTime('calc(1s)', 650)).toBe(650);
  });
});
