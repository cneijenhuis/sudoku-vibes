import { defineConfig } from 'vitest/config';
import { swPlugin } from './build/sw-plugin.ts';

export default defineConfig({
  base: './',
  plugins: [swPlugin()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
  },
});
