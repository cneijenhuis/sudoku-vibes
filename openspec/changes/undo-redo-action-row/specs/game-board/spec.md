# Spec Delta

## MODIFIED Requirements

### Requirement: Screen layout
In portrait the game screen SHALL show, top to bottom, a bar with a pause button on the left and the running time beside it; the 9x9 board; the digits 1 to 9 in a row; and below them an action row with the undo button, key-sized, under the 1, the redo button next to it (under the 2) while there is something to redo, and the pencil button, key-sized, under the 9. The free space between bar and action row SHALL be split into three equal gaps. No wordmark.

#### Scenario: Phone portrait
- **WHEN** the game screen is shown at 375x667 CSS pixels
- **THEN** the top bar, a square fully visible board, all nine digit buttons and the action row below them are visible without scrolling, the board is horizontally centred and no wordmark is shown

#### Scenario: Board centred vertically
- **WHEN** the game screen is shown at 390x844
- **THEN** the gaps above the board, between the board and the digit row, and between the digit row and the action row differ by no more than 1px

#### Scenario: Pencil is key-sized
- **WHEN** the game screen is shown in portrait
- **THEN** the pencil button has the same width and height as the 9 key (within 1px), its right edge matches the 9 key's and it is below the digit row

#### Scenario: Undo and redo are key-sized
- **WHEN** the game screen is shown in portrait and an entry has been undone
- **THEN** undo is under the 1 and redo under the 2, both the size of a digit key, and the pause button is at the left of the top bar

### Requirement: Landscape panel
In every landscape viewport (width greater than height) the pause button and the timer SHALL sit in a panel on the right together with the digits as a 3x3 keypad and, below it, a compact row with undo and redo at the left and the pencil at the right, and the board SHALL use the full height minus a 6px margin, centred vertically in the area left of the panel.

#### Scenario: Landscape panel
- **WHEN** the game screen is shown at 844x390 or at 1024x768
- **THEN** pause and timer are in the right-hand panel above the keypad, the undo and pencil buttons are in a row below the keypad, none of them sits above the board, and the board's height equals the viewport height minus 12px (at most 720px)

#### Scenario: Rotation
- **WHEN** the device is rotated from portrait to landscape during a game
- **THEN** the layout switches to the right-hand panel without losing any game state

### Requirement: Fits any viewport
The pause button SHALL be at least 44 CSS pixels in both dimensions and each digit, undo, redo and pencil button at least 44 CSS pixels tall. Narrow undo, redo and pencil buttons SHALL get a transparent touch area at least 44px wide where no neighbouring button is closer; neighbouring areas meet midway between the buttons. The whole game screen SHALL fit without clipping or scrolling.

#### Scenario: Small or landscape screens
- **WHEN** the viewport is 320x568 or 667x375
- **THEN** nothing is clipped or scrolls, the board is fully visible and the pause, undo, pencil and digit buttons are at least 44px tall

#### Scenario: Touch areas do not overlap
- **WHEN** undo and redo are both shown at 320x568
- **THEN** a point in the gap between them resolves to one of the two buttons and no point resolves to a button other than the one it is over
