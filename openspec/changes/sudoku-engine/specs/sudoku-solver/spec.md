# Spec Delta

## Purpose

Provides correct, fast solving and uniqueness checking for standard 9x9 Sudoku boards, the foundation for puzzle generation and mistake detection.

## ADDED Requirements

### Requirement: Board representation
The engine SHALL represent a board as 81 cells, each empty or holding a digit 1-9, and SHALL parse from and serialise to an 81-character string where `0` or `.` denotes an empty cell.

#### Scenario: Round-trip
- **WHEN** a valid 81-character puzzle string is parsed and serialised
- **THEN** the result equals the input (with `.` normalised to `0`)

#### Scenario: Invalid input
- **WHEN** a string that is not 81 characters of digits or `.` is parsed
- **THEN** an error is raised

### Requirement: Conflict detection
The engine SHALL report whether a board contains duplicate digits within any row, column or 3x3 box, and which cells conflict.

#### Scenario: Duplicate in a row
- **WHEN** a board has two 5s in the same row
- **THEN** both cells are reported as conflicting

### Requirement: Solving
The engine SHALL find a complete valid solution for any solvable board and SHALL report that none exists for an unsolvable board.

#### Scenario: Solvable puzzle
- **WHEN** a known solvable puzzle is solved
- **THEN** the result is a full grid with no conflicts that preserves all givens

#### Scenario: Unsolvable puzzle
- **WHEN** a board with no valid completion is solved
- **THEN** the engine reports no solution

### Requirement: Uniqueness check
The engine SHALL count solutions up to a limit of 2 so callers can determine whether a puzzle has exactly one solution.

#### Scenario: Unique puzzle
- **WHEN** a puzzle with exactly one solution is counted
- **THEN** the count is 1

#### Scenario: Multiple solutions
- **WHEN** an empty board is counted
- **THEN** the count is 2 (the limit) without enumerating all solutions
