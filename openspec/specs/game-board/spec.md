# game-board Specification

## Purpose
Defines what the player sees while playing: the board, top bar and number pad, and how the game recognises it has been won.

## Requirements

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

### Requirement: Portrait board size
In portrait the board SHALL be a square sized to the largest size that fits between the top bar and the number keys, at most 720 CSS pixels.

#### Scenario: Portrait phone
- **WHEN** the game screen is shown at 390x844
- **THEN** the board is 378px wide and nothing is clipped or scrolls

### Requirement: Landscape panel
In every landscape viewport (width greater than height) the undo button, the timer and the pause button SHALL sit in a panel on the right together with the digits as a 3x3 keypad and the pencil button right-aligned below it, and the board SHALL use the full height minus a 6px margin, centred vertically in the area left of the panel.

#### Scenario: Landscape panel
- **WHEN** the game screen is shown at 844x390 or at 1024x768
- **THEN** undo, timer and pause are in the right-hand panel above the keypad, the pencil button is below the keypad, none of them sits above the board, and the board's height equals the viewport height minus 12px (at most 720px)

#### Scenario: Rotation
- **WHEN** the device is rotated from portrait to landscape during a game
- **THEN** the layout switches to the right-hand panel without losing any game state

### Requirement: Fits any viewport
The undo and pause buttons SHALL be at least 44 CSS pixels in both dimensions and each digit button at least 44 CSS pixels tall, and the whole game screen SHALL fit without clipping or scrolling.

#### Scenario: Small or landscape screens
- **WHEN** the viewport is 320x568 or 667x375
- **THEN** nothing is clipped or scrolls, the board is fully visible and the undo, pause and digit buttons are at least 44px tall

### Requirement: Live status line
Below the time the top bar SHALL show the difficulty name and the number of mistakes made so far in the status colour, emphasised in weight once the count is above zero.

#### Scenario: Mistake count shown
- **WHEN** the player has made one mistake
- **THEN** the status line reads "<Difficulty> · 1 mistake" in the status colour with stronger weight

### Requirement: Cell rendering
Given digits SHALL be visually distinct from digits entered by the player, 3x3 boxes SHALL be visually separated, and each cell SHALL expose an accessible label with its row, column and value.

#### Scenario: Givens vs entries
- **WHEN** the board is shown with some entered digits
- **THEN** givens and entries are styled differently and box borders are heavier than cell borders

### Requirement: Selection and same-number highlight
The selected cell SHALL be highlighted. The game SHALL keep at most one highlighted digit, and every cell holding that digit SHALL be highlighted. Tapping a filled cell SHALL make its digit the highlighted digit. Selecting an empty cell SHALL NOT change the highlighted digit. A digit that is complete SHALL never be highlighted.

#### Scenario: Highlight matching digits
- **WHEN** the player taps a cell containing 7
- **THEN** that cell is marked selected and all cells containing 7 are highlighted

#### Scenario: Empty cell selected
- **WHEN** 7 is highlighted and the player taps an empty cell
- **THEN** that cell is selected and the cells containing 7 stay highlighted

#### Scenario: Highlight survives entry
- **WHEN** the player enters a 3 into the selected empty cell
- **THEN** the cell is deselected and all cells containing 3, including the new one, are highlighted

### Requirement: Completion detection
When every cell holds the correct digit the game SHALL end and the app SHALL move to the results state with the elapsed time and mistake count.

#### Scenario: Last cell filled
- **WHEN** the player enters the correct digit in the last empty cell
- **THEN** the timer stops and the results state is shown carrying the time and mistakes

### Requirement: Completed digits
When all nine instances of a digit are present and correct, its digit button SHALL be greyed out and disabled, and cells containing that digit SHALL NOT be highlighted. A digit that is no longer complete (after an undo) SHALL become available again.

#### Scenario: Digit completed
- **WHEN** the player enters the ninth correct 4
- **THEN** the 4 button is greyed out and cannot be tapped, and no cell is shown as highlighted for 4

#### Scenario: Completed digit cannot be highlighted
- **WHEN** 4 is complete and the player taps a cell containing 4
- **THEN** the cell is selected but no other cells are highlighted

#### Scenario: Undo reopens a digit
- **WHEN** 4 is complete and the player undoes the last 4 they entered
- **THEN** the 4 button is enabled again

#### Scenario: Undo restores a hidden highlight
- **WHEN** 4 was highlighted, the ninth 4 completed it, and the player undoes that entry
- **THEN** the 4 button is enabled and the cells containing 4 are highlighted again
