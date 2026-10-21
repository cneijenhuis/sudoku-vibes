# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Completed digit ends the mode`
- TO: `### Requirement: Completed digit advances to the next digit`

## MODIFIED Requirements

### Requirement: Completed digit advances to the next digit
When the active digit becomes complete in number-first mode, number-first mode SHALL stay active and the next higher digit that is not complete SHALL become the active digit, wrapping from 9 to 1 and skipping completed digits. A complete digit's button cannot start the mode or be made active.

#### Scenario: Last instance placed
- **WHEN** number-first mode is active with 2 and the player places the ninth correct 2 while 3 is not complete
- **THEN** number-first mode stays active with 3 as the active digit and all 3s are highlighted

#### Scenario: Skip completed digits
- **WHEN** number-first mode is active with 2, the player places the ninth correct 2 and 3 is already complete while 4 is not
- **THEN** 4 becomes the active digit

#### Scenario: Wrap around
- **WHEN** number-first mode is active with 9, the player places the ninth correct 9, and 1 is not complete
- **THEN** 1 becomes the active digit

#### Scenario: Wrap and skip
- **WHEN** number-first mode is active with 9, the player places the ninth correct 9 and 1 and 2 are complete while 3 is not
- **THEN** 3 becomes the active digit

#### Scenario: Undo of the completing entry
- **WHEN** the ninth 5 advanced the active digit to 6 and the player undoes that entry
- **THEN** the entry is removed, the 5 button is enabled again, number-first mode stays active with 6 and no cell is selected

#### Scenario: Puzzle finished
- **WHEN** the digit completed is the last one that was incomplete
- **THEN** the puzzle is complete and the results screen is shown as usual

#### Scenario: Cell-first unchanged
- **WHEN** cell-first mode is active and the player enters the ninth correct 5
- **THEN** cell-first mode stays active and nothing is highlighted
