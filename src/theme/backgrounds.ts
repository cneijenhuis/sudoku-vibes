import beachDay from '../assets/backgrounds/beach-day.webp';

/** One selectable full-screen background. Adding another is a new image file plus an entry below. */
export interface Background {
  id: string;
  /** Built URL of the image (hashed by the bundler, so it is precached by the service worker). */
  image: string;
  /** Plain colour shown while the image loads or if it fails; also the browser chrome colour. */
  fallback: string;
  /** CSS `background-position` (the focal point kept in view when the image is cropped to cover). */
  position: string;
}

/**
 * Every background the app can show. `index.html` preloads the first entry; if you add more and
 * pick randomly, only that first one benefits from the preload (the others load on demand).
 */
export const BACKGROUNDS: readonly Background[] = [
  {
    id: 'beach-day',
    image: beachDay,
    fallback: '#F6E9D2',
    // The inflatable 7 and the chair sit just left of centre; keep them behind the board on portrait phones.
    position: '44% 50%',
  },
];

/** Choose the background for this page load (`random` is injectable for tests). */
export function pickBackground(list: readonly Background[] = BACKGROUNDS, random: () => number = Math.random): Background {
  const i = Math.min(list.length - 1, Math.floor(random() * list.length));
  const picked = list[i];
  if (!picked) throw new Error('no backgrounds configured');
  return picked;
}

/** Expose the chosen background to the stylesheet as custom properties on `<html>`. */
export function applyBackground(bg: Background, root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--bg-image', `url("${bg.image}")`);
  root.style.setProperty('--bg-position', bg.position);
  root.style.setProperty('--fallback-bg', bg.fallback);
}
