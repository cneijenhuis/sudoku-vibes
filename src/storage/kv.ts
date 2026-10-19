/** The subset of `Storage` the app uses (lets tests inject fakes). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** String key-value access that never throws: storage may be blocked, full or missing. */
export interface KeyValue {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/**
 * Wrap `getStorage` so every failure (including the accessor itself throwing, as `localStorage`
 * does when site data is blocked) is swallowed: reads give null, writes do nothing.
 */
export function createKeyValue(getStorage: () => StorageLike | null | undefined): KeyValue {
  return {
    get(key) {
      try {
        return getStorage()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        getStorage()?.setItem(key, value);
      } catch {
        /* storage full or blocked: carry on without saving */
      }
    },
    remove(key) {
      try {
        getStorage()?.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

/** Browser `localStorage`, or nothing where it is unavailable. */
export const localKv: KeyValue = createKeyValue(() => globalThis.localStorage);
