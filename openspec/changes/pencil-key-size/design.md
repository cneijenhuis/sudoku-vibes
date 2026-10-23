# Design

The key size comes from the pad: width = one of nine pad columns (`(pad width - 8 gaps) / 9`), height = the digit key height (60px). Both come from one set of CSS values so they cannot drift apart; the button is right-aligned to the pad's content edge.

Vertical rhythm: bar, board region, pencil button, digit row sit in a column whose free space is divided into three equal gaps (for example `justify-content: space-evenly` on a grid or flex column, or equal auto margins). The board's size is the largest square that fits the width and leaves at least 6px per gap; if the screen is short, the board shrinks before the gaps do. The pad's existing top padding for the drop edge must not make the lower gap look larger: measure from the button/key edges, not from padding boxes.

Alternatives (from the contact sheet): two-row pad (B, bigger keys, costs board height) and top-bar button (C, wraps the clock). Rejected by the user's choice of A.

Landscape keeps its compact button (the panel is already height-constrained by a 3x3 keypad of up to 110px keys).

Touch target: the visible pencil button is exactly one digit key, which is only 30-38px wide on phones, so a transparent `::after` on the button extends its hit area leftwards (over the empty notes-row columns) to at least 44px. Vertically it is already 60px. The 8 key is below the row, so nothing overlaps it. Landscape's 56x44 button needs no extension.
