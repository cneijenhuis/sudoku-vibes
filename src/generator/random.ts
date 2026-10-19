/** A random source returning floats in [0, 1). */
export type Random = () => number;

/** mulberry32: small, fast, seedable 32-bit PRNG. */
export function mulberry32(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh random 32-bit seed from the platform CSPRNG. */
export function randomSeed(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] ?? 0;
}

/** Integer in [0, n). */
export function randInt(rng: Random, n: number): number {
  return Math.floor(rng() * n);
}

/** In-place Fisher-Yates shuffle; returns the same array. */
export function shuffle<T>(items: T[], rng: Random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = items[i] as T;
    items[i] = items[j] as T;
    items[j] = tmp;
  }
  return items;
}
