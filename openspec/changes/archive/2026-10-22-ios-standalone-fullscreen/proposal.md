# Proposal

## Why

On an iPhone running the installed home-screen app, the beach photo stopped about 59 points above the bottom of the screen and a beige strip showed underneath. Diagnostics from the device showed the cause: in home-screen mode iOS reports a layout viewport (793 points) shorter than the screen (852 points; the difference is the status-bar height), fixed-position layers stop at that edge, and only the page canvas paints the full screen. The theme spec did not cover this, and the first fixes (a taller fixed layer, a different status-bar style) did not work or made it flicker.

## What Changes

- The photo is painted on the page canvas (the root element's background) instead of a fixed layer.
- In home-screen mode, when the layout viewport is shorter than the screen, the root element is sized to the screen height so the photo covers the whole screen, with a decision rule that is stable (no flicker) and re-checked after launch and on window, focus, visibility and touch events.
- The iOS status bar is translucent (`black-translucent`), so the photo runs under the clock.
- The temporary build label and diagnostics panel used to find this are removed again.

## Capabilities

### New Capabilities

### Modified Capabilities
- `visual-theme`: the background photo requirement now covers every screen edge in home-screen mode and is painted on the page canvas.
- `app-branding`: the iOS status bar is translucent over the photo.

## Impact

`src/style.css` (photo on `html`, `--canvas-h`), `src/theme/canvas.ts` and its test, `src/main.ts`, `index.html` (status-bar meta), `README.md`. The temporary diagnostics code is removed. No new dependencies.
