# Proposal

## Why

The repository is empty. Before building game logic we need a TypeScript project that builds, tests and deploys to GitHub Pages, so every later change can be seen live on a phone from day one.

## What Changes

- Add a Vite + TypeScript (strict) project with zero runtime dependencies; Vitest as the test runner.
- Add a minimal mobile-first app shell (placeholder screen) with correct viewport and touch defaults.
- Add a GitHub Actions workflow that type-checks, tests, builds and publishes `dist/` to GitHub Pages on push to `main`.
- Configure the build so it works when served from the `/<repo-name>/` sub-path.

## Capabilities

### New Capabilities
- `static-deployment`: The app is built as a static site and published to GitHub Pages automatically, gated on type-check and tests.
- `mobile-app-shell`: The page renders full-screen on mobile with correct viewport, touch behaviour and safe-area handling, as the base every screen builds on.

### Modified Capabilities

## Impact

New files: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/`, `.github/workflows/deploy.yml`, `.gitignore`, `README.md`. Dev dependencies: `vite`, `typescript`, `vitest`. Requires the repo owner to set Pages source to "GitHub Actions".
