// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { Difficulty } from '../engine/grading';
import { Disposed, Superseded } from '../generator/client';
import type { GeneratedPuzzle } from '../generator/generate';
import { bindScreens, createRouter, type AppState } from './router';

const puzzle = (difficulty: Difficulty): GeneratedPuzzle => ({
  puzzle: '0'.repeat(81),
  solution: '1'.repeat(81),
  difficulty,
  exact: true,
});

interface Req {
  difficulty: Difficulty;
  resolve: (p: GeneratedPuzzle) => void;
  reject: (e: Error) => void;
}

function setup() {
  const reqs: Req[] = [];
  const cancelGeneration = vi.fn();
  const generate = vi.fn(
    (difficulty: Difficulty) =>
      new Promise<GeneratedPuzzle>((resolve, reject) => reqs.push({ difficulty, resolve, reject })),
  );
  const router = createRouter({ generate, cancelGeneration });
  return { router, reqs, generate, cancelGeneration };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('router', () => {
  it('exit leaves loading (cancelling), game, results and error for the menu; no-op on the menu', async () => {
    const a = setup();
    a.router.exit();
    expect(a.router.state).toEqual({ screen: 'menu' });
    expect(a.cancelGeneration).not.toHaveBeenCalled();
    a.router.startGame(Difficulty.Easy);
    a.router.exit();
    expect(a.router.state).toEqual({ screen: 'menu' });
    expect(a.cancelGeneration).toHaveBeenCalledOnce();
    for (const s of [
      { screen: 'game', game: puzzle(Difficulty.Easy) },
      { screen: 'results', game: puzzle(Difficulty.Easy), elapsedMs: 1, mistakes: 0 },
      { screen: 'error', difficulty: Difficulty.Easy, message: 'x' },
    ] as AppState[]) {
      a.router.navigate(s);
      a.router.exit();
      expect(a.router.state).toEqual({ screen: 'menu' });
    }
  });

  it('resumeGame opens the saved game with its resume payload, only from the menu', () => {
    const { router, generate } = setup();
    const saved = {
      puzzle: '0'.repeat(81),
      solution: '1'.repeat(81),
      difficulty: Difficulty.Hard,
      moves: [] as [number, number][],
      mistakes: 2,
      elapsedMs: 5000,
      savedAt: 1,
    };
    router.resumeGame(saved);
    expect(router.state).toMatchObject({ screen: 'game', resume: saved, game: { puzzle: saved.puzzle, difficulty: Difficulty.Hard } });
    const before = router.state;
    router.resumeGame({ ...saved, mistakes: 9 });
    expect(router.state).toBe(before);
    expect(generate).not.toHaveBeenCalled();
  });

  it('starts on the menu', () => {
    expect(setup().router.state).toEqual({ screen: 'menu' });
  });

  it('goes loading then game on success', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Hard);
    expect(router.state).toEqual({ screen: 'loading', difficulty: Difficulty.Hard });
    const p = puzzle(Difficulty.Hard);
    reqs[0]!.resolve(p);
    await flush();
    expect(router.state).toEqual({ screen: 'game', game: p });
  });

  it('cancel returns to the menu and a late result is ignored', async () => {
    const { router, reqs, cancelGeneration } = setup();
    router.startGame(Difficulty.Easy);
    router.cancel();
    expect(router.state).toEqual({ screen: 'menu' });
    expect(cancelGeneration).toHaveBeenCalledOnce();
    reqs[0]!.resolve(puzzle(Difficulty.Easy));
    await flush();
    expect(router.state).toEqual({ screen: 'menu' });
  });

  it('cancel followed by a Disposed rejection stays on the menu', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Easy);
    router.cancel();
    reqs[0]!.reject(new Disposed());
    await flush();
    expect(router.state).toEqual({ screen: 'menu' });
  });

  it('cancel is a no-op outside loading', () => {
    const { router, cancelGeneration } = setup();
    router.cancel();
    expect(cancelGeneration).not.toHaveBeenCalled();
  });

  it('error then retry with the same difficulty', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Extreme);
    reqs[0]!.reject(new Error('boom'));
    await flush();
    expect(router.state).toEqual({ screen: 'error', difficulty: Difficulty.Extreme, message: 'boom' });
    router.startGame(Difficulty.Extreme);
    expect(router.state.screen).toBe('loading');
    expect(reqs).toHaveLength(2);
    expect(reqs[1]!.difficulty).toBe(Difficulty.Extreme);
    reqs[1]!.resolve(puzzle(Difficulty.Extreme));
    await flush();
    expect(router.state.screen).toBe('game');
  });

  it('non-Error rejections become an error message', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Easy);
    reqs[0]!.reject('weird' as unknown as Error);
    await flush();
    expect(router.state).toMatchObject({ screen: 'error', message: 'weird' });
  });

  it('rapid double start only starts one game, at the first difficulty', async () => {
    const { router, reqs, generate } = setup();
    router.startGame(Difficulty.Easy);
    router.startGame(Difficulty.Hard);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(router.state).toEqual({ screen: 'loading', difficulty: Difficulty.Easy });
    reqs[0]!.resolve(puzzle(Difficulty.Easy));
    await flush();
    expect(router.state).toMatchObject({ screen: 'game', game: { difficulty: Difficulty.Easy } });
  });

  it('swallows Superseded rejections without changing screen (vitest fails the run on unhandled rejections)', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Easy);
    reqs[0]!.reject(new Superseded());
    await flush();
    expect(router.state).toEqual({ screen: 'loading', difficulty: Difficulty.Easy });
  });

  it('ignores a stale result from an earlier request after cancel and restart', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Easy);
    router.cancel();
    router.startGame(Difficulty.Hard);
    reqs[0]!.resolve(puzzle(Difficulty.Easy));
    await flush();
    expect(router.state).toEqual({ screen: 'loading', difficulty: Difficulty.Hard });
    reqs[1]!.resolve(puzzle(Difficulty.Hard));
    await flush();
    expect(router.state).toMatchObject({ screen: 'game', game: { difficulty: Difficulty.Hard } });
  });

  it('back to menu from the game', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Easy);
    reqs[0]!.resolve(puzzle(Difficulty.Easy));
    await flush();
    router.navigate({ screen: 'menu' });
    expect(router.state).toEqual({ screen: 'menu' });
  });

  it('completing a game navigates to results carrying time and mistakes', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Easy);
    const p = puzzle(Difficulty.Easy);
    reqs[0]!.resolve(p);
    await flush();
    router.navigate({ screen: 'results', game: p, elapsedMs: 65_000, mistakes: 2 });
    expect(router.state).toEqual({ screen: 'results', game: p, elapsedMs: 65_000, mistakes: 2 });
    router.navigate({ screen: 'menu' });
    expect(router.state).toEqual({ screen: 'menu' });
  });

  it('a result arriving after navigating away from loading is ignored', async () => {
    const { router, reqs } = setup();
    router.startGame(Difficulty.Easy);
    router.navigate({ screen: 'menu' });
    reqs[0]!.resolve(puzzle(Difficulty.Easy));
    await flush();
    expect(router.state).toEqual({ screen: 'menu' });
  });
});

describe('bindScreens', () => {
  it('disposes the previous screen before showing the next, and on teardown', () => {
    const { router } = setup();
    const log: string[] = [];
    const off = bindScreens<string>(
      router,
      (s: AppState) => ({ el: s.screen, dispose: () => log.push(`dispose ${s.screen}`) }),
      (el) => log.push(`show ${el}`),
    );
    router.startGame(Difficulty.Easy);
    expect(log).toEqual(['show menu', 'dispose menu', 'show loading']);
    off();
    expect(log.at(-1)).toBe('dispose loading');
    router.navigate({ screen: 'menu' });
    expect(log.at(-1)).toBe('dispose loading');
  });

  it('disposes the game screen when the game completes or is quit', () => {
    const { router } = setup();
    const p = puzzle(Difficulty.Easy);
    const log: string[] = [];
    bindScreens<string>(
      router,
      (s: AppState) => ({ el: s.screen, dispose: () => log.push(`dispose ${s.screen}`) }),
      () => {},
    );
    router.navigate({ screen: 'game', game: p });
    router.navigate({ screen: 'results', game: p, elapsedMs: 1000, mistakes: 0 });
    router.navigate({ screen: 'game', game: p });
    router.navigate({ screen: 'menu' });
    expect(log).toEqual(['dispose menu', 'dispose game', 'dispose results', 'dispose game']);
  });
});
