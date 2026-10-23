## MODIFIED Requirements

### Requirement: Backgrounds are configurable
Available backgrounds SHALL be defined in a single list (identifier, image, fallback colour, focal position). Adding another SHALL require only a new image and a list entry. The app SHALL pick one at random at launch and again whenever a new game starts, avoiding the previous one when several exist. Resuming a game or returning to the menu SHALL NOT change it.

#### Scenario: One background configured
- **WHEN** the list contains one entry
- **THEN** that background is shown on every screen

#### Scenario: Second entry added
- **WHEN** a second entry is added to the list
- **THEN** the app can show it without any component changes

#### Scenario: New game changes the background
- **WHEN** the player starts a new game while several backgrounds exist
- **THEN** a randomly chosen background different from the current one is shown

#### Scenario: Resume keeps it
- **WHEN** the player resumes a saved game or returns to the menu
- **THEN** the background does not change
