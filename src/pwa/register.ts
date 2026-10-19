/** The subset of the browser the registration touches (lets tests inject fakes). */
export interface RegisterEnv {
  /** True only in production builds. */
  prod: boolean;
  nav: { serviceWorker?: { register(url: string, options?: { scope?: string }): Promise<unknown> } } | undefined;
  win: { addEventListener(type: 'load', listener: () => void, options?: { once?: boolean }): void } | undefined;
  doc: { readyState: string } | undefined;
}

/**
 * Register `./sw.js` (relative, so it also works from a sub-path such as /sudoku-vibes/) once the
 * page has loaded. Does nothing outside production builds or where service workers are missing;
 * every failure is swallowed because the game never depends on the worker.
 */
export function registerServiceWorker(
  env: RegisterEnv = {
    prod: import.meta.env.PROD,
    nav: typeof navigator === 'undefined' ? undefined : navigator,
    win: typeof window === 'undefined' ? undefined : window,
    doc: typeof document === 'undefined' ? undefined : document,
  },
): void {
  try {
    const sw = env.nav?.serviceWorker;
    if (!env.prod || !sw || !env.win || !env.doc) return;
    const register = (): void => {
      try {
        sw.register('./sw.js', { scope: './' }).catch(() => undefined);
      } catch {
        /* unsupported or blocked: play without it */
      }
    };
    if (env.doc.readyState === 'complete') register();
    else env.win.addEventListener('load', register, { once: true });
  } catch {
    /* ignore */
  }
}
