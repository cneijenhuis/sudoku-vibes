# Spec Delta

## ADDED Requirements

### Requirement: Completed digits
When all nine instances of a digit are present and correct, its digit button SHALL be greyed out and disabled, and cells containing that digit SHALL NOT be highlighted. A digit that is no longer complete (after an undo) SHALL become available again.

#### Scenario: Digit completed
- **WHEN** the player enters the ninth correct 4
- **THEN** the 4 button is greyed out and cannot be tapped, and no cell is shown as highlighted for 4

#### Scenario: Completed digit cannot be highlighted
- **WHEN** 4 is complete and the player taps a cell containing 4
- **THEN** the cell is selected but no other cells are highlighted

#### Scenario: Undo reopens a digit
- **WHEN** 4 is complete and the player undoes the last 4 they entered
- **THEN** the 4 button is enabled again

#### Scenario: Undo restores a hidden highlight
- **WHEN** 4 was highlighted, the ninth 4 completed it, and the player undoes that entry
- **THEN** the 4 button is enabled and the cells containing 4 are highlighted again

## MODIFIED Requirements

### Requirement: Selection and same-number highlight
The selected cell SHALL be highlighted. The game SHALL keep at most one highlighted digit, and every cell holding that digit SHALL be highlighted. Tapping a filled cell SHALL make its digit the highlighted digit. Selecting an empty cell SHALL NOT change the highlighted digit. A digit that is complete SHALL never be highlighted.

#### Scenario: Highlight matching digits
- **WHEN** the player taps a cell containing 7
- **THEN** that cell is marked selected and all cells containing 7 are highlighted

#### Scenario: Empty cell selected
- **WHEN** 7 is highlighted and the player taps an empty cell
- **THEN** that cell is selected and the cells containing 7 stay highlighted

#### Scenario: Highlight survives entry
- **WHEN** the player enters a 3 into the selected empty cell
- **THEN** the cell is deselected and all cells containing 3, including the new one, are highlighted
