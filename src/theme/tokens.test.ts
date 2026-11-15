// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const fullCss = new TextDecoder().decode(readFileSync('src/style.css')); // vitest runs from the repo root
/** The game-screen background blocks (`html[data-scene...]`) hold their own colour literals and token overrides. */
const SCENE_BLOCK = /^html\[data-scene[^{]*\{[^}]*\}\n?/gm;
const css = fullCss.replace(SCENE_BLOCK, '');
const sceneCss = [...fullCss.matchAll(SCENE_BLOCK)].map((m) => m[0]).join('\n');

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
  '--error': '#a80b24',
  '--cursor-fill': '#ddf1f7',
  '--solved-tint': 'rgba(111, 143, 163, 0.3)',
};

describe('theme tokens', () => {
  for (const [name, value] of Object.entries(TOKENS)) {
    it(`${name} is defined exactly once as ${value}`, () => {
      const decls = [...css.matchAll(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'gm'))];
      expect(decls.map((m) => m[1]?.trim())).toEqual([value]);
    });
  }

  it('keeps literal hex colours out of component rules (only the :root token block has them)', () => {
    const afterRoot = css.slice(css.indexOf('}', css.indexOf(':root {')) + 1);
    expect(afterRoot.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  });

  it('keeps rgba()/hsl() colour literals out of component rules', () => {
    const afterRoot = css.slice(css.indexOf('}', css.indexOf(':root {')) + 1);
    expect(afterRoot.match(/\b(?:rgba?|hsla?)\(/g) ?? []).toEqual([]);
  });

  it('only the .glass rules set the surface as a background (else they defeat the glass fallbacks)', () => {
    const offenders: string[] = [];
    for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = (m[1] ?? '').trim();
      if (/^\.glass$/.test(sel)) continue;
      if (/background(?:-color)?:\s*var\(--surface(?:-fallback)?\)/.test(m[2] ?? '')) offenders.push(sel);
    }
    expect(offenders).toEqual([]);
  });

  it('scene overrides only redefine existing tokens (plus the scene colour)', () => {
    const names = [...sceneCss.matchAll(/^\s*(--[a-z-]+):/gm)].map((m) => m[1]!);
    expect(names.length).toBeGreaterThan(10);
    for (const n of names) {
      if (n === '--scene-bg') continue;
      expect(css, n).toMatch(new RegExp(`^\\s*${n}:`, 'm'));
    }
  });

  it('declares the glass fallbacks', () => {
    expect(css).toContain('@supports not');
    expect(css).toContain('prefers-reduced-transparency');
    expect(css).toContain('color-scheme: light');
  });

  describe('dark scene contrast (WCAG 2.1, at least 4.5:1 on the solid surface)', () => {
    const dark = /^html\[data-scene='dark'\]\s*\{([^}]*)\}/m.exec(fullCss)?.[1] ?? '';
    const tok = (name: string): string => new RegExp(`${name}:\\s*([^;]+);`).exec(dark)?.[1]?.trim() ?? '';
    type Rgb = [number, number, number];
    const parse = (c: string): { rgb: Rgb; a: number } => {
      const hex = /^#([0-9a-f]{6})$/i.exec(c);
      if (hex) return { rgb: [0, 2, 4].map((i) => parseInt(hex[1]!.slice(i, i + 2), 16)) as Rgb, a: 1 };
      const m = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(c);
      if (!m) throw new Error(`unparsable colour ${c}`);
      return { rgb: [+m[1]!, +m[2]!, +m[3]!], a: +m[4]! };
    };
    const over = (fg: string, bg: string): Rgb => {
      const f = parse(fg);
      const b = parse(bg).rgb;
      return f.rgb.map((v, i) => v * f.a + b[i]! * (1 - f.a)) as Rgb;
    };
    const lum = ([r, g, b]: Rgb): number => {
      const l = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * l[0]! + 0.7152 * l[1]! + 0.0722 * l[2]!;
    };
    const ratio = (a: Rgb, b: Rgb): number => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    const solid = parse(tok('--surface-solid')).rgb;

    for (const name of ['--ink', '--key-text', '--entry', '--status', '--done-text', '--error']) {
      it(`${name} on the solid surface`, () => {
        expect(ratio(parse(tok(name)).rgb, solid)).toBeGreaterThanOrEqual(4.5);
      });
    }
    it('ink and entry on the cursor fill', () => {
      const cursor = parse(tok('--cursor-fill')).rgb;
      expect(ratio(parse(tok('--ink')).rgb, cursor)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(parse(tok('--entry')).rgb, cursor)).toBeGreaterThanOrEqual(4.5);
    });
    it('error on its tint over the solid surface', () => {
      const tint = over(tok('--error-tint'), tok('--surface-solid'));
      expect(ratio(parse(tok('--error')).rgb, tint)).toBeGreaterThanOrEqual(4.5);
    });
    it('ink on the dark page', () => {
      expect(ratio(parse(tok('--ink')).rgb, parse(tok('--scene-bg')).rgb)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
