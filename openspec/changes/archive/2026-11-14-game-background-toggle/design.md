## Context
The photo is `<html>`'s background (`--bg-image`, see `src/theme/canvas.ts` and the iOS standalone
design): fixed layers get clipped in iOS home-screen mode, so the plain modes must also paint the root
element, never a fixed layer. All colours are custom properties on `:root` (`src/style.css`), and the
game screen is mounted/disposed by the router (`gameScreen()` in `src/ui/game.ts`).

## Goals / Non-Goals
Goals: a one-tap, three-way switch on the game screen; remembered; other screens untouched.
Non-goals: a dark theme for other screens, following the system dark-mode preference, per-game
settings, new images.

## Decisions

**1. A `data-scene` attribute on `<html>`, set only while the game screen is mounted.**
`gameScreen()` sets `document.documentElement.dataset.scene = 'light' | 'dark'` on mount and removes it
in `dispose()` (photo = no attribute, so photo mode is byte-for-byte today's CSS). CSS:
`html[data-scene] { background-image: none; background-color: <scene bg>; }` plus token overrides under
`html[data-scene="dark"]`. Root element, so iOS standalone `--canvas-h` keeps working unchanged.
Alternatives: a class on `.game-screen` (cannot repaint the canvas behind the safe areas); a fixed
full-screen layer (clipped on iOS, explicitly rejected in CLAUDE.md).

**2. DOM-free module `src/theme/scene.ts`.** `type Scene = 'photo' | 'light' | 'dark'`,
`nextScene(s)`, `loadScene(kv)` (unknown/missing → `'photo'`), `saveScene(kv, s)` using the existing
never-throwing `KeyValue` (`src/storage/kv.ts`, key `sudoku-vibes:background`), and
`applyScene(root, s | null)` that sets/removes the attribute and the `theme-color` meta. Unit-tested
like `backgrounds.ts`. `GameEnv` gets an optional `kv` so tests inject a fake.

**3. Colours.** Light: page `#F4F1EA`, every token unchanged (surfaces stay the light glass).
Dark (start here; tune only to meet contrast): page `#0F151D`; surface `rgba(29,40,54,0.88)`,
surface-solid `#1D2836`, surface-fallback `rgba(29,40,54,0.96)`; ink `#E9EFF5`; key text `#D3E2EE`;
entry `#6FD3DE`; strong line `#7FA6C2`; soft line `rgba(127,166,194,0.36)`; done text `#93A9BA`;
done edge `#5F7B8F`; status `#F0A57F` (warm orange, not red); error `#FF7D8C`, error tint
`rgba(255,125,140,0.18)`; cursor fill `#2A4A5D`; board shadow `0 14px 30px rgba(0,0,0,0.5)`.
Highlight (`#FFE08A` fill, `#6E4300` text, ring/edge) stays: it reads well on dark. Drop edges under
buttons/keys currently use the strong line; in dark use a near-black edge (`#05080C`) via a new
`--edge` token that defaults to `var(--line-strong)`, so light and photo stay identical.
Any other literal colour on the game screen (pause card, completion flash, notes, digit jump) is
checked in dark and moved onto tokens where it looks wrong.

**4. Status bar.** The app uses `black-translucent` (white status text, fixed at launch). In light mode
the root background adds a dark strip exactly `env(safe-area-inset-top)` tall in the strong-line navy
(`linear-gradient` layer sized `100% env(safe-area-inset-top)`, no-repeat, top). Zero height in the
browser and on non-notched devices. Dark mode needs nothing; photo is unchanged. `theme-color` meta is
set to the scene colour while a plain scene is active and restored to `#F6E9D2` on leave.

**5. Button.** Reuse `iconButton()`; class `scene`, `data-action="scene"`, placed as the third topbar
child in grid column 3 (portrait and landscape already reserve a 52px column). Icons in the existing
24px 2.2-stroke style: picture frame, sun, moon (from the approved contact sheet, option C). It shows
the *current* mode. Hidden with the rest of the header while paused (existing rule).

## Risks / Trade-offs
- Flash when leaving the game: removing the attribute in `dispose()` before the next screen paints;
  the photo is already decoded, so no fallback flash. Verify menu/results after a dark game.
- Background swap on new game (`applyBackgroundWhenLoaded`) keeps setting `--bg-image` underneath; in
  a plain scene it is simply not visible. No interaction.
- Chromium cannot show the real iOS status bar; the strip is verified by measuring with a simulated
  safe-area inset, and the user checks on the iPhone.
