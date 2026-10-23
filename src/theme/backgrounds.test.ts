// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { applyBackground, applyBackgroundWhenLoaded, BACKGROUNDS, pickBackground, type Background } from './backgrounds';

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

  it('ships the surfboard 5 and the volleyball 8 with the shared fallback colour', () => {
    const ids = BACKGROUNDS.map((b) => b.id);
    expect(ids).toEqual(expect.arrayContaining(['beach-day', 'surf-five', 'beach-volleyball']));
    expect(new Set(ids).size).toBe(ids.length);
    for (const b of BACKGROUNDS) {
      expect(b.fallback).toBe('#F6E9D2');
      expect(b.image).toMatch(/\.webp$/);
      expect(b.position).toMatch(/^\d+% \d+%$/);
    }
  });

  it('never returns the excluded id when several entries exist', () => {
    for (const exclude of BACKGROUNDS.map((b) => b.id)) {
      for (let r = 0; r < 1; r += 0.01) {
        expect(pickBackground(BACKGROUNDS, () => r, exclude).id).not.toBe(exclude);
      }
      expect(pickBackground(BACKGROUNDS, () => 0.999999, exclude).id).not.toBe(exclude);
    }
  });

  it('can reach every other entry when excluding one', () => {
    const seen = new Set<string>();
    for (let r = 0; r < 1; r += 0.01) seen.add(pickBackground(BACKGROUNDS, () => r, 'beach-day').id);
    expect([...seen].sort()).toEqual(BACKGROUNDS.map((b) => b.id).filter((id) => id !== 'beach-day').sort());
  });

  it('returns the only entry even if it is the excluded one', () => {
    const only = BACKGROUNDS.slice(0, 1);
    expect(pickBackground(only, () => 0.5, only[0]?.id)).toBe(only[0]);
  });

  it('keeps random() values at the bounds inside the list', () => {
    expect(pickBackground(BACKGROUNDS, () => 0)).toBe(BACKGROUNDS[0]);
    expect(pickBackground(BACKGROUNDS, () => 1)).toBe(BACKGROUNDS[BACKGROUNDS.length - 1]);
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

  function fakeRoot() {
    const props = new Map<string, string>();
    return { props, root: { style: { setProperty: (k: string, v: string) => void props.set(k, v) } } as unknown as HTMLElement };
  }

  it('applies a new background only after its image has decoded', async () => {
    const { props, root } = fakeRoot();
    let finish!: () => void;
    const done = applyBackgroundWhenLoaded(second, () => true, root, () => new Promise<void>((r) => (finish = r)));
    await Promise.resolve();
    expect(props.size).toBe(0);
    finish();
    await done;
    expect(props.get('--bg-image')).toBe('url("b.webp")');
  });

  it('applies anyway when the image fails to decode, and skips an overtaken swap', async () => {
    const failed = fakeRoot();
    await applyBackgroundWhenLoaded(second, () => true, failed.root, () => Promise.reject(new Error('x')));
    expect(failed.props.get('--bg-image')).toBe('url("b.webp")');
    const stale = fakeRoot();
    await applyBackgroundWhenLoaded(second, () => false, stale.root, () => Promise.resolve());
    expect(stale.props.size).toBe(0);
  });
});
