# Spec Delta

## ADDED Requirements

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
