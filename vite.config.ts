import { defineConfig } from 'vitest/config';
import { swPlugin } from './build/sw-plugin.ts';

// Shown in the menu's build tag so a deployed (or cached) build can be told apart.
const sha = (process.env.GITHUB_SHA ?? '').slice(0, 7) || 'local';
const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

export default defineConfig({
  base: './',
  define: { __BUILD_ID__: JSON.stringify(`${sha} ${stamp}Z`) },
  plugins: [swPlugin()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
  },
});
