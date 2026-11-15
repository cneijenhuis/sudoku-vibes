# game-persistence Specification

## Purpose
Keeps the player's game safe across reloads, closed tabs and app switches so no progress or time is lost.

## Requirements

### Requirement: Automatic saving
The game in progress SHALL be saved automatically after every entry, undo or note change, when the game is paused, and when the page is hidden or being closed. The save SHALL contain the puzzle, its solution, the difficulty, the player's entries in order, the notes, the mistake count and the elapsed time. Saves from before the nine levels SHALL be dropped.

#### Scenario: Reload mid-game
- **WHEN** the player enters some digits and notes and reloads the page
- **THEN** the start menu offers to resume a game with those digits and notes, the same mistakes and the elapsed time at the last save

#### Scenario: Older save
- **WHEN** a save in the previous (six-level) format exists
- **THEN** it is removed and the menu shows no Resume entry

### Requirement: Resume
The start menu SHALL offer "Resume" when a valid saved game exists, showing its difficulty and elapsed time. Resuming SHALL restore the board, entries, notes, undo history, mistake count and timer, and open the game paused. The input mode and highlight SHALL start as cell-first with nothing selected, and notes mode off.

#### Scenario: Resume paused
- **WHEN** the player taps Resume
- **THEN** the game screen opens with the saved board, the pause overlay is shown and the timer is stopped until the player resumes

#### Scenario: Undo after resume
- **WHEN** the player resumes and taps undo
- **THEN** the most recent saved entry is removed

### Requirement: Quit keeps the game
Quitting to the menu SHALL keep the saved game, so it can be resumed later.

#### Scenario: Quit then resume
- **WHEN** the player quits to the menu from the pause overlay and taps Resume
- **THEN** the same game is restored

### Requirement: Replacing a saved game
Starting a new game while a saved game exists SHALL first ask for confirmation to discard the saved game; declining SHALL leave the saved game and the menu unchanged.

#### Scenario: Confirm replacement
- **WHEN** a saved game exists and the player taps a difficulty
- **THEN** a confirmation is shown, and only after confirming is the new game started and the old save replaced

#### Scenario: Decline
- **WHEN** the player declines the confirmation
- **THEN** the menu is shown and the saved game is still resumable

### Requirement: Clearing the save
Completing a game SHALL clear the saved game.

#### Scenario: Finished game
- **WHEN** the player completes the puzzle
- **THEN** no saved game exists and the menu shows no Resume entry

### Requirement: Invalid or unavailable storage
Saved data that is missing, malformed, of an unknown version or inconsistent (givens not matching the solution, entries on given or out-of-range cells) SHALL be ignored and removed. If browser storage is unavailable or full, the game SHALL still be playable without saving, and no error SHALL be shown.

#### Scenario: Corrupt save
- **WHEN** the stored data cannot be parsed or fails validation
- **THEN** the menu shows no Resume entry and the app works normally

#### Scenario: Storage blocked
- **WHEN** reading or writing storage throws
- **THEN** the game can still be started and played

### Requirement: Best times
Completing a game with zero mistakes SHALL record its elapsed time as that level's best time when there is none or it is faster. Games with any mistake SHALL NOT change best times. Best times SHALL survive reloads; invalid stored data SHALL be ignored, and blocked storage SHALL not stop play.

#### Scenario: Flawless and faster
- **WHEN** the player completes a Medium game in 6:10 with 0 mistakes and the Medium best is 7:12
- **THEN** the Medium best becomes 6:10

#### Scenario: Mistake made
- **WHEN** the player completes a Medium game in 5:00 with 1 mistake
- **THEN** the Medium best time is unchanged

#### Scenario: Slower flawless game
- **WHEN** the player completes a Medium game in 8:00 with 0 mistakes and the Medium best is 7:12
- **THEN** the Medium best stays 7:12
