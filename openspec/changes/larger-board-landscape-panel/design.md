# Design

## Context

The play screen is a CSS grid (`.screen.game-screen`: top bar, board region, number pad). The board region is a size container with 8px/12px padding; the board side is `min(100cqw, 100cqh - var(--pb), 560px)`, where `--pb` is the height of the wordmark slot (pill plus gap) when there is room. Landscape only moves the pad beside the board in `@media (max-height: 520px) and (orientation: landscape)`, and the top bar stays across the top of both columns. Before the restyle the board used about 8px gutters and snapped cell sizes to whole 9px multiples; the restyle used the designer's 12px gutter without snapping, which made width-limited boards about 1 to 2% smaller (390x844: 369 to 366; 360x640: 342 to 336; 412x915: 396 to 388).

## Goals / Non-Goals

**Goals:** the largest board each screen can fit; a clean board-centred composition; a landscape layout with the board at full height and all controls on the right.

**Non-Goals:** changing the header or key styling, new game features, redesigning the menu.

## Decisions

- **Remove the pill.** Delete the wordmark slot markup in `src/ui/game.ts`, and the `.wordmark-slot`, `.wordmark-pill` and `--pb` machinery from the CSS. The `wordmark` helper stays for the menu header.
- **Gutters:** a `--board-gutter: 6px` token for the board region and the pad (portrait). The header keeps its 12px padding so the 52px buttons do not hug the screen edge. Alternative: edge-to-edge board; rejected, the rounded frame and drop shadow would be clipped and the screen edge would crowd the grid.
- **Cap 720px:** the old 560px cap only matters on tablets and wide windows; 720px lets tablets use more of the screen without the cells becoming silly. Pad `max-width` follows the board cap so keys line up with the board edges.
- **Centring:** the board region keeps `display: flex; align-items: center; justify-content: center` with symmetric padding, so the free space above and below the board is equal. With the pill gone no slot offsets the board. Verify numerically at several viewports (top gap equals bottom gap within 1px).
- **Landscape panel for every landscape viewport:** switch the media query from `(max-height: 520px) and (orientation: landscape)` to `(orientation: landscape)` (width greater than height), with the grid becoming `[board region | panel]`. The panel is a column: the top bar controls (undo, timer pill, pause) in a row, then the 3x3 keypad filling the remaining height. The panel width is content-driven with a minimum (about 260px) and a maximum, so the board region gets the rest; the board is `min(100cqw, 100cqh, 720px)` with a 6px margin. On wide tablet landscape (1024x768) the panel is capped so the board stays at 720px and spare width is shared as equal side space around the two columns.
- **Rotation:** pure CSS media-query layout, no JS, so game state is untouched by rotation. Safe-area insets (notch on the left or right in landscape) stay applied by `#app` padding.
- **Header in the panel:** in landscape the timer pill and buttons keep their sizes where they fit; on narrow panels the existing narrow-screen rules (smaller status line, tighter padding) apply. The status line may wrap onto two lines.
- **Measurements:** record before and after board sizes for 390x844, 393x852, 375x667, 360x640, 412x915, 430x932, 320x568, 667x375, 844x390, 932x430, 768x1024 and 1024x768, using the previous commit's build for the "before" numbers.

## Risks / Trade-offs

- [6px gutter makes the frame feel tight to the screen edge] -> visual check at 320, 375 and 430 widths; the drop shadow and glass edge keep it readable; if it looks cramped, 8px is the fallback and is a single token.
- [Landscape panel too narrow on 568x320 phones] -> verify at 568x320 and 667x375 that the keypad keys stay at least 44px and the clock fits (status line may wrap).
- [Tablet landscape leaves empty space beside the panel] -> acceptable; centre the pair of columns.

## Board size before and after

Board side in CSS pixels, measured with `getBoundingClientRect` in Chromium (touch-emulated, DPR 2) on a build of the commit before this change (`36c3bbb`, which only adds the proposal; the code is that of `c42527f`).

| Viewport | Before | After | Change |
| --- | --- | --- | --- |
| 390x844 | 366 | | |
| 393x852 | 369 | | |
| 375x667 | 351 | | |
| 360x640 | 336 | | |
| 412x915 | 388 | | |
| 430x932 | 406 | | |
| 320x568 | 296 | | |
| 768x1024 | 560 | | |
| 667x375 | 309 | | |
| 844x390 | 324 | | |
| 932x430 | 364 | | |
| 568x320 | 254 | | |
| 1024x768 | 560 | | |
| 1180x820 | 560 | | |

The before numbers for 390x844, 360x640 and 412x915 match the figures in the proposal (366, 336, 388).
