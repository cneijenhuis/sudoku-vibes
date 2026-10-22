# Design

## Context

Icons were rendered by `icons-src/render.mjs` from three hand-written SVGs (a dark navy tile with a blue 5) using Chromium. An icon exploration (eight options, then chair-and-7 cut-out variants) ended with the user choosing **option A**: the photo cropped tightly around the deckchair and the 7, with umbrella, sea and sand visible.

## Decisions

- **One full-bleed opaque master** (`icons-src/icon-master.jpg`, 1024x1024, JPEG quality 95) serves every size. iOS needs an opaque Apple touch icon and rounds the corners itself; maskable icons are cropped to a circle or squircle by the OS, and the chair and 7 sit inside the central safe zone, so the same image works for both. Alternative: a separate maskable variant with extra padding; rejected, a photo cannot be padded without inventing background.
- **Pillow render script** (`icons-src/render.py`, Lanczos resize, PNG `optimize`) replaces the Chromium script: better resampling, smaller PNGs, no browser needed. It is a one-off tool, not part of the build.
- **File sizes:** photographic PNGs are large (512px about 410 KB each), so `icon-512.png` and `icon-maskable-512.png` are excluded from the service worker precache (`PRECACHE_EXCLUDE` in `build/sw-plugin.ts`); the browser fetches them from the network when installing. They still count toward the cache-name hash. Alternative: WebP icons; rejected to avoid installability risks.
- **Favicon:** a 32px PNG link added before the 192px one.
- **The master is upscaled** (the source chair and 7 are about 300 to 600 px in the photo); it looks slightly soft at 1024 but is fine at 512 and below, which are the sizes actually used.

## Risks / Trade-offs

- [Photographic icon is busier than a flat mark at tiny sizes] -> checked at 60px and as a 32px favicon; the yellow 7 stays recognisable.
- [Circle crop trims the chair's feet] -> acceptable; the 7 and the chair's seat and back remain inside the circle.
- [Browsers cache old icons] -> the cache name changes with the icon content; home-screen icons may need re-adding to refresh.
