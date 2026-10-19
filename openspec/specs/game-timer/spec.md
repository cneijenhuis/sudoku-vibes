# game-timer Specification

## Purpose
Measures how long the player takes and lets them pause without gaining thinking time on the board.

## Requirements

### Requirement: Running timer
The timer SHALL start at 0:00 when the game screen appears, count up in whole seconds formatted m:ss (h:mm:ss from one hour), and stop when the game is completed.

#### Scenario: Counting
- **WHEN** 65 seconds of active play have elapsed
- **THEN** the timer shows 1:05

### Requirement: Pause
Tapping the pause button SHALL stop the timer and hide the board and digits behind a pause overlay offering Resume and Quit to menu. Undo and digit entry SHALL be unavailable while paused.

#### Scenario: Pause hides the board
- **WHEN** the player taps pause
- **THEN** the timer stops, the board cells are not visible, and Resume and Quit to menu are offered

#### Scenario: Resume
- **WHEN** the player taps Resume
- **THEN** the board returns exactly as it was and the timer continues from where it stopped

### Requirement: Auto-pause
The game SHALL pause automatically when the page becomes hidden.

#### Scenario: App switched away
- **WHEN** the browser tab or app is sent to the background
- **THEN** the game is paused and no time accrues while hidden

### Requirement: Quit
Quit to menu SHALL show the start menu, stop the timer and keep the game saved so it can be resumed.

#### Scenario: Quit
- **WHEN** the player taps Quit to menu in the pause overlay
- **THEN** the start menu is shown, the timer is stopped and a Resume entry is available
