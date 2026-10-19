# difficulty-grading Specification

## Purpose
Classifies a uniquely solvable puzzle into one of five difficulty levels so generated games match the level the player chose.

## Requirements

### Requirement: Difficulty levels
The engine SHALL define exactly five ordered difficulty levels: Easy, Medium, Hard, Extreme, Almost Impossible.

#### Scenario: Ordering
- **WHEN** levels are compared
- **THEN** Easy < Medium < Hard < Extreme < Almost Impossible

### Requirement: Logical technique solving
The engine SHALL attempt to solve a puzzle using human techniques ordered from simplest to hardest and SHALL report the hardest technique used or that logic alone is insufficient.

#### Scenario: Singles-only puzzle
- **WHEN** a puzzle solvable with only naked and hidden singles is analysed
- **THEN** the hardest technique reported is a single

#### Scenario: Needs guessing
- **WHEN** a puzzle that stalls all implemented techniques is analysed
- **THEN** the result is flagged as requiring guessing

### Requirement: Grade assignment
The engine SHALL assign Easy to puzzles needing only singles, Medium to those also needing locked candidates or pairs, Hard to those needing triples, quads or X-Wing, Extreme to those needing Swordfish, XY-Wing or harder, and Almost Impossible to those that defeat all implemented techniques, or that would otherwise be Extreme but have 22 or fewer givens.

#### Scenario: Grade by hardest technique
- **WHEN** a puzzle's hardest required technique is a naked pair
- **THEN** it is graded Medium

#### Scenario: Beyond implemented techniques
- **WHEN** a uniquely solvable puzzle cannot be completed by any implemented technique
- **THEN** it is graded Almost Impossible

#### Scenario: Very sparse Extreme puzzle
- **WHEN** a puzzle solvable at Extreme level has 22 or fewer givens
- **THEN** it is graded Almost Impossible

### Requirement: Grading requires a valid puzzle
The engine SHALL refuse to grade a board that has conflicts or does not have exactly one solution.

#### Scenario: Non-unique board
- **WHEN** a board with multiple solutions is graded
- **THEN** an error is raised

### Requirement: Deterministic grading
Grading the same puzzle SHALL always yield the same level.

#### Scenario: Repeat grading
- **WHEN** a puzzle is graded twice
- **THEN** both results are identical
