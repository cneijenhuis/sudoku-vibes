import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { buildServiceWorker, CACHE_PREFIX } from '../src/pwa/sw-source.ts';

export const SW_FILE = 'sw.js';

export interface FileEntry {
  /** Path relative to the site root, with forward slashes. */
  path: string;
  /** Hex hash of the file's bytes. */
  hash: string;
}

/** Every file under `dir` (recursively, sorted) except the service worker itself. */
export function listFiles(dir: string): FileEntry[] {
  const out: FileEntry[] = [];
  const walk = (rel: string): void => {
    for (const entry of readdirSync(join(dir, rel), { withFileTypes: true })) {
      const path = rel === '' ? entry.name : `${rel}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (path !== SW_FILE) out.push({ path, hash: createHash('sha256').update(readFileSync(join(dir, path))).digest('hex') });
    }
  };
  walk('');
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * Cache name derived from a hash of the file list, including each file's content hash: files
 * whose names are not content-hashed (index.html, icons, the manifest) still change the name
 * when their content changes, so a new build never reuses an old cache.
 */
export function cacheNameFor(entries: readonly FileEntry[]): string {
  const h = createHash('sha256');
  for (const e of entries) h.update(`${e.path}\0${e.hash}\n`);
  return CACHE_PREFIX + h.digest('hex').slice(0, 12);
}

/**
 * Files that stay out of the precache: the large 512px icons are only fetched by the browser when
 * the app is installed (the manifest links them), so caching them would add about 0.8 MB to the
 * first visit for nothing. They are still part of the cache-name hash, so changing them changes it.
 */
export const PRECACHE_EXCLUDE = /^icons\/icon-(maskable-)?512\.png$/;

/** Write `sw.js` into the built site at `dir`; returns the cache name used. */
export function writeServiceWorker(dir: string): string {
  const entries = listFiles(dir);
  const cacheName = cacheNameFor(entries);
  const files = entries.map((e) => e.path).filter((p) => !PRECACHE_EXCLUDE.test(p));
  writeFileSync(join(dir, SW_FILE), buildServiceWorker({ cacheName, files }));
  return cacheName;
}

/** Vite plugin: after a production build, emit a service worker precaching exactly the built files. */
export function swPlugin(): Plugin {
  let outDir = '';
  return {
    name: 'sudoku-vibes-sw',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle: {
      order: 'post',
      handler() {
        if (outDir && existsSync(outDir)) writeServiceWorker(outDir);
      },
    },
  };
}
