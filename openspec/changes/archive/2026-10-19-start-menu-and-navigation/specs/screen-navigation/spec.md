# Spec Delta

## Purpose

Defines how the player moves between the app's screens so loading, errors and returning to the menu always behave predictably.

## ADDED Requirements

### Requirement: Loading state
While a puzzle is being generated the app SHALL show a loading screen naming the chosen difficulty, with a Cancel button.

#### Scenario: Slow generation
- **WHEN** the player starts a game and generation is still running
- **THEN** a loading screen with the difficulty name and a Cancel button is shown

### Requirement: Cancelling
Cancelling during loading SHALL return the player to the start menu and no game SHALL start from the cancelled request.

#### Scenario: Cancel then late result
- **WHEN** the player taps Cancel and the generator later finishes
- **THEN** the start menu remains displayed

### Requirement: Entering the game
When generation succeeds the app SHALL show the game screen for the generated puzzle.

#### Scenario: Puzzle ready
- **WHEN** generation completes
- **THEN** the game screen is shown, carrying the puzzle, its solution and its difficulty

### Requirement: Leaving the game
The game screen SHALL provide a way back to the start menu.

#### Scenario: Back to menu
- **WHEN** the player taps the back control on the game screen
- **THEN** the start menu is shown

### Requirement: Generation failure
If generation fails, the app SHALL show an error message with Retry and Back to menu actions.

#### Scenario: Worker error
- **WHEN** the generator rejects with an error
- **THEN** an error screen offers Retry (same difficulty) and Back to menu

### Requirement: Single active screen
Exactly one screen SHALL be shown at a time, and replacing it SHALL not leave stale handlers or timers from the previous screen active.

#### Scenario: Screen swap
- **WHEN** the app navigates from one screen to another
- **THEN** only the new screen's elements are in the document
