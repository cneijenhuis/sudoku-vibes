import { generatePuzzleAsync, disposeGenerator } from '../generator/client';
import { createSaves } from '../storage/save';
import { applyBackgroundWhenLoaded, pickBackground, type Background } from '../theme/backgrounds';
import { gameScreen } from './game';
import { haptics } from './haptics';
import { syncHistory } from './history';
import { menuScreen } from './menu';
import { resultsScreen } from './results';
import { bindScreens, createRouter, type AppState, type MountedScreen, type Router } from './router';
import { errorScreen, loadingScreen } from './status';

const saves = createSaves();

function buildScreen(state: AppState, router: Router): MountedScreen<HTMLElement> {
  const toMenu = () => router.navigate({ screen: 'menu' });
  switch (state.screen) {
    case 'menu':
      return menuScreen({ saved: saves.load(), onChoose: (d) => router.startGame(d), onResume: (s) => router.resumeGame(s), haptics });
    case 'loading':
      return loadingScreen(state.difficulty, () => router.cancel());
    case 'error':
      return errorScreen(state.difficulty, state.message, () => router.startGame(state.difficulty), toMenu);
    case 'game':
      return gameScreen(
        { game: state.game, resume: state.resume },
        {
          onQuit: toMenu,
          onComplete: ({ elapsedMs, mistakes, lastDigit }) => {
            saves.clear(); // a finished game is never resumable
            router.navigate({ screen: 'results', game: state.game, elapsedMs, mistakes, lastDigit });
          },
          onSave: (game, elapsedMs) => saves.save(game, state.game.difficulty, elapsedMs),
        },
      );
    case 'results':
      return resultsScreen(state.game, state.elapsedMs, state.mistakes, state.lastDigit, {
        onSame: (d) => router.startGame(d),
        onNext: (d) => router.startGame(d),
        onMenu: toMenu,
      });
  }
}

/**
 * Pick a fresh background for every new game (menu, results, error retry) and show it once the game
 * appears, so cancelling the loading screen, resuming and the menu keep the current one.
 */
function watchNewGames(router: Router, initial?: Background): void {
  let shown = initial;
  let pending: Background | undefined;
  let previous = router.state.screen;
  router.subscribe((state) => {
    if (state.screen === 'loading') {
      if (previous !== 'loading') pending = pickBackground(undefined, undefined, shown?.id);
    } else if (state.screen === 'game' && pending) {
      const next = pending;
      pending = undefined;
      shown = next;
      void applyBackgroundWhenLoaded(next, () => shown === next);
    } else {
      pending = undefined;
    }
    previous = state.screen;
  });
}

/** Create the real router (backed by the worker) and render it into `root`. */
export function startApp(root: HTMLElement, initialBackground?: Background): Router {
  const router = createRouter({ generate: generatePuzzleAsync, cancelGeneration: disposeGenerator });
  bindScreens(router, (s) => buildScreen(s, router), (el) => root.replaceChildren(el));
  watchNewGames(router, initialBackground);
  syncHistory(router, window.history, window);
  return router;
}
