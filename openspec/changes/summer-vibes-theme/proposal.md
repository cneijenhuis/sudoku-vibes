# Proposal

## Why

The app works but looks like a generic dark UI. A "Summer Vibes" identity gives it a personality: a full-screen beach photo behind frosted white surfaces, navy grid lines, a butter-yellow highlight, a rounded Fredoka typeface, and the new name **Sudoku Vibes**. The design handover is the "Beach Day, Deep Sea (A3)" variant (Claude Docs handover https://claude.ai/artifact/H6QX3s64FKsfvJRyzRz5Y1), focused on the in-game screen.

## What Changes

- **Theme foundation (app-wide):** design tokens (colours, surfaces, shadows, radii), Fredoka typeface (self-hosted, offline-capable), a full-screen background photo with a plain-colour fallback, and a shared "glass" surface style. The light theme replaces the dark one.
- **Backgrounds are data-driven:** one photo ships now, but backgrounds are listed in one place so more can be added later without touching components.
- **Play screen restyle (pixel-level):** header buttons and timer pill, a "Sudoku Vibes" wordmark pill, the framed board with navy lines, cell and number-key states, including the new error treatment and a cursor style for the selected cell.
- **Other screens (interim):** menu, loading/error, pause overlay and results adopt the tokens, fonts and glass surfaces so nothing looks mixed, but keep their current layouts. A dedicated design round for them follows later.
- **Branding:** the app is called "Sudoku Vibes" in the page title, manifest, install name and menu header.
- Game logic, layout structure and behaviour are unchanged.

## Capabilities

### New Capabilities
- `visual-theme`: Tokens, typography, background photo, glass surfaces and the accessibility fallbacks that apply across the whole app.
- `app-branding`: The product name and how it appears (title, install name, wordmark).
- `play-screen-visuals`: How the header, board, cells and number keys look in each state on the play screen.

### Modified Capabilities
- `game-board`: the screen layout gains the wordmark pill; the status line adopts the theme's status colour.
- `mobile-app-shell`: the first-load screen shows the "Sudoku Vibes" title.

## Impact

`src/style.css` (rewritten around tokens), new `src/theme/` (backgrounds list, font loading), `src/assets/` (optimised background image, Fredoka woff2 files), `src/ui/game.ts`, `menu.ts`, `status.ts`, `results.ts` (class and markup tweaks, wordmark), `index.html` (title, theme colour, preload), `public/manifest.webmanifest`, `README.md`. The service worker precaches the new assets automatically through the existing build plugin. No new npm dependencies. PWA icons are not redrawn in this change (see design).
