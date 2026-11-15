## MODIFIED Requirements

### Requirement: Automatic saving
The game in progress SHALL be saved automatically after every entry, undo or note change, when the game is paused, and when the page is hidden or being closed. The save SHALL contain the puzzle, its solution, the difficulty, the player's entries in order, the notes, the mistake count and the elapsed time. Saves from before the nine levels SHALL be dropped.

#### Scenario: Reload mid-game
- **WHEN** the player enters some digits and notes and reloads the page
- **THEN** the start menu offers to resume a game with those digits and notes, the same mistakes and the elapsed time at the last save

#### Scenario: Older save
- **WHEN** a save in the previous (six-level) format exists
- **THEN** it is removed and the menu shows no Resume entry

## ADDED Requirements

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
