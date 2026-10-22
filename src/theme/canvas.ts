/**
 * iOS home-screen (standalone) mode reports a layout viewport shorter than the screen (innerHeight 793
 * against a screen height of 852 on an iPhone 15 Pro): fixed layers stop at the short edge, but the page
 * canvas paints the whole screen. So the photo lives on the root element's background, and in that
 * situation the root element is made as tall as the screen so `cover` sizes the photo to the whole canvas.
 *
 * The viewport only shrinks some time after launch and no resize event announces it, so the check is
 * repeated on several events and a few timers right after load.
 */
export interface CanvasEnv {
  innerWidth: number;
  innerHeight: number;
  outerHeight: number;
  screenWidth: number;
  screenHeight: number;
  standalone: boolean;
}

/** The height (px) the root element should have, or null to keep the normal viewport height. */
export function canvasHeight(env: CanvasEnv): number | null {
  if (!env.standalone) return null;
  // iOS reports screen dimensions in portrait terms; pick the side matching the current orientation.
  const landscape = env.innerWidth > env.innerHeight;
  const long = Math.max(env.screenWidth, env.screenHeight);
  const short = Math.min(env.screenWidth, env.screenHeight);
  const target = Math.max(env.outerHeight, landscape ? short : long);
  const extra = target - env.innerHeight;
  return extra > 0 && extra <= 120 ? target : null;
}

function isStandalone(win: Window): boolean {
  const nav = win.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || win.matchMedia('(display-mode: standalone)').matches;
}

export function syncCanvas(win: Window = window, root: HTMLElement = win.document.documentElement): void {
  const h = canvasHeight({
    innerWidth: win.innerWidth,
    innerHeight: win.innerHeight,
    outerHeight: win.outerHeight,
    screenWidth: win.screen.width,
    screenHeight: win.screen.height,
    standalone: isStandalone(win),
  });
  if (h === null) root.style.removeProperty('--canvas-h');
  else root.style.setProperty('--canvas-h', `${h}px`);
}

const RETRY_MS = [0, 50, 150, 400, 1000, 2500];

/** Apply now, shortly after load, and whenever the window, visibility or orientation changes. */
export function watchCanvas(win: Window = window): void {
  const sync = (): void => syncCanvas(win);
  for (const ms of RETRY_MS) win.setTimeout(sync, ms);
  for (const type of ['resize', 'orientationchange', 'pageshow', 'focus', 'load']) win.addEventListener(type, sync);
  win.document.addEventListener('visibilitychange', sync);
  win.addEventListener('pointerdown', sync, { passive: true });
  win.visualViewport?.addEventListener('resize', sync);
}
