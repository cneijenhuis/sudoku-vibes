# Tasks

## 1. Project setup

- [ ] 1.1 Create `package.json` (scripts: `dev`, `build`, `typecheck`, `test`, `preview`), `tsconfig.json` (strict), `.gitignore`; verify `npm install` succeeds and `npm run typecheck` passes
- [ ] 1.2 Add `vite.config.ts` with `base: './'` and `vitest`; verify `npm run build` produces `dist/index.html` with relative asset URLs

## 2. App shell

- [ ] 2.1 Add `index.html` with viewport meta, `src/main.ts` and `src/style.css` implementing the mobile defaults (dvh layout, no zoom/select/callout, safe-area padding, 44px targets) and a "Sudoku" placeholder; verify with `npm run dev` / Playwright screenshot at 375x667 that nothing scrolls
- [ ] 2.2 Add a Vitest smoke test and verify `npm test` passes

## 3. Deployment

- [ ] 3.1 Add `.github/workflows/deploy.yml` (typecheck, test, build, then Pages deploy on push to `main`); verify with `npx --yes actionlint` or YAML parse and review against the spec scenarios
- [ ] 3.2 Add `README.md` with commands and the "Pages source = GitHub Actions" setup note; verify the documented commands run as written
- [ ] 3.3 Verify `dist/` served from a sub-path (copy `dist/` into a temp `sudoku-vibes/` folder and serve its parent with a static server) loads with no 404s

## Workflow follow-up

- After merging to `main`, confirm the Pages site is live.
