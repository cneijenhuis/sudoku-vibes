# Design

## Context

The app currently has a dark theme in a single `src/style.css` with per-level accent colours, a locked-gold number-first style and a results celebration. Source of truth for the new look: the Claude Docs handover "Sudoku Vibes – Beach Day (Deep Sea) Handover" (https://claude.ai/artifact/H6QX3s64FKsfvJRyzRz5Y1), variant A3, designed on a 390 x 844 frame with a 54px top safe area. Its tables are reproduced below so this change is self-contained. The background photo is the user's upload at `/root/.claude/uploads/8deb684b-58ce-596e-8b08-83919acb27e5/d67ae395-image.png` (1254 x 1254 PNG, about 2.4 MB: umbrella, deckchair with an inflatable 7, juice, towel; the 7 sits behind the board on portrait screens).

## Goals / Non-Goals

**Goals:** faithful play screen; one global token set; offline-safe fonts and photo; easy addition of more backgrounds; no gameplay change.

**Non-Goals:** redesigning the menu/pause/results layouts (interim re-skin only), redrawing PWA icons, a dark mode, per-level theming of the board, notes/pencil marks.

## Decisions

### Tokens (from the handover)
`--surface rgba(255,253,248,0.86)`, `--ink #10233A`, `--entry #067684`, `--line-strong #1E4D6B`, `--line-soft rgba(30,77,107,0.42)`, `--key-text #1E4D6B`, `--highlight #FFE08A`, `--highlight-text #6E4300`, `--highlight-ring #F4B400`, `--highlight-edge #D9A100`, `--done-text #4F6E82`, `--done-edge #6F8FA3`, `--accent #E2533F` (wordmark "Vibes" only), `--status #B83A28` (status line), `--fallback-bg #F6E9D2`, `--shadow-board 0 14px 30px rgba(40,30,10,0.22)`. Additions decided here (not in the handover): `--error` (a clear red, not #E2533F or #B83A28, at least 4.5:1 on #FFFDF8; the implementer measures and picks, e.g. around #C8102E), `--error-tint` (the error at about 14% alpha), `--cursor-fill` (light sea-glass, about #CDE9F2) and `--cursor-ring` (strong line).

### Typography (Fredoka 500/600/700, fallback `system-ui, sans-serif`)
Timer 34/600 (line-height 1); status line 15/500, 6px below timer; wordmark 30/700, letter-spacing -0.5px, 8px between words; given digit 25/600; entered digit 25/500 in `--entry`; number key 28/600. **Self-hosted** woff2 (latin subset, OFL) in `src/assets/fonts/`, loaded with `@font-face` and `font-display: swap`; no Google Fonts request, so the service worker precaches them and offline play stays intact. If the font files cannot be fetched in the build environment, report it instead of linking a CDN.

### Layout (390 x 844 reference)
One column, 12px side gutter. Safe area top (use `env(safe-area-inset-top)`), header row 56px (undo left, timer pill centre, pause right), wordmark pill 56px high 34px below the header, board full width (366px) square 18px below the pill, keypad 9 columns 60px high 40px below the board with 5px gaps. Radii: header buttons 18, timer pill 20, wordmark pill 28, board 22 outer, number keys 14. The existing flexible layout (board sized by container query, landscape side keypad) stays; the pill is hidden when showing it would make the board smaller than it is today at that viewport (short phones, landscape).

### Components (all white surfaces share `.glass`)
`.glass { background: var(--surface); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px) }`, with `@supports not (backdrop-filter: blur(1px))` raising alpha to 0.94 and `@media (prefers-reduced-transparency: reduce)` making it opaque #FFFDF8 without blur. Header buttons 52x52, no border, `0 3px 0 --line-strong`, 24px ink stroke icons (undo 2.2px, pause bars 3px). Timer pill padding 8px 18px 7px with the same drop edge. Board: glass, 3px `--line-strong` border, 22px radius, shadow, overflow hidden; boxes draw `0 0 0 1.5px --line-strong` (3px dividers where neighbours meet); cells transparent with `inset 0 0 0 1px --line-soft`. Cell states: empty/given/entered as in the tokens; highlighted = `--highlight` fill, `--highlight-text`, `inset 0 0 0 2px --highlight-ring`; selected cell (cursor, our addition) = `--cursor-fill` with a 3px `--cursor-ring` inset, so it differs from highlight in fill and ring weight; error = `--error` digit on `--error-tint` with the existing non-colour cue (wavy underline or corner marker). Keys: available = glass, 2px `--line-strong`, `0 3px 0 --line-strong`, `--key-text`; selected = `--highlight`, `--highlight-text`, 2px `--highlight-edge`, `0 4px 0 --highlight-edge`, `translateY(-3px)`; **lock icon only in number-first** (cell-first highlight shows no lock); completed = glass, 2px dashed `--done-edge`, `--done-text`, no shadow, check icon, disabled. The long-press fill animation is kept but recoloured with the highlight palette.

### Background
`src/theme/backgrounds.ts` exports a list of `{ id, image, fallback, position }`; one entry ships. A fixed full-viewport layer (`background-size: cover`, `background-position` from the entry, `background-color: --fallback-bg`) sits behind `#app`. The image is processed once into WebP (and a JPEG fallback only if WebP is unavailable in a target browser, which it is not) about 1170 px tall, about 150 to 250 KB, committed under `src/assets/backgrounds/`; the 2.4 MB original is not committed. The selected background's URL is preloaded from `index.html`. One background is chosen per load (list index, random once there is more than one). The SW plugin already precaches built assets, so the photo and fonts are cached for offline.

### Other screens (interim)
The menu, loading/error, pause overlay (a glass card centred over the photo), the replace-confirm sheet and the results screen switch to the tokens, Fredoka and glass. Per-level accent colours remain as small chips/pips/bars but must have enough contrast on light surfaces; the results celebration keeps working on the light theme. Layout and behaviour do not change. Menu header becomes the wordmark "Sudoku Vibes".

### Branding
`<title>Sudoku Vibes</title>`, manifest `name: "Sudoku Vibes"`, `short_name: "Sudoku Vibes"` (12 characters), `apple-mobile-web-app-title`, README title; `theme-color`/`background_color` become `#F6E9D2`. The iOS status-bar style (`black-translucent`) is reviewed against the light photo and changed to `default` only if the clock and icons are unreadable.

### Accessibility
Body text 4.5:1 minimum (the handover measured ink 15:1, key text 9:1, highlight text 7:1, status 5.5:1, entry 5:1, done text 5:1 over solid #FFFDF8; over the photo through 86% white they are slightly lower, so the implementer measures real rendered pairs). Keys keep real `button` elements with labels ("Number 4, complete"), undo and pause keep `aria-label`s.

## Risks / Trade-offs

- [Photo busy behind text] -> text sits on 86% white surfaces; the menu and pause cards are glass too; measure contrast over the actual photo.
- [`backdrop-filter` cost on low-end phones] -> radius is only 3px and applied to about 15 surfaces, not the 81 cells; the board itself is one blurred surface.
- [Number keys are about 36px wide at 390px (under 44px)] -> unchanged from today and called out in the handover; kept, height is 60px.
- [PWA icons still show the old dark 5-tile mark] -> deliberately not part of this change; flag as a follow-up design item.
- [Fredoka download blocked in the build environment] -> fall back to system-ui and report so the font can be added by hand.
