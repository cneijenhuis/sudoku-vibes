// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Difficulty } from '../engine/grading';
import type { GeneratedPuzzle } from '../generator/generate';
import { syncHistory, type HistoryLike } from './history';
import { createRouter, type Router } from './router';

const puzzle = (difficulty: Difficulty): GeneratedPuzzle => ({ puzzle: '0'.repeat(81), solution: '1'.repeat(81), difficulty, exact: true });

/** A browser session history: entries, a current index, and popstate delivered on `flush()`. */
class FakeBrowser implements HistoryLike {
  entries: unknown[] = [null];
  index = 0;
  /** True once a Back/`back()` went past the first entry (the page was left). */
  left = false;
  pushes = 0;
  replaces = 0;
  private listeners = new Set<() => void>();
  private queued = 0;
  get state(): unknown {
    return this.entries[this.index];
  }
  pushState(data: unknown): void {
    this.entries.splice(this.index + 1, Infinity, data);
    this.index++;
    this.pushes++;
  }
  replaceState(data: unknown): void {
    this.entries[this.index] = data;
    this.replaces++;
  }
  back(): void {
    this.queued--;
  }
  /** The player presses the Back button. */
  userBack(): void {
    this.queued--;
  }
  userForward(): void {
    this.queued++;
  }
  addEventListener(_t: 'popstate', l: () => void): void {
    this.listeners.add(l);
  }
  removeEventListener(_t: 'popstate', l: () => void): void {
    this.listeners.delete(l);
  }
  /** Run queued traversals, firing popstate for each (as the browser does asynchronously). */
  flush(): void {
    while (this.queued !== 0) {
      const step = this.queued < 0 ? -1 : 1;
      this.queued -= step;
      const next = this.index + step;
      if (next < 0) {
        this.left = true;
        return;
      }
      if (next >= this.entries.length) continue;
      this.index = next;
      for (const l of [...this.listeners]) l();
    }
  }
}

function setup(initial?: { state?: unknown }) {
  const browser = new FakeBrowser();
  if (initial) browser.entries = [initial.state];
  const cancelGeneration = vi.fn();
  const resolvers: ((p: GeneratedPuzzle) => void)[] = [];
  const router: Router = createRouter({
    generate: (d) =>
      new Promise<GeneratedPuzzle>((resolve) => {
        resolvers.push(() => resolve(puzzle(d)));
      }),
    cancelGeneration,
  });
  const stop = syncHistory(router, browser, browser);
  const settle = async (): Promise<void> => {
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
  };
  /** Menu -> loading -> game. */
  const startToGame = async (d = Difficulty.Easy): Promise<void> => {
    router.startGame(d);
    resolvers.shift()!(puzzle(d));
    await settle();
  };
  return { browser, router, stop, cancelGeneration, resolvers, settle, startToGame };
}

describe('history sync', () => {
  afterEach(() => vi.useRealTimers());

  it('does nothing while on the menu', () => {
    const { browser } = setup();
    expect(browser.entries).toEqual([null]);
    expect(browser.pushes + browser.replaces).toBe(0);
  });

  it('pushes one marker entry when leaving the menu', () => {
    const { browser, router } = setup();
    router.startGame(Difficulty.Easy);
    expect(browser.entries).toHaveLength(2);
    expect(browser.pushes).toBe(1);
    expect(browser.index).toBe(1);
  });

  it('loading -> game -> results -> loading -> game keeps a single marker entry', async () => {
    const { browser, router, resolvers, settle } = setup();
    router.startGame(Difficulty.Easy);
    resolvers.shift()!(puzzle(Difficulty.Easy));
    await settle();
    expect(router.state.screen).toBe('game');
    router.navigate({ screen: 'results', game: puzzle(Difficulty.Easy), elapsedMs: 1, mistakes: 0 });
    router.startGame(Difficulty.Easy);
    resolvers.shift()!(puzzle(Difficulty.Easy));
    await settle();
    expect(router.state.screen).toBe('game');
    expect(browser.pushes).toBe(1);
    expect(browser.entries).toHaveLength(2);
    expect(browser.index).toBe(1);
  });

  it('Back from the game goes to the menu and keeps the entry count at one extra', async () => {
    const { browser, router, startToGame } = setup();
    await startToGame();
    browser.userBack();
    browser.flush();
    expect(router.state).toEqual({ screen: 'menu' });
    expect(browser.index).toBe(0);
    expect(browser.left).toBe(false);
  });

  it('Back from loading cancels generation and shows the menu', () => {
    const { browser, router, cancelGeneration } = setup();
    router.startGame(Difficulty.Hard);
    browser.userBack();
    browser.flush();
    expect(router.state).toEqual({ screen: 'menu' });
    expect(cancelGeneration).toHaveBeenCalledOnce();
  });

  it('Back from results and from the error screen shows the menu', () => {
    const a = setup();
    a.router.startGame(Difficulty.Easy);
    a.router.navigate({ screen: 'results', game: puzzle(Difficulty.Easy), elapsedMs: 5, mistakes: 1 });
    a.browser.userBack();
    a.browser.flush();
    expect(a.router.state).toEqual({ screen: 'menu' });

    const b = setup();
    b.router.startGame(Difficulty.Easy);
    b.router.navigate({ screen: 'error', difficulty: Difficulty.Easy, message: 'x' });
    b.browser.userBack();
    b.browser.flush();
    expect(b.router.state).toEqual({ screen: 'menu' });
  });

  it('Back on the menu leaves the page (nothing intercepts it)', () => {
    const { browser, router } = setup();
    browser.userBack();
    browser.flush();
    expect(browser.left).toBe(true);
    expect(router.state).toEqual({ screen: 'menu' });
  });

  it('in-app return to the menu pops the marker so one Back leaves after three games', async () => {
    const { browser, router, startToGame, settle } = setup();
    for (let n = 0; n < 3; n++) {
      await startToGame();
      router.navigate({ screen: 'menu' });
      browser.flush();
      await settle();
      expect(browser.index).toBe(0);
      expect(router.state).toEqual({ screen: 'menu' });
    }
    expect(browser.pushes).toBe(3);
    browser.userBack();
    browser.flush();
    expect(browser.left).toBe(true);
  });

  it('three games chained via results then Menu need one Back to leave', async () => {
    const { browser, router, startToGame, settle } = setup();
    for (let n = 0; n < 3; n++) {
      await startToGame();
      router.navigate({ screen: 'results', game: puzzle(Difficulty.Easy), elapsedMs: 1, mistakes: 0 });
    }
    router.navigate({ screen: 'menu' });
    browser.flush();
    await settle();
    expect(browser.entries).toHaveLength(2);
    expect(browser.index).toBe(0);
    browser.userBack();
    browser.flush();
    expect(browser.left).toBe(true);
  });

  it('starting a game before the pending back settles re-pushes the marker afterwards', async () => {
    const { browser, router, startToGame, settle } = setup();
    await startToGame();
    router.navigate({ screen: 'menu' }); // back() queued, popstate not yet delivered
    router.startGame(Difficulty.Easy); // immediately another game
    expect(router.state.screen).toBe('loading');
    browser.flush();
    await settle();
    expect(browser.index).toBe(1);
    expect(browser.state).not.toBeNull();
    browser.userBack();
    browser.flush();
    expect(router.state).toEqual({ screen: 'menu' });
    expect(browser.index).toBe(0);
  });

  it('Forward onto a stale marker bounces back to the menu', () => {
    const { browser, router } = setup();
    router.startGame(Difficulty.Easy);
    browser.userBack();
    browser.flush(); // menu again, marker entry is ahead
    expect(router.state).toEqual({ screen: 'menu' });
    browser.userForward();
    browser.flush();
    expect(browser.index).toBe(0);
    expect(router.state).toEqual({ screen: 'menu' });
    expect(browser.left).toBe(false);
  });

  it('a page that starts on a stale marker entry clears it', () => {
    const { browser } = setup({ state: { sudokuVibes: 'screen' } });
    expect(browser.state).toBeNull();
  });

  it('retries when the popstate for our back() never comes', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { browser, router } = setup();
    router.startGame(Difficulty.Easy);
    const realBack = browser.back.bind(browser);
    let calls = 0;
    browser.back = () => {
      if (++calls > 1) realBack(); // the first call is dropped by the "browser"
    };
    router.navigate({ screen: 'menu' });
    expect(calls).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(calls).toBe(2); // gave up waiting and tried again
    browser.flush();
    expect(browser.index).toBe(0);
    router.startGame(Difficulty.Easy); // and the app can push a marker again
    expect(browser.index).toBe(1);
  });

  it('stop() detaches the listeners', () => {
    const { browser, router, stop } = setup();
    stop();
    router.startGame(Difficulty.Easy);
    expect(browser.entries).toHaveLength(1);
  });
});
