## Why

When the puzzle is done, the last digit replaces the star on the results screen as a bouncy sticker. The first version also showed a sticker in the play header when a digit was completed; the user decided the existing completion flash is enough during play, so that part was removed.

## What Changes

- New sticker images 1-9 (the transparent PNGs in `digits/`, shrunk to display size) shipped as app assets.
- Results screen: the star badge is replaced by the sticker of the digit that finished the puzzle, jumping forever (stretched in the air, squashed on landing, flowing straight into the next jump).
- Reduced motion: the sticker stays still.
- The play screen shows no stickers (the header's right slot stays empty).

Out of scope: sound, haptics, other celebrations, changing the confetti burst.

## Capabilities

### New Capabilities
- `digit-jump`: the jumping digit sticker (motion look, assets) and the absence of stickers during play.

### Modified Capabilities
- `results-screen`: the celebration badge shows the final digit instead of a star.

## Impact

`src/ui/game.ts` (`GameResult.lastDigit` only), `src/ui/results.ts`, `src/ui/router.ts`/`app.ts` (carry the digit), `src/style.css`, `src/assets/digits/`, README.
