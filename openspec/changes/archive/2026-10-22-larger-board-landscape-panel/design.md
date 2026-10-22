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
| 390x844 | 366 | 378 | +12 |
| 393x852 | 369 | 381 | +12 |
| 375x667 | 351 | 363 | +12 |
| 360x640 | 336 | 348 | +12 |
| 412x915 | 388 | 400 | +12 |
| 430x932 | 406 | 418 | +12 |
| 320x568 | 296 | 308 | +12 |
| 768x1024 | 560 | 720 | +160 |
| 667x375 | 309 | 363 | +54 |
| 844x390 | 324 | 378 | +54 |
| 932x430 | 364 | 418 | +54 |
| 568x320 | 254 | 308 | +54 |
| 1024x768 | 560 | 720 | +160 |
| 1180x820 | 560 | 720 | +160 |

The before numbers for 390x844, 360x640 and 412x915 match the figures in the proposal (366, 336, 388).

Portrait: the space above and below the board is equal at every portrait viewport (for example 146.9 and 146.9 at 390x844, 65.9 and 65.9 at 375x667, 45 and 45 at 320x568) and the board is centred horizontally. Landscape: the board is the viewport height minus 12px (720px at most) and the margin above and below it is equal (6px; 24px at 1024x768, 50px at 1180x820). The keys are at least 72x72 in landscape and 60px tall in portrait, undo and pause are 52x52.

Gutter: 6px was kept. At 320, 375 and 430 widths the rounded frame and shadow still read clearly against the photo and the keys line up with the board edges; 8px (one token, `--board-gutter`) stays the fallback.

Implemented landscape layout: the board column is as wide as the screen is tall (capped at 720px plus the gutters) and the panel takes the remaining width, between 240px and 320px; the two columns are centred as a pair, and the grid rows (spacer, bar, keypad, spacer) centre the panel vertically. The pair only leaves spare width at both sides above about 1052px wide (at 1180x820 it is 54px each side); at 1024x768 the pair fills the width.

Height-aware keys and safe areas: the first version made the keys square, so key height followed the panel width and the panel could outgrow the screen once real safe-area insets are subtracted (iPhone landscape standalone: 47px left and right, 21px bottom, which left 369px at 844x390 against a 376px panel, and overflowed 12px at 568x320). The key height is now `clamp(44px, (available height - 2 gutters - bar - gaps) / 3, 110px)` and the key width follows the panel width, so the panel always fits the available height with the same 6px margin above and below as the board. The bar has a fixed 76px height and the status line is two stacked lines (level, then mistakes) in landscape with the separator dot hidden, so it never wraps to a line that starts with a dot. At 1024x768 and 1180x820 the keys grow to 110px tall so the keypad is not tiny next to a 720px board.

Checked with and without simulated insets (47px sides, 21px bottom, top 0, by rewriting `env(safe-area-inset-*)` in the built CSS) at 568x320, 667x375, 844x390, 932x430, 1024x768, 1180x820: nothing clips or scrolls, the panel keeps a 6px margin to the top and bottom of the available area and the board is vertically centred. With insets the board is smaller where width is the limit (222px at 568x320, 321px at 667x375) because the panel keeps at least 240px.
