# Spec Delta

## ADDED Requirements

### Requirement: Tapping a digit highlights it
When no empty cell is selected, tapping a digit button SHALL highlight every cell holding that digit; tapping the same digit button again SHALL clear the highlight. Tapping a different digit button SHALL switch the highlight to it. The board contents are not changed.

#### Scenario: Highlight from the pad
- **WHEN** no cell is selected and the player taps the digit button 5
- **THEN** every cell containing 5 is highlighted and the board is unchanged

#### Scenario: Toggle and switch
- **WHEN** 5 is highlighted and the player taps 5 again, then taps 7
- **THEN** the highlight is cleared by the first tap and cells containing 7 are highlighted after the second

#### Scenario: Blocked entry still highlights
- **WHEN** a mistake is on the board, an empty cell is selected and the player taps a digit button
- **THEN** no digit is placed and the tap acts as a pad tap: that digit becomes the highlighted digit, or the highlight is cleared if it was already that digit

## MODIFIED Requirements

### Requirement: Cell-first is the default mode
A new game SHALL start in cell-first mode.

#### Scenario: New game
- **WHEN** a game starts
- **THEN** no cell is selected and no digit is highlighted

### Requirement: Entering a digit
When an empty cell is selected, tapping a digit button SHALL place that digit in the cell and deselect the cell. The entered digit SHALL become the highlighted digit.

#### Scenario: Correct digit
- **WHEN** an empty cell is selected and the player taps the digit that belongs there
- **THEN** the digit appears in the cell, no cell is selected and every cell containing that digit is highlighted

### Requirement: Givens and filled cells cannot be overwritten
Tapping a digit button while a filled cell (given or entered) is selected SHALL NOT change the board contents; it SHALL highlight that digit.

#### Scenario: Digit on a filled cell
- **WHEN** a given is selected and the player taps a digit button
- **THEN** the board contents are unchanged and the tapped digit is highlighted
