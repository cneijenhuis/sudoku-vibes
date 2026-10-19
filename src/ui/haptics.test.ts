import { describe, expect, it, vi } from 'vitest';
import { createKeyValue, type StorageLike } from '../storage/kv';
import { HAPTICS_KEY, PATTERNS, createHaptics } from './haptics';

function storage(init: Record<string, string> = {}, failing = false) {
  const data = new Map(Object.entries(init));
  const s: StorageLike = {
    getItem: (k) => {
      if (failing) throw new Error('blocked');
      return data.get(k) ?? null;
    },
    setItem: (k, v) => {
      if (failing) throw new Error('blocked');
      data.set(k, v);
    },
    removeItem: (k) => void data.delete(k),
  };
  return { data, kv: createKeyValue(() => s) };
}

function setup(opts: { init?: Record<string, string>; visible?: boolean; vibrate?: boolean; failing?: boolean } = {}) {
  const vibrate = vi.fn(() => true);
  const state = { visible: opts.visible ?? true };
  const st = storage(opts.init, opts.failing);
  const nav = opts.vibrate === false ? {} : { vibrate };
  const haptics = createHaptics({ nav, kv: st.kv, visible: () => state.visible });
  return { haptics, vibrate, state, st };
}

describe('haptics', () => {
  it('vibrates with the pattern of each event by default', () => {
    const { haptics, vibrate } = setup();
    haptics.fire('mistake');
    haptics.fire('mode');
    haptics.fire('complete');
    expect(vibrate.mock.calls).toEqual([[[30]], [[15]], [[40, 60, 40, 60, 120]]]);
    expect(PATTERNS.complete.length).toBeGreaterThan(PATTERNS.mistake.length);
  });

  it('is on by default and reports support', () => {
    const { haptics } = setup();
    expect(haptics.supported).toBe(true);
    expect(haptics.enabled()).toBe(true);
  });

  it('turning it off stops vibration and persists across instances', () => {
    const { haptics, vibrate, st } = setup();
    haptics.setEnabled(false);
    haptics.fire('mistake');
    expect(vibrate).not.toHaveBeenCalled();
    expect(st.data.get(HAPTICS_KEY)).toBe('0');
    const again = setup({ init: Object.fromEntries(st.data) });
    expect(again.haptics.enabled()).toBe(false);
    again.haptics.fire('mistake');
    expect(again.vibrate).not.toHaveBeenCalled();
    again.haptics.setEnabled(true);
    again.haptics.fire('mistake');
    expect(again.vibrate).toHaveBeenCalledOnce();
    expect(again.st.data.get(HAPTICS_KEY)).toBe('1');
  });

  it('does not vibrate while the page is hidden', () => {
    const { haptics, vibrate, state } = setup({ visible: false });
    haptics.fire('complete');
    expect(vibrate).not.toHaveBeenCalled();
    state.visible = true;
    haptics.fire('complete');
    expect(vibrate).toHaveBeenCalledOnce();
  });

  it('is unsupported and silent without navigator.vibrate', () => {
    const { haptics, vibrate } = setup({ vibrate: false });
    expect(haptics.supported).toBe(false);
    expect(() => haptics.fire('mistake')).not.toThrow();
    expect(vibrate).not.toHaveBeenCalled();
    expect(createHaptics({ nav: null, kv: storage().kv, visible: () => true }).supported).toBe(false);
    expect(createHaptics({ nav: undefined, kv: storage().kv, visible: () => true }).supported).toBe(false);
  });

  it('swallows a throwing vibrate and a throwing storage', () => {
    const nav = {
      vibrate: () => {
        throw new Error('NotAllowedError');
      },
    };
    const h = createHaptics({ nav, kv: storage({}, true).kv, visible: () => true });
    expect(() => h.fire('mistake')).not.toThrow();
    expect(h.enabled()).toBe(true); // storage unreadable: default on
    expect(() => h.setEnabled(false)).not.toThrow();
    expect(h.enabled()).toBe(false); // remembered for this session
  });

  it('keeps `this` for the real navigator.vibrate', () => {
    let seen: unknown;
    const nav = {
      vibrate(this: unknown) {
        seen = this;
        return true;
      },
    };
    createHaptics({ nav, kv: storage().kv, visible: () => true }).fire('mode');
    expect(seen).toBe(nav);
  });

  it('passes a copy so the shared pattern cannot be mutated', () => {
    const { haptics, vibrate } = setup();
    haptics.fire('complete');
    const arg = (vibrate.mock.calls[0] as unknown as number[][])[0]!;
    arg.push(1);
    expect(PATTERNS.complete).toEqual([40, 60, 40, 60, 120]);
  });
});
