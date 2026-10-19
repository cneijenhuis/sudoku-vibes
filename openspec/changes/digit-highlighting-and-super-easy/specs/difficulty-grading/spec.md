# Spec Delta

## MODIFIED Requirements

### Requirement: Difficulty levels
The engine SHALL define exactly six ordered difficulty levels: Super Easy, Easy, Medium, Hard, Extreme, Almost Impossible.

#### Scenario: Ordering
- **WHEN** levels are compared
- **THEN** Super Easy < Easy < Medium < Hard < Extreme < Almost Impossible

### Requirement: Grade assignment
The engine SHALL assign Super Easy to puzzles needing only singles and having 44 or more givens, Easy to puzzles needing only singles with fewer than 44 givens, Medium to those also needing locked candidates or pairs, Hard to those needing triples, quads or X-Wing, Extreme to those needing Swordfish, XY-Wing or harder, and Almost Impossible to those that defeat all implemented techniques, or that would otherwise be Extreme but have 22 or fewer givens.

#### Scenario: Grade by hardest technique
- **WHEN** a puzzle's hardest required technique is a naked pair
- **THEN** it is graded Medium

#### Scenario: Beyond implemented techniques
- **WHEN** a uniquely solvable puzzle cannot be completed by any implemented technique
- **THEN** it is graded Almost Impossible

#### Scenario: Very sparse Extreme puzzle
- **WHEN** a puzzle solvable at Extreme level has 22 or fewer givens
- **THEN** it is graded Almost Impossible

#### Scenario: Singles-only, many givens
- **WHEN** a puzzle solvable with singles only has 44 givens
- **THEN** it is graded Super Easy

#### Scenario: Singles-only, fewer givens
- **WHEN** a puzzle solvable with singles only has 36 givens
- **THEN** it is graded Easy
