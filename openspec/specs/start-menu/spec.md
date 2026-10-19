# start-menu Specification

## Purpose
Gives the player a clear first screen to choose how hard their game will be.

## Requirements

### Requirement: Difficulty choices
The start menu SHALL show the game title and exactly six buttons, in order: Super Easy, Easy, Medium, Hard, Extreme, Almost Impossible.

#### Scenario: Menu contents
- **WHEN** the app loads
- **THEN** the start menu is shown with the six labelled buttons in that order

### Requirement: Touch-friendly layout
Each difficulty button SHALL be at least 44 CSS pixels tall and the whole menu SHALL fit a 375x667 viewport without scrolling.

#### Scenario: Small phone
- **WHEN** the menu is shown at 375x667 CSS pixels
- **THEN** all six buttons are fully visible and tappable without scrolling

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
