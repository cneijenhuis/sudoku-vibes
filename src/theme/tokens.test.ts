// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const css = new TextDecoder().decode(readFileSync('src/style.css')); // vitest runs from the repo root

/** The values the Summer Vibes handover (and the visual-theme spec) fix for each token. */
const TOKENS: Record<string, string> = {
  '--surface': 'rgba(255, 253, 248, 0.86)',
  '--ink': '#10233a',
  '--entry': '#067684',
  '--line-strong': '#1e4d6b',
  '--line-soft': 'rgba(30, 77, 107, 0.42)',
  '--key-text': '#1e4d6b',
  '--highlight': '#ffe08a',
  '--highlight-text': '#6e4300',
  '--highlight-ring': '#f4b400',
  '--highlight-edge': '#d9a100',
  '--done-text': '#4f6e82',
  '--done-edge': '#6f8fa3',
  '--accent': '#e2533f',
  '--status': '#b83a28',
  '--fallback-bg': '#f6e9d2',
  '--shadow-board': '0 14px 30px rgba(40, 30, 10, 0.22)',
  '--error': '#bd0e2a',
  '--cursor-fill': '#ddf1f7',
};

describe('theme tokens', () => {
  for (const [name, value] of Object.entries(TOKENS)) {
    it(`${name} is defined exactly once as ${value}`, () => {
      const decls = [...css.matchAll(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'gm'))];
      expect(decls.map((m) => m[1]?.trim())).toEqual([value]);
    });
  }

  it('declares the glass fallbacks', () => {
    expect(css).toContain('@supports not');
    expect(css).toContain('prefers-reduced-transparency');
    expect(css).toContain('color-scheme: light');
  });
});
