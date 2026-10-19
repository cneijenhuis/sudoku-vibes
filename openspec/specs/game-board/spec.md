# game-board Specification

## Purpose
Defines what the player sees while playing: the board, top bar and number pad, and how the game recognises it has been won.

## Requirements

### Requirement: Screen layout
The game screen SHALL show, top to bottom, a bar with an undo button on the left, the running time in the centre and a pause button on the right; the 9x9 board centred in the remaining space; and the digits 1 to 9 in a row at the bottom (see "Fits any viewport" for short landscape screens).

#### Scenario: Phone portrait
- **WHEN** the game screen is shown at 375x667 CSS pixels
- **THEN** the top bar, a square fully visible board and all nine digit buttons are visible without scrolling, and the board is horizontally centred

### Requirement: Fits any viewport
The board SHALL be a square sized to the largest size that fits the space between the top bar and number pad. The undo and pause buttons SHALL be at least 44 CSS pixels in both dimensions, and each digit button SHALL be at least 44 CSS pixels tall and share the row width equally (nine buttons cannot each be 44px wide on phones narrower than 396px). In short landscape viewports the number pad MAY move beside the board as a 3x3 keypad.

#### Scenario: Small or landscape screens
- **WHEN** the viewport is 320x568 or 667x375
- **THEN** nothing is clipped or scrolls, the board is fully visible and the undo, pause and digit buttons are at least 44px tall

### Requirement: Live status line
Below the time the top bar SHALL show the difficulty name and the number of mistakes made so far, highlighted once the count is above zero.

#### Scenario: Mistake count shown
- **WHEN** the player has made one mistake
- **THEN** the status line reads "<Difficulty> · 1 mistake" in a highlighted style

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
