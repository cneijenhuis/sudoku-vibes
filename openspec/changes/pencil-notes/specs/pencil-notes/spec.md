# Spec Delta

## ADDED Requirements

### Requirement: Notes mode toggle
A pencil button below the board, on the right, SHALL toggle notes mode on and off. It SHALL show its state (pressed or not) without using red, be at least 44 CSS pixels in both dimensions, and be inactive while the game is paused. A new game and a resumed game SHALL start with notes mode off.

#### Scenario: Toggle
- **WHEN** the player taps the pencil button twice
- **THEN** notes mode is on after the first tap and off after the second, and the button shows the matching state

#### Scenario: Resume
- **WHEN** a game saved with notes mode on is resumed
- **THEN** notes mode is off

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
Notes SHALL appear in an empty cell as small digits on a 3x3 grid in fixed positions (1 2 3 on top, 4 5 6 in the middle, 7 8 9 at the bottom), much smaller than a placed digit, so a cell with all nine notes reads 123/456/789. A cell holding a digit SHALL show no notes. The cell's accessible label SHALL list its notes.

#### Scenario: Full cell
- **WHEN** a cell has all nine notes
- **THEN** it shows 1 2 3, 4 5 6 and 7 8 9 on three rows, each digit smaller than half the size of a placed digit, all inside the cell

#### Scenario: Placing clears notes
- **WHEN** a cell has notes and the player places a digit in it
- **THEN** the cell shows only the digit, and after undoing that entry the cell is empty without notes

#### Scenario: Accessible label
- **WHEN** a cell has notes 1 and 9
- **THEN** its accessible label ends with "notes 1, 9"
