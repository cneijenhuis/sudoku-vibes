## 1. Logic

- [x] 1.1 Add `src/theme/scene.ts` (`Scene`, `nextScene`, `loadScene`, `saveScene`, `applyScene` incl. `theme-color` meta) and `src/theme/scene.test.ts`; verify by unit tests: cycle order, unknown/missing/throwing storage → photo, save round-trip, apply sets/removes `data-scene` and meta (restored to `#F6E9D2` for photo/null)

## 2. Button and styling

- [ ] 2.1 Add the background button (photo/sun/moon icons, accessible name "Background: <mode>") to the game header's right slot in `src/ui/game.ts`, load the stored scene on mount, apply on mount and every tap, remove in `dispose()`; optional `kv` in `GameEnv`; verify with unit tests in the existing game-screen test style (cycle, name/icon follow, timer and board unchanged, dispose removes the attribute, stored value used on next mount)
- [ ] 2.2 CSS in `src/style.css`: `html[data-scene]` plain backgrounds, light-mode status-bar strip, dark token overrides, new `--edge` token for drop edges (default `var(--line-strong)`), fixes for any literal colours that look wrong in dark; verify with `tools/e2e/` screenshots (viewed) of photo, light and dark at 390x844, 375x667, 320x568, 844x390 and 1024x768, including a highlighted digit, a cursor cell, a wrong digit, notes, a completed key, number-first lock and the pause card; computed-style check that photo mode is unchanged from `main` (board, keys, header colours)
- [ ] 2.3 Verify contrast numerically: ink, key text, entry, status, done text and error on the dark solid surface ≥ 4.5:1 (extend `src/theme/tokens.test.ts` if it covers this)

## 3. Scope and docs

- [ ] 3.1 Verify in Playwright: choice survives reload; menu, loading, results and error screens show the photo after a light or dark game (no `data-scene` on `<html>`); iOS standalone simulation with a top safe-area inset shows the navy strip in light mode and the plain colour covering the full canvas in light and dark
- [ ] 3.2 Update README (feature list / background bullet); run `npm run typecheck && npm test && npm run build` and `openspec validate --all --strict`
