# play-screen-visuals Specification

## Purpose
Defines the exact look of the play screen: header, wordmark, board, cells and number keys in each state.

## Requirements

### Requirement: Header controls
The header SHALL show undo (left), the timer pill (centre) and pause (right). Undo and pause SHALL be 52x52px glass buttons with radius 18px, no border, a 0 3px 0 strong-line drop edge, 24px ink stroke icons, and accessible names "Undo" and "Pause". The timer pill SHALL be a glass pill (radius 20px) with the time in 34px Fredoka 600 and below it, 6px lower, the status line in 15px 500 in the status colour.

#### Scenario: Header contents
- **WHEN** the play screen is shown
- **THEN** the undo button, timer pill and pause button appear in one row with the specified sizes and accessible names

### Requirement: Board frame
The board SHALL be a glass surface with a 3px strong-line border, 22px outer radius, board shadow and hidden overflow. 3x3 boxes SHALL be divided by 3px strong-line dividers (each box drawing a 1.5px strong-line edge) and single cells by 1px soft lines.

#### Scenario: Grid lines
- **WHEN** the board is shown
- **THEN** box dividers are visibly heavier than cell lines and the outer corners are rounded

### Requirement: Cell digits and states
Givens SHALL be ink, Fredoka 600, 25px; digits the player entered SHALL be the entry colour, weight 500. Cells holding the highlighted digit SHALL have the highlight fill, highlight-text digit and a 2px inset highlight ring. The selected cell (cell-first cursor) SHALL be clearly different from a highlighted cell: a light sea-glass fill with a thicker 3px strong-line inset ring.

#### Scenario: Highlight vs cursor
- **WHEN** a digit is highlighted and an empty cell is selected
- **THEN** highlighted cells are yellow with a 2px ring and the selected cell has a different fill and a 3px ring

### Requirement: Error cells
A cell holding a wrong digit SHALL use the error colour for the digit with a light error tint fill and SHALL keep a non-colour cue (such as an underline or corner marker). Red SHALL NOT be used as a fill anywhere else in the interface.

#### Scenario: Wrong digit
- **WHEN** the player enters a wrong digit
- **THEN** the cell shows the digit in the error colour on a light red tint with a non-colour cue

### Requirement: Available number keys
Number keys SHALL be 60px high with 14px radius and Fredoka 600 28px digits. Available keys SHALL be glass with key-text digits, a 2px strong-line border and a 0 3px 0 strong-line drop edge.

#### Scenario: Available key
- **WHEN** a digit still has instances to place
- **THEN** its key is a glass key with a strong-line border and drop edge

### Requirement: Selected number key
The key of the highlighted digit (or the active number-first digit) SHALL have the highlight fill, highlight-text digit, a 2px highlight-edge border, a 0 4px 0 highlight-edge drop edge and be raised 3px. In number-first mode it SHALL also show an 11px lock icon 6px from its top.

#### Scenario: Selected key
- **WHEN** a digit is highlighted in cell-first mode
- **THEN** its key is yellow and raised without a lock icon

#### Scenario: Number-first key
- **WHEN** number-first mode is active with 5
- **THEN** the 5 key is yellow and raised with a lock icon

### Requirement: Completed number keys
A completed key SHALL be glass with a 2px dashed done-edge border, done-text digit, no drop edge and an 11px check icon 6px from its top, and SHALL NOT be tappable.

#### Scenario: Completed key
- **WHEN** all nine 4s are placed correctly
- **THEN** the 4 key has a dashed border, a check icon and cannot be tapped

### Requirement: Layout across devices
The play screen SHALL give the board and the number keys a 6px side gutter in portrait (the header controls keep a 12px inset), SHALL fit 390x844, 375x667, 320x568, 667x375, 844x390 and 1024x768 without scrolling or clipping, and SHALL keep touch targets at their previous size. Where the board is width-limited it SHALL be the viewport width minus the two gutters, and the board SHALL NOT be smaller than its size before the Summer Vibes restyle at any of those viewports.

#### Scenario: Small viewports
- **WHEN** the play screen is shown at 375x667, 320x568, 667x375 and 844x390
- **THEN** nothing scrolls or is clipped and the board is larger than it was before the restyle

#### Scenario: Width-limited board
- **WHEN** the play screen is shown at 390x844
- **THEN** the board is 378px wide (390 minus two 6px gutters)

#### Scenario: Tablet
- **WHEN** the play screen is shown at 768x1024
- **THEN** the board is 720px wide, centred horizontally
