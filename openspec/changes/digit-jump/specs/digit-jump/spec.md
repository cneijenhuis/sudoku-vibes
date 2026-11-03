## ADDED Requirements

### Requirement: Jump motion
The final-digit sticker SHALL jump continuously: each jump about 700 ms, a slight vertical stretch while rising and falling and a slight squash (wider and shorter, anchored at the bottom) on landing that flows straight into the next jump, with no pause on the ground. The motion SHALL be tunable through CSS custom properties, SHALL NOT use red and SHALL NOT block input.

#### Scenario: Squash and stretch
- **WHEN** the sticker jumps
- **THEN** it is taller than its resting size at the top of the jump and shorter and wider than its resting size on landing

#### Scenario: Continuous
- **WHEN** the results screen stays open
- **THEN** the sticker keeps jumping without stopping between jumps

### Requirement: Reduced motion
Under reduced motion the sticker SHALL NOT jump and SHALL be shown still.

#### Scenario: Reduced motion
- **WHEN** the system prefers reduced motion and the results screen is shown
- **THEN** the sticker appears without moving

### Requirement: Sticker assets
The nine stickers SHALL be transparent images with their white outline, bundled with the app (precached, working offline) and shrunk to at most twice their largest display size.

#### Scenario: Offline
- **WHEN** the installed app is offline and the results screen is shown
- **THEN** the sticker still appears

### Requirement: No sticker during play
The play screen SHALL NOT show digit stickers; completing a digit is acknowledged only by the completion flash.

#### Scenario: Digit completed
- **WHEN** the player enters the ninth correct 4
- **THEN** the cells flash as before and no sticker appears in the header
