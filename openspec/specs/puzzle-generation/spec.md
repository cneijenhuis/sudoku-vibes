# puzzle-generation Specification

## Purpose
Produces random, uniquely solvable Sudoku puzzles matching one of the five difficulty levels so every new game is different and fair.

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
- **WHEN** puzzles are generated for Easy, Medium, Hard, Extreme and Almost Impossible
- **THEN** each grades as the level that was requested

### Requirement: Minimum givens per level
Puzzles for Easy, Medium, Hard and Extreme SHALL have at least 36, 32, 28 and 25 givens respectively, so lower levels are not sparse for human players. Almost Impossible has no minimum.

#### Scenario: Easy is not sparse
- **WHEN** an Easy puzzle is generated
- **THEN** it has at least 36 givens

#### Scenario: Floor and grade together
- **WHEN** a Hard puzzle is generated
- **THEN** it has at least 28 givens and still grades as Hard

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
