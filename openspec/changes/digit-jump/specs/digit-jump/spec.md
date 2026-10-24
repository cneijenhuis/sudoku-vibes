## ADDED Requirements

### Requirement: Digit completed on the play screen
When a player's entry makes a digit have all nine instances correctly placed, the sticker of that digit SHALL appear in the right slot of the play header (opposite pause, so the timer stays centred), jump three times and then disappear. If another digit completes while one is jumping, the new sticker SHALL replace the old one and start from the beginning.

#### Scenario: Digit completed
- **WHEN** the player enters the ninth correct 4
- **THEN** the 4 sticker appears in the top right, jumps three times and disappears

#### Scenario: Wrong or incomplete
- **WHEN** the player enters a wrong digit or a digit that still has instances to place
- **THEN** no sticker appears

#### Scenario: Replaced
- **WHEN** the 4 is still jumping and the player completes the 7
- **THEN** the 4 sticker is replaced by the 7 sticker, which starts its three jumps

### Requirement: Only entries jump
Undo, redo, resuming a saved game and the entry that finishes the puzzle SHALL NOT show a sticker on the play screen. A digit completed again after an undo SHALL jump again.

#### Scenario: Undo, redo and resume
- **WHEN** the player undoes or redoes an entry, or resumes a saved game with completed digits
- **THEN** no sticker appears

#### Scenario: Completed again
- **WHEN** the player undoes the ninth 4 and enters it again
- **THEN** the 4 sticker jumps again

### Requirement: Jump motion
Each jump SHALL take about 700 ms: a slight vertical stretch while rising and falling, a slight squash (wider and shorter, anchored at the bottom) on landing, and a short rest. The sticker SHALL be about as large as the pause button, SHALL NOT change layout, block input or hide the timer, and SHALL NOT use red.

#### Scenario: Squash and stretch
- **WHEN** a sticker jumps
- **THEN** it is taller than its resting size at the top of the jump and shorter and wider than its resting size on landing

#### Scenario: Input while jumping
- **WHEN** the player taps a cell or key while the sticker jumps
- **THEN** the input works normally and the header does not move

### Requirement: Reduced motion
Under reduced motion the sticker SHALL NOT jump. On the play screen it SHALL be shown still for about the length of three jumps and then removed; on the results screen it SHALL be shown still.

#### Scenario: Reduced motion
- **WHEN** the system prefers reduced motion and a digit is completed
- **THEN** the sticker appears without moving and is removed after about two seconds

### Requirement: Sticker assets
The nine stickers SHALL be transparent images with their white outline, bundled with the app (precached, working offline) and shrunk to at most twice their largest display size.

#### Scenario: Offline
- **WHEN** the installed app is offline and a digit is completed
- **THEN** the sticker still appears
