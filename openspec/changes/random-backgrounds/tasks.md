# Tasks

## 1. Images and logic

- [ ] 1.1 Convert the two attached PNGs (`/root/.claude/uploads/2b27204c-9e54-47e4-91f5-556e23fe63d8/47d98b60-image.png` = 5 on surfboard, `.../a55fe0bf-image.png` = 8 volleyball) to 1170x1170 WebP (quality ~80, under ~250 KB each) as `surf-five.webp` and `beach-volleyball.webp` in `src/assets/backgrounds/`; add list entries (fallback `#F6E9D2`, positions above); extend `pickBackground` with `exclude`; verify unit tests: never returns the excluded id with several entries, returns the only entry when one, random bounds, existing tests still pass
- [ ] 1.2 Re-pick on new game in `src/ui/app.ts` (router subscription, load-then-swap), random at launch in `src/main.ts`, remove the preload link in `index.html`; verify unit tests where DOM-free logic allows, and in Playwright: starting several games changes the image each time, resume and menu keep it, retry from error re-picks

## 2. Visual check and docs

- [ ] 2.1 Screenshot menu, game and results with each of the three backgrounds at 390x844, 375x667, 320x568 and 844x390; board and text stay legible, focal subjects visible; verify standalone simulation covers the whole screen for the new images; update README background bullet; `npm run typecheck`, `npm test`, `npm run build`, `openspec validate --all --strict`
