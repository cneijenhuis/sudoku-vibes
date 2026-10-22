/**
 * iOS home-screen (standalone) mode reports a layout viewport shorter than the screen (innerHeight 793
 * against outerHeight 852 on an iPhone 15 Pro): fixed layers stop at the short edge, but the page canvas
 * paints the full screen. So the photo lives on the root element's background, and in that situation
 * the root element is made as tall as the screen so `cover` sizes the photo to the whole canvas.
 */
export interface CanvasEnv {
  innerHeight: number;
  outerHeight: number;
  standalone: boolean;
}

/** The height (px) the root element should have, or null to keep the normal viewport height. */
export function canvasHeight({ innerHeight, outerHeight, standalone }: CanvasEnv): number | null {
  if (!standalone) return null;
  const extra = outerHeight - innerHeight;
  return extra > 0 && extra <= 120 ? outerHeight : null;
}

function isStandalone(win: Window): boolean {
  const nav = win.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || win.matchMedia('(display-mode: standalone)').matches;
}

export function syncCanvas(win: Window = window, root: HTMLElement = win.document.documentElement): void {
  const h = canvasHeight({ innerHeight: win.innerHeight, outerHeight: win.outerHeight, standalone: isStandalone(win) });
  if (h === null) root.style.removeProperty('--canvas-h');
  else root.style.setProperty('--canvas-h', `${h}px`);
}

/** Apply now and whenever the window changes size or orientation. */
export function watchCanvas(win: Window = window): void {
  syncCanvas(win);
  win.addEventListener('resize', () => syncCanvas(win));
  win.addEventListener('orientationchange', () => syncCanvas(win));
}
