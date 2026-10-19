# Tasks

## 1. Logic

- [x] 1.1 Add `nextDifficulty` to `src/ui/levels.ts`; verify unit tests cover every level, `null` after Almost Impossible, and consistency with `LEVELS` order

## 2. Results screen

- [x] 2.1 Rebuild `src/ui/results.ts`: congratulations headline (flawless variant), level, time, mistakes, and Same/Next/Menu actions wired through `app.ts`; verify with Playwright on a seeded puzzle that stats are correct and each action behaves per the spec scenarios (same level, next level, menu, hidden Next at Almost Impossible)
- [x] 2.2 Style the screen with a CSS-only celebration and reduced-motion fallback; verify screenshots at 375x667, 320x568 and 667x375 show no clipping or scrolling and buttons are >= 44px tall, and a `prefers-reduced-motion` run shows no animation
- [x] 2.3 Verify loading/cancel/error and rapid-tap behaviour from the results screen in Playwright (delayed Worker, forced failure, two quick taps starting one game)

## 3. Integration

- [ ] 3.1 Verify `npm run typecheck`, `npm test`, `npm run build` and `openspec validate --all --strict` pass, the built site works from a sub-path with no console errors, and update `README.md`
