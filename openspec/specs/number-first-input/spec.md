# number-first-input Specification

## Purpose
Lets the player pick a digit once and then place it in many cells by tapping them, for fast entry of repeated digits.

## Requirements

### Requirement: Entering number-first mode
Holding a digit button on the number pad for about half a second SHALL switch the game to number-first mode with that digit active. While the button is held it SHALL show a fill animation rising from the bottom of the button, completing when the mode switches. Releasing before completion SHALL cancel the animation and act as an ordinary tap.

#### Scenario: Long press
- **WHEN** the player holds the 5 button until its fill animation completes
- **THEN** number-first mode is active with 5 as the active digit and all cells containing 5 are highlighted

#### Scenario: Early release
- **WHEN** the player releases the 5 button before the animation completes
- **THEN** the animation is cancelled, the mode does not change and the release counts as a tap on 5

#### Scenario: Selection cleared
- **WHEN** a cell is selected and the player long-presses a digit button
- **THEN** number-first mode starts and no cell is selected

### Requirement: Placing digits by tapping cells
In number-first mode, tapping an empty cell SHALL place the active digit in it immediately, without selecting the cell.

#### Scenario: Place the active digit
- **WHEN** number-first mode is active with 5 and the player taps an empty cell where 5 belongs
- **THEN** the 5 appears in that cell, the cell is not selected and all 5s stay highlighted

#### Scenario: Wrong cell
- **WHEN** number-first mode is active with 5 and the player taps an empty cell where 5 does not belong
- **THEN** the 5 is placed and shown as a mistake and the mistake count increases by one

### Requirement: Active digit indication
In number-first mode the active digit's button SHALL be visibly locked in, distinct from the plain highlight of cell-first mode, and no other part of the screen (board border, pad background) SHALL change appearance.

#### Scenario: Locked-in indicator
- **WHEN** number-first mode is active with 5
- **THEN** the 5 button shows a locked-in style that differs from the highlighted style used in cell-first mode

### Requirement: Switching the active digit
In number-first mode, tapping another digit button, or tapping any filled cell (given or entered) SHALL make that cell's or button's digit the active digit while staying in number-first mode. Long-pressing another digit button SHALL do the same. Tapping the active digit's own button SHALL leave the mode unchanged.

#### Scenario: Switch via pad
- **WHEN** number-first mode is active with 5 and the player taps the 7 button
- **THEN** 7 is the active digit, all 7s are highlighted and 5s are not

#### Scenario: Switch via board
- **WHEN** number-first mode is active with 5 and the player taps a cell containing 3
- **THEN** 3 is the active digit and the board is unchanged

#### Scenario: Active button tapped
- **WHEN** number-first mode is active with 5 and the player briefly taps the 5 button
- **THEN** number-first mode remains active with 5

### Requirement: Leaving number-first mode
Long-pressing the active digit's button SHALL return the game to cell-first mode with no cell selected and the digit remaining highlighted.

#### Scenario: Long press to exit
- **WHEN** number-first mode is active with 5 and the player completes a long press on the 5 button
- **THEN** cell-first mode is active, no cell is selected and the 5s remain highlighted

### Requirement: Completed digit advances to the next digit
When the active digit becomes complete in number-first mode, number-first mode SHALL stay active and the next higher digit that is not complete SHALL become the active digit, wrapping from 9 to 1 and skipping completed digits. A complete digit's button cannot start the mode or be made active.

#### Scenario: Last instance placed
- **WHEN** number-first mode is active with 2 and the player places the ninth correct 2 while 3 is not complete
- **THEN** number-first mode stays active with 3 as the active digit and all 3s are highlighted

#### Scenario: Skip completed digits
- **WHEN** number-first mode is active with 2, the player places the ninth correct 2 and 3 is already complete while 4 is not
- **THEN** 4 becomes the active digit

#### Scenario: Wrap around
- **WHEN** number-first mode is active with 9, the player places the ninth correct 9, and 1 is not complete
- **THEN** 1 becomes the active digit

#### Scenario: Wrap and skip
- **WHEN** number-first mode is active with 9, the player places the ninth correct 9 and 1 and 2 are complete while 3 is not
- **THEN** 3 becomes the active digit

#### Scenario: Undo of the completing entry
- **WHEN** the ninth 5 advanced the active digit to 6 and the player undoes that entry
- **THEN** the entry is removed, the 5 button is enabled again, number-first mode stays active with 6 and no cell is selected

#### Scenario: Puzzle finished
- **WHEN** the digit completed is the last one that was incomplete
- **THEN** the puzzle is complete and the results screen is shown as usual

#### Scenario: Cell-first unchanged
- **WHEN** cell-first mode is active and the player enters the ninth correct 5
- **THEN** cell-first mode stays active and nothing is highlighted

### Requirement: Mode is per game
A new game SHALL start in cell-first mode, and pausing and resuming SHALL preserve the current mode and active digit.

#### Scenario: Pause and resume
- **WHEN** the player pauses during number-first mode with 5 and resumes
- **THEN** number-first mode is still active with 5
