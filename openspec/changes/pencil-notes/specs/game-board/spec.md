# Spec Delta

## MODIFIED Requirements

### Requirement: Screen layout
In portrait the game screen SHALL show, top to bottom, a bar with an undo button on the left, the running time in the centre and a pause button on the right; the 9x9 board centred horizontally and vertically in the space between the bar and the notes row; a row with the pencil button at its right end; and the digits 1 to 9 in a row at the bottom. There SHALL be no product wordmark on the play screen. In landscape the layout is defined by "Fits any viewport".

#### Scenario: Phone portrait
- **WHEN** the game screen is shown at 375x667 CSS pixels
- **THEN** the top bar, a square fully visible board, the pencil button and all nine digit buttons are visible without scrolling, the board is horizontally centred and no wordmark is shown

#### Scenario: Board centred vertically
- **WHEN** the game screen is shown at 390x844
- **THEN** the space above the board (below the top bar) and the space below it (above the pencil row) differ by no more than 1px

### Requirement: Landscape panel
In every landscape viewport (width greater than height) the undo button, the timer and the pause button SHALL sit in a panel on the right together with the digits as a 3x3 keypad and the pencil button right-aligned below it, and the board SHALL use the full height minus a 6px margin, centred vertically in the area left of the panel.

#### Scenario: Landscape panel
- **WHEN** the game screen is shown at 844x390 or at 1024x768
- **THEN** undo, timer and pause are in the right-hand panel above the keypad, the pencil button is below the keypad, none of them sits above the board, and the board's height equals the viewport height minus 12px (at most 720px)

#### Scenario: Rotation
- **WHEN** the device is rotated from portrait to landscape during a game
- **THEN** the layout switches to the right-hand panel without losing any game state
