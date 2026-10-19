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

/** Write `sw.js` into the built site at `dir`; returns the cache name used. */
export function writeServiceWorker(dir: string): string {
  const entries = listFiles(dir);
  const cacheName = cacheNameFor(entries);
  writeFileSync(join(dir, SW_FILE), buildServiceWorker({ cacheName, files: entries.map((e) => e.path) }));
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
