# Spec Delta

## MODIFIED Requirements

### Requirement: Notes mode toggle
A pencil button below the board, on the right, SHALL toggle notes mode on and off. In portrait it SHALL look like one digit key; its touch target SHALL be at least 44x44 CSS pixels, extended with a transparent hit area where the key is narrower. It SHALL show its state without using red and be inactive while paused. A new or resumed game SHALL start with notes mode off.

#### Scenario: Toggle
- **WHEN** the player taps the pencil button twice
- **THEN** notes mode is on after the first tap and off after the second, and the button shows the matching state

#### Scenario: Resume
- **WHEN** a game saved with notes mode on is resumed
- **THEN** notes mode is off

#### Scenario: Narrow key still tappable
- **WHEN** the game screen is shown at 320x568
- **THEN** a point 43px left of the pencil button's right edge, at its vertical centre, resolves to the pencil button
