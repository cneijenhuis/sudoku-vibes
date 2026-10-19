# Spec Delta

## Purpose

Defines what the player sees while playing: the board, top bar and number pad, and how the game recognises it has been won.

## ADDED Requirements

### Requirement: Screen layout
The game screen SHALL show, top to bottom, a bar with an undo button on the left, the running time in the centre and a pause button on the right; the 9x9 board centred in the remaining space; and the digits 1 to 9 in a row at the bottom.

#### Scenario: Phone portrait
- **WHEN** the game screen is shown at 375x667 CSS pixels
- **THEN** the top bar, a square fully visible board and all nine digit buttons are visible without scrolling, and the board is horizontally centred

### Requirement: Fits any viewport
The board SHALL be a square sized to the largest size that fits the space between the top bar and number pad, and all controls SHALL remain at least 44 CSS pixels in their smaller dimension.

#### Scenario: Small or landscape screens
- **WHEN** the viewport is 320x568 or 667x375
- **THEN** nothing is clipped or scrolls and every control is at least 44px in its smaller dimension

### Requirement: Cell rendering
Given digits SHALL be visually distinct from digits entered by the player, 3x3 boxes SHALL be visually separated, and each cell SHALL expose an accessible label with its row, column and value.

#### Scenario: Givens vs entries
- **WHEN** the board is shown with some entered digits
- **THEN** givens and entries are styled differently and box borders are heavier than cell borders

### Requirement: Selection and same-number highlight
The selected cell SHALL be highlighted. When the selected cell holds a digit, every other cell holding the same digit SHALL also be highlighted.

#### Scenario: Highlight matching digits
- **WHEN** the player taps a cell containing 7
- **THEN** that cell is marked selected and all other cells containing 7 are highlighted

#### Scenario: Empty cell selected
- **WHEN** the player taps an empty cell
- **THEN** only that cell is highlighted

### Requirement: Completion detection
When every cell holds the correct digit the game SHALL end and the app SHALL move to the results state with the elapsed time and mistake count.

#### Scenario: Last cell filled
- **WHEN** the player enters the correct digit in the last empty cell
- **THEN** the timer stops and the results state is shown carrying the time and mistakes
