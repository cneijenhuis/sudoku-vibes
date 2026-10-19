# Spec Delta

## Purpose

Celebrates a finished puzzle and makes it effortless to start the next game at the same or a higher difficulty.

## ADDED Requirements

### Requirement: Congratulations content
When a game is completed the app SHALL show a screen with a congratulations message, the difficulty that was played, the elapsed time formatted like the in-game timer, and the number of mistakes made.

#### Scenario: Finished game
- **WHEN** the player completes a Medium game in 4:32 with 2 mistakes
- **THEN** the screen shows a congratulations message, "Medium", the time "4:32" and 2 mistakes

#### Scenario: Flawless game
- **WHEN** the player completes a game with 0 mistakes
- **THEN** the screen shows a flawless-run message in addition to the stats

### Requirement: Same difficulty
The screen SHALL offer a "Same difficulty" action that starts a new game at the level just played.

#### Scenario: Play again
- **WHEN** the player finishes a Hard game and taps "Same difficulty"
- **THEN** the loading screen for Hard is shown and then a new Hard game starts

### Requirement: Next difficulty
The screen SHALL offer a "Next difficulty" action that starts a new game one level harder than the one just played, in the order Super Easy, Easy, Medium, Hard, Extreme, Almost Impossible. After Almost Impossible the action SHALL NOT be offered.

#### Scenario: Step up
- **WHEN** the player finishes an Easy game and taps "Next difficulty"
- **THEN** the loading screen for Medium is shown and then a new Medium game starts

#### Scenario: Hardest level
- **WHEN** the player finishes an Almost Impossible game
- **THEN** no "Next difficulty" action is shown and "Same difficulty" and "Menu" remain

### Requirement: Return to menu
The screen SHALL offer a "Menu" action that returns to the start menu.

#### Scenario: Back to menu
- **WHEN** the player taps "Menu"
- **THEN** the start menu is shown

### Requirement: Starting from the results screen
Actions that start a game SHALL use the normal loading, cancel and error behaviour, and repeated taps SHALL NOT start more than one game.

#### Scenario: Cancel while loading
- **WHEN** the player taps "Next difficulty" and then cancels on the loading screen
- **THEN** the start menu is shown and no game starts

#### Scenario: Rapid taps
- **WHEN** the player taps "Same difficulty" and "Next difficulty" in quick succession
- **THEN** only one game starts

### Requirement: Layout and accessibility
The screen SHALL fit a 375x667 viewport without scrolling, every action SHALL be at least 44 CSS pixels tall, and any celebration animation SHALL be disabled or reduced when the user prefers reduced motion.

#### Scenario: Small phone
- **WHEN** the results screen is shown at 375x667 and 320x568
- **THEN** all content and actions are visible without scrolling

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** no moving celebration animation plays
