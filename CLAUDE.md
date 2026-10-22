# Sudoku Vibes – working notes

Stack, theme and product constraints are in `openspec/config.yaml`; behaviour is in `openspec/specs/`;
the reasoning behind past decisions is in `openspec/changes/archive/*/design.md`. This file only holds
how we work and what is easy to get wrong.

## Workflow
- A behaviour change is an OpenSpec change (`openspec new change`, proposal/specs/design/tasks,
  `openspec validate --strict`), archived after merge. Tiny styling or debugging tweaks may go direct,
  but then update the main spec and README if documented behaviour or a documented decision changed.
- Delegated flow: I write the change, a Sonnet subagent implements it, a separate Sonnet subagent
  reviews it. REQUEST_CHANGES goes back to the same implementer via SendMessage; larger fixes get a
  fresh re-review. Prompt templates and the checklist: `/ship-change`.
- Never commit a running subagent's work in progress (the stop hook nags meanwhile; ignore it). A
  parallel agent that must not touch the repo works in the scratchpad only.
- Dev branch `claude/relaxed-keller-2de3gj`. Shipping = push it and also
  `git push origin claude/relaxed-keller-2de3gj:main` (GitHub Pages deploys `main` via Actions). No PRs
  unless asked. The user owns repo and environment settings (Pages, branch rules); I cannot change them.

## OpenSpec traps (`.claude/skills/openspec-*` cover the rest)
- MODIFIED must repeat the whole requirement including every existing scenario (a missing or renamed
  scenario fails validation). Keep requirement text under 500 characters or `--strict` fails.
- A renamed requirement needs RENAMED plus MODIFIED. Deltas cannot change `## Purpose`: edit the main
  spec by hand after archiving, then re-run `openspec validate --all --strict` (an archive can leave a
  failing main spec).

## Browser testing
- Use `tools/e2e/` (`/sudoku-e2e`): static server under the `/sudoku-vibes/` sub-path, seeded puzzles,
  touch holds, safe-area and iOS-standalone simulation, offline and installability checks. Never run
  `playwright install`; scratchpad scripts do not survive a session.

## Hard-won facts
- iOS home-screen mode reports a layout viewport 59pt shorter than the screen and clips fixed layers
  there. The photo is therefore `<html>`'s background plus `--canvas-h` (`src/theme/canvas.ts`). Do not
  go back to a fixed background layer, and keep that decision identical in both viewport states (the
  first version flickered). Details: `openspec/changes/archive/*ios-standalone-fullscreen/design.md`.
- The service worker has no `skipWaiting`: after a deploy the user must fully close the installed app to
  get the new version. Say so when shipping. Files in `dist/` are precached automatically (exclusions:
  `PRECACHE_EXCLUDE` in `build/sw-plugin.ts`).
- The user tests on an iPhone (iOS 18.5, installed PWA), not in a desktop browser. Chromium emulation
  cannot show real iOS Safari, notch or vibration behaviour; say what was not verified.

## Preferences
- Red is only for errors (never a fill elsewhere). The board should be as large as possible. No
  runtime dependencies.
- For creative choices (icons, designs) produce options in one contact sheet, then ask for a letter.
- Short answers. When a sensible default exists, state the assumption instead of asking.
