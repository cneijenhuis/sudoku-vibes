## Decisions
- **Dark blue, bold (option C of the contact sheet).** Brown matches the highlighted cell's digit but is close to the grey-blue notes in hue at this size; blue bold gave the strongest contrast without a new colour. Alternatives: brown regular/bold, blue regular (too subtle).
- **Only the digit, no pill or fill.** Notes are tiny; a fill would crowd neighbours and risks reading as a mistake or cursor.
- **Selected cell included.** The highlight applies in the cursor cell too; the cell fill is unchanged.
- **Render cache.** The per-cell cache key gains a flag for "this cell's notes contain the highlighted digit", so cells re-render when the highlight changes.

## Risks
- Heavier weight may widen the glyph slightly; the 3x3 grid has fixed cells, so layout cannot shift. Verified by screenshot.
