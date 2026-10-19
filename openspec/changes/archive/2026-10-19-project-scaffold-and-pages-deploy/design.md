# Design

## Context

Greenfield repo (see proposal.md). Constraints: TypeScript, as few dependencies as possible, GitHub Pages hosting from a sub-path.

## Goals / Non-Goals

**Goals:** fast feedback loop (dev server, tests), a deploy pipeline proven before any game code exists, a screen-mounting structure later changes can extend.

**Non-Goals:** routing, state management, PWA/offline, any game logic.

## Decisions

- **Vite + Vitest** (dev deps only). Alternative: plain `tsc` + hand-rolled bundling; rejected as more config for no benefit. Vite gives dev server, hashed bundles and `base` support.
- **`base: './'`** in Vite config so asset URLs are relative and work on any sub-path without hardcoding the repo name. Alternative: `base: '/sudoku-vibes/'`; rejected as brittle on rename.
- **Plain DOM, no framework.** The UI is a handful of screens; a tiny `mount(screen)` helper in `src/main.ts` is enough.
- **Deploy via official Pages actions** (`actions/configure-pages`, `upload-pages-artifact`, `deploy-pages`) using Node 22 and `npm ci`; one job runs `tsc --noEmit`, `vitest run`, `vite build`, then a dependent deploy job. Alternative: push to a `gh-pages` branch; rejected, Actions deployment needs no extra branch or token.
- **CSS**: `100dvh` layout, `touch-action: manipulation`, `user-select: none` and `-webkit-touch-callout: none` on controls, `env(safe-area-inset-*)` padding, viewport meta with `viewport-fit=cover, user-scalable=no`.
- **Tests**: Vitest with `jsdom` is avoided for now (extra dependency); the engine is pure logic and needs none. Add a trivial smoke test so the pipeline is exercised.

## Risks / Trade-offs

- [Pages not enabled for Actions] → document in README that Settings → Pages → Source must be "GitHub Actions".
- [`user-scalable=no` hurts accessibility] → acceptable for a game board; revisit if needed.
