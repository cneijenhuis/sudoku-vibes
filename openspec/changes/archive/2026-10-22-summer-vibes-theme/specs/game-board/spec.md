# Spec Delta

## MODIFIED Requirements

### Requirement: Screen layout
The game screen SHALL show, top to bottom, a bar with an undo button on the left, the running time in the centre and a pause button on the right; the "Sudoku Vibes" wordmark pill when there is room; the 9x9 board centred in the remaining space; and the digits 1 to 9 in a row at the bottom (see "Fits any viewport" for short landscape screens).

#### Scenario: Phone portrait
- **WHEN** the game screen is shown at 375x667 CSS pixels
- **THEN** the top bar, a square fully visible board and all nine digit buttons are visible without scrolling, and the board is horizontally centred

### Requirement: Live status line
Below the time the top bar SHALL show the difficulty name and the number of mistakes made so far in the status colour, emphasised in weight once the count is above zero.

#### Scenario: Mistake count shown
- **WHEN** the player has made one mistake
- **THEN** the status line reads "<Difficulty> · 1 mistake" in the status colour with stronger weight
