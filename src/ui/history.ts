import type { Router } from './router';

/** The subset of `History` the sync uses (lets tests inject a fake). */
export interface HistoryLike {
  readonly state: unknown;
  pushState(data: unknown, unused: string): void;
  replaceState(data: unknown, unused: string): void;
  back(): void;
}

/** The subset of `Window` the sync uses. */
export interface PopstateTarget {
  addEventListener(type: 'popstate', listener: () => void): void;
  removeEventListener(type: 'popstate', listener: () => void): void;
}

const MARKER = { sudokuVibes: 'screen' } as const;
/** If the popstate for our own `history.back()` has not arrived by now, stop waiting for it. */
const BACK_TIMEOUT_MS = 800;

const isMarker = (state: unknown): boolean =>
  typeof state === 'object' && state !== null && (state as { sudokuVibes?: unknown }).sudokuVibes === 'screen';

/**
 * Make the browser/Android Back button leave the loading, error, game and results screens for the
 * menu instead of leaving the app, without leaving history clutter.
 *
 * There is at most one extra "marker" history entry, pushed when the app goes from the menu to
 * any other screen. Moving between non-menu screens replaces that entry; returning to the menu
 * in-app pops it with `history.back()`. A Back press that lands off the marker is routed to
 * `router.exit()`. Reloading never keeps a marker (the app always starts on the menu).
 * Returns a function that stops the sync.
 */
export function syncHistory(router: Router, history: HistoryLike, win: PopstateTarget): () => void {
  /** The current history entry is our marker entry. */
  let marker = false;
  /** We called `history.back()` ourselves and are waiting for its popstate. */
  let pendingBack = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  // A reload (or restored session) can land on a stale marker entry; make it a plain entry.
  if (isMarker(history.state)) history.replaceState(null, '');

  const clearTimer = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  function reconcile(): void {
    if (pendingBack) return; // settled when the pending popstate arrives
    if (router.state.screen !== 'menu') {
      if (marker) {
        history.replaceState(MARKER, '');
      } else {
        history.pushState(MARKER, '');
        marker = true;
      }
    } else if (marker) {
      pendingBack = true;
      timer = setTimeout(() => {
        timer = null;
        pendingBack = false;
        marker = isMarker(history.state);
        reconcile();
      }, BACK_TIMEOUT_MS);
      history.back();
    }
  }

  function onPopstate(): void {
    if (pendingBack) {
      clearTimer();
      pendingBack = false;
      marker = false;
      reconcile(); // the player may have started another screen meanwhile
      return;
    }
    const onMarker = isMarker(history.state);
    if (marker && !onMarker) {
      marker = false; // the player pressed Back
      router.exit();
    } else if (!marker && onMarker) {
      marker = true; // Forward onto the stale marker: the menu is showing, so bounce back
      reconcile();
    }
  }

  win.addEventListener('popstate', onPopstate);
  const off = router.subscribe(reconcile);
  return () => {
    off();
    clearTimer();
    win.removeEventListener('popstate', onPopstate);
  };
}
