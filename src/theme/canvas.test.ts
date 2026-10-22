import { describe, expect, it } from 'vitest';
import { canvasHeight, type CanvasEnv } from './canvas';

const iphone: CanvasEnv = { innerWidth: 393, innerHeight: 793, outerHeight: 852, screenWidth: 393, screenHeight: 852, standalone: true };

describe('canvasHeight', () => {
  it('uses the screen height when a standalone viewport is short (iPhone 15 Pro: 793 vs 852)', () => {
    expect(canvasHeight(iphone)).toBe(852);
  });

  it('still works when outerHeight has not caught up but the screen height shows the gap', () => {
    expect(canvasHeight({ ...iphone, outerHeight: 793 })).toBe(852);
  });

  it('keeps the normal height when not standalone', () => {
    expect(canvasHeight({ ...iphone, standalone: false })).toBeNull();
  });

  it('keeps the normal height when the viewport already fills the screen', () => {
    expect(canvasHeight({ ...iphone, innerHeight: 852 })).toBeNull();
  });

  it('ignores implausibly large differences', () => {
    expect(canvasHeight({ ...iphone, innerHeight: 400, outerHeight: 400 })).toBeNull();
  });

  it('in landscape uses the short screen side, not the portrait height', () => {
    const landscape: CanvasEnv = { innerWidth: 852, innerHeight: 334, outerHeight: 393, screenWidth: 393, screenHeight: 852, standalone: true };
    expect(canvasHeight(landscape)).toBe(393);
  });
});
