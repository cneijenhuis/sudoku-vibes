# Spec Delta

## Purpose

Defines the default way to enter numbers: choose a cell first, then choose a digit.

## ADDED Requirements

### Requirement: Cell-first is the default mode
A new game SHALL start in cell-first mode.

#### Scenario: New game
- **WHEN** a game starts
- **THEN** no cell is selected and tapping a digit button without a selected cell changes nothing

### Requirement: Selecting a cell
Tapping a cell SHALL select it, replacing any previous selection; tapping the selected cell again SHALL deselect it.

#### Scenario: Change selection
- **WHEN** a cell is selected and the player taps a different cell
- **THEN** the new cell is selected and the old one is not

#### Scenario: Toggle off
- **WHEN** the player taps the already selected cell
- **THEN** nothing is selected

### Requirement: Entering a digit
When an empty cell is selected, tapping a digit button SHALL place that digit in the cell and deselect it.

#### Scenario: Correct digit
- **WHEN** an empty cell is selected and the player taps the digit that belongs there
- **THEN** the digit appears in the cell and no cell is selected

### Requirement: Givens and filled cells cannot be overwritten
Tapping a digit button while a filled cell (given or entered) is selected SHALL NOT change the board.

#### Scenario: Digit on a filled cell
- **WHEN** a given is selected and the player taps a digit button
- **THEN** the board is unchanged
