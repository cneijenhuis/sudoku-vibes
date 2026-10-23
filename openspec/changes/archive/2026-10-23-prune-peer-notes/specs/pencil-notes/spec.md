# Spec Delta

## ADDED Requirements

### Requirement: Placing a digit prunes peer notes
Placing a correct digit SHALL remove that digit's note from every other cell in the same row, column and 3x3 box. A wrong digit SHALL NOT remove any notes. Cells without that note SHALL be unchanged.

#### Scenario: Peers pruned
- **WHEN** cells in the same row, column and box as an empty cell all have note 5 and the player places the correct 5 in that cell
- **THEN** those cells no longer have note 5 and keep their other notes

#### Scenario: Other cells untouched
- **WHEN** a cell outside the row, column and box of the entry has note 5 and a correct 5 is placed
- **THEN** that cell still has note 5

#### Scenario: Wrong digit
- **WHEN** the player places a wrong 5 in a cell
- **THEN** no peer loses its note 5

### Requirement: Undo restores removed notes
Undoing an entry SHALL restore the notes that entry removed: the entry cell's own notes and the peer notes it pruned. An entry restored from a save has no such record, so undoing it restores no notes.

#### Scenario: Undo restores
- **WHEN** a cell has notes 2 and 5, peers have note 5, the player places the correct 5 and then taps undo
- **THEN** the cell is empty with notes 2 and 5 and the peers have note 5 again

#### Scenario: Undo after resume
- **WHEN** a game is resumed from a save and the player undoes an entry saved earlier
- **THEN** the cell is empty and no notes are restored

## MODIFIED Requirements

### Requirement: Note display
Notes SHALL appear in an empty cell as small digits on a 3x3 grid in fixed positions (1 2 3 on top, 4 5 6 in the middle, 7 8 9 at the bottom), much smaller than a placed digit, so a cell with all nine notes reads 123/456/789. A cell holding a digit SHALL show no notes, and notes of a digit that is complete SHALL be hidden. The cell's accessible label SHALL list its notes.

#### Scenario: Full cell
- **WHEN** a cell has all nine notes
- **THEN** it shows 1 2 3, 4 5 6 and 7 8 9 on three rows, each digit smaller than half the size of a placed digit, all inside the cell

#### Scenario: Complete digit hides its notes
- **WHEN** a cell has notes 4 and 6 and the ninth 4 is placed elsewhere
- **THEN** the cell shows only note 6

#### Scenario: Placing clears notes
- **WHEN** a cell has notes and the player places a digit in it
- **THEN** the cell shows only the digit

#### Scenario: Accessible label
- **WHEN** a cell has notes 1 and 9
- **THEN** its accessible label ends with "notes 1, 9"
