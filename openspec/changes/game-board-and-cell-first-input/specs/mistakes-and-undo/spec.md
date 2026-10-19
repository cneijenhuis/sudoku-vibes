# Spec Delta

## Purpose

Gives immediate feedback on wrong entries, forces the player to correct them, and lets any move be taken back.

## ADDED Requirements

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

#### Scenario: Nothing to undo
- **WHEN** no digit has been entered
- **THEN** the undo button is disabled
