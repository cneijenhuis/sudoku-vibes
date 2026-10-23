## Why

The app shows one beach photo per page load. The user is adding more photos over time and wants variety: every new game should get a randomly chosen background. Two images are added now (an inflatable 5 on a surfboard, an inflatable 8 at beach volleyball).

## What Changes

- A new background is picked at random each time a new game starts (from the menu, "play again"/"next" on the results screen, or retry after an error), never the same one twice in a row when there are several.
- The app also picks a random one at launch. Resuming a saved game or returning to the menu keeps the current background.
- Add the two attached images to the list (WebP, 1170 px, same as the existing one).
- Drop the single-image preload in `index.html` (it would waste bandwidth whenever another image is chosen); the service worker precaches every image, so later switches are instant and offline.
- The new image is applied only once it has loaded, so there is no flash of the fallback colour.

Out of scope: remembering the background per saved game, weighting, a manual picker.

## Capabilities

### Modified Capabilities
- `visual-theme`: "Backgrounds are configurable" now requires a fresh random pick per new game.

## Impact

`src/theme/backgrounds.ts` (+ test), `src/ui/app.ts`, `src/main.ts`, `index.html`, `src/assets/backgrounds/`, README.
