import digit1 from '../assets/digits/digit-1.webp';
import digit2 from '../assets/digits/digit-2.webp';
import digit3 from '../assets/digits/digit-3.webp';
import digit4 from '../assets/digits/digit-4.webp';
import digit5 from '../assets/digits/digit-5.webp';
import digit6 from '../assets/digits/digit-6.webp';
import digit7 from '../assets/digits/digit-7.webp';
import digit8 from '../assets/digits/digit-8.webp';
import digit9 from '../assets/digits/digit-9.webp';
import { h } from './dom';

/** Built (hashed, precached) URLs of the sticker images, index 0 = digit 1. */
const STICKERS: readonly string[] = [digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9];

/**
 * The jumping digit sticker: `.digit-sticker` is the positioned box, its `.digit-sticker-img` child
 * is the one that animates (see "Digit sticker" in src/style.css, where all tunables live). Add the
 * class `jump` for three jumps or `jump-forever` for endless ones; without either it stands still.
 */
export function digitSticker(digit: number): HTMLElement {
  const src = STICKERS[digit - 1];
  if (src === undefined) throw new Error(`no sticker for digit ${digit}`);
  const img = h('img', { class: 'digit-sticker-img', attrs: { src, alt: '', draggable: 'false' } });
  return h('span', { class: 'digit-sticker', attrs: { 'aria-hidden': 'true', 'data-digit': String(digit) } }, img);
}

/** Milliseconds in a CSS time value (`700ms`, `0.7s`), or `fallback` when it is not one. */
export function parseCssTime(value: string, fallback: number): number {
  const m = /^\s*(-?\d*\.?\d+)\s*(ms|s)\s*$/.exec(value);
  if (!m) return fallback;
  const n = Number(m[1]) * (m[2] === 's' ? 1000 : 1);
  return n > 0 ? n : fallback;
}
