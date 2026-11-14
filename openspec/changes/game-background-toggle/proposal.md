## Why
The beach photo is part of the charm, but while solving some players want a calm, plain backdrop, and
in the evening a dark one. The game screen needs a quick way to switch without leaving the puzzle.

## What Changes
- New round glass button in the empty top-right slot of the game header (mirrors Pause). Each tap
  cycles the game-screen background: photo → light → dark → photo.
- The icon shows the current background: a picture frame (photo), a sun (light) or a moon (dark).
- Light: a plain warm off-white backdrop; surfaces keep the current light look.
- Dark: a plain near-black navy backdrop with dark glass surfaces and light ink on the game screen
  (board, keys, header, action row, pause card). Red stays reserved for errors.
- The choice is remembered across games and launches. Menu, loading, results and error screens always
  show the photo, as now.

## Capabilities
### New Capabilities
- `game-background`: the background toggle, its three modes, persistence and scope.

### Modified Capabilities
- `visual-theme`: the photo is on every screen except the game screen when the player picked light or dark.
- `play-screen-visuals`: the header gains the background button on the right.

## Impact
`src/ui/game.ts`, `src/style.css`, a new DOM-free module `src/theme/scene.ts` (+ tests), README.
No new dependencies, no new assets.
