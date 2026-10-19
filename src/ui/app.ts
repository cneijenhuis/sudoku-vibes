import { generatePuzzleAsync, disposeGenerator } from '../generator/client';
import { createSaves } from '../storage/save';
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
          onComplete: ({ elapsedMs, mistakes }) => {
            saves.clear(); // a finished game is never resumable
            router.navigate({ screen: 'results', game: state.game, elapsedMs, mistakes });
          },
          onSave: (game, elapsedMs) => saves.save(game, state.game.difficulty, elapsedMs),
        },
      );
    case 'results':
      return resultsScreen(state.game, state.elapsedMs, state.mistakes, {
        onSame: (d) => router.startGame(d),
        onNext: (d) => router.startGame(d),
        onMenu: toMenu,
      });
  }
}

/** Create the real router (backed by the worker) and render it into `root`. */
export function startApp(root: HTMLElement): Router {
  const router = createRouter({ generate: generatePuzzleAsync, cancelGeneration: disposeGenerator });
  bindScreens(router, (s) => buildScreen(s, router), (el) => root.replaceChildren(el));
  syncHistory(router, window.history, window);
  return router;
}
