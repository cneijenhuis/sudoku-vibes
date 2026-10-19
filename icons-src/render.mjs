// Renders the PNG icons in public/icons/ from the SVG sources next to this file.
// One-off tool, not part of the build: needs Playwright and a Chromium, e.g.
//   NODE_PATH=/opt/node-tools/node_modules node icons-src/render.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public', 'icons');

const jobs = [
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  ['icon-maskable.svg', 'icon-maskable-512.png', 512],
  ['icon-apple.svg', 'apple-touch-icon.png', 180],
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
for (const [src, name, size] of jobs) {
  const svg = readFileSync(join(here, src), 'utf8').replace('width="512" height="512"', `width="${size}" height="${size}"`);
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`);
  await page.screenshot({ path: join(out, name), omitBackground: true });
  await page.close();
  console.log('wrote', name);
}
await browser.close();
