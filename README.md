# Sudoku Vibes

Mobile-first Sudoku game in TypeScript (Vite, plain DOM). No runtime dependencies.

## Screens

The app opens on a start menu with the five difficulty levels (Easy, Medium, Hard,
Extreme, Almost Impossible). Choosing one shows a loading screen (with Cancel) while a
puzzle is generated in a Web Worker, then the game screen (a placeholder for now). Errors
offer Retry / Back to menu. Navigation lives in `src/ui/router.ts`. In dev, `?smoke`
runs a generator smoke test (not included in production builds).

## Commands

```sh
npm install        # install dev dependencies
npm run dev        # dev server with hot reload
npm run typecheck  # tsc --noEmit (strict)
npm test           # run Vitest once
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
```

## Deployment (GitHub Pages)

Pushes to `main` run `.github/workflows/deploy.yml`: type-check, test, build, then
publish `dist/` to GitHub Pages. The workflow can also be run manually
(`workflow_dispatch`). A failing check blocks the deploy.

**One-time setup:** in the repository, go to Settings -> Pages and set
**Source** to **GitHub Actions**.

The build uses `base: './'`, so it works from any sub-path such as
`https://<user>.github.io/sudoku-vibes/`.
