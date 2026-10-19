import { describe, expect, it, vi } from 'vitest';
import { buildServiceWorker, CACHE_PREFIX } from './sw-source';

const ORIGIN = 'https://player.test';
const BASE = `${ORIGIN}/sudoku-vibes/`;
const FILES = ['index.html', 'assets/app-1a2b.js', 'assets/worker-9z.js', 'manifest.webmanifest', 'icons/icon-192.png'];

class FakeRequest {
  url: string;
  method: string;
  mode: string;
  cache: string | undefined;
  constructor(input: string | FakeRequest, init: { method?: string; mode?: string; cache?: string } = {}) {
    this.url = typeof input === 'string' ? new URL(input, `${BASE}sw.js`).href : input.url;
    this.method = init.method ?? 'GET';
    this.mode = init.mode ?? 'no-cors';
    this.cache = init.cache;
  }
}

interface Res {
  status: number;
  body: string;
}
const res = (body: string, status = 200): Res => ({ status, body });

/** Runs the generated worker against fake caches/fetch and returns handles to drive its events. */
function boot(opts: { files?: string[]; cacheName?: string; fetchImpl?: (r: FakeRequest) => Promise<Res>; setTimeoutImpl?: (fn: () => void, ms: number) => unknown } = {}) {
  const cacheName = opts.cacheName ?? `${CACHE_PREFIX}v2`;
  const source = buildServiceWorker({ cacheName, files: opts.files ?? FILES });
  const store = new Map<string, Map<string, Res>>();
  const listeners = new Map<string, (event: unknown) => void>();
  const claim = vi.fn(async () => undefined);
  const network = new Map<string, Res>(); // url -> response the "server" has
  const fetched: FakeRequest[] = [];
  let doFetch: (r: FakeRequest) => Promise<Res> =
    opts.fetchImpl ??
    (async (r) => {
      const hit = network.get(r.url);
      if (!hit) throw new TypeError('offline or unknown');
      return hit;
    });
  const fetchFn = vi.fn((r: FakeRequest | string, _init?: { cache?: string }) => {
    const req = typeof r === 'string' ? new FakeRequest(r) : r;
    fetched.push(req);
    return doFetch(req);
  });
  const keyOf = (r: FakeRequest | string, ignoreSearch = false): string => {
    const u = new URL(typeof r === 'string' ? new URL(r, `${BASE}sw.js`).href : r.url);
    if (ignoreSearch) u.search = '';
    return u.href;
  };
  const cacheApi = {
    async open(name: string) {
      if (!store.has(name)) store.set(name, new Map());
      const entries = store.get(name)!;
      return {
        async addAll(reqs: FakeRequest[]) {
          const got = await Promise.all(reqs.map(async (r) => [keyOf(r), await fetchFn(r)] as const));
          for (const [k, v] of got) entries.set(k, v);
        },
        async match(r: FakeRequest | string, o: { ignoreSearch?: boolean } = {}) {
          const want = keyOf(r, o.ignoreSearch);
          for (const [k, v] of entries) if (keyOf(k, o.ignoreSearch) === want) return v;
          return undefined;
        },
      };
    },
    async keys() {
      return [...store.keys()];
    },
    async delete(name: string) {
      return store.delete(name);
    },
  };
  const self = {
    location: { origin: ORIGIN },
    clients: { claim },
    addEventListener: (type: string, fn: (e: unknown) => void) => void listeners.set(type, fn),
  };
  new Function('self', 'caches', 'fetch', 'Request', 'URL', 'setTimeout', 'clearTimeout', source)(
    self,
    cacheApi,
    fetchFn,
    FakeRequest,
    URL,
    opts.setTimeoutImpl ?? setTimeout,
    clearTimeout,
  );
  const lifecycle = async (type: 'install' | 'activate'): Promise<void> => {
    let work: Promise<unknown> = Promise.resolve();
    listeners.get(type)!({ waitUntil: (p: Promise<unknown>) => (work = p) });
    await work;
  };
  /** Dispatch a fetch event; resolves to the response, or 'passthrough' if the worker did not respond. */
  const request = async (url: string, init: { method?: string; mode?: string } = {}): Promise<Res | 'passthrough'> => {
    let out: Promise<Res> | null = null;
    listeners.get('fetch')!({ request: new FakeRequest(url, init), respondWith: (p: Promise<Res>) => (out = p) });
    return out ?? 'passthrough';
  };
  const serve = (path: string, body: string, status = 200): void => void network.set(`${BASE}${path}`, res(body, status));
  const useFetch = (fn: (r: FakeRequest) => Promise<Res>): void => void (doFetch = fn);
  return { useFetch, source, store, cacheName, lifecycle, request, serve, network, fetchFn, fetched, claim, listeners, cacheApi };
}

describe('generated service worker', () => {
  it('embeds the cache name and a relative file list (root, then every built file)', () => {
    const { source } = boot();
    expect(source).toContain(`"${CACHE_PREFIX}v2"`);
    for (const f of ['./', './index.html', './assets/app-1a2b.js', './assets/worker-9z.js', './manifest.webmanifest', './icons/icon-192.png']) {
      expect(source).toContain(`"${f}"`);
    }
    expect(source).not.toMatch(/"\/[^"]*"/); // no root-absolute URLs: it must work from a sub-path
    expect(source).not.toContain('skipWaiting');
    expect(() => new Function(source)).not.toThrow();
  });

  it('is a pure function of its inputs', () => {
    const a = buildServiceWorker({ cacheName: 'sudoku-vibes-x', files: ['a.js'] });
    expect(buildServiceWorker({ cacheName: 'sudoku-vibes-x', files: ['a.js'] })).toBe(a);
    expect(buildServiceWorker({ cacheName: 'sudoku-vibes-y', files: ['a.js'] })).not.toBe(a);
    expect(buildServiceWorker({ cacheName: 'sudoku-vibes-x', files: ['a.js', 'b.js'] })).not.toBe(a);
  });

  it('install precaches the whole list in the versioned cache, bypassing the HTTP cache', async () => {
    const sw = boot();
    for (const f of ['', ...FILES]) sw.serve(f, `body:${f}`);
    await sw.lifecycle('install');
    const cached = [...sw.store.get(sw.cacheName)!.keys()].sort();
    expect(cached).toEqual(['', ...FILES].map((f) => `${BASE}${f}`).sort());
    expect(sw.fetched.every((r) => r.cache === 'reload')).toBe(true);
  });

  it('install fails (keeping the old worker) when a file cannot be fetched', async () => {
    const sw = boot();
    for (const f of ['', ...FILES.slice(1)]) sw.serve(f, 'x'); // index.html missing
    await expect(sw.lifecycle('install')).rejects.toThrow();
  });

  it('activate deletes only this app\'s other caches and claims clients', async () => {
    const sw = boot();
    sw.store.set(`${CACHE_PREFIX}v1`, new Map());
    sw.store.set(`${CACHE_PREFIX}v0`, new Map());
    sw.store.set(sw.cacheName, new Map());
    sw.store.set('someone-elses-cache', new Map());
    await sw.lifecycle('activate');
    expect([...sw.store.keys()].sort()).toEqual([sw.cacheName, 'someone-elses-cache'].sort());
    expect(sw.claim).toHaveBeenCalledOnce();
  });

  describe('fetch', () => {
    async function installed(opts: Parameters<typeof boot>[0] = {}) {
      const sw = boot(opts);
      for (const f of ['', ...FILES]) sw.serve(f, `v2:${f}`);
      await sw.lifecycle('install');
      sw.fetchFn.mockClear();
      return sw;
    }

    it('ignores non-GET and cross-origin requests', async () => {
      const sw = await installed();
      expect(await sw.request(`${BASE}index.html`, { method: 'POST' })).toBe('passthrough');
      expect(await sw.request('https://elsewhere.test/x.js')).toBe('passthrough');
    });

    it('serves assets cache-first without touching the network', async () => {
      const sw = await installed();
      expect(await sw.request(`${BASE}assets/app-1a2b.js`)).toEqual(res('v2:assets/app-1a2b.js'));
      expect(await sw.request(`${BASE}assets/worker-9z.js`)).toEqual(res('v2:assets/worker-9z.js'));
      expect(await sw.request(`${BASE}assets/app-1a2b.js?x=1`)).toEqual(res('v2:assets/app-1a2b.js'));
      expect(sw.fetchFn).not.toHaveBeenCalled();
    });

    it('an asset missing from the cache comes from the network and is not stored', async () => {
      const sw = await installed();
      sw.serve('assets/other.js', 'net');
      expect(await sw.request(`${BASE}assets/other.js`)).toEqual(res('net'));
      expect(sw.store.get(sw.cacheName)!.has(`${BASE}assets/other.js`)).toBe(false);
    });

    it('navigations are network-first: a newer page wins when online', async () => {
      const sw = await installed();
      sw.serve('', 'v3:index');
      expect(await sw.request(BASE, { mode: 'navigate' })).toEqual(res('v3:index'));
      // ...and the cache was not overwritten with it (it would not match the cached assets)
      expect(sw.store.get(sw.cacheName)!.get(BASE)).toEqual(res('v2:'));
    });

    it('navigation fetches revalidate instead of trusting the HTTP cache', async () => {
      const sw = await installed();
      sw.serve('', 'fresh');
      await sw.request(BASE, { mode: 'navigate' });
      expect(sw.fetchFn).toHaveBeenCalledOnce();
      expect(sw.fetchFn.mock.calls[0]![1]).toEqual({ cache: 'no-cache' });
    });

    it('navigations fall back to the cached page when offline', async () => {
      const sw = await installed();
      sw.network.clear();
      expect(await sw.request(`${BASE}?utm=1`, { mode: 'navigate' })).toEqual(res('v2:index.html'));
    });

    it('navigations fall back to the cache on a server error but pass client errors through', async () => {
      const sw = await installed();
      sw.serve('', 'oops', 503);
      expect(await sw.request(BASE, { mode: 'navigate' })).toEqual(res('v2:index.html'));
      sw.serve('', 'gone', 404);
      expect(await sw.request(BASE, { mode: 'navigate' })).toEqual(res('gone', 404));
    });

    it('navigations fall back to the cache when the network is too slow', async () => {
      const timers: (() => void)[] = [];
      const sw = await installed({ setTimeoutImpl: (fn) => (timers.push(fn), timers.length) });
      sw.useFetch(() => new Promise<Res>(() => undefined)); // connected but never answers
      const pending = sw.request(BASE, { mode: 'navigate' });
      await Promise.resolve();
      timers.at(-1)!();
      expect(await pending).toEqual(res('v2:index.html'));
    });

    it('a navigation with nothing cached and no network fails (browser offline page)', async () => {
      const sw = boot();
      await expect(sw.request(BASE, { mode: 'navigate' })).rejects.toThrow();
    });
  });
});
