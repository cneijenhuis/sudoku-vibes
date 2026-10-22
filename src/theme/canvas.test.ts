import { describe, expect, it } from 'vitest';
import { canvasHeight } from './canvas';

describe('canvasHeight', () => {
  it('uses the screen height when a standalone viewport is short (iPhone 15 Pro: 793 vs 852)', () => {
    expect(canvasHeight({ innerHeight: 793, outerHeight: 852, standalone: true })).toBe(852);
  });

  it('keeps the normal height when not standalone', () => {
    expect(canvasHeight({ innerHeight: 793, outerHeight: 852, standalone: false })).toBeNull();
  });

  it('keeps the normal height when viewport and window agree', () => {
    expect(canvasHeight({ innerHeight: 852, outerHeight: 852, standalone: true })).toBeNull();
    expect(canvasHeight({ innerHeight: 900, outerHeight: 852, standalone: true })).toBeNull();
  });

  it('ignores implausibly large differences', () => {
    expect(canvasHeight({ innerHeight: 400, outerHeight: 852, standalone: true })).toBeNull();
  });
});
