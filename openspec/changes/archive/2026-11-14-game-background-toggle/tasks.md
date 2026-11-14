## 1. Logic

- [x] 1.1 Add `src/theme/scene.ts` (`Scene`, `nextScene`, `loadScene`, `saveScene`, `applyScene` incl. `theme-color` meta) and `src/theme/scene.test.ts`; verify by unit tests: cycle order, unknown/missing/throwing storage → photo, save round-trip, apply sets/removes `data-scene` and meta (restored to `#F6E9D2` for photo/null)

## 2. Button and styling

- [x] 2.1 Add the background button (photo/sun/moon icons, accessible name "Background: <mode>") to the game header's right slot in `src/ui/game.ts`, load the stored scene on mount, apply on mount and every tap, remove in `dispose()`; optional `kv` in `GameEnv`; verified by the `scene.ts` module unit tests (labels, icons, cycle, storage) and by `npm run e2e:background` (cycling with label/icon/data-scene/theme-color, timer and board unchanged, dispose, stored value on next mount); there is no DOM test environment for the game screen
- [x] 2.2 CSS in `src/style.css`: `html[data-scene]` plain backgrounds, light-mode status-bar strip, dark token overrides, new `--edge` token for drop edges (default `var(--line-strong)`), fixes for any literal colours that look wrong in dark; verify with `tools/e2e/` screenshots (viewed) of photo, light and dark at 390x844, 375x667, 320x568, 844x390 and 1024x768, including a highlighted digit, a cursor cell, a wrong digit, notes, a completed key, number-first lock and the pause card; computed-style check that photo mode is unchanged from `main` (board, keys, header colours)
- [x] 2.3 Verify contrast numerically: ink, key text, entry, status, done text and error on the dark solid surface ≥ 4.5:1 (extend `src/theme/tokens.test.ts` if it covers this)

## 3. Scope and docs

- [x] 3.1 Verified by `npm run e2e:background` (Playwright): choice survives reload and resume; menu, results, quit and browser Back show the photo with no `data-scene` on `<html>`; garbage or blocked storage gives photo and still cycles; iOS standalone simulation with a top safe-area inset shows a strip as tall as the inset in light mode and the plain colour over the full canvas in light and dark
- [x] 3.2 Update README (feature list / background bullet); run `npm run typecheck && npm test && npm run build` and `openspec validate --all --strict`
