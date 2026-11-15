## ADDED Requirements

### Requirement: One palette for all levels
The interface SHALL NOT use per-level colours. Elements that showed a level colour (Resume button, loading spinner, status level name, results level chip and sparks, pause time, buttons) SHALL use the shared theme tokens, identical for every level.

#### Scenario: Same look at every level
- **WHEN** the loading, game and results screens are shown for Super Easy and for Impossible
- **THEN** their colours are identical apart from the level name text
