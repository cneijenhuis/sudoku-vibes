# haptic-feedback Specification

## Purpose
Gives light tactile feedback on phones that support vibration, without being intrusive.

## Requirements

### Requirement: Haptic events
Where vibration is supported and enabled, the app SHALL give a short vibration on a mistake, a short vibration when number-first mode starts or ends, and a distinct longer pattern when a puzzle is completed.

#### Scenario: Mistake
- **WHEN** the player enters a wrong digit and vibration is enabled
- **THEN** a short vibration is triggered

#### Scenario: Completion
- **WHEN** the player completes the puzzle and vibration is enabled
- **THEN** a longer completion pattern is triggered

### Requirement: Setting
The start menu SHALL provide a haptics on/off toggle, shown only when the browser supports vibration. The choice SHALL persist across visits, and the default SHALL be on.

#### Scenario: Turned off
- **WHEN** the player turns haptics off and enters a wrong digit
- **THEN** no vibration is triggered, including after a reload

#### Scenario: Unsupported browser
- **WHEN** the browser has no vibration support
- **THEN** no toggle is shown and no errors occur

### Requirement: No haptics without a gesture or while hidden
Vibration SHALL only be triggered in response to player actions, never while the page is hidden or paused.

#### Scenario: Paused
- **WHEN** the game is paused
- **THEN** no vibration is triggered
