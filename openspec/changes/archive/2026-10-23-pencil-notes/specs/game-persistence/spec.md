# Spec Delta

## MODIFIED Requirements

### Requirement: Automatic saving
The game in progress SHALL be saved automatically after every entry, undo or note change, when the game is paused, and when the page is hidden or being closed. The save SHALL contain the puzzle, its solution, the difficulty, the player's entries in order, the notes, the mistake count and the elapsed time. Saves made before notes existed SHALL still load, without notes.

#### Scenario: Reload mid-game
- **WHEN** the player enters some digits and notes and reloads the page
- **THEN** the start menu offers to resume a game with those digits and notes, the same mistakes and the elapsed time at the last save

#### Scenario: Older save
- **WHEN** a save without a notes field exists
- **THEN** it is offered for resume and the board has no notes

### Requirement: Resume
The start menu SHALL offer "Resume" when a valid saved game exists, showing its difficulty and elapsed time. Resuming SHALL restore the board, entries, notes, undo history, mistake count and timer, and open the game paused. The input mode and highlight SHALL start as cell-first with nothing selected, and notes mode off.

#### Scenario: Resume paused
- **WHEN** the player taps Resume
- **THEN** the game screen opens with the saved board, the pause overlay is shown and the timer is stopped until the player resumes

#### Scenario: Undo after resume
- **WHEN** the player resumes and taps undo
- **THEN** the most recent saved entry is removed
