## ADDED Requirements

### Requirement: Final digit celebration
The celebration badge of the results screen SHALL show the sticker of the digit whose entry finished the puzzle instead of a star, jumping indefinitely with the same motion as on the play screen. The existing burst of rings and sparks SHALL stay around it.

#### Scenario: Finished game
- **WHEN** the player finishes a puzzle with an entry of 6
- **THEN** the results screen shows the 6 sticker jumping repeatedly where the star was

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** the sticker is shown without jumping
