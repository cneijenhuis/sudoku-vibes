# Spec Delta

## MODIFIED Requirements

### Requirement: Screen layout
In portrait the game screen SHALL show, top to bottom, a bar with an undo button on the left, the running time in the centre and a pause button on the right; the 9x9 board; the digits 1 to 9 in a row; and below them a pencil button the same size as a digit key, right edge in line with the 9 key. The free space between bar and pencil SHALL be split into three equal gaps. No wordmark.

#### Scenario: Phone portrait
- **WHEN** the game screen is shown at 375x667 CSS pixels
- **THEN** the top bar, a square fully visible board, all nine digit buttons and the pencil button below them are visible without scrolling, the board is horizontally centred and no wordmark is shown

#### Scenario: Board centred vertically
- **WHEN** the game screen is shown at 390x844
- **THEN** the gaps above the board, between the board and the digit row, and between the digit row and the pencil button differ by no more than 1px

#### Scenario: Pencil is key-sized
- **WHEN** the game screen is shown in portrait
- **THEN** the pencil button has the same width and height as the 9 key (within 1px), its right edge matches the 9 key's and it is below the digit row
