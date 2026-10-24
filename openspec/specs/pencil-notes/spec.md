# pencil-notes Specification

## Purpose
Lets the player jot candidate digits into empty cells as small notes, without placing a digit or risking a mistake.

## Requirements

### Requirement: Notes mode toggle
A pencil button below the board, on the right, SHALL toggle notes mode on and off. In portrait it SHALL look like one digit key; its touch target SHALL be at least 44x44 CSS pixels where no neighbouring button is closer, extended with a transparent hit area where the key is narrower; next to a visible eraser the two areas meet midway. It SHALL show its state without using red and be inactive while paused. A new or resumed game SHALL start with notes mode off.

#### Scenario: Toggle
- **WHEN** the player taps the pencil button twice
- **THEN** notes mode is on after the first tap and off after the second, and the button shows the matching state

#### Scenario: Resume
- **WHEN** a game saved with notes mode on is resumed
- **THEN** notes mode is off

#### Scenario: Narrow key still tappable
- **WHEN** the game screen is shown at 320x568 and no eraser is shown
- **THEN** a point 43px left of the pencil button's right edge, at its vertical centre, resolves to the pencil button

### Requirement: Adding notes
With notes mode on and an empty cell selected, tapping a digit SHALL add that digit to the cell's notes, or remove it if already noted, and SHALL keep the cell selected so several digits can be noted. Notes SHALL NOT change the board, the mistake count, the highlight or the undo history, and are not checked against the solution.

#### Scenario: Several notes
- **WHEN** notes mode is on, an empty cell is selected and the player taps 2, 5 and 7
- **THEN** the cell shows notes 2, 5 and 7, is still selected and no digit is placed

#### Scenario: Remove a note
- **WHEN** a cell has notes 2 and 5 and the player taps 5 with notes mode on and the cell selected
- **THEN** the cell has only note 2

#### Scenario: No empty cell selected
- **WHEN** notes mode is on and no empty cell is selected and the player taps a digit
- **THEN** the digit is highlighted as usual and no note is added

#### Scenario: Complete digit
- **WHEN** all nine 4s are placed and notes mode is on
- **THEN** the 4 button stays disabled and no note 4 can be added

#### Scenario: Mistake on the board
- **WHEN** a mistake is on the board and notes mode is on and the player notes a digit in a selected empty cell
- **THEN** the note is added

### Requirement: Notes in number-first mode
With notes mode on in number-first mode, tapping an empty cell SHALL toggle the active digit as a note in that cell instead of placing it. Tapping a filled cell still switches the active digit.

#### Scenario: Note by tapping
- **WHEN** number-first mode is active with 5, notes mode is on and the player taps an empty cell twice
- **THEN** the cell has note 5 after the first tap and no notes after the second, and nothing is placed

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

### Requirement: Eraser button
Once notes are visible on the board, an eraser button SHALL appear in the action row directly left of the pencil, the size of a digit key; it SHALL be hidden otherwise. It SHALL be inactive while paused. When the last visible note is gone it SHALL hide again.

#### Scenario: Appears with the first note
- **WHEN** the board has no notes and the player adds a note
- **THEN** the eraser button appears left of the pencil without moving other controls

#### Scenario: Hides without notes
- **WHEN** the last note on the board is removed
- **THEN** the eraser button is hidden

### Requirement: Erasing notes in cell-first mode
Tapping the eraser while an empty cell is selected SHALL remove all of that cell's notes and keep the cell selected. With no cell selected, or a filled cell, nothing SHALL change. Placed digits SHALL never be erased, and erasing is not part of undo.

#### Scenario: Clear a cell
- **WHEN** a cell with notes 2, 5 and 7 is selected and the player taps the eraser
- **THEN** the cell has no notes, is still selected and other cells' notes are unchanged

#### Scenario: Nothing selected
- **WHEN** no cell is selected and the player taps the eraser
- **THEN** no notes change

### Requirement: Eraser in number-first mode
Holding the eraser SHALL activate it like a digit: it fills like a digit key while held and, once active, shows locked like a digit key with no digit highlighted. While active, tapping an empty cell SHALL remove all of its notes and tapping a filled cell SHALL change nothing. Holding it again SHALL leave the mode, tapping a digit SHALL switch to that digit, and tapping the eraser while a digit is active SHALL switch to the eraser. When the last visible note is gone the mode SHALL end.

#### Scenario: Erase by tapping cells
- **WHEN** the eraser is activated by holding it and the player taps two cells that have notes
- **THEN** both cells have no notes and the eraser stays active while notes remain elsewhere

#### Scenario: Switch tools
- **WHEN** the eraser is active and the player taps the 5 button, then taps the eraser
- **THEN** the 5 becomes the active digit after the first tap and the eraser is active after the second

#### Scenario: Leave
- **WHEN** the eraser is active and the player holds it again
- **THEN** number-first mode ends with no cell selected

#### Scenario: Last note erased
- **WHEN** the eraser is active and the player erases the last cell that has notes
- **THEN** the eraser is hidden and cell-first mode is active

### Requirement: Highlighted digit in notes
While a digit is highlighted (selected filled cell, pressed key or number-first locked digit), a note of that digit SHALL be drawn dark blue and extra bold in every empty cell that has it, other notes unchanged. It SHALL update when the highlight changes and add no fill, ring or red.

#### Scenario: Note follows the highlight
- **WHEN** cells have notes including 5 and the player highlights the 5
- **THEN** the 5 in each of those cells is dark blue and extra bold, and the other notes keep their normal style

#### Scenario: Highlight removed
- **WHEN** the highlight is cleared or moves to another digit
- **THEN** the 5 notes return to the normal note style and the new digit's notes are emphasised
