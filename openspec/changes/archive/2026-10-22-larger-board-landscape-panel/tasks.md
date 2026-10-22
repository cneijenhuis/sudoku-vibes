# Tasks

## 1. Portrait

- [x] 1.1 Record "before" board sizes (from a build of the current `main`) at 390x844, 393x852, 375x667, 360x640, 412x915, 430x932, 320x568, 768x1024 in a table in `design.md`; verify the numbers against the table in the proposal where they overlap
- [x] 1.2 Remove the wordmark pill (markup, `.wordmark-slot`, `.wordmark-pill`, `--pb`) from the play screen, add the 6px board and pad gutter token, raise the board and pad cap to 720px, and keep the board centred; verify screenshots at the portrait viewports above, the board widths (390 gives 378, 768 gives 720), top gap equals bottom gap within 1px, and the menu wordmark is unchanged

## 2. Landscape

- [x] 2.1 Switch the landscape layout to `(orientation: landscape)` with the right-hand panel (undo, timer, pause above the 3x3 keypad), board at full height minus 6px and vertically centred; verify at 568x320, 667x375, 844x390, 932x430, 1024x768 that the board height equals the viewport height minus 12px (capped at 720px), nothing clips or scrolls, all controls are at least 44px, and screenshots look balanced (including the pause overlay and number-first states)
- [x] 2.2 Verify rotation: start a game in portrait, make a move and a mistake, rotate to landscape and back with Playwright viewport changes; the board, entries, timer and mode are unchanged

## 3. Integration

- [x] 3.1 Record "after" board sizes for every viewport in the table and confirm none is smaller than before; verify the existing flows (cell-first, number-first with advance, pause, results, resume) still work, `npm run typecheck`, `npm test`, `npm run build` and `openspec validate --all --strict` pass, and update `README.md` (layout section, wordmark text)
