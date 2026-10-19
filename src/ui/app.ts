import { generatePuzzleAsync, disposeGenerator } from '../generator/client';
import { gameScreen } from './game';
import { menuScreen } from './menu';
import { bindScreens, createRouter, type AppState, type MountedScreen, type Router } from './router';
import { errorScreen, loadingScreen } from './status';

function buildScreen(state: AppState, router: Router): MountedScreen<HTMLElement> {
  const toMenu = () => router.navigate({ screen: 'menu' });
  switch (state.screen) {
    case 'menu':
      return menuScreen((d) => router.startGame(d));
    case 'loading':
      return loadingScreen(state.difficulty, () => router.cancel());
    case 'error':
      return errorScreen(state.difficulty, state.message, () => router.startGame(state.difficulty), toMenu);
    case 'game':
    case 'results': // results screen arrives in a later change; show the game placeholder meanwhile
      return gameScreen(state.game, toMenu);
  }
}

/** Create the real router (backed by the worker) and render it into `root`. */
export function startApp(root: HTMLElement): Router {
  const router = createRouter({ generate: generatePuzzleAsync, cancelGeneration: disposeGenerator });
  bindScreens(router, (s) => buildScreen(s, router), (el) => root.replaceChildren(el));
  return router;
}
