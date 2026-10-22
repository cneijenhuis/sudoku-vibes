// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { applyBackground, BACKGROUNDS, pickBackground, type Background } from './backgrounds';

const second: Background = { id: 'second', image: 'b.webp', fallback: '#102030', position: '50% 50%' };

describe('backgrounds', () => {
  it('ships the beach photo with the fallback colour and a focal position', () => {
    expect(BACKGROUNDS.length).toBeGreaterThanOrEqual(1);
    const [first] = BACKGROUNDS;
    expect(first?.id).toBe('beach-day');
    expect(first?.fallback).toBe('#F6E9D2');
    expect(first?.image).toMatch(/\.webp$/);
    expect(first?.position).toMatch(/%/);
  });

  it('uses the only entry when there is one', () => {
    const only = BACKGROUNDS.slice(0, 1);
    expect(pickBackground(only, () => 0.99)).toBe(only[0]);
  });

  it('picks one of several entries per load without component changes', () => {
    const list = [...BACKGROUNDS, second];
    expect(pickBackground(list, () => 0)).toBe(list[0]);
    expect(pickBackground(list, () => 0.999)).toBe(second);
  });

  it('exposes the choice to the stylesheet as custom properties', () => {
    const props = new Map<string, string>();
    const root = { style: { setProperty: (k: string, v: string) => void props.set(k, v) } } as unknown as HTMLElement;
    applyBackground(second, root);
    expect(props.get('--bg-image')).toBe('url("b.webp")');
    expect(props.get('--bg-position')).toBe('50% 50%');
    expect(props.get('--fallback-bg')).toBe('#102030');
  });
});
