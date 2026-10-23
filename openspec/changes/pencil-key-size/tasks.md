# Tasks

## 1. Layout

- [ ] 1.1 Implement the portrait layout in `src/style.css` (and `src/ui/game.ts` only if needed); update `boardMetrics` in `tools/e2e/lib.mjs` to report the three gaps; verify in Playwright at 390x844, 375x667, 320x568, 768x1024: button width and height equal the 9 key's (within 1px), right edges equal, the three gaps equal within 1px, nothing clips or scrolls, and report the board size before and after at each; landscape 844x390 and 1024x768 unchanged
- [ ] 1.2 Screenshot and review the portrait sizes (notes mode on and off, paused overlay still hides the button) and landscape; update `README.md`; verify `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e:smoke`, `openspec validate --all --strict`
