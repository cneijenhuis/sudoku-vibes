# Tasks

## 1. UI

- [x] 1.1 In `src/ui/game.ts` mark the note span matching the highlighted digit (`hl` class, also in the selected cell) and include that flag in the cell cache key; in `src/style.css` style it `color: var(--ink)`, `font-weight: 900`; verify `npm run typecheck`, `npm test`
- [x] 1.2 Verify with `tools/e2e/` at 390x844, 375x667, 320x568 and 844x390: with seeded notes, highlighting a digit emphasises exactly its notes (check via DOM), changing/clearing the highlight and number-first lock update them, mistakes and the selected cell look right; view screenshots
- [ ] 1.3 Update `README.md`; verify `npm run typecheck`, `npm test`, `npm run build`, `openspec validate --all --strict`
