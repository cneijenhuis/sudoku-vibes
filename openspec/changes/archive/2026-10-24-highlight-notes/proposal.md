## Why
Highlighting a digit lights up its placed cells but not the same digit inside pencil notes, so the player has to scan the small notes by eye to find candidates.

## What Changes
- In every empty cell, the note matching the highlighted digit (cell-first highlight or number-first locked digit) is drawn dark blue (the board ink) and extra bold, so it stands out from the other notes.
- No cell fill or ring is added; only the note digit changes.

## Impact
- Spec: pencil-notes (Note display).
- Code: `src/ui/game.ts` (note class, render cache key), `src/style.css`, README.
