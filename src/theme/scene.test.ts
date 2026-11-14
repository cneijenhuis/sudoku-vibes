// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createKeyValue } from '../storage/kv';
import {
  PHOTO_THEME_COLOR,
  SCENES,
  SCENE_ICONS,
  SCENE_KEY,
  applyScene,
  loadScene,
  nextScene,
  saveScene,
  sceneLabel,
  type SceneTarget,
} from './scene';

const memoryKv = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return createKeyValue(() => ({
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }));
};

const target = (): SceneTarget => ({ root: { dataset: {} }, meta: { content: PHOTO_THEME_COLOR } });

describe('nextScene', () => {
  it('cycles photo, light, dark, photo', () => {
    expect(nextScene('photo')).toBe('light');
    expect(nextScene('light')).toBe('dark');
    expect(nextScene('dark')).toBe('photo');
  });
});

describe('loadScene / saveScene', () => {
  it('defaults to the photo when nothing is stored', () => {
    expect(loadScene(memoryKv())).toBe('photo');
  });
  it('treats an unknown value as the photo', () => {
    expect(loadScene(memoryKv({ [SCENE_KEY]: 'sepia' }))).toBe('photo');
    expect(loadScene(memoryKv({ [SCENE_KEY]: '' }))).toBe('photo');
  });
  it('round-trips every scene', () => {
    for (const s of SCENES) {
      const kv = memoryKv();
      saveScene(kv, s);
      expect(loadScene(kv)).toBe(s);
    }
  });
  it('survives storage that throws', () => {
    const kv = createKeyValue(() => {
      throw new Error('blocked');
    });
    expect(loadScene(kv)).toBe('photo');
    expect(() => saveScene(kv, 'dark')).not.toThrow();
  });
});

describe('applyScene', () => {
  it('sets data-scene and the theme colour for light and dark', () => {
    const t = target();
    applyScene('light', t);
    expect(t.root.dataset.scene).toBe('light');
    expect(t.meta?.content).toBe('#F4F1EA');
    applyScene('dark', t);
    expect(t.root.dataset.scene).toBe('dark');
    expect(t.meta?.content).toBe('#0F151D');
  });
  it('removes the attribute and restores the colour for photo and null', () => {
    for (const s of ['photo', null] as const) {
      const t = target();
      applyScene('dark', t);
      applyScene(s, t);
      expect(t.root.dataset.scene).toBeUndefined();
      expect(t.meta?.content).toBe('#F6E9D2');
    }
  });
  it('copes with a missing meta tag', () => {
    const t: SceneTarget = { root: { dataset: {} }, meta: null };
    expect(() => applyScene('dark', t)).not.toThrow();
    expect(t.root.dataset.scene).toBe('dark');
  });
});

describe('button content', () => {
  it('names the current mode', () => {
    expect(sceneLabel('photo')).toBe('Background: photo');
    expect(sceneLabel('light')).toBe('Background: light');
    expect(sceneLabel('dark')).toBe('Background: dark');
  });
  it('has a distinct icon per mode', () => {
    expect(new Set(SCENES.map((s) => SCENE_ICONS[s])).size).toBe(3);
  });
});
