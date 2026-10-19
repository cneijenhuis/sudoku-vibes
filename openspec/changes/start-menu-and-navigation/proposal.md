# Proposal

## Why

The app currently shows a placeholder title. Players need a start menu to choose one of the five difficulty levels, and the app needs a way to move between menu, game and results screens. Generation can take a moment (Hard up to a few seconds), so the transition needs a loading state.

## What Changes

- Replace the title placeholder with a start menu: title plus five full-width difficulty buttons (Easy, Medium, Hard, Extreme, Almost Impossible).
- Add a small screen router (menu, loading, game, results) with typed screen state and a single `navigate` entry point.
- Choosing a level requests a puzzle from the background generator, shows a loading screen with a Cancel button, then opens the game screen with the puzzle. The game screen is a placeholder (level name, givens string, Back to menu) until the next change builds the board.
- Handle generator failure with an error message and retry/back options; ignore `Superseded`/`Disposed` rejections.
- Make the `?smoke` hook dev-only so it is not shipped in production builds.

## Capabilities

### New Capabilities
- `start-menu`: The first screen, listing the five difficulty levels and starting a game at the chosen one.
- `screen-navigation`: Moving between menu, loading, game and results screens, including cancelling generation and recovering from errors.

### Modified Capabilities

## Impact

New modules under `src/ui/` (router, menu, loading, game placeholder) and updated `src/main.ts`/`src/style.css`. Uses `generatePuzzleAsync` from `src/generator/client.ts`. No new dependencies. Updates the `mobile-app-shell` placeholder behaviour: the title screen is superseded by the start menu.
