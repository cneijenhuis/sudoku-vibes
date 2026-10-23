# game-board Specification

## Purpose
Defines what the player sees while playing: the board, top bar and number pad, and how the game recognises it has been won.

## Requirements

### Requirement: Screen layout
In portrait the game screen SHALL show, top to bottom, a bar with a pause button on the left and the running time centred; the 9x9 board; the digits 1 to 9 in a row; and below them an action row with the undo button, key-sized, under the 1, the redo button next to it (under the 2) while there is something to redo, and the pencil button, key-sized, under the 9. The free space between bar and action row SHALL be split into three equal gaps. No wordmark.

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

### Requirement: Portrait board size
In portrait the board SHALL be a square sized to the largest size that fits between the top bar and the number keys, at most 720 CSS pixels.

#### Scenario: Portrait phone
- **WHEN** the game screen is shown at 390x844
- **THEN** the board is 378px wide and nothing is clipped or scrolls

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
