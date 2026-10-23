# mistakes-and-undo Specification

## Purpose
Gives immediate feedback on wrong entries, forces the player to correct them, and lets any move be taken back.

## Requirements

### Requirement: Immediate mistake display
A digit that differs from the puzzle's solution SHALL be placed and shown immediately as a mistake, using a cue other than colour alone.

#### Scenario: Wrong digit
- **WHEN** the player places a digit that is not the solution for that cell
- **THEN** the cell displays the digit styled as a mistake and the mistake count increases by one

### Requirement: Mistakes block progress
While any mistake is on the board, placing further digits SHALL be disabled until the mistake is undone. Selecting cells and highlighting SHALL remain available.

#### Scenario: Entry blocked
- **WHEN** a mistake is on the board and the player selects an empty cell and taps a digit
- **THEN** the board is unchanged

#### Scenario: Selection still works
- **WHEN** a mistake is on the board and the player taps a filled cell
- **THEN** that cell is selected and matching digits are highlighted

### Requirement: Mistake count
The game SHALL count every wrong entry made. Undoing a mistake SHALL NOT reduce the count.

#### Scenario: Count persists
- **WHEN** the player enters a wrong digit and then undoes it
- **THEN** the mistake count remains 1

### Requirement: Unlimited undo
The undo button SHALL revert the most recent entry, repeatedly, back to the initial board. It SHALL be disabled when there is nothing to undo.

#### Scenario: Undo a correct entry
- **WHEN** the player has entered three digits and taps undo twice
- **THEN** the two most recent digits are removed in reverse order

#### Scenario: Undo a mistake
- **WHEN** a mistake is on the board and the player taps undo
- **THEN** the mistake is removed and entry is possible again

#### Scenario: Undo reselects the cell
- **WHEN** the player taps undo
- **THEN** the cell that was cleared is selected, so a replacement digit can be entered immediately

#### Scenario: Nothing to undo
- **WHEN** no digit has been entered
- **THEN** the undo button is disabled

### Requirement: Mistakes and undo in number-first mode
In number-first mode a mistake SHALL block placing further digits until it is undone, exactly as in cell-first mode, while switching the active digit and leaving the mode remain available. Undo SHALL remove the latest entry and SHALL NOT select a cell.

#### Scenario: Blocked until undone
- **WHEN** number-first mode is active and a mistake is on the board and the player taps an empty cell
- **THEN** the board is unchanged

#### Scenario: Undo keeps the mode
- **WHEN** number-first mode is active with 5 and the player undoes the last entry
- **THEN** the entry is removed, number-first mode stays active with 5 and no cell is selected

### Requirement: Redo
After an undo a redo button SHALL appear next to the undo button. Redo SHALL re-enter the most recently undone entry, with its note effects, repeatedly; it SHALL NOT count a mistake again. Any new entry SHALL clear what can be redone and hide the button. Nothing can be redone after a game is resumed, while paused or finished, or while a mistake is on the board.

#### Scenario: Undo then redo
- **WHEN** the player enters a digit, taps undo and then taps redo
- **THEN** the digit is back in its cell, no cell is selected and the redo button is hidden

#### Scenario: Several steps
- **WHEN** the player undoes two entries and taps redo twice
- **THEN** the entries return in their original order

#### Scenario: New entry clears redo
- **WHEN** the player undoes an entry and then enters a different digit
- **THEN** the redo button is hidden

#### Scenario: Redo a wrong digit
- **WHEN** the player undoes a wrong digit and taps redo
- **THEN** the wrong digit is back as a mistake and the mistake count is unchanged

#### Scenario: Resume
- **WHEN** the player undoes an entry, quits and resumes the game
- **THEN** the redo button is not shown
