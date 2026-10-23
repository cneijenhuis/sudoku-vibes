# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
