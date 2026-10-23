# Tasks

## 1. Layout

- [x] 1.1 Reorder the portrait layout (CSS, and DOM order if needed so tab order is digits then pencil); update `boardMetrics` and the smoke test for the new gap order (above board, board to digits, digits to pencil); verify in Playwright at 390x844, 375x667, 320x568, 360x560, 768x1024: gaps equal within 1px, pencil equals the 9 key in size with equal right edges and still hit43 true, board size unchanged versus now (report numbers), nothing clips or scrolls, also with `simulateSafeArea` bottom 34 and the standalone simulation; landscape 844x390 and 1024x768 unchanged
- [ ] 1.2 Screenshot and review portrait (notes on and off, paused hides both) and landscape; check keyboard tab order; update `README.md` and the e2e skill Layout bullet if they describe the order; verify `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e:smoke`, `openspec validate --all --strict`
