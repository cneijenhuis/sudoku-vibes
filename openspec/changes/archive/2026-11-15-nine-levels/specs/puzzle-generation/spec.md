## MODIFIED Requirements

### Requirement: Requested difficulty
The generator SHALL return a puzzle that grades exactly as the requested level whenever one is found within the time budget.

#### Scenario: Each level
- **WHEN** puzzles are generated for each of the nine levels
- **THEN** each grades as the level that was requested

## REMOVED Requirements

### Requirement: Minimum givens per level
**Reason**: Givens count barely predicts human solve time (Pelánek: r ≈ 0.26); the score and open-moves tiers now set how sparse a level may be.
**Migration**: None; generated puzzles are graded by the new rule.

### Requirement: Super Easy givens
**Reason**: Super Easy is now defined by its score band and open moves, not a fixed 44 givens.
**Migration**: None.

## ADDED Requirements

### Requirement: Fair puzzles only
Every generated puzzle SHALL be solvable by the technique solver limited to the requested level's techniques, so it never needs guessing or a technique above its level.

#### Scenario: Within the level's techniques
- **WHEN** a Tricky puzzle is generated
- **THEN** the solver limited to level 5 techniques solves it completely

### Requirement: Spread within the level
The generator SHALL aim for a random score inside the requested level's score band rather than always the hardest puzzle of that level, so successive puzzles of one level differ in difficulty.

#### Scenario: Not piled at the edge
- **WHEN** 100 Gentle puzzles are generated with different seeds
- **THEN** their scores are spread over the Gentle band and fewer than half lie in its top fifth
