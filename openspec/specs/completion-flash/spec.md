# completion-flash Specification

## Purpose
Acknowledges progress on the board: a brief yellow flash on the cells of a row, column, box or digit the player has just completed.

## Requirements

### Requirement: Flash on completed groups
When a player's entry makes a row, column or 3x3 box hold the correct digit in all nine cells, those nine cells SHALL play a short yellow flash once. When the entry makes a digit have all nine instances correctly placed, every cell holding that digit SHALL flash at the same time. Cells flashing for several reasons flash once together.

#### Scenario: Row completed
- **WHEN** the player enters the last missing correct digit of a row
- **THEN** the nine cells of that row flash yellow once

#### Scenario: Digit completed
- **WHEN** the player enters the ninth correct 4
- **THEN** all nine cells holding 4 flash yellow at the same time

#### Scenario: Several at once
- **WHEN** one entry completes a row and a box
- **THEN** the union of their cells flashes together, each cell once

#### Scenario: Wrong digit
- **WHEN** the player enters a wrong digit
- **THEN** no cell flashes

### Requirement: Only entries flash
Undo, redo, resuming a saved game and the entry that finishes the puzzle SHALL NOT flash. A group that is broken by undo and completed again by a new entry SHALL flash again.

#### Scenario: Undo and redo
- **WHEN** the player undoes or redoes an entry
- **THEN** no cell flashes

#### Scenario: Resume
- **WHEN** a saved game with completed rows is resumed
- **THEN** no cell flashes

#### Scenario: Last move
- **WHEN** the final entry completes the puzzle
- **THEN** no flash plays and the results screen appears as before

### Requirement: Flash look
The flash SHALL be a yellow wash (the highlight amber, peaking at about 80% opacity so it shows over highlighted cells too), last about 700 ms and not block input, not change layout and not hide digits. Under reduced motion no animation SHALL play. Red SHALL NOT be used.

#### Scenario: Input during a flash
- **WHEN** the player taps a cell or a key while cells are flashing
- **THEN** the input works normally

#### Scenario: Reduced motion
- **WHEN** the system prefers reduced motion and a row is completed
- **THEN** no animation plays
