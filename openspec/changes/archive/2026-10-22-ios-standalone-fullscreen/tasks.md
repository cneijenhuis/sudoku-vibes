# Tasks

## 1. Implementation (done during device debugging)

- [x] 1.1 Paint the photo on `html` and add `--canvas-h` handling in `src/theme/canvas.ts` with unit tests for portrait, landscape, non-standalone, no-flicker and implausible gaps; verified by unit tests and a simulated iOS state (viewport shrinking without an event, feedback loop) in Chromium, and confirmed on a real iPhone
- [x] 1.2 Set the iOS status bar to `black-translucent`; confirmed on a real iPhone
- [x] 1.3 Remove the temporary build label and diagnostics panel; verify `npm run typecheck`, `npm test`, `npm run build` and `openspec validate --all --strict` pass and no references to the diagnostics remain
