# Spec Delta

## Purpose

Lets the player pick a digit once and then place it in many cells by tapping them, for fast entry of repeated digits.

## ADDED Requirements

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
In number-first mode, tapping an empty cell SHALL place the active digit in it immediately, without selecting the cell. Tapping the same empty cell would place it again only if undone first.

#### Scenario: Place the active digit
- **WHEN** number-first mode is active with 5 and the player taps an empty cell where 5 belongs
- **THEN** the 5 appears in that cell, the cell is not selected and all 5s stay highlighted

#### Scenario: Wrong cell
- **WHEN** number-first mode is active with 5 and the player taps an empty cell where 5 does not belong
- **THEN** the 5 is placed and shown as a mistake and the mistake count increases by one

### Requirement: Active digit indication
In number-first mode the active digit's button SHALL be visibly locked in, distinct from the plain highlight of cell-first mode, and the pad SHALL indicate that number-first mode is on.

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

### Requirement: Completed digit ends the mode
When the active digit becomes complete, number-first mode SHALL end and the game SHALL return to cell-first mode with nothing highlighted. A complete digit's button cannot start the mode.

#### Scenario: Last instance placed
- **WHEN** number-first mode is active with 5 and the player places the ninth correct 5
- **THEN** cell-first mode is active, the 5 button is disabled and nothing is highlighted

### Requirement: Mode is per game
A new game SHALL start in cell-first mode, and pausing and resuming SHALL preserve the current mode and active digit.

#### Scenario: Pause and resume
- **WHEN** the player pauses during number-first mode with 5 and resumes
- **THEN** number-first mode is still active with 5
