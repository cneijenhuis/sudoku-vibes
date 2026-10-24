import type { Difficulty } from '../engine/grading';
import { Disposed, Superseded } from '../generator/client';
import type { GeneratedPuzzle } from '../generator/generate';
import type { SavedGame } from '../storage/save';

/** Every screen the app can show. */
export type AppState =
  | { screen: 'menu' }
  | { screen: 'loading'; difficulty: Difficulty }
  | { screen: 'error'; difficulty: Difficulty; message: string }
  | { screen: 'game'; game: GeneratedPuzzle; resume?: SavedGame }
  | { screen: 'results'; game: GeneratedPuzzle; elapsedMs: number; mistakes: number; lastDigit: number };

export interface RouterDeps {
  generate: (difficulty: Difficulty) => Promise<GeneratedPuzzle>;
  /** Abort any in-flight generation (rejects it with `Disposed`). */
  cancelGeneration: () => void;
}

export interface Router {
  readonly state: AppState;
  /** The single entry point for changing screens. */
  navigate(state: AppState): void;
  /** Request a puzzle and go loading -> game (or error). Ignored while already loading. */
  startGame(difficulty: Difficulty): void;
  /** Open a saved game (paused). Only acts from the menu. */
  resumeGame(saved: SavedGame): void;
  /** Abort loading and return to the menu; no game starts from the cancelled request. */
  cancel(): void;
  /** Leave whatever screen is showing for the menu (cancelling generation when loading). No-op on the menu. */
  exit(): void;
  /** Called after every state change; returns an unsubscribe function. */
  subscribe(listener: (state: AppState) => void): () => void;
}

export function createRouter(deps: RouterDeps): Router {
  let state: AppState = { screen: 'menu' };
  let token = 0;
  const listeners = new Set<(s: AppState) => void>();

  function navigate(next: AppState): void {
    // Leaving the loading screen by any route invalidates its request.
    if (state.screen === 'loading' && next.screen !== 'loading') token++;
    state = next;
    for (const l of [...listeners]) l(state);
  }

  function startGame(difficulty: Difficulty): void {
    if (state.screen === 'loading') return; // double-tap protection
    const mine = ++token;
    navigate({ screen: 'loading', difficulty });
    // `navigate` leaves token alone when entering loading, so `mine` is current.
    deps.generate(difficulty).then(
      (game) => {
        if (mine === token && state.screen === 'loading') navigate({ screen: 'game', game });
      },
      (err: unknown) => {
        if (err instanceof Superseded || err instanceof Disposed) return;
        if (mine !== token || state.screen !== 'loading') return;
        navigate({ screen: 'error', difficulty, message: err instanceof Error ? err.message : String(err) });
      },
    );
  }

  function resumeGame(saved: SavedGame): void {
    if (state.screen !== 'menu') return;
    const game: GeneratedPuzzle = { puzzle: saved.puzzle, solution: saved.solution, difficulty: saved.difficulty, exact: true };
    navigate({ screen: 'game', game, resume: saved });
  }

  function cancel(): void {
    if (state.screen !== 'loading') return;
    navigate({ screen: 'menu' }); // bumps the token first, so late results are ignored
    deps.cancelGeneration();
  }

  function exit(): void {
    if (state.screen === 'loading') cancel();
    else if (state.screen !== 'menu') navigate({ screen: 'menu' });
  }

  return {
    get state() {
      return state;
    },
    navigate,
    startGame,
    resumeGame,
    cancel,
    exit,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** A mounted screen: its root element plus cleanup for timers/handlers it owns. */
export interface MountedScreen<E> {
  el: E;
  dispose?: () => void;
}

/**
 * Render the router's current screen via `build`, disposing the previous screen
 * before showing the next. DOM-agnostic so it can be unit-tested.
 */
export function bindScreens<E>(
  router: Router,
  build: (state: AppState) => MountedScreen<E>,
  show: (el: E) => void,
): () => void {
  let current: MountedScreen<E> | null = null;
  const render = (state: AppState): void => {
    current?.dispose?.();
    current = build(state);
    show(current.el);
  };
  render(router.state);
  const off = router.subscribe(render);
  return () => {
    off();
    current?.dispose?.();
    current = null;
  };
}
