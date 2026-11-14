import type { KeyValue } from '../storage/kv';

/** The game screen's background: the beach photo, or a plain light or dark backdrop. */
export type Scene = 'photo' | 'light' | 'dark';

export const SCENES: readonly Scene[] = ['photo', 'light', 'dark'];
export const SCENE_KEY = 'sudoku-vibes:background';

/** The browser chrome colour while the photo shows (matches index.html and the manifest). */
export const PHOTO_THEME_COLOR = '#F6E9D2';
/** The chrome colour of each plain scene (the same colour as the page behind the board). */
export const SCENE_THEME_COLOR: Record<'light' | 'dark', string> = { light: '#F4F1EA', dark: '#0F151D' };

/** photo -> light -> dark -> photo. */
export function nextScene(scene: Scene): Scene {
  return SCENES[(SCENES.indexOf(scene) + 1) % SCENES.length] ?? 'photo';
}

export function isScene(value: unknown): value is Scene {
  return typeof value === 'string' && (SCENES as readonly string[]).includes(value);
}

/** The stored scene; a missing, unknown or unreadable value means the photo. */
export function loadScene(kv: KeyValue): Scene {
  const raw = kv.get(SCENE_KEY);
  return isScene(raw) ? raw : 'photo';
}

export function saveScene(kv: KeyValue, scene: Scene): void {
  kv.set(SCENE_KEY, scene);
}

/** The accessible name of the background button: it names the current mode. */
export function sceneLabel(scene: Scene): string {
  return `Background: ${scene}`;
}

const SVG_OPEN =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

/** Icons showing the current mode: a picture frame, a sun and a moon. Static markup. */
export const SCENE_ICONS: Record<Scene, string> = {
  photo: `${SVG_OPEN}<rect x="3" y="4.5" width="18" height="15" rx="3"/><circle cx="15.5" cy="9.5" r="1.6"/><path d="M3.5 17l5-5 4 4 2.5-2.5 5 5"/></svg>`,
  light: `${SVG_OPEN}<circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/></svg>`,
  dark: `${SVG_OPEN}<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/></svg>`,
};

/** What `applyScene` touches; the defaults are the real document. */
export interface SceneTarget {
  root: { dataset: DOMStringMap };
  meta: { content: string } | null;
}

function documentTarget(): SceneTarget {
  return {
    root: document.documentElement,
    meta: document.querySelector<HTMLMetaElement>('meta[name="theme-color"]'),
  };
}

/**
 * Show `scene` behind the game screen: `data-scene` on `<html>` (absent for the photo, so the photo
 * CSS is untouched) and the browser chrome colour. `null` restores everything for the other screens.
 */
export function applyScene(scene: Scene | null, target: SceneTarget = documentTarget()): void {
  if (scene === null || scene === 'photo') {
    delete target.root.dataset.scene;
    if (target.meta) target.meta.content = PHOTO_THEME_COLOR;
    return;
  }
  target.root.dataset.scene = scene;
  if (target.meta) target.meta.content = SCENE_THEME_COLOR[scene];
}
