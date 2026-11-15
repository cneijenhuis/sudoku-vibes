# start-menu Specification

## Purpose
Gives the player a clear first screen to choose how hard their game will be.

## Requirements

### Requirement: Difficulty choices
The start menu SHALL show the game title and one 3x3 box, like a sudoku box, of nine level cells in reading order 1 to 9. Each cell SHALL show that digit's balloon image and, below it, the level name in the done-text colour. Each cell is a button named "Level N, Name".

#### Scenario: Menu contents
- **WHEN** the app loads with no best times
- **THEN** the menu shows the box with balloon digits 1 to 9 and the names Super Easy, Easy, Gentle, Medium, Tricky, Hard, Tough, Extreme, Impossible beneath them

### Requirement: Touch-friendly layout
Each level cell SHALL be at least 44 CSS pixels in both directions, the box SHALL be as large as the screen allows, and the whole menu SHALL fit a 375x667 viewport without scrolling.

#### Scenario: Small phone
- **WHEN** the menu is shown at 375x667 CSS pixels
- **THEN** all nine level cells are fully visible and tappable without scrolling

### Requirement: Starting a game
Tapping a difficulty button SHALL start a new game at that difficulty.

#### Scenario: Choose Hard
- **WHEN** the player taps "Hard"
- **THEN** a puzzle graded Hard is requested and the player is taken to the game once it is ready

### Requirement: Double-tap protection
While a puzzle is being generated, further taps on difficulty buttons SHALL NOT start additional games.

#### Scenario: Rapid taps
- **WHEN** the player taps "Easy" and then immediately taps "Hard"
- **THEN** only one game starts, at Easy

### Requirement: Resume entry
When a valid saved game exists, the start menu SHALL show a Resume entry above the difficulty buttons displaying the saved game's difficulty and elapsed time. It SHALL NOT be shown when there is no saved game.

#### Scenario: Saved game present
- **WHEN** the app loads with a saved Hard game at 4:32
- **THEN** the menu shows a Resume entry labelled with Hard and 4:32

### Requirement: Menu still fits
With the Resume entry and the haptics toggle shown, the menu SHALL fit 375x667, 320x568 and landscape 844x390 without scrolling, and every control SHALL be at least 44 CSS pixels tall.

#### Scenario: Crowded menu
- **WHEN** the menu is shown at 320x568 with a saved game and vibration supported
- **THEN** all controls are visible without scrolling

### Requirement: Solved levels
A level with a best time SHALL show its cell with the solved tint (done edge at 30% opacity), its balloon digit, and "Best m:ss" in the done-text colour in place of the level name. It SHALL show no tick or other marker and stays tappable; its accessible name adds ", best m:ss".

#### Scenario: Four levels solved
- **WHEN** levels 1 to 4 have best times 1:48, 3:05, 4:41 and 7:12
- **THEN** those four cells are tinted and show "Best 1:48", "Best 3:05", "Best 4:41" and "Best 7:12" without names, and cells 5 to 9 show their names
