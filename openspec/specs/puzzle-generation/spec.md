# puzzle-generation Specification

## Purpose
Produces random, uniquely solvable Sudoku puzzles matching one of the six difficulty levels so every new game is different and fair.

## Requirements

### Requirement: Generated puzzle contents
For a requested difficulty, the generator SHALL return a puzzle (givens), its complete solution, and the difficulty it actually grades as.

#### Scenario: Result is consistent
- **WHEN** a puzzle is generated for any level
- **THEN** the solution is a conflict-free full grid, every given matches the solution, and the reported difficulty equals the engine's grade of the puzzle

### Requirement: Unique solution
Every generated puzzle SHALL have exactly one solution.

#### Scenario: Uniqueness
- **WHEN** a puzzle is generated for any level
- **THEN** counting its solutions yields 1

### Requirement: Requested difficulty
The generator SHALL return a puzzle that grades exactly as the requested level whenever one is found within the time budget.

#### Scenario: Each level
- **WHEN** puzzles are generated for each of the nine levels
- **THEN** each grades as the level that was requested

### Requirement: Randomness
Successive generations SHALL produce different puzzles, and the generator SHALL accept a seed so the same seed and level reproduce the same puzzle.

#### Scenario: Different puzzles
- **WHEN** two puzzles are generated for the same level without a seed
- **THEN** their givens differ

#### Scenario: Seeded
- **WHEN** a puzzle is generated twice with the same seed and level
- **THEN** both puzzles are identical

### Requirement: Time budget and fallback
Generation SHALL stop after a time budget and return the closest-graded unique puzzle found, flagged as not matching the request, rather than fail or run indefinitely.

#### Scenario: Budget exhausted
- **WHEN** no exact-level puzzle is found before the budget expires
- **THEN** a unique puzzle is still returned with its true difficulty and a flag indicating it differs from the request

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
