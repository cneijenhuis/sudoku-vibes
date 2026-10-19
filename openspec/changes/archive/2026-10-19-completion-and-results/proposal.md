# Proposal

## Why

Finishing a puzzle currently lands on a placeholder that shows time and mistakes and only offers "Back to menu". Players want a proper congratulations moment and a one-tap way to keep playing: another game at the same difficulty, or the next level up.

## What Changes

- Replace the placeholder results screen with a congratulations screen showing the difficulty played, the time and the number of mistakes (with a friendlier message for a flawless run).
- Add two primary actions: **Same difficulty** (start another game at the level just played) and **Next difficulty** (start a game one level harder). Next difficulty is not offered after the hardest level.
- Keep a **Menu** action to return to the start menu.
- Starting from the results screen uses the existing loading, cancel and error flow.
- A short, tasteful celebration animation that respects reduced-motion settings.

## Capabilities

### New Capabilities
- `results-screen`: The congratulations screen content, its actions for continuing play, and its behaviour at the hardest level and during generation.

### Modified Capabilities

## Impact

`src/ui/results.ts`, `src/ui/app.ts` (wiring and level progression helper in `src/ui/levels.ts`), `src/style.css`, tests, README. Reuses `router.startGame`; no router state changes are expected. No new dependencies.
