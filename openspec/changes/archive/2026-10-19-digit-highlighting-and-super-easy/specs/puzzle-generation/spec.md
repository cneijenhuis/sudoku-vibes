# Spec Delta

## ADDED Requirements

### Requirement: Super Easy givens
A Super Easy puzzle SHALL have exactly 44 givens and SHALL be solvable using only naked and hidden singles. Easy puzzles SHALL have fewer than 44 givens.

#### Scenario: Super Easy puzzle
- **WHEN** a Super Easy puzzle is generated
- **THEN** it has exactly 44 givens, is uniquely solvable and the engine grades it Super Easy

## MODIFIED Requirements

### Requirement: Requested difficulty
The generator SHALL return a puzzle that grades exactly as the requested level whenever one is found within the time budget.

#### Scenario: Each level
- **WHEN** puzzles are generated for Super Easy, Easy, Medium, Hard, Extreme and Almost Impossible
- **THEN** each grades as the level that was requested
