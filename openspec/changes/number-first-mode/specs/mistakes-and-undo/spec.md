# Spec Delta

## ADDED Requirements

### Requirement: Mistakes and undo in number-first mode
In number-first mode a mistake SHALL block placing further digits until it is undone, exactly as in cell-first mode, while switching the active digit and leaving the mode remain available. Undo SHALL remove the latest entry and SHALL NOT select a cell.

#### Scenario: Blocked until undone
- **WHEN** number-first mode is active and a mistake is on the board and the player taps an empty cell
- **THEN** the board is unchanged

#### Scenario: Undo keeps the mode
- **WHEN** number-first mode is active with 5 and the player undoes the last entry
- **THEN** the entry is removed, number-first mode stays active with 5 and no cell is selected
