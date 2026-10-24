## Why

The empty top-right slot of the play header can reward progress: when a digit is completed, that digit pops up there as a bouncy sticker. When the whole puzzle is done, the last digit replaces the star on the results screen and keeps jumping. The user expects to iterate on the look, so the motion is easy to tune.

## What Changes

- New sticker images 1-9 (the transparent PNGs in `digits/`, shrunk to display size) shipped as app assets.
- Play screen: when an entry completes a digit (all nine placed correctly), that digit's sticker appears in the header's right slot, jumps three times (stretched in the air, squashed on landing) and disappears.
- Results screen: the star badge is replaced by the sticker of the digit that finished the puzzle, jumping forever.
- Reduced motion: stickers stay still (play screen: shown for the length of three jumps, then removed).

Out of scope: sound, haptics, other celebrations, changing the confetti burst.

## Capabilities

### New Capabilities
- `digit-jump`: the jumping digit sticker (play-screen trigger, results-screen finale, motion look).

### Modified Capabilities
- `results-screen`: the celebration badge shows the final digit instead of a star.

## Impact

`src/ui/game.ts` (trigger, header slot, `GameResult.lastDigit`), `src/ui/results.ts`, `src/ui/router.ts`/`app.ts` (carry the digit), `src/style.css`, `src/assets/digits/`, README.
