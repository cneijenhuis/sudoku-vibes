# background-generation Specification

## Purpose
Keeps the UI responsive by running puzzle generation off the main thread and exposing it as a simple asynchronous call.

## Requirements

### Requirement: Asynchronous generation API
The app SHALL expose generation as a function returning a promise of the generated puzzle.

#### Scenario: Request a puzzle
- **WHEN** the UI requests a puzzle for a level
- **THEN** the promise resolves with the puzzle, solution and difficulty

### Requirement: Non-blocking
Generation MUST NOT block the main thread; the UI SHALL stay responsive while a puzzle is being generated.

#### Scenario: Slow generation
- **WHEN** generating an Almost Impossible puzzle takes seconds
- **THEN** the main thread remains free to render and handle input throughout

### Requirement: Latest request wins
A new request SHALL cancel or supersede an in-flight request so stale results are never delivered.

#### Scenario: Superseded request
- **WHEN** a second request is made before the first completes
- **THEN** only the second request's puzzle is delivered to the caller that awaits it

### Requirement: Worker failure
If the worker cannot start or crashes, the app SHALL reject the promise with an error rather than hang.

#### Scenario: Worker error
- **WHEN** the worker raises an error during generation
- **THEN** the promise rejects with an error
