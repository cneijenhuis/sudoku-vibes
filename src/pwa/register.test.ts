import { describe, expect, it, vi } from 'vitest';
import { registerServiceWorker, type RegisterEnv } from './register';

function env(over: Partial<RegisterEnv> & { ready?: string; register?: () => Promise<unknown> } = {}) {
  const register = vi.fn(over.register ?? (async () => undefined));
  const loads: (() => void)[] = [];
  const e: RegisterEnv = {
    prod: true,
    nav: { serviceWorker: { register } },
    win: { addEventListener: (_t, l) => void loads.push(l) },
    doc: { readyState: over.ready ?? 'complete' },
    ...over,
  };
  return { e, register, loads };
}

describe('registerServiceWorker', () => {
  it('registers ./sw.js with a relative scope in production', () => {
    const { e, register } = env();
    registerServiceWorker(e);
    expect(register).toHaveBeenCalledWith('./sw.js', { scope: './' });
  });

  it('waits for the load event when the page is still loading', () => {
    const { e, register, loads } = env({ ready: 'loading' });
    registerServiceWorker(e);
    expect(register).not.toHaveBeenCalled();
    loads[0]!();
    expect(register).toHaveBeenCalledOnce();
  });

  it('does nothing outside production builds', () => {
    const { e, register } = env({ prod: false });
    registerServiceWorker(e);
    expect(register).not.toHaveBeenCalled();
  });

  it('does nothing without service worker support (or without a browser)', () => {
    expect(() => registerServiceWorker({ ...env().e, nav: {} })).not.toThrow();
    expect(() => registerServiceWorker({ ...env().e, nav: undefined })).not.toThrow();
    expect(() => registerServiceWorker({ prod: true, nav: undefined, win: undefined, doc: undefined })).not.toThrow();
  });

  it('swallows a rejected registration', async () => {
    const { e, register } = env({ register: () => Promise.reject(new Error('SecurityError')) });
    expect(() => registerServiceWorker(e)).not.toThrow();
    await Promise.resolve();
    expect(register).toHaveBeenCalled(); // and no unhandled rejection is raised (vitest would fail the run)
  });

  it('swallows a register that throws synchronously', () => {
    const { e } = env({
      register: () => {
        throw new Error('boom');
      },
    });
    expect(() => registerServiceWorker(e)).not.toThrow();
  });

  it('swallows a throwing navigator getter', () => {
    const nav = {
      get serviceWorker(): never {
        throw new Error('blocked');
      },
    };
    expect(() => registerServiceWorker({ ...env().e, nav })).not.toThrow();
  });
});
