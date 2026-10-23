# Spec Delta

## MODIFIED Requirements

### Requirement: Screen layout
In portrait the game screen SHALL show, top to bottom, a bar with an undo button on the left, the running time in the centre and a pause button on the right; the 9x9 board; a pencil button the same size as a digit key, right edge in line with the 9 key; and the digits 1 to 9 in a row at the bottom. The free space between bar and digits SHALL be split into three equal gaps around the board and the pencil button. No wordmark.

#### Scenario: Phone portrait
- **WHEN** the game screen is shown at 375x667 CSS pixels
- **THEN** the top bar, a square fully visible board, the pencil button and all nine digit buttons are visible without scrolling, the board is horizontally centred and no wordmark is shown

#### Scenario: Board centred vertically
- **WHEN** the game screen is shown at 390x844
- **THEN** the gaps above the board, between the board and the pencil button, and between the pencil button and the digit row differ by no more than 1px

#### Scenario: Pencil is key-sized
- **WHEN** the game screen is shown in portrait
- **THEN** the pencil button has the same width and height as the 9 key (within 1px) and its right edge matches the 9 key's
