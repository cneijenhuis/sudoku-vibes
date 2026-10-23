import beachDay from '../assets/backgrounds/beach-day.webp';
import beachVolleyball from '../assets/backgrounds/beach-volleyball.webp';
import surfFive from '../assets/backgrounds/surf-five.webp';

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

/** Every background the app can show. The service worker precaches all of them, so switching works offline. */
export const BACKGROUNDS: readonly Background[] = [
  {
    id: 'beach-day',
    image: beachDay,
    fallback: '#F6E9D2',
    // The inflatable 7 and the chair sit just left of centre; keep them behind the board on portrait phones.
    position: '44% 50%',
  },
  // The inflatable 5 sits in the middle of the square image.
  { id: 'surf-five', image: surfFive, fallback: '#F6E9D2', position: '50% 50%' },
  // The inflatable 8 is left of centre; a portrait phone shows under half of the image's width.
  { id: 'beach-volleyball', image: beachVolleyball, fallback: '#F6E9D2', position: '38% 50%' },
];

/**
 * Choose a background (`random` is injectable for tests). With several entries the one whose id is
 * `exclude` is never returned, so consecutive games look different.
 */
export function pickBackground(
  list: readonly Background[] = BACKGROUNDS,
  random: () => number = Math.random,
  exclude?: string,
): Background {
  const pool = list.length > 1 && exclude !== undefined ? list.filter((b) => b.id !== exclude) : list;
  const picked = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  if (!picked) throw new Error('no backgrounds configured');
  return picked;
}

/** Expose the chosen background to the stylesheet as custom properties on `<html>`. */
export function applyBackground(bg: Background, root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--bg-image', `url("${bg.image}")`);
  root.style.setProperty('--bg-position', bg.position);
  root.style.setProperty('--fallback-bg', bg.fallback);
}

/**
 * Apply `bg` once its image has decoded (or failed, then anyway) so the swap never shows the fallback
 * colour. `isCurrent` lets a caller drop a swap that a newer pick has overtaken. `decode` is injectable for tests.
 */
export async function applyBackgroundWhenLoaded(
  bg: Background,
  isCurrent: () => boolean = () => true,
  root: HTMLElement = document.documentElement,
  decode: (url: string) => Promise<unknown> = decodeImage,
): Promise<void> {
  try {
    await decode(bg.image);
  } catch {
    // apply anyway: the fallback colour covers a broken image
  }
  if (isCurrent()) applyBackground(bg, root);
}

function decodeImage(url: string): Promise<void> {
  const img = new Image();
  img.src = url;
  return img.decode();
}
