## Decisions

- **Trigger:** `startApp` subscribes to the router, picks when the state becomes `loading` from any other screen, and shows the pick when the `game` screen appears (so cancelling loading keeps the current background). Covers menu, results (same/next) and error retry; `resumeGame` goes straight to `game` with nothing pending. Alternative: a hook inside `startGame` (couples the router to theme code).
- **No repeats:** `pickBackground(list, random, exclude?)` picks among entries other than `exclude` (id) when more than one exists.
- **Load before swap:** `applyBackground` is applied after `Image.decode()` resolves (or fails, then applied anyway) so the swap never shows the fallback colour. The loading screen gives the image time. Launch picks apply immediately (nothing to flash from).
- **Preload removed:** only one image could be preloaded; with random launch picks it would often be wasted. The SW precaches `dist/` so all images are available offline after install. Cost: first paint on a cold online load shows the fallback colour briefly.
- **Focal points:** 5 on surfboard `50% 50%`; 8 volleyball `38% 50%` (subject left of centre). A portrait phone shows ~46% of the square image's width.
- **Fallback colour:** stays `#F6E9D2` for every entry (spec, theme-color and manifest are single values).

## Risks

- Stale installed app until fully closed (no `skipWaiting`).
- Image weight: each ~200 KB, precached once.
