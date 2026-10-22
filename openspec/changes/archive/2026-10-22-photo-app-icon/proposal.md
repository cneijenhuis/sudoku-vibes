# Proposal

## Why

The home-screen icon still showed the old dark "5" tile, which does not match the Summer Vibes look. The new icon is the deckchair with the inflatable yellow 7 from the app's beach photo (option A of the icon exploration: a tight photo crop, chosen over cut-out and illustrated variants).

## What Changes

- New icon artwork: a square crop of the beach photo showing the deckchair with the 7, used for every icon size.
- Icons rendered from one committed master image by a small one-off script (Pillow), replacing the old SVG sources and Chromium script.
- A 32px favicon is added to the page head.
- The two large 512px icons are left out of the service worker precache (they are only fetched when the app is installed), which saves about 0.8 MB on the first visit.

## Capabilities

### New Capabilities
- `app-icon`: The artwork and file set of the app's icons (browser tab, home screen, installed app) and the rules they follow.

### Modified Capabilities

## Impact

`icons-src/` (master image and render script), `public/icons/*.png`, `index.html` (favicon link), `build/sw-plugin.ts` and its test (precache exclusion), `README.md`. The manifest is unchanged (same file names). No new npm dependencies (the render script is a one-off Python tool needing Pillow).
