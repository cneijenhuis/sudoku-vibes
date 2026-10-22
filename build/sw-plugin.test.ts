// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CACHE_PREFIX } from '../src/pwa/sw-source.ts';
import { cacheNameFor, listFiles, writeServiceWorker } from './sw-plugin.ts';

const dirs: string[] = [];
function site(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'sw-plugin-'));
  dirs.push(dir);
  for (const [path, body] of Object.entries(files)) {
    const full = join(dir, path);
    mkdirSync(full.slice(0, full.lastIndexOf('/')), { recursive: true });
    writeFileSync(full, body);
  }
  return dir;
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

const BUILD = { 'index.html': '<html>1</html>', 'assets/a-1.js': 'a', 'assets/worker-2.js': 'w', 'icons/i.png': 'png', 'manifest.webmanifest': '{}' };

describe('service worker plugin', () => {
  it('lists every built file sorted, with forward-slash relative paths, excluding sw.js', () => {
    const dir = site({ ...BUILD, 'sw.js': 'old worker' });
    expect(listFiles(dir).map((e) => e.path)).toEqual(['assets/a-1.js', 'assets/worker-2.js', 'icons/i.png', 'index.html', 'manifest.webmanifest']);
  });

  it('derives a prefixed cache name from the files: stable, and changed by content, names or additions', () => {
    const base = cacheNameFor(listFiles(site(BUILD)));
    expect(base).toMatch(new RegExp(`^${CACHE_PREFIX}[0-9a-f]{12}$`));
    expect(cacheNameFor(listFiles(site(BUILD)))).toBe(base);
    expect(cacheNameFor(listFiles(site({ ...BUILD, 'index.html': '<html>2</html>' })))).not.toBe(base);
    expect(cacheNameFor(listFiles(site({ ...BUILD, 'icons/i.png': 'other png' })))).not.toBe(base);
    expect(cacheNameFor(listFiles(site({ ...BUILD, 'assets/a-3.js': 'a' })))).not.toBe(base);
    const { 'assets/worker-2.js': _gone, ...without } = BUILD;
    expect(cacheNameFor(listFiles(site(without)))).not.toBe(base);
  });

  it('writes sw.js with exactly the built files and is idempotent', () => {
    const dir = site(BUILD);
    const name = writeServiceWorker(dir);
    const sw = readFileSync(join(dir, 'sw.js'));
    const text = new TextDecoder().decode(sw);
    expect(text).toContain(JSON.stringify(name));
    for (const f of Object.keys(BUILD)) expect(text).toContain(`"./${f}"`);
    expect(text).not.toContain('"./sw.js"');
    expect(writeServiceWorker(dir)).toBe(name); // a second run ignores the sw.js it wrote
    expect(new TextDecoder().decode(readFileSync(join(dir, 'sw.js')))).toBe(text);
  });

  it('leaves the large install-only 512px icons out of the precache but keeps the small ones', () => {
    const dir = site({ ...BUILD, 'icons/icon-192.png': 'a', 'icons/icon-512.png': 'b', 'icons/icon-maskable-512.png': 'c', 'icons/apple-touch-icon.png': 'd' });
    writeServiceWorker(dir);
    const text = new TextDecoder().decode(readFileSync(join(dir, 'sw.js')));
    expect(text).toContain('"./icons/icon-192.png"');
    expect(text).toContain('"./icons/apple-touch-icon.png"');
    expect(text).not.toContain('icon-512.png');
    expect(text).not.toContain('icon-maskable-512.png');
  });

  it('still changes the cache name when an excluded icon changes', () => {
    const a = site({ ...BUILD, 'icons/icon-512.png': 'one' });
    const b = site({ ...BUILD, 'icons/icon-512.png': 'two' });
    expect(writeServiceWorker(a)).not.toBe(writeServiceWorker(b));
  });

  it('two different builds produce different workers and cache names', () => {
    const a = site(BUILD);
    const b = site({ ...BUILD, 'assets/a-1.js': 'changed' });
    expect(writeServiceWorker(a)).not.toBe(writeServiceWorker(b));
    expect(readFileSync(join(a, 'sw.js')).length).toBeGreaterThan(0);
    expect(new TextDecoder().decode(readFileSync(join(a, 'sw.js')))).not.toBe(new TextDecoder().decode(readFileSync(join(b, 'sw.js'))));
  });
});
